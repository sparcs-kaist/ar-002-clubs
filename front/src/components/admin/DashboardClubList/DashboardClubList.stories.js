import { DashboardClubList } from ".";

export default {
  title: "Components/DashboardClubList",
  component: DashboardClubList,
  argTypes: {
    title: {
      options: ["zero", "one"],
      control: { type: "select" },
    },
  },
};

export const Default = {
  args: {
    title: "zero",
    className: {},
    text: "#",
    text1: "동아리명",
    text2: "검토전",
    text3: "승인됨",
    text4: "반려됨",
    text5: "전체",
    text6: "지도교수 서명",
    text7: "담당자",
  },
};
