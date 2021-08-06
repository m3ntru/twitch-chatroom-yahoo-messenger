import React, { useEffect, useRef } from 'react';
import avatar1 from './img/avatar1.gif';
import avatar2 from './img/avatar2.gif';
import { Chatbox } from './Chatbox';
import './App.css';

function App() {
  const paramsTitle = new URLSearchParams(window.location.search).get("title");
  const paramsStatus = new URLSearchParams(window.location.search).get("status");

  return (
    <div className="App">
      <div className="title">{paramsTitle}</div>
      <div className="status">{paramsStatus}</div>
      <Chatbox />
      <img className="avatar-one" src={avatar1} alt="avatar1" />
      <img className="avatar-two" src={avatar2} alt="avatar2" />
    </div>
  );
}

export default App;
