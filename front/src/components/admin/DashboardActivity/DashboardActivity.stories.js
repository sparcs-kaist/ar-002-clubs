import { DashboardActivity } from ".";

export default {
  title: "Components/DashboardActivity",
  component: DashboardActivity,
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
    activityStateProperty1: "variant-2",
  },
};
