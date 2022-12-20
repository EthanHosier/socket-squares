import { Link, useNavigate} from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useRefreshToken from '../hooks/useRefreshToken';
import { useEffect, useState } from 'react';

const PRICE = 1;

const Popup = ({imgSrc,socket,index}) => {
    
    const navigateTo = useNavigate();
    const {auth} = useAuth();
    const refresh = useRefreshToken();
    const [errMsg, setErrMsg] = useState();
    

    useEffect(()=>{
        socket.on("exception", ({errorMessage}) =>{
            setErrMsg(errorMessage);
        })
        
        
    })

    //called if error with authentication token
    const retryWithNewAT = async() =>{
        try{
            const newAccessToken = await refresh();
            socket.emit("buy",index,PRICE,newAccessToken,retryWithNewAT);
        } catch (err){
            //refresh token outdated
            navigateTo("login")
        }
    }

    const buy = ()=>{
        console.log(`buy ${index}`)
        socket.emit("buy",index,PRICE,auth.accessToken,retryWithNewAT);
    }
  
    return (
    <div className="Popup">
        <img src={imgSrc}/>

        {auth.user
        ? 
        <>
        <button onClick={buy}>Buy</button>
        <p>You have {auth.coins} coins</p>
        {errMsg ? <p className='errMsg'>{errMsg}</p> : <></>}
        </>
        : 
        <div>
            <p>In order to buy square, you must be logged in</p>
            <Link to="login">
                <button>Login</button>
            </Link>
        </div>
    }
    </div>
  )
}

export default Popup