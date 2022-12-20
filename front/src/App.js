
import React from 'react'
import Layout from "./components/Layout"
import { Route, Routes } from 'react-router-dom'
import SquaresPage from './components/SquaresPage'
import Login from './components/Login'
import About from './components/About'
import Register from './components/Register'
import PageMissing from './components/PageMissing'
import Account from './components/Account'
import RequireSignIn from "./components/RequireSignIn"
import Coins from './components/Coins'

const App = () => {
  return (
    <Routes>
        <Route path="/" element={<Layout />}>
          {/*Public Routes:*/}
          <Route path="/" element={<SquaresPage/>}/>
          <Route path="About" element={<About/>}/>
          <Route path="Login" element={<Login/>}/>
          <Route path="Register" element={<Register/>}/>

          {/*Protected Routes; TODO: Add photo, get coins */}
          <Route element = {<RequireSignIn />}>
            <Route path="Account" element={<Account />}/>
            <Route path="Coins" element={<Coins />}/>
          </Route>

          {/*Catch*/}
          <Route path="/*" element={<PageMissing />}/>
           
        </Route>
    </Routes>
  )
}

export default App