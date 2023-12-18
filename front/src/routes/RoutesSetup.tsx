import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import { CafeNotice } from "pages/CafeNotice";
import { ClubList } from "pages/ClubList";
import { MyClub } from "pages/MyClub";
import { RecentMeeting } from "pages/RecentMeeting";
import { AddMeeting } from "pages/AddMeeting";
import { MeetingDetail } from "pages/MeetingDetail";
import { EditMeeting } from "pages/EditMeeting";
import { ClubDetail } from "pages/ClubDetail";
import { ClubManage } from "pages/ClubManage";

export default function RouteSetup() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cafe_notice" element={<CafeNotice />} />
      <Route path="/club_list" element={<ClubList />} />
      <Route path="/my_club" element={<MyClub />} />
      <Route path="/recent_meeting/0" element={<RecentMeeting id={0} />} />
      <Route path="/recent_meeting/1" element={<RecentMeeting id={1} />} />
      <Route path="/recent_meeting/2" element={<RecentMeeting id={2} />} />
      <Route path="/recent_meeting/3" element={<RecentMeeting id={3} />} />
      <Route path="/recent_meeting/4" element={<RecentMeeting id={4} />} />
      <Route path="/add_meeting/:id" element={<AddMeeting />} />
      <Route path="/meeting_detail/:id" element={<MeetingDetail />} />
      <Route path="/edit_meeting/:id" element={<EditMeeting />} />
      <Route path="/club_detail/:id" element={<ClubDetail />} />
      <Route path="/club_manage" element={<ClubManage />} />
    </Routes>
  );
}
