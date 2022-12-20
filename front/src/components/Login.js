import React from 'react'
import {useRef, useState, useEffect} from 'react';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import useAuth from '../hooks/useAuth'; 
import axios from '../api/axios';

const LOGIN_URL = "/api/auth/login";

const Login = () => {
  const {setAuth} = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const userRef = useRef();
  const errRef = useRef();

  const [user,setUser] = useState('');
  const [pwd,setPwd] = useState("");    
  const [errMsg, setErrMsg] = useState('');

  useEffect(()=>{
    userRef.current.focus()
  },[]);

  useEffect(() =>{
    setErrMsg('');
  }, [user,pwd]);

  const submit = async(e) =>{
    e.preventDefault();

    if(!(user&&pwd)){
        setErrMsg("Invalid Entry")
        return;
    }

    //send login post request:
    try{
        const response = await axios.post(LOGIN_URL, JSON.stringify({username: user,password: pwd}),
        {
            headers: {'Content-Type': 'application/json'},
            withCredentials: true,
        });
        console.log(JSON.stringify(response?.data));
        const accessToken = response?.data?.accessToken;
        setAuth({user,coins:response?.data?.coins,accessToken,id: response?.data?._id});
        setUser('');
        setPwd('');
        //setSuccess(true);
        navigate(from, {replace:true}) //(replace:true so that if user presses back arrow again wont be sent back to sign in page)
        return;
    }catch(err){
        if(!err?.response){
            setErrMsg('No server response');
        }else if(err.response?.status===0){
            setErrMsg("Error connecting to server")
        }else{
            setErrMsg("Incorrect Login")
        }
        errRef.current.focus();
    }
  }


  return (
    <section className='auth'>
      <p ref={errRef} className={errMsg? "errmsg":"offscreen"} aria-live="assertive">{errMsg}</p>
      <h1>Login</h1>
      <form onSubmit={submit}>
        <label htmlFor='username'>
            Username:
        </label>
        <input 
        type="text"
        id="username"
        ref={userRef}
        required
        autoComplete="on"
        onChange={(e)=> setUser(e.target.value)}
        value={user}
        />
        <label htmlFor='password'>
            Password:
        </label>
        <input 
        type="password"
        id="password"
        required
        autoComplete="off"
        onChange={(e)=> setPwd(e.target.value)}
        value={pwd}
        />
        <button disabled = {!(user&&pwd)}>
          Login
        </button>
        <p>
          Need an account?<br />
          <span className="link">
              <Link to="/register">Register</Link>
          </span>
        </p>
      </form>
    </section>
  )
}

export default Login