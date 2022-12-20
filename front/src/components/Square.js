import React, { useEffect } from 'react'
import { useState } from 'react';
import Popup from './Popup';
//    {/*<div onDoubleClick={() => console.log("clicked")}>{text}</div>*/}

const Square = ({startUrl, socket,index}) => {
  const [active, setActive] = useState(false);
  const [imgSrc, setImageSrc] = useState("")

  const onDoubleClick = () =>{
    setActive(true);
  }

  //on mount:
  useEffect(()=>{
    setImageSrc(startUrl)

    socket.on(`update-image-${index}`, newSrc =>{
      setImageSrc(newSrc)
    })

  },[])


  
  return (
    <>
      <div onDoubleClick={onDoubleClick}>
        {imgSrc? <img id="square-image" src={imgSrc}/> :<></>}
      </div>
          
      {active 
      ?
      <>
        <Popup imgSrc={imgSrc} socket={socket} index={index}/>
        <div id='overlay' onDoubleClick={() => setActive(false)}/>
      </>
      : <></>
      }  
      
    </>
  )
}

export default Square