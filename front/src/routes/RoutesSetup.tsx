import {Routes, Route} from 'react-router-dom'
import Home from './Home'
import { CafeNotice } from 'pages/CafeNotice'
import { ClubList } from 'pages/ClubList'

export default function RouteSetup() {
    return (
        <Routes>
            <Route path= "/" element = {<Home/>}/>
            <Route path= "/cafe_notice" element = {<CafeNotice/>}/>
            <Route path= "/club_list" element = {<ClubList/>}/>
        </Routes>
    )
}