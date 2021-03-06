import React, { useState, useEffect, useRef } from 'react';
import tmi from 'tmi.js'
import Converter from './model/Converter';
import parse from 'html-react-parser';
import AudioPlayer from 'react-audio-player';
import MsnSound from './sound/msn.mp3';

export const Chatbox = (props) => {
  const chatBoxref = useRef(null);
  const [badge, setBadge] = useState(null);
  const [bttv, setBttv] = useState([]);
  const [bttvCode, setBttvCode] = useState([]);
  const [ffz, setFfz] = useState([]);
  const [ffzCode, setFfzCode] = useState([]);
  const [messages, setMessges] = useState([
    {
      name: "System",
      id: "System",
      msg: "initializing...",
      color: "#000000",
      emotes: null,
      badge: null
    }
  ]);
  const [sound, setSound] = useState(null);
  //const [shakeCoolDown, setShakeCoolDown] = useState(false);
  var shakeCoolDown = false;

  useEffect(() => {
    badgeInit();
    tmiInit();
    bttvInit();
    FFZInit();
  }, []);

  useEffect(() => {
    chatBoxref.current.scrollIntoView({ behavior: "auto" })
  }, [messages]);

  const badgeInit = () => {
    async function GetGlobalBadge() {
      /** Fetch Global Badge **/
      const response = await fetch('https://badges.twitch.tv/v1/badges/global/display');
      const data = await response.json();
      return data.badge_sets;
    }

    async function GetChannalBadge() {
      /** Fetch Channal Badge **/
      const response = await fetch(`https://badges.twitch.tv/v1/badges/channels/68150547/display`);
      const data = await response.json();
      return data.badge_sets;
    }

    async function twitchfetch() {
      /** Fetch Global & Channel Badge **/
      let [TempGBdg, TempCBdg] = await Promise.all([GetGlobalBadge(), GetChannalBadge()]);
      /** Replace Global one with Channel's bits & sub Badge **/
      if (TempCBdg['bits'] !== undefined) {
        var obj = Object.assign({}, TempGBdg['bits']['versions'], TempCBdg['bits']['versions']);
        TempGBdg['bits']['versions'] = obj;
        delete TempCBdg['bits'];
      }
      if (TempCBdg['subscriber'] !== undefined) {
        delete TempGBdg['subscriber'];
      }
      Object.assign(TempGBdg, TempCBdg);
      setBadge(TempGBdg);
    }
    twitchfetch();
  }

  const bttvInit = () => {
    async function GetGlobal() {
      /** Fetch Global Badge **/
      const response = await fetch('https://api.betterttv.net/3/cached/emotes/global');
      const data = await response.json();
      return data;
    }

    async function GetChannal() {
      /** Fetch Global Badge **/
      const response = await fetch('https://api.betterttv.net/3/cached/users/twitch/68150547');
      const data = await response.json();
      return data.sharedEmotes;
    }

    async function getBttv() {
      let [TempGBttv, TempCBttv] = await Promise.all([GetGlobal(), GetChannal()]);
      let result = TempGBttv.concat(TempCBttv);
      setBttv(result);
      var bttvArray = result.map(function (obj) {
        return obj.code;
      });
      setBttvCode(bttvArray);
    }
    getBttv();
  }

  const FFZInit = () => {
    async function GetGlobal() {
      /** Fetch Global Badge **/
      const response = await fetch('https://api.frankerfacez.com/v1/set/global');
      const data = await response.json();
      var result = data.sets[3].emoticons;
      setFfz(result);
      var ffzArray = result.map(function (obj) {
        return obj.name;
      });
      setFfzCode(ffzArray);
      console.log(result);
    }
    GetGlobal();
  }

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
        emotes: null,
        badge: null
      }
      ]);
      console.log("2021/10/09 ver3");
    }).catch((err) => {
      console.log(err)
    });

    client.on("message", (target, context, msg, self) => {
      if (msg.split(' ')[0].toLowerCase() === "!??????") {
        if (!shakeCoolDown) {
          shakeWindow();
          shakeCoolDown = true
          setTimeout(() => shakeCoolDown = false, 10000);
        }
      }
      else {
        messageUpdate(context, msg, false);
      }
    });

    client.on("timeout", (channel, username, reason, duration, userstate) => {
      setMessges(preArray => {
        preArray = preArray.filter(({ id }) => id !== username);
        return [...preArray,
        {
          name: "System",
          id: "System",
          msg: `${username}??????${duration}?????????`,
          color: "#0000FF",
          emotes: null,
          badge: null
        }]
      }
      )
    });

    client.on('cheer', (channel, userstate, message) => {
      setSound(MsnSound);
      shakeWindow();
      var result = Converter.formatText(message, [".", "!", "?", ":", ";", ",", " "], 90, userstate.emotes);
      messageUpdate(userstate, result.display, true)
    });
  };

  const messageUpdate = (context, msg, cheer) => {
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
        emotes: context.emotes,
        badge: context.badges,
        cheer
      }
      ]
    });
  }

  const getbadageurl = (bgd) => {
    if (bgd) {
      return (
        Object.entries(bgd).map((data, index) => (
          <img alt={index} key={index} src={badge[data[0]]['versions'][data[1]]['image_url_2x']} className="badge" style={{marginRight: "2px", marginLeft: "2px", height: "28px", width: "28px", verticalAlign: "bottom" }}/>
        ))
      )
    }
    else return null;
  }

  const shakeWindow = () => {
    const { handleShake } = props;
    handleShake(true);
    setMessges(preArray => [...preArray,
    {
      name: "System",
      id: "System",
      msg: "??????????????????????????????",
      color: "#000000",
      emotes: null,
      badge: null
    }
    ]);
    setTimeout(() => shakeEnd(), 400);
  }

  const shakeEnd = () => {
    const { handleShake } = props;
    handleShake(false);
  }


  return (
    <div className="chat-box">
      {messages.map((data, index) => (
        (data.id == "System") ?
          <div className="text alert" style={{ fontWeight: "bolder", fontSize: "21px", color: "red", fontFamily: "PMingLiU" }} key={index}>
            {data.msg}
          </div>
          :
          <div className="text" key={index}>
            {getbadageurl(data.badge)}
            <span style={{marginRight: "2px", height: "28px", display: 'inline-block', color: data.color, fontWeight: "bold"}}>{data.name + ":  "}</span>
            {(data.cheer)
            ?parse(Converter.formatFfzEmotes(Converter.formatBttvEmotes(data.msg, bttv, bttvCode), ffz, ffzCode))
            :parse(Converter.formatFfzEmotes(Converter.formatBttvEmotes(Converter.formatTwitchEmotes(data.msg, data.emotes), bttv, bttvCode), ffz, ffzCode))}
          </div>
      ))}
      <div ref={chatBoxref} />
      <AudioPlayer
        src={sound}
        title={""}
        autoPlay
        onEnded={() => setSound(null)}
      />
    </div>
  );
}

