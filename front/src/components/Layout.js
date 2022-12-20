//defines basic layout used on all child webpages

import React from 'react'
import { Outlet } from "react-router-dom"
import Footer from './Footer'
import Navbar from './Navbar'
import { useLocation } from 'react-router-dom'
const Layout = () => {
    const location = useLocation();
    
    return(
        <main className='App'>
            <Navbar/>
            <Outlet />
            
            {location.pathname=='/'
            ?<></>
            :<Footer/>}
            
        </main>
    )
}

export default Layout;