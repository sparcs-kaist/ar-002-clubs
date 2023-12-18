import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRepresentativeStatus } from "hooks/useUserRepresentativeStatus";
import { Activity } from "components/Activity";
import { ActivityState } from "components/ActivityState";
import { SubTitle } from "components/SubTitle";
import { UnderBar } from "components/UnderBar";
import { UpperBar } from "components/UpperBar";
import "./ClubManage.css";

export const ClubManage = (): JSX.Element => {
  const { typeId, clubId, isLoading } = useUserRepresentativeStatus();

  return (
    <div className="club-manage">
      <div className="frame-8">
        <UpperBar title="동아리 관리" className="upper-bar" />
        <div className="frame-wrapper">
          <div className="frame-12">
            <div className="frame-13">
              <SubTitle
                className="sub-title-instance"
                divClassName="design-component-instance-node"
                text="동아리 대표자"
              />
              <div className="frame-14">
                <div className="overlap-group-wrapper">
                  <div className="overlap-group">
                    <div className="frame-15">
                      <div className="text-wrapper-8">20220123 정민호</div>
                    </div>
                    <p className="p">
                      <span className="span">대표자 :</span>
                      <span className="text-wrapper-9">&nbsp;</span>
                    </p>
                  </div>
                </div>
                <div className="overlap-group-wrapper">
                  <div className="overlap-group">
                    <div className="frame-15">
                      <div className="text-wrapper-8">20220123 정민호</div>
                    </div>
                    <p className="p">
                      <span className="span">대의원 :</span>
                      <span className="text-wrapper-9">&nbsp;</span>
                    </p>
                  </div>
                </div>
                <div className="overlap-group-wrapper">
                  <div className="overlap-group">
                    <div className="frame-15">
                      <div className="text-wrapper-8">20220123 정민호</div>
                    </div>
                    <p className="p">
                      <span className="span">대의원 :</span>
                      <span className="text-wrapper-9">&nbsp;</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="frame-16">
              <SubTitle
                className="sub-title-instance"
                divClassName="design-component-instance-node"
                text="동아리 설명"
              />
              <div className="frame-17">
                <div className="frame-18">
                  <p className="text-wrapper-10">
                    흔히 듣는 가요에서부터 팝, 락, 연주곡까지 하고 싶은 음악을
                    마음껏 할 수 있는 곳이 바로 뮤즈입니다. 다양한 장르의 곡들의
                    보컬을 합창 혹은 중창 등 다성부 곡으로 직접 편곡해서
                    공연한답니다. 소프라노, 알토, 테너, 베이스로 이루어진
                    4성부가 기본이지만 곡에 따라 어울리는 편곡을 하기 때문에
                    3성부, 5성부, 듀엣과 코러스로 이루어지기도 합니다. 뮤즈는
                    노래의 반주도 직접 연주한다는 것이 특징입니다. 일렉 기타,
                    일렉베이스 기타, 드럼, 키보드, 어쿠스틱 기타를 비롯해,
                    바이올린, 색소폰, 플룻 같은 악기도 연주할 수 있답니다.
                    처음부터 잘하는 경우보다, 동아리에 들어와서 배우기 시작한
                    악기를 공연에서 멋지게 연주하는 사람들이 대부분이죠!
                    뮤즈에서는 세션교실을 통해서 배우고 싶었던 악기들을 배울 수
                    있습니다. 악기를 하는 사람들과 노래를 하는 사람들을 따로
                    구분하지 않기 때문에 노래와 악기연주 모두 할 수 있답니다!
                    거리공연이나 딸기파티, MT와 같은 다른 행사들도 많지만,
                    무엇보다 가장 큰 행사인 정기공연은 1년에 두 번, 5월과 11월에
                    있습니다. 공연 직전 한 달 여간의 연습 기간이야말로 너무나
                    좋은 동아리 사람들과 더없이 친해질 수 있는 좋은 기회입니다.
                    직접 무대에서 사람들과 함께 다른 사람들에게 노래를 선보이는
                    새로운 경험도 할 수 있습니다.
                  </p>
                </div>
              </div>
              <div className="frame-19">
                <div className="frame-20">
                  <div className="text-wrapper-11">설명 저장</div>
                </div>
              </div>
              <div className="frame-21">
                <div className="frame-13">
                  <SubTitle
                    className="sub-title-instance"
                    divClassName="design-component-instance-node"
                    text="활동 보고서"
                  />
                  <div className="frame-22">
                    <Activity
                      activityStateProperty1="variant-2"
                      className="activity-instance"
                      property1="variant-2"
                    />
                    <Activity
                      activityStateProperty1="variant-2"
                      className="activity-instance"
                      property1="default"
                    />
                    <Activity
                      activityStateProperty1="variant-3"
                      className="activity-instance"
                      property1="default"
                    />
                    <Activity
                      activityStateProperty1="variant-2"
                      className="activity-instance"
                      property1="default"
                    />
                    <Activity
                      activityStateProperty1="default"
                      className="activity-instance"
                      property1="default"
                    />
                    <Activity
                      activityStateProperty1="default"
                      className="activity-instance"
                      property1="default"
                    />
                    <Activity
                      activityStateProperty1="default"
                      className="activity-instance"
                      property1="default"
                    />
                    <Activity
                      activityStateProperty1="default"
                      className="activity-instance"
                      property1="default"
                    />
                    <Activity
                      activityStateProperty1="default"
                      className="activity-instance"
                      property1="default"
                    />
                    <Activity
                      activityStateProperty1="default"
                      className="activity-instance"
                      property1="default"
                    />
                    <Activity
                      activityStateProperty1="default"
                      className="activity-instance"
                      property1="default"
                    />
                  </div>
                  <div className="frame-28">
                    <div className="rectangle" />
                    <div className="frame-29">
                      <div className="group-3">
                        <div className="overlap-group-2">
                          <div className="ellipse" />
                          <div className="text-wrapper-13">+</div>
                        </div>
                      </div>
                      <div className="text-wrapper-14">활동 추가하기</div>
                    </div>
                  </div>
                </div>
                <div className="frame-13">
                  <SubTitle
                    className="sub-title-instance"
                    divClassName="design-component-instance-node"
                    text="지도교수 확인"
                  />
                  <div className="frame-14">
                    <p className="text-wrapper-15">
                      2022.12.17. ~ 2023.06.16. 기간 중 <br />
                      궁극의 맛의 동아리 활동이 위 활동보고서와 일치함을
                      확인하고 이에 서명합니다.
                    </p>
                  </div>
                  <div className="frame-14">
                    <div className="frame-30">
                      <div className="text-wrapper-16">지도교수: 이해신</div>
                      <ActivityState property1="default" />
                    </div>
                    <div className="group-4">
                      <div className="frame-20">
                        <div className="text-wrapper-11">확인하기</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <UnderBar />
      </div>
    </div>
  );
};
