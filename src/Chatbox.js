import React, { useState, useEffect, useRef } from 'react';
import tmi from 'tmi.js'
import Converter from './model/Converter';
import parse from 'html-react-parser';

export const Chatbox = () => {
  const chatBoxref = useRef(null);
  const [messages, setMessges] = useState([
    {
      name: "System",
      id: "System",
      msg: "initializing...",
      color: "#000000",
      emotes: null
    }
  ]);

  useEffect(() => {
    tmiInit();
  }, []);

  useEffect(() => {
    chatBoxref.current.scrollIntoView({ behavior: "auto" })
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
        id: "System",
        msg: "Joined " + paramsId,
        color: "#000000",
        emotes: null
      }
      ]);
    }).catch((err) => {
      console.log(err)
    });

    client.on("message", (target, context, msg, self) => {
      messageUpdate(context, msg);
    });

    client.on("timeout", (channel, username, reason, duration, userstate) => {
      setMessges(preArray => {
        preArray = preArray.filter(({ id }) => id !== username);
        return [...preArray,
          {
            name: "timeout",
            id: "timeout",
            msg: username + " 吃ㄌ" + duration + "秒的刀",
            color: "#0000FF",
            emotes: null
          }]
      }
      )
    });

    client.on('cheer', (channel, userstate, message) => {
      var result = Converter.formatText(message, [".", "!", "?", ":", ";", ",", " "], 90, userstate.emotes);
      messageUpdate(userstate, result.display)
    });
  };

  const messageUpdate = (context, msg) => {
    setMessges(preArray => {
      if (preArray.length === 15) {
        preArray.shift();
      }
      return [...preArray,
      {
        name: context["display-name"],
        msg,
        id: context.username,
        color: context.color,
        emotes: context.emotes
      }
      ]
    });
  }

  return (
    <div className="App">
      <div className="chat-box">
        {messages.map((data, index) => (
          (data.id == "timeout")?
          <div className="text" style={{fontStyle: "italic", fontSize: "12px", color: "blue"}} key={index}>
            {parse(Converter.formatTwitchEmotes(data.msg, data.emotes))}
          </div>
          :
          <div className="text" key={index}><span style={{ fontWeight: "bold", color: data.color, fontSize: "14px", marginTop: "14px"}}>{data.name + ": "}</span>
            {parse(Converter.formatTwitchEmotes(data.msg, data.emotes))}
          </div>
        ))}
        <div ref={chatBoxref} />
      </div>
    </div>
  );
}

