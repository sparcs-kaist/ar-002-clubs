import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import { CafeNotice } from "pages/home/CafeNotice";
import { ClubList } from "pages/club/ClubList";
import { MyClub } from "pages/club/MyClub";
import { RecentMeeting } from "pages/meeting/RecentMeeting";
import { AddMeeting } from "pages/meeting/AddMeeting";
import { MeetingDetail } from "pages/meeting/MeetingDetail";
import { EditMeeting } from "pages/meeting/EditMeeting";
import { ClubDetail } from "pages/club/ClubDetail";
import { ClubManage } from "pages/club/ClubManage";
import { AddActivity } from "pages/activity/AddActivity";
import { ActivityDetail } from "pages/activity/ActivityDetail";
import { EditActivity } from "pages/activity/EditActivity";
import { Admin } from "pages/admin/Admin";
import { ActivityFeedback } from "pages/admin/ActivityFeedback";

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
      <Route path="/add_activity" element={<AddActivity />} />
      <Route path="/activity_detail/:id" element={<ActivityDetail />} />
      <Route path="/edit_activity/:id" element={<EditActivity />} />

      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/activity_feedback" element={<ActivityFeedback />} />
    </Routes>
  );
}
