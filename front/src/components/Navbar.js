import React from 'react'
import { faHome, faInfoCircle, faUser, faCoins } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useAuth from '../hooks/useAuth'

import './css/Navbar.css'

const NAV_DATA = [
    {
        title: "Home",
        link: "/",
        icon: faHome,
    },
    
    {
        title: "About",
        link: "/about",
        icon: faInfoCircle,
    },

    {
        title: "Account",
        link: "/account",
        icon: faUser,
    },
]

const Navbar = () => {
    const {auth} = useAuth();
    return (
    <div className='nav-container'>
        {auth.user? <p>{auth.user}:{auth.coins}</p> : <></>}
        {NAV_DATA.map((btn, i) =>{
            return(<Link to={btn.link} key={i}>
                <button className='nav' 
                id={btn.title} 
                >
                <FontAwesomeIcon icon={btn.icon} />
                </button>
            </Link>)
        })}
        <Link to="/coins">
            <button className='nav' id="coin">
                <FontAwesomeIcon icon={faCoins} />
            </button>
        </Link>
    </div>
  )
}

export default Navbar