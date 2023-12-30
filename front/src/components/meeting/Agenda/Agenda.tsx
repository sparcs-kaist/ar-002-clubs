/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React, { useState } from "react";
import "./style.css";

interface Props {
  className: any;
  number: number;
  title: string;
  decision: string;
  total: number;
  pros: number;
  cons: number;
  giveup: number;
  property: "variant-2" | "default" | "variant-1";
  onUpdate: (updatedAgend: any) => void;
  onDelete: () => void;
}

export const Agenda = ({
  className,
  number,
  title,
  decision,
  total,
  pros,
  cons,
  giveup,
  property,
  onUpdate,
  onDelete,
}: Props): JSX.Element => {
  const [localTitle, setLocalTitle] = useState(title);
  const [localDecision, setLocalDecision] = useState(decision);
  const [localTotal, setLocalTotal] = useState(total);
  const [localPros, setLocalPros] = useState(pros);
  const [localCons, setLocalCons] = useState(cons);
  const [localGiveup, setLocalGiveup] = useState(giveup);

  const handleSave = () => {
    const updatedAgenda = {
      number,
      title: localTitle,
      decision: localDecision,
      total: localTotal,
      pros: localPros,
      cons: localCons,
      giveup: localGiveup,
      property: "variant-2",
    };
    onUpdate(updatedAgenda);
  };

  const handleEdit = () => {
    onUpdate({ ...Agenda, property: "default" });
  };

  return (
    <div className={`agenda property-1-${property} ${className}`}>
      {property === "default" && (
        <>
          <div className="group">
            <div className="frame">
              <div className="text-wrapper-4">안건{number}</div>
            </div>
          </div>
          <div className="overlap-group-wrapper">
            <input
              type="text"
              placeholder="안건 제목"
              value={localTitle}
              className="div-wrapper"
              onChange={(e) => setLocalTitle(e.target.value)}
            />
          </div>
          <div className="text-wrapper-7">안건내용</div>
          <textarea
            placeholder="안건 내용"
            value={localDecision}
            className="overlap-2"
            onChange={(e) => {
              setLocalDecision(e.target.value);
            }}
          />
          <div className="text-wrapper-7">표결결과</div>
          <div className="frame-2">
            <div className="frame-3">
              <div className="text-wrapper-8">재석:</div>
              <div className="group-3">
                <div className="overlap-group-2">
                  <input
                    type="text"
                    placeholder="0"
                    value={localTotal}
                    className="rectangle"
                    onChange={(e) =>
                      setLocalTotal(
                        Number(e.target.value) ? Number(e.target.value) : 0
                      )
                    }
                  />
                </div>
              </div>
              <div className="text-wrapper-10">명</div>
            </div>
            <div className="frame-4">
              <div className="text-wrapper-8">찬성:</div>
              <div className="group-3">
                <div className="overlap-group-2">
                  <input
                    type="text"
                    placeholder="0"
                    value={localPros}
                    className="rectangle"
                    onChange={(e) =>
                      setLocalPros(
                        Number(e.target.value) ? Number(e.target.value) : 0
                      )
                    }
                  />
                </div>
              </div>
              <div className="text-wrapper-10">명</div>
            </div>
            <div className="frame-5">
              <div className="text-wrapper-8">반대:</div>
              <div className="group-3">
                <div className="overlap-group-2">
                  <input
                    type="text"
                    placeholder="0"
                    value={localCons}
                    className="rectangle"
                    onChange={(e) =>
                      setLocalCons(
                        Number(e.target.value) ? Number(e.target.value) : 0
                      )
                    }
                  />
                </div>
              </div>
              <div className="text-wrapper-10">명</div>
            </div>
            <div className="frame-6">
              <div className="text-wrapper-8">기권:</div>
              <div className="group-3">
                <div className="overlap-group-2">
                  <input
                    type="text"
                    placeholder="0"
                    value={localGiveup}
                    className="rectangle"
                    onChange={(e) =>
                      setLocalGiveup(
                        Number(e.target.value) ? Number(e.target.value) : 0
                      )
                    }
                  />
                </div>
              </div>
              <div className="text-wrapper-10">명</div>
            </div>
          </div>
          <div className="frame-wrapper" onClick={handleSave}>
            <div className="frame-7">
              <div className="text-wrapper-11">안건 저장</div>
            </div>
          </div>
        </>
      )}

      {["variant-2", "variant-1"].includes(property) && (
        <div className="frame-8">
          <div className="frame-9">
            <p className="element-SPARCS">
              <span className="span">안건{number}: </span>
              <span className="agenda-text-wrapper-12">{localTitle}</span>
            </p>
            {property === "variant-2" && (
              <>
                <div className="text-wrapper-13" onClick={handleEdit}>
                  수정
                </div>
                <div className="text-wrapper-14" onClick={onDelete}>
                  삭제
                </div>
              </>
            )}
          </div>
          <div className="text-wrapper-7">안건내용</div>
          <div className="text-wrapper-15">{localDecision}</div>
          <div className="text-wrapper-7">표결결과</div>
          <div className="frame-10">
            <div className="frame-11">
              <div className="text-wrapper-8">재석:</div>
              <div className="text-wrapper-16">{localTotal}명</div>
            </div>
            <div className="frame-11">
              <div className="text-wrapper-8">찬성:</div>
              <div className="text-wrapper-16">{localPros}명</div>
            </div>
            <div className="frame-11">
              <div className="text-wrapper-8">반대:</div>
              <div className="text-wrapper-16">{localCons}명</div>
            </div>
            <div className="frame-11">
              <div className="text-wrapper-8">기권:</div>
              <div className="text-wrapper-16">{localGiveup}명</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Agenda.propTypes = {
  property1: PropTypes.oneOf(["variant-2", "variant-3", "default"]),
};
