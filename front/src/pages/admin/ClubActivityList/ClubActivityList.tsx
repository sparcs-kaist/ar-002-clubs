import React from "react";
import { DashboardActivity } from "components/admin/DashboardActivity";
import { SubTitle } from "components/home/SubTitle";
import { UnderBar } from "components/home/UnderBar";
import "./ClubActivityList.css";
import { UpperBar } from "components/home/UpperBar";

export const ClubActivityList = (): JSX.Element => {
  return (
    <div className="club-activity-list">
      <div className="frame-6">
        <UpperBar className={"upper-bar"} title={"0000 동아리"} />
        <div className="frame-wrapper">
          <div className="frame-10">
            <div className="frame-11">
              <div className="frame-12">
                <div className="frame-13">
                  <SubTitle
                    className="sub-title-instance"
                    text="활동 보고서 검토 현황"
                  />
                  <div className="frame-14">
                    <DashboardActivity
                      className="design-component-instance-node"
                      title="zero"
                      activityStateProperty1="default"
                    />
                    <DashboardActivity
                      activityStateProperty1="default"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="default"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="default"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                    <DashboardActivity
                      activityStateProperty1="variant-2"
                      className="design-component-instance-node"
                      title="one"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          U
        </div>
        <UnderBar />
      </div>
    </div>
  );
};
