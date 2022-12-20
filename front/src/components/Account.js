import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import useAuth from '../hooks/useAuth'
import { useEffect, useState, useRef } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

import "./css/Account.css" 
import axios from '../api/axios';

//TODO: MAKE SO ACCEPTS OTHER IMAGE FORMAT (probs quite easy to do, just check image format of file then change header content to match, icba atm tho)

const Account = () => {
    const {auth,setAuth} = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const [image, setImage] = useState({});
    const [imageUrl, setImageUrl] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [errMsg, setErrMsg] = useState();
    const [successMsg, setSuccessMsg] = useState();
    const imageRef = useRef();

    const upload = async(e)=>{
        setErrMsg('');
        setSuccessMsg('');
        const file = imageRef?.current?.files[0];

        if(!file) return console.log("NO");
        
        e.preventDefault();
        console.log(imageRef.current.files[0])
        setIsLoading(true)
        

        //add to aws
        try{
            const response = await axiosPrivate.get('/api/s3/geturl');
            const url = response.data.url;

           await axios.put(url,file,{
                headers: {
                    "Content-Type": "image/png"
                },   
            })

            //send back new url to server
            const updateResponse = await axiosPrivate.post("/api/s3/updateurl",
            {
                data:{
                    url: url.split('?')[0]
                }
            })
            setAuth(prev => {return{...prev, coins:updateResponse.data.coins}})
        } catch (err){
            setIsLoading(false)
            if(!err?.response){
                setErrMsg('No server response');
            }else if(err.response?.status===0){
                setErrMsg("Error connecting to server")
            }else{
                setErrMsg("Error updating image")
            }  
            return;
        }
        setIsLoading(false);
        setSuccessMsg("SUCCESS");
    }

    const onImageChange = (e) =>{
        setImage(e.target.files[0]);
    }

    useEffect(() =>{
        if(!image.name) return;
        setImageUrl(URL.createObjectURL(image));
    },[image])

    return (        
        isLoading
        ? <h2>Loading...</h2>
        :
        <div id="profile">
            <div id="user-data">
                <h1>{auth.user}</h1>
                <br />
                <p><FontAwesomeIcon icon={faCoins}/>{auth.coins}</p>
            </div>
            <form onSubmit={upload}>
                <input id='imageInput' type="file" accept="image/png" onChange={onImageChange} ref={imageRef}/>
                <img src={imageUrl}/>
                <button type="submit" disabled={!imageRef?.current?.files[0]}>Upload</button>
                <h2>{errMsg}</h2>
                <h2>{successMsg}</h2>
            </form>
        </div>
        
    )
}

export default Account