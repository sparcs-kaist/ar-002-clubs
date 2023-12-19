import React from "react";
import { Activity } from "../../components/Activity";
import { ActivityProof } from "../../components/ActivityProof";
import { LoadingBar } from "../../components/LoadingBar";
import { SubTitle } from "../../components/SubTitle";
import { UnderBar } from "../../components/UnderBar";
import { UpperbarMenu } from "../../components/UpperbarMenu";
import "./AddActivity.css";
import { UpperBar } from "components/UpperBar";

export const AddActivity = (): JSX.Element => {
  return (
    <div className="add-activity">
      <div className="frame-3">
        <UpperBar className={"upper-bar"} />
        <div className="frame-wrapper">
          <div className="frame-7">
            <div className="frame-8">
              <SubTitle className="sub-title-instance" text="활동 정보" />
              <div className="frame-9">
                <p className="div-2">
                  <span className="span">활동명: </span>
                  <span className="text-wrapper-8">
                    석림태울제 부스 홍보 및 준비
                  </span>
                </p>
                <p className="div-3">
                  <span className="span">공식 분류: </span>
                  <span className="text-wrapper-8">
                    합치하지 않는 내부 활동
                  </span>
                </p>
                <p className="div-3">
                  <span className="span">시작 일시:</span>
                  <span className="text-wrapper-8"> 2023-10-10</span>
                </p>
                <p className="div-3">
                  <span className="span">종료 일시:</span>
                  <span className="text-wrapper-8"> 2023-10-10</span>
                </p>
                <p className="div-3">
                  <span className="span">장소:</span>
                  <span className="text-wrapper-8"> 동아리방</span>
                </p>
                <p className="div-3">
                  <span className="span">활동 목적:</span>
                  <span className="text-wrapper-8"> 동아리원 친목 도모</span>
                </p>
              </div>
            </div>
            <div className="frame-10">
              <SubTitle className="sub-title-instance" text="참여 회원" />
              <div className="frame-9">
                <p className="div-2">
                  <span className="span">총원:</span>
                  <span className="text-wrapper-8"> 40명</span>
                </p>
                <p className="text-wrapper-9">
                  정민호, 정민호, 정민호, 정민호, 정민호, 정민호, 정민호,
                  정민호, 정민호, 정민호, 정민호, 정민호, 정민호, 정민호,
                  정민호, 정민호, 정민호, 정민호, 정민호, 정민호, 정민호,
                  정민호, 정민호, 정민호, 정민호, 정민호, 정민호, 정민호,
                  정민호, 정민호, 정민호, 정민호, 정민호, 정민호, 정민호,
                  정민호, 정민호, 정민호, 정민호,
                </p>
              </div>
            </div>
            <div className="frame-11">
              <SubTitle className="sub-title-instance" text="활동 내용" />
              <div className="frame-9">
                <p className="text-wrapper-10">
                  부스 준비 위원회를 결성하여 홍보물 제작 및 게시, 예산안 작성
                  등의 준비를 하고, 요리 연습도 하였습니다.
                </p>
              </div>
            </div>
            <div className="frame-12">
              <SubTitle className="sub-title-instance" text="활동 증빙" />
              <div className="frame-9">
                <p className="text-wrapper-10">
                  왼쪽 위에서부터 00사진, 00사진, 00사진 입니다.
                </p>
              </div>
              <div className="frame-9">
                <div className="frame-13">
                  <ActivityProof
                    className="activity-proof-instance"
                    property1="variant-2"
                  />
                  <ActivityProof
                    className="activity-proof-instance"
                    property1="default"
                  />
                </div>
                <div className="frame-13">
                  <ActivityProof
                    className="activity-proof-instance"
                    property1="default"
                  />
                  <ActivityProof
                    className="activity-proof-instance"
                    property1="default"
                  />
                </div>
              </div>
              <div className="frame-14">
                <div className="frame-15">
                  <div className="text-wrapper-11">활동 저장</div>
                </div>
              </div>
            </div>
            <div className="frame-11">
              <SubTitle className="sub-title-instance" text="검토 결과" />
              <div className="frame-9">
                {/* <Activity
                  className="design-component-instance-node"
                  text="2023.12.31. 19:58:00"
                />
                <Activity
                  className="design-component-instance-node"
                  text="2023.12.31. 19:59:00"
                  text1="증빙 사진1의 인원이 맞지 않습니다."
                />
                <Activity
                  className="design-component-instance-node"
                  text="2023.01.01. 19:58:00"
                  text1="증빙 사진1의 인원이 맞지 않습니다."
                /> */}
              </div>
            </div>
          </div>
        </div>
        <UnderBar />
      </div>
    </div>
  );
};
