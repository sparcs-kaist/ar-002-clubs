import React, { useEffect, useState } from "react";
import { Agenda } from "../../components/Agenda";
import { OptionButton } from "../../components/OptionButton";
import { SubTitle } from "../../components/SubTitle";
import { TableEntry } from "../../components/TableEntry";
import "./style.css";
import { UpperBar } from "components/UpperBar";
import { UnderBar } from "components/UnderBar";
import { useNavigate, useParams } from "react-router-dom";
import { getRequest, postRequest } from "utils/api";

interface Attendee {
  ClubDivision: boolean;
  Club: string;
  ClubId: number;
  Name: string;
  PositionId: number;
  TypeId: number;
}
interface Agenda {
  number: number;
  title: string;
  decision: string;
  total: number;
  pros: number;
  cons: number;
  giveup: number;
  property: any;
}

export const AddMeeting = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRegular, setIsRegular] = useState<boolean>(true);
  const [meetingType, setMeetingType] = useState<number>(
    parseInt(id ? id : "1", 10) || 1
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0] // Initializes with today's date
  );

  const data: Attendee[] = [
    {
      ClubDivision: true,
      Club: "IT Club",
      ClubId: 1,
      Name: "",
      PositionId: 1, // 예: 1이 '회장'을 의미
      TypeId: 1, // 예: 1이 '재석'을 의미
    },
  ];

  const [attendees, setAttendees] = useState<Attendee[]>(data);
  const [meetingDivision, setMeetingDivision] = useState<number>(1);
  const [agendas, setAgendas] = useState<Agenda[]>([]);

  //TODO: Back에서 가지고 오도록 수정
  const DIVISION_OPTIONS = [
    "생활문화",
    "연행예술",
    "전시창작",
    "밴드음악",
    "보컬음악",
    "연주음악",
    "사회",
    "종교",
    "구기체육",
    "생활체육",
    "이공학술",
    "인문학술",
  ];

  //TODO: Back에서 가지고 오도록 수정
  const POSITION_OPTIONS = [
    "회장",
    "부회장",
    "대표자",
    "대의원",
    "대표자대리",
    "분과장",
    "분과장대리",
  ];

  //TODO: Back에서 가지고 오도록 수정
  const ATTENDANCE_OPTIONS = ["재석", "지각", "결석", "조퇴"];

  // 분과 선택 핸들러
  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMeetingDivision(DIVISION_OPTIONS.indexOf(e.target.value) + 1);
  };

  // Handlers for setting state
  const handleRegularityChange = (regularity: boolean) => {
    setIsRegular(regularity);
  };

  const handleMeetingTypeChange = (type: number) => {
    setMeetingType(type);
  };
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  // 이름 변경 핸들러
  const handleNameChange = (index: number, newName: string) => {
    const updatedAttendees = attendees.map((attendee, idx) =>
      idx === index ? { ...attendee, Name: newName } : attendee
    );
    setAttendees(updatedAttendees);
  };

  // 직책 변경 핸들러
  const handlePositionChange = (index: number, newPosition: string) => {
    const updatedPositionId = POSITION_OPTIONS.indexOf(newPosition) + 1;
    const updatedAttendees = attendees.map((attendee, idx) =>
      idx === index ? { ...attendee, PositionId: updatedPositionId } : attendee
    );
    setAttendees(updatedAttendees);
  };

  // 출결상태 변경 핸들러
  const handleAttendanceTypeChange = (index: number, newType: string) => {
    const updatedTypeId = ATTENDANCE_OPTIONS.indexOf(newType) + 1;
    const updatedAttendees = attendees.map((attendee, idx) =>
      idx === index ? { ...attendee, TypeId: updatedTypeId } : attendee
    );
    setAttendees(updatedAttendees);
  };

  const addAgenda = () => {
    const newAgenda = {
      number: agendas.length + 1,
      title: "",
      decision: "",
      total: 0,
      pros: 0,
      cons: 0,
      giveup: 0,
      property: "default",
    };
    setAgendas([...agendas, newAgenda]);
  };

  const updateAgenda = (index: number, updatedAgenda: any) => {
    const updatedAgendas = agendas.map((agenda, idx) =>
      idx === index ? updatedAgenda : agenda
    );
    setAgendas(updatedAgendas);
  };

  const deleteAgenda = (index: number) => {
    const updatedAgendas = agendas.filter((_, idx) => idx !== index);
    setAgendas(updatedAgendas);
  };

  const handleSaveMeeting = async () => {
    const meetingData = {
      typeId: meetingType,
      meetingDivision,
      meetingDate: selectedDate,
      isRegular,
      attendees,
      agendas,
    };

    await postRequest(
      "meeting/add_meeting",
      meetingData,
      (response) => {
        console.log("Meeting saved successfully:", response);
        navigate(`/meeting_detail/${response.data.result}`);
      },
      (error) => {
        alert(`에러가 발생했습니다. 다시 시도해주세요.`);
      }
    );
  };

  useEffect(() => {
    const url = `meeting/attendance_list/?id=${
      meetingType === 4 ? meetingDivision + meetingType : meetingType
    }`;
    getRequest(url, (data) => {
      if (Array.isArray(data)) {
        setAttendees(data);
      } else {
        console.error("Received data is not an array:", data);
        setAttendees([]); // 빈 배열로 설정
      }
    });
  }, [meetingType, meetingDivision]);

  return (
    <div className="add-meeting">
      <UpperBar className={""} title={"회의 추가하기"} />
      <div className="frame-15">
        <div className="frame-16">
          <SubTitle
            className="sub-title-instance"
            divClassName="sub-title-instance"
            text="회의종류"
          />
          <div className="frame-17">
            <div className="frame-18">
              <div className="text-wrapper-20">정기 여부</div>
              <div className="frame-19">
                <OptionButton
                  property1={isRegular ? "variant-2" : "default"}
                  text="정기"
                  clickHandler={() => handleRegularityChange(true)}
                />
                <OptionButton
                  property1={!isRegular ? "variant-2" : "default"}
                  text="비정기"
                  clickHandler={() => handleRegularityChange(false)}
                />
              </div>
            </div>
            <div className="frame-20">
              <div className="text-wrapper-20">회의체 종류</div>
              <div className="frame-21">
                <OptionButton
                  property1={meetingType === 1 ? "variant-2" : "default"}
                  text="전동대회"
                  clickHandler={() => handleMeetingTypeChange(1)}
                />
                <OptionButton
                  property1={meetingType === 2 ? "variant-2" : "default"}
                  text="확운위"
                  clickHandler={() => handleMeetingTypeChange(2)}
                />
                <OptionButton
                  property1={meetingType === 3 ? "variant-2" : "default"}
                  text="운위"
                  clickHandler={() => handleMeetingTypeChange(3)}
                />
                <OptionButton
                  property1={meetingType === 4 ? "variant-2" : "default"}
                  text="분과회의"
                  clickHandler={() => handleMeetingTypeChange(4)}
                />
                {meetingType === 4 ? (
                  <TableEntry
                    className="design-component-instance-node-2"
                    property1="variant-2"
                    dropdownOptions={DIVISION_OPTIONS}
                    dropdownValue={DIVISION_OPTIONS[meetingDivision - 1]}
                    onDropdownChange={handleDivisionChange}
                  />
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
          <SubTitle
            className="sub-title-instance"
            divClassName="sub-title-instance"
            text="회의일시"
          />
          <div className="group-6" style={{ marginLeft: "20px" }}>
            <div className="overlap-group-4">
              <input
                type="date"
                className="text-wrapper-21" // Add your CSS class for styling
                value={selectedDate}
                onChange={handleDateChange}
                style={{ border: "none" }}
              />
            </div>
          </div>
          <SubTitle
            className="sub-title-instance"
            divClassName="sub-title-instance"
            text="회의출석"
          />
          <div className="frame-22">
            <div className="frame-23">
              <TableEntry
                className="table-entry-instance"
                divClassName="table-entry-3"
                overlapGroupClassName="table-entry-2"
                property1="variant-4"
                text="출결대상"
              />
              <TableEntry
                className="design-component-instance-node-2"
                property1="variant-4"
                text="성명"
              />
              <TableEntry
                className="design-component-instance-node-2"
                property1="variant-4"
                text="직책"
              />
              <TableEntry
                className="design-component-instance-node-2"
                property1="variant-4"
                text="출결상태"
              />
            </div>
            {attendees.map((attendee, index) => (
              <div className="frame-23" key={index}>
                <TableEntry
                  className="table-entry-instance"
                  divClassName="table-entry-3"
                  overlapGroupClassName="table-entry-2"
                  property1="default"
                  text={attendee.Club}
                />
                <TableEntry
                  className="design-component-instance-node-2"
                  property1="variant-1"
                  text={attendee.Name}
                  onChange={(e: any) => handleNameChange(index, e.target.value)}
                />
                <TableEntry
                  className="design-component-instance-node-2"
                  property1="variant-2"
                  dropdownOptions={POSITION_OPTIONS}
                  dropdownValue={POSITION_OPTIONS[attendee.PositionId - 1]}
                  onDropdownChange={(e) =>
                    handlePositionChange(index, e.target.value)
                  }
                />
                <TableEntry
                  className="design-component-instance-node-2"
                  property1="variant-2"
                  dropdownOptions={ATTENDANCE_OPTIONS}
                  dropdownValue={ATTENDANCE_OPTIONS[attendee.TypeId - 1]}
                  onDropdownChange={(e) =>
                    handleAttendanceTypeChange(index, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
          <SubTitle
            className="sub-title-instance"
            divClassName="sub-title-instance"
            text="회의안건"
          />
          <div className="frame-24">
            {agendas.map((agenda, index) => (
              <Agenda
                key={index}
                className={"design-component-instance-node"}
                number={index + 1}
                title={agenda.title}
                decision={agenda.decision}
                total={agenda.total}
                pros={agenda.pros}
                cons={agenda.cons}
                giveup={agenda.giveup}
                property={agenda.property}
                onUpdate={(updatedAgenda: any) =>
                  updateAgenda(index, updatedAgenda)
                }
                onDelete={() => deleteAgenda(index)}
              />
            ))}
            <div className="group-7" onClick={addAgenda}>
              <div className="overlap-3">
                <div className="frame-25">
                  <div className="group-8">
                    <div className="overlap-group-5">
                      <div className="ellipse" />
                      <div className="text-wrapper-22">+</div>
                    </div>
                  </div>
                  <div className="text-wrapper-20">안건 추가하기</div>
                </div>
              </div>
            </div>
          </div>
          <div className="frame-26" style={{ marginLeft: "20px" }}>
            <div
              className="frame-27"
              onClick={handleSaveMeeting}
              style={{ cursor: "pointer" }}
            >
              <div className="text-wrapper-23">회의 저장</div>
            </div>
          </div>
        </div>
        <UnderBar />
      </div>
    </div>
  );
};
