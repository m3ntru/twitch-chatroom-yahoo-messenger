import { Channel, EmoteFetcher, EmoteParser } from 'twitch-emoticons';
import TwitchJS from 'twitch-js';
import twemoji from 'twemoji';

var config = require('./config.json');
var systemstate = {
  'display-name': 'System',
  'color': '#000000',
  'message-type': 'chat'
};
/** Set id **/
var channelid, TCfetcher, TCChannel, TCparser, options, client;
async function init (id) {
  channelid = id;

  /** Set Emote Fecher **/
  TCfetcher = new EmoteFetcher();
  TCChannel = new Channel(TCfetcher, channelid);
  TCparser = new EmoteParser(TCfetcher, {
    template: '<img class="emoticon" src="{size1x}" srcset="{size2x} 2x, {size4x} 4x">',
    match: /(?:^|\s+)([a-zA-Z0-9_]+?)(?=$|\s+)/g
  });

  /** Set Twitch Socket **/
  options = {
    connection: {
      reconnect: true
    },
    channels: [`#${channelid}`],
    identity: {
      username: 'justinfan5566',
      password: 'oauth:xxx'
    }
  };
  client = new TwitchJS.Client(options);

  /** Get Twitch Number ID (Used for API) from Channel Name **/
  const response = await fetch(`https://api.twitch.tv/v5/users?login=${channelid}&client_id=${config.client_id}`);
  const data = await response.json();
  return data.users[0]['_id'];
}

function twitchconnect () {
  client.connect();
}

/** Extend function for fetch FFZ and BTTV emote **/
EmoteParser.prototype.FBparse = function (text) {
  const parsed = text.replace(this.options.match, (matched, id) => {
    const emote = this.fetcher.emotes.get(id);
    if (!emote) return matched;
    const template = this.options.template;
    const res = template
      .replace(/{name}/g, emote.code)
      .replace(/{size1x}/g, emote.toLink(0))
      .replace(/{size2x}/g, emote.toLink(1))
      .replace(/{size4x}/g, emote.toLink(2))
      .replace(/{creator}/g, emote.ownerName || 'global');
    return res;
  });
  return parsed;
};

/**
  formatTwitchEmotes
  author: AlcaDesign (https://github.com/AlcaDesign)
  fixed emoji bugs
**/
function formatTwitchEmotes (text, emotes) {
  let link = 'http://static-cdn.jtvnw.net/emoticons/v1/';
  var splitText = Array.from(text);
  for (var i in emotes) {
    var e = emotes[i];
    for (var j in e) {
      var mote = e[j];
      if (typeof mote === 'string') {
        mote = mote.split('-');
        mote = [parseInt(mote[0]), parseInt(mote[1])];
        var length = mote[1] - mote[0];
        var empty = Array.apply(null, new Array(length + 1)).map(function () { return ''; });
        splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
        splitText.splice(mote[0], 1, `<img class="emoticon" src="${link}${i}/1.0" srcset="${link}${i}/2.0 2x, ${link}${i}/3.0 4x">`);
      };
    };
  }
  return splitText.join('');
}

function formatEmoji (text) {
  return twemoji.parse(text);
}

function formatFBEmotes (text) {
  return TCparser.FBparse(text);
}

function formatMessage (text, emotes) {
  return formatEmoji(formatFBEmotes(formatTwitchEmotes(text, emotes)));
}

function fetchEmotes () {
  if (config.FFZ) {
    TCChannel.fetchFFZEmotes();
  }
  if (config.BTTV) {
    TCfetcher.fetchBTTVEmotes();
  }
}

/** Twitch Badge **/
async function twitchfetch (nid) {
  fetchEmotes();
  /** Fetch Global & Channel Badge **/
  let [TempGBdg, TempCBdg] = await Promise.all([GetGlobalBadge(), GetChannalBadge(nid)]);
  /** Replace Global one with Channel's bits & sub Badge **/
  if (TempCBdg['bits'] !== undefined) {
    delete TempGBdg['bits'];
  }
  if (TempCBdg['subscriber'] !== undefined) {
    delete TempGBdg['subscriber'];
  }
  Object.assign(TempGBdg, TempCBdg);
  return TempGBdg;
}

async function GetGlobalBadge () {
  /** Fetch Global Badge **/
  const response = await fetch('https://badges.twitch.tv/v1/badges/global/display');
  const data = await response.json();
  return data.badge_sets;
}

async function GetChannalBadge (nid) {
  /** Fetch Channal Badge **/
  const response = await fetch(`https://badges.twitch.tv/v1/badges/channels/${nid}/display`);
  const data = await response.json();
  return data.badge_sets;
}


formatTwitchEmotes = (text, emotes) => {
  let link = 'http://static-cdn.jtvnw.net/emoticons/v2/';
  var splitText = Array.from(text);
  for (var i in emotes) {
      var e = emotes[i];
      for (var j in e) {
          var mote = e[j];
          if (typeof mote === 'string') {
              mote = mote.split('-');
              mote = [parseInt(mote[0]), parseInt(mote[1])];
              var length = mote[1] - mote[0];
              var empty = Array.apply(null, new Array(length + 1)).map(function () { return ''; });
              splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
              splitText.splice(mote[0], 1, `<img class="emoticon" src="${link}${i}/default/dark/3.0">`);
          };
      };
  }
  return splitText.join('');
}


export {
  systemstate,
  twitchfetch,
  twitchconnect,
  config,
  client,
  init,
  fetchEmotes,
  formatMessage,
  formatTwitchEmotes
};
