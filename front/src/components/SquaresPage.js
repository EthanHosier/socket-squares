import React, { useEffect } from 'react'
import Square from './Square'
import { useState, useRef } from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import { faMagnifyingGlassPlus, faMagnifyingGlassMinus } from '@fortawesome/free-solid-svg-icons';

import {io, Socket} from "socket.io-client"

import "./css/Squares.css"
import useAuth from '../hooks/useAuth';

const HEIGHT_IN_SQUARES = 11;
const MAX_PIXEL_WIDTH = 600; //of each square
const MIN_PIXEL_WIDTH = 200;

let startImages;

const SquaresPage = () => {

  const {auth} = useAuth();

  const [pixelWidth, setPixelWidth] = useState(500);
  const scrollRef = useRef(); //reference to entire window of squares

  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);

  const [socket, setSocket] = useState();

  //TODO: set so array of states instead of state of entire array?

  const onMouseDown = e =>{
      setIsDown(true);
      const slider = scrollRef.current
      slider.classList.add("active");

      setStartX(e.pageX - slider.offsetLeft);
      setStartY(e.pageY - slider.offsetTop);

      setScrollLeft(slider.scrollLeft);
      setScrollTop(slider.scrollTop);
      
  };

  const onMouseUp = () =>{
    setIsDown(false);
    scrollRef.current.classList.remove("active");

  };

  const onMouseMove = e =>{
      e.preventDefault();
      if(!isDown) return;
      const slider = scrollRef.current
      const x = e.pageX - slider.offsetLeft;
      const y = e.pageY - slider.offsetTop;

      const walkx = Math.floor(1.1*(x-startX));
      const walky = Math.floor(1.1*(y-startY));

      slider.scrollLeft = scrollLeft-walkx;
      slider.scrollTop = scrollTop - walky;
  }

  const onMouseLeave= () => {
    setIsDown(false);
    scrollRef.current.classList.remove("active");
  }

  //TODO: smart zoom, so that when user zooms the squares' relative positions is same on screen (so square that was centred before is now centred again)
  const zoomIn = ()=>{
    if(pixelWidth<MAX_PIXEL_WIDTH){
      setPixelWidth(pixelWidth + 100);
    }
  }

  const zoomOut = ()=>{
    if(pixelWidth>MIN_PIXEL_WIDTH){
      setPixelWidth(pixelWidth - 100);
    }
  }

  //on mount
  useEffect(()=>{
      setSocket(io('http://localhost:3500'))
  
  },[])

  useEffect(() =>{
    if(!socket) return; //null socket so return
    socket.on('connect', ()=>{   
      socket.emit("get-all-images",setAllImages) 
    })

    socket.on('update-coins', new_coins =>{
      auth.coins = new_coins;
      console.log(new_coins)
    })

    //disconnect socket on dismount
    return () =>{
      socket.disconnect();
    }

  },[socket])

  const setAllImages = (array) =>{
    startImages = array;
    console.log(startImages);
    setIsLoading(false);
    //set scroll so centred on centre square
  }

  useEffect(()=>{
    if (isLoading) return;
    //now page is ready:
    const slider = scrollRef.current;
    slider.scrollLeft = (pixelWidth*HEIGHT_IN_SQUARES - slider.clientWidth)/2
    slider.scrollTop = (pixelWidth*HEIGHT_IN_SQUARES - slider.clientHeight) / 2

  }, [isLoading])

  
  
  return (
    
    isLoading
    ? <p>Loading...</p>
    :

    <>
      <button className="zoom" id="zoom-plus" onClick={zoomIn}>
        <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
      </button>

      <button className="zoom" id="zoom-minus" onClick={zoomOut}>
        <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
      </button>
      
      <div 
      id="squares-container" 
      style= {{gridTemplateRows: `repeat(${HEIGHT_IN_SQUARES}, ${pixelWidth}px)`, 
              gridTemplateColumns: `repeat(${HEIGHT_IN_SQUARES}, ${pixelWidth}px)`}}
      ref={scrollRef}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      >
        {startImages.map((url, i) => <Square startUrl={url} key={i} index={i} socket={socket}></Square>)}
      </div>
    </>
  )
}

export default SquaresPage