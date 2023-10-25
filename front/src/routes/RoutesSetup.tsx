import {Routes, Route} from 'react-router-dom'
import Home from './Home'
import { CafeNotice } from 'pages/CafeNotice'

export default function RouteSetup() {
    return (
        <Routes>
            <Route path= "/" element = {<Home/>}/>
            <Route path= "/cafe_notice" element = {<CafeNotice/>}/>
        </Routes>
    )
}