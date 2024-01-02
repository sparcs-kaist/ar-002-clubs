import { ActivityFeedback } from ".";

export default {
  title: "Components/ActivityFeedback",
  component: ActivityFeedback,
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
  },
};
