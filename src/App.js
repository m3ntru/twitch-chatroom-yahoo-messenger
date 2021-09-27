import React from 'react';
import avatar1 from './img/avatar1.gif';
import avatar2 from './img/avatar2.gif';
import sleep from './img/sleep.png';
import { Chatbox } from './Chatbox';
import './App.css';

function App() {
  const paramsTitle = new URLSearchParams(window.location.search).get("title");
  const paramsStatus = new URLSearchParams(window.location.search).get("status");
  const paramsRival = new URLSearchParams(window.location.search).get("rival");
  const paramsSelf = new URLSearchParams(window.location.search).get("self");
  const paramsSleep = new URLSearchParams(window.location.search).get("sleep");
  const avatarRival = (paramsRival) ? `https://i.imgur.com/${paramsRival}` : avatar1;
  const avatarSelf = (paramsSelf) ? `https://i.imgur.com/${paramsSelf}` : avatar2;
  const isSleep = (paramsSleep == "true") ? true : false;

  return (
    <div className="App">
      <div className="title">{paramsTitle}</div>
      <div className="status">{paramsStatus}</div>
      <Chatbox />
      <img className="avatar-rival" src={avatarRival} alt="avatarRival" />
      <img className="avatar-self" src={avatarSelf} alt="avatarSelf" />
      <img className="avatar-self" src={avatarSelf} alt="avatarSelf" />
      {(isSleep)?
      <img className="sleep" src={sleep} alt="sleep" />
      :
      ""
      }
    </div>
  );
}

export default App;
