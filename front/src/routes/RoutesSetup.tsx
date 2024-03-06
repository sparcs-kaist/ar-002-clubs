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
import { ActivityFeedbackScreen } from "pages/admin/ActivityFeedbackScreen";
import { ActivityDashboard } from "pages/admin/ActivityDashboard";
import { ClubActivityList } from "pages/admin/ClubActivityList";
import { ActivityAdminDetail } from "pages/admin/ActivityAdminDetail";
import { AddFunding } from "pages/funding/AddFunding";
import { FundingDetail } from "pages/funding/FundingDetail";
import { EditFunding } from "pages/funding/EditFunding";
import { FundingFeedbackScreen } from "pages/admin/FundingFeedback/FundingFeedbackScreen";
import { FundingDashboard } from "pages/admin/FundingDashboard";
import { ClubFundingList } from "pages/admin/ClubFundingList";
import { FundingAdminDetail } from "pages/admin/FundingAdminDetail";
import { ClubRegistration } from "pages/registration/ClubRegistration";
import { AddClubRegistration } from "pages/registration/AddClubRegistration";
import { AddClubRegistrationActivity } from "pages/registration/AddClubRegistrationActivity";
import { ClubRegistrationActivityDetail } from "pages/registration/ClubRegistrationActivityDetail";
import { EditClubRegistrationActivity } from "pages/registration/EditClubRegistrationActivity";
import { ClubRegistrationDetail } from "pages/registration/ClubRegistrationDetail";
import { EditClubRegistration } from "pages/registration/EditClubRegistration";
import { ClubRegistrationDashboard } from "pages/admin/ClubRegistrationDashboard";
import { ClubRegistrationAdminDetail } from "pages/admin/ClubRegistrationAdminDetail";

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

      {/* 등록 */}
      <Route path="/club_registration" element={<ClubRegistration />} />
      <Route
        path="/add_club_registration/promotional"
        element={<AddClubRegistration type="promotional" />}
      />
      <Route
        path="/add_club_registration/provisional"
        element={<AddClubRegistration type="provisional" />}
      />
      <Route
        path="/add_club_registration/renewal"
        element={<AddClubRegistration type="renewal" />}
      />
      <Route
        path="/add_club_registration/add_activity"
        element={<AddClubRegistrationActivity />}
      />
      <Route
        path="/add_club_registration/edit_activity/:id"
        element={<EditClubRegistrationActivity />}
      />
      <Route
        path="/add_club_registration/activity_detail/:id"
        element={<ClubRegistrationActivityDetail />}
      />
      <Route
        path="/club_registration_detail/:id"
        element={<ClubRegistrationDetail />}
      />
      <Route
        path="/edit_club_registration/:id"
        element={<EditClubRegistration />}
      />

      {/* 활동 보고서 */}
      <Route path="/add_activity" element={<AddActivity />} />
      <Route path="/activity_detail/:id" element={<ActivityDetail />} />
      <Route path="/edit_activity/:id" element={<EditActivity />} />

      {/* 지원금 */}
      <Route path="/add_funding" element={<AddFunding />} />
      <Route path="/funding_detail/:id" element={<FundingDetail />} />
      <Route path="/edit_funding/:id" element={<EditFunding />} />

      {/*활동보고서 검토 */}
      <Route path="/admin" element={<Admin />} />
      <Route
        path="/admin/activity_feedback"
        element={<ActivityFeedbackScreen />}
      />
      <Route path="/admin/activity_dashboard" element={<ActivityDashboard />} />
      <Route path="/admin/club_activity/:id" element={<ClubActivityList />} />
      <Route path="/admin/activity/:id" element={<ActivityAdminDetail />} />

      {/*지원금 검토 */}
      <Route
        path="/admin/funding_feedback"
        element={<FundingFeedbackScreen />}
      />
      <Route path="/admin/funding_dashboard" element={<FundingDashboard />} />
      <Route path="/admin/club_funding/:id" element={<ClubFundingList />} />
      <Route path="/admin/funding/:id" element={<FundingAdminDetail />} />

      <Route
        path="/admin/registration_dashboard"
        element={<ClubRegistrationDashboard />}
      />
      <Route
        path="/admin/registration/:id"
        element={<ClubRegistrationAdminDetail />}
      />
    </Routes>
  );
}
