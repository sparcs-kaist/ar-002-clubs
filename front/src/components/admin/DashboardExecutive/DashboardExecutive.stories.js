import { DashboardExecutive } from ".";

export default {
  title: "Components/DashboardExecutive",
  component: DashboardExecutive,
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
    text1: "집행부원",
    text2: "검토전",
    text3: "승인됨",
    text4: "반려됨",
    text5: "전체 검토",
    text6: "전체 담당",
    text7: "완료율",
  },
};
