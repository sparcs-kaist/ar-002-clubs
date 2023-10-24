import {Routes, Route} from 'react-router-dom'
import Home from './Home'
// import { Login } from 'pages/Login'

export default function RouteSetup() {
    return (
        <Routes>
            <Route path= "/" element = {<Home/>}/>
            {/* <Route path= "/login" element = {<Login/>}/> */}
        </Routes>
    )
}