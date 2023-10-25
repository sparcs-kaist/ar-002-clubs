import React from "react";
import "./style.css";
import CafeLogo from 'assets/Images/CafeLogo.png'

interface Props {
  title: string;
  author: string;
  date: string;
  url: string;
}

export const CafenoticeList = ({ title, author, date, url }: Props): JSX.Element => {
  const handleClick = () => {
    window.open(url, '_blank');
  };

  return (
    <div className="cafenotice-list" onClick={handleClick} style={{cursor: 'pointer'}}>
      <div className="text-wrapper-2">{title}</div>
      <div className="text-wrapper-3">작성자: {author}</div>
      <div className="text-wrapper-4">{date}</div>
      <img className="image" alt="Image" src={CafeLogo} />
    </div>
  );
};
