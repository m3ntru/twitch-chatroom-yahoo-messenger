import React, { useState, useEffect, useRef } from 'react';
import tmi from 'tmi.js'
import Converter from './model/Converter';
import parse from 'html-react-parser';

export const Chatbox = () => {
  const chatBoxref = useRef(null);
  const [messages, setMessges] = useState([
    {
      name: "System",
      msg: "initializing...",
      color: "#000000",
      emotes: null
    }
  ]);

  useEffect(() => {
    tmiInit();
  }, []);

  useEffect(() => {
    chatBoxref.current.scrollTop = chatBoxref.current.scrollHeight;
  }, [messages]);

  const tmiInit = () => {
    const paramsId = new URLSearchParams(window.location.search).get("id");
    const client = new tmi.Client({
      options: { debug: true, messagesLogLevel: "info" },
      connection: {
        reconnect: true,
        secure: true
      },
      identity: {
        username: "justinfan123456",
        password: ""
      },
      channels: [paramsId]
    });
    client.connect().then((data) => {
      setMessges(preArray => [...preArray,
      {
        name: "System",
        msg: "Joined " + paramsId,
        color: "#000000",
        emotes: null
      }
      ]);
    }).catch((err) => {
      console.log(err)
    });

    client.on("message", (target, context, msg, self) => {
      messageUpdate(target, context, msg, self)
    });
  };

  const messageUpdate = (target, context, msg, self) => {
    setMessges(preArray => {
      if (preArray.length === 25) {
        preArray.shift();
      }
      return [...preArray,
      {
        name: context["display-name"],
        msg,
        color: context.color,
        emotes: context.emotes
      }
      ]
    });
  }

  return (
    <div className="App">
      <div ref={chatBoxref} className="chat-box">
        {messages.map((data, index) => (
          <div className="text" key={index} ><span style={{ fontWeight: "bold", color: data.color, fontSize: "13px" }}>{data.name}:</span>
            {parse(Converter.formatTwitchEmotes(data.msg, data.emotes))}
          </div>
        ))}
      </div>
    </div>
  );
}

