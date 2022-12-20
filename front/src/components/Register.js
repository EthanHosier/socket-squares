import {useRef, useState, useEffect} from 'react';
import {faCheck, faTimes, faInfoCircle} from "@fortawesome/free-solid-svg-icons" 
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axios from '../api/axios';

import './css/Login-register.css'

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const REGISTER_URL = '/api/auth/register';


const Register = () => {
  const navigate = useNavigate();
  const {setAuth} = useAuth();

  const userRef = useRef();
  const errRef = useRef();

  const [user,setUser] = useState('');
  const [validName, setValidName] = useState(false); //whether enetered name valid or not  
  const [userFocus, setUserFocus] = useState(false); //whether have focus on username input field or not
  
  const [pwd,setPwd] = useState("");
  const [validPwd,setValidPwd] = useState(false);
  const [pwdFocus,setPwdFocus] = useState(false); //whether focus on pwd field

  const [matchPwd,setMatchPwd] = useState("");
  const [validMatch,setValidMatch] = useState(false);
  const [matchFocus,setMatchFocus] = useState(false); //whether focus on match pwd field
  
  const [errMsg, setErrMsg] = useState('');

  //set focus on username when component loads
  useEffect(() =>{
    userRef.current.focus();
  }, [])

  //validate username anytime it changes:
  useEffect(()=>{
    const result = USER_REGEX.test(user);
    setValidName(result);
  }, [user])

  //validate password, anytime pwd or match pwd changes
  useEffect(() => {
    const result = PWD_REGEX.test(pwd);
    setValidPwd(result);
    const match = pwd===matchPwd;
    setValidMatch(match);
  }, [pwd,matchPwd]);

  //clear error message when pwd,user or matchpwd changed:
  useEffect(() => {
    setErrMsg('');
  }, [user,pwd,matchPwd]);

  //submit function:
  const submit = async(e) =>{
    e.preventDefault();

    //revalidate data incase of button enabled w/ JS hack
    const v1 = USER_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);

    if(!v1||!v2){
        setErrMsg("Invalid Entry");
        return;
    }
   
   try{
        const response = await axios.post(REGISTER_URL, JSON.stringify({username: user,password: pwd}), 
        {
            headers: {'Content-Type': 'application/json'},
            withCredentials: true,
        })
        console.log(response.data);
        console.log(response.data.coins)
        navigate("/")
        setAuth({user, coins: response.data.coins, accessToken: response.data.accessToken,id: response.data._id});
        //clear input fields??
        return;
   } catch(err){
        if(!err?.response){
            setErrMsg('No server response');
        }else if(err.response?.status === 409){
            setErrMsg("Username taken");
        }else if(err.response?.status===0){
            setErrMsg("Error connecting to server")
        }
        else{
            setErrMsg("Registration Failed")
        }
        errRef.current.focus();
   }
}


  return (
    <section className="auth">
    {/* p holds error message if error exists; 'aria-live' makes screen reader read message when focused */}
    <p ref={errRef} className={errMsg? "errmsg":"offscreen"} aria-live="assertive">{errMsg}</p>
    <h1>Register</h1>
    <form onSubmit={submit}>
        <label htmlFor="username">
            Username:
            <span className={validName? "valid":"hide"}>
                <FontAwesomeIcon icon={faCheck}/>
            </span>
            <span className={validName || !user ? "hide":"invalid"}>
                <FontAwesomeIcon icon={faTimes}/>
            </span>

        </label>
        <input
            type="text"
            id="username"
            ref={userRef}
            required
            autoComplete="off"
            onChange={(e) => setUser(e.target.value)}
            aria-invalid={validName? "false":"true"}
            aria-describedby="uidnote"
            onFocus={() => setUserFocus(true)}
            onBlur={() => setUserFocus(false)}
        />
        <p id="uidnote" className={userFocus && user && !validName? "instructions":"offscreen"}>
            <FontAwesomeIcon icon ={faInfoCircle}/>
            4 to 24 Characters. <br />
            Must begin with a letter. <br />
            Letters, numbers, underscores, hyphens allowed.
        </p>

        <label htmlFor="password">
            Password:
            <span className={validPwd? "valid":"hide"}>
                <FontAwesomeIcon icon={faCheck}/>
            </span>
            <span className={validPwd || !pwd ? "hide":"invalid"}>
                <FontAwesomeIcon icon={faTimes}/>
            </span>

        </label>
        <input
            type="password"
            id="password"
            onChange={(e) => setPwd(e.target.value)}
            required
            aria-invalid={validPwd? "false":"true"}
            aria-describedby="pwdnote"
            onFocus={() => setPwdFocus(true)}
            onBlur={() => setPwdFocus(false)}
        />
        <p id="pwdnote" className={pwdFocus && pwd && !validPwd? "instructions":"offscreen"}>
            <FontAwesomeIcon icon ={faInfoCircle}/>
            8 to 24 Characters. <br />
            Must include uppercase and lowecase letters, a number and a special character<br />
            Allowed special characters: <span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
        </p>
        
        <label htmlFor="confirm_pwd">
            Confirm Password:
            <span className={validMatch && matchPwd && validPwd? "valid":"hide"}>
                <FontAwesomeIcon icon={faCheck}/>
            </span>
            <span className={validMatch || !matchPwd ? "hide":"invalid"}>
                <FontAwesomeIcon icon={faTimes}/>
            </span>

        </label>
        <input
            type="password"
            id="confirm_pwd"
            required
            onChange={(e) => setMatchPwd(e.target.value)}
            aria-invalid={validName? "false":"true"}
            aria-describedby="uidnote"
            onFocus={() => setMatchFocus(true)}
            onBlur={() => setMatchFocus(false)}
        />
        <p id="uidnote" className={matchFocus && !validMatch? "instructions":"offscreen"}>
            <FontAwesomeIcon icon ={faInfoCircle}/>
            Passwords must match.
        </p>

        {/*(Button type is submit by default)*/}
        <button disabled = {!validName || !validPwd || !validMatch? true:false}>
            Sign Up
        </button>

        <p>
            Already registered? <br />
            <span className="line">
                {/*PUT ROUTER LINK HERE*/}
                <Link to="/login">Login</Link>
            </span>
        </p>
    </form>
</section>
  )
}

export default Register