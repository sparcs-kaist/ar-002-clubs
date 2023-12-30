import React, { useEffect, useState } from "react";
import { Agenda } from "../../../components/meeting/Agenda";
import { SubTitle } from "../../../components/home/SubTitle";
import { TableEntry } from "../../../components/meeting/TableEntry";
import "./style.css";
import { UpperBar } from "components/home/UpperBar";
import { UnderBar } from "components/home/UnderBar";
import { useNavigate, useParams } from "react-router-dom";
import { getRequest, postRequest } from "utils/api";
import { useAuth } from "contexts/authContext";

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
}

export const MeetingDetail = (): JSX.Element => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

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
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [editor, setEditor] = useState<number>(0);

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

  const deleteMeeting = () => {
    // Show a confirmation dialog
    const isConfirmed = window.confirm("회의를 삭제하시겠습니까?");

    // If the user confirms, send the POST request
    if (isConfirmed) {
      postRequest(
        `meeting/delete/?id=${id}`,
        {},
        () => {
          navigate("/recent_meeting/0");
        },
        (error) => {
          // Handle any errors
          alert(`삭제 중 오류가 발생했습니다`);
        }
      );
    }
  };

  const editMeeting = () => {
    navigate(`/edit_meeting/${id}`);
  };

  useEffect(() => {
    const url = `meeting/detail/?id=${id}`;
    getRequest(url, (data) => {
      if (data) {
        setTitle(data.title);
        setSelectedDate(data.meetingDate);
        setAttendees(data.attendees);
        setAgendas(data.agendas);
        setEditor(data.editorId);
      } else {
        console.error("Error fetching meeting details");
      }
    });
  }, [id]);

  return (
    <div className="meeting-detail">
      <UpperBar className={""} title={title} />
      {user && user.student_id === editor ? (
        <>
          <div
            className="text-wrapper-12"
            style={{ cursor: "pointer" }}
            onClick={editMeeting}
          >
            수정
          </div>
          <div
            className="text-wrapper-13"
            style={{ cursor: "pointer" }}
            onClick={deleteMeeting}
          >
            삭제
          </div>
        </>
      ) : (
        <></>
      )}
      <div className="frame-15">
        <div className="frame-16">
          <SubTitle
            className="sub-title-instance"
            divClassName="sub-title-instance"
            text="회의일시"
          />
          <div className="group-6" style={{ marginLeft: "20px" }}>
            <div className="overlap-group-4">
              <div className="text-wrapper-21" style={{ border: "none" }}>
                {selectedDate}
              </div>
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
                className="des ign-component-instance-node-2"
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
                  property1="default"
                  text={attendee.Name}
                />
                <TableEntry
                  className="design-component-instance-node-2"
                  property1="default"
                  text={POSITION_OPTIONS[attendee.PositionId - 1]}
                />
                <TableEntry
                  className="design-component-instance-node-2"
                  property1="default"
                  text={ATTENDANCE_OPTIONS[attendee.TypeId - 1]}
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
                property={"variant-1"}
                onUpdate={(updatedAgenda: any) =>
                  updateAgenda(index, updatedAgenda)
                }
                onDelete={() => deleteAgenda(index)}
              />
            ))}
          </div>
        </div>
        <UnderBar />
      </div>
    </div>
  );
};
