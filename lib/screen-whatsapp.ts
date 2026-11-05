import {
  WA_AVATARS,
  WA_CALLS,
  WA_CHANNELS,
  WA_CHATS,
  WA_COMMUNITIES,
  WA_FAVOURITES,
  WA_META_AI,
  WA_STATUSES,
  type WaBlock,
  type WaChannel,
  type WaChat,
  type WaMessage,
  type WaStatus,
} from "@/data/whatsapp";
import { waImage } from "@/lib/screen-whatsapp-images";
import { highlightJs } from "@/lib/screen-whatsapp-code";
import { WA_EMOJI_GROUPS, WA_RECENT_EMOJI } from "@/lib/screen-whatsapp-emoji";
import { WA_ICONS, type WaIcon } from "@/lib/screen-whatsapp-icons";
import { WINDOW_ICONS } from "@/lib/window-controls";

/** What the WhatsApp window is doing, as far as the desktop is concerned. */
export type WhatsAppState = "open" | "minimised" | "closed";
type WindowState = "full" | "windowed" | "minimised" | "closed";
type View = "chats" | "calls" | "status" | "channels" | "communities";
type CallMode = "voice" | "video";

/** After a scroll list reaches an end, wheel inertia is still swallowed for this long. */
const WHEEL_LATCH_MS = 350;

const esc = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const icon = (name: WaIcon) => WA_ICONS[name];
const initial = (name: string) => esc(name.trim().charAt(0).toUpperCase());
const photoTag = (name: string) =>
  WA_AVATARS[name] ? `<img class="wa-photo" src="${WA_AVATARS[name]}" alt="" draggable="false" />` : "";
const avatar = (name: string, tone: number, extra = "") =>
  `<span class="wa-av ${extra}" data-tone="${tone % 6}">${initial(name)}${photoTag(name)}</span>`;
const chatAvatar = (chat: WaChat) =>
  chat.ai ? `<span class="wa-av wa-ai-av">${icon("metaAi")}</span>` : avatar(chat.name, chat.tone);
/** Inline `code` in assistant text. */
const inline = (text: string) => esc(text).replace(/`([^`]+)`/g, "<code>$1</code>");
const findChat = (id: string) =>
  id === WA_META_AI.id ? WA_META_AI : WA_CHATS.find((entry) => entry.id === id);

function blockMarkup(block: WaBlock) {
  if (block.type === "code")
    return `<div class="wa-code"><div class="wa-code-top"><span>${esc(block.lang)}</span><button type="button" tabindex="-1" class="wa-copy" data-copy aria-label="Copy code">${icon("copy")}</button></div><pre>${highlightJs(block.code)}</pre></div>`;
  return `<p class="wa-rich-${block.type}">${inline(block.text)}</p>`;
}

function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  html?: string,
) {
  const node = document.createElement(tag);
  node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

const controlsMarkup = (scope: string) =>
  (["minimise", "maximise", "close"] as const)
    .map(
      (name) =>
        `<button type="button" tabindex="-1" class="wa-control" data-control="${name}" data-scope="${scope}" aria-label="${name[0].toUpperCase()}${name.slice(1)}">${WINDOW_ICONS[name === "maximise" ? "restore" : name]}</button>`,
    )
    .join("");

// ---- Markup for each part of the app -----------------------------------------
function chatRow(chat: WaChat, selected: boolean) {
  const lead = chat.call
    ? `<span class="wa-lead" data-kind="${chat.call}">${icon(chat.call === "video" ? "videoSmall" : "callMissed")}</span>`
    : chat.sent
      ? `<span class="wa-lead wa-ticks">${icon("ticks")}</span>`
      : "";
  const tail = `${chat.muted ? `<span class="wa-muted">${icon("bellOff")}</span>` : ""}${chat.unread ? `<b class="wa-count">${chat.unread}</b>` : ""}`;
  return `<button type="button" tabindex="-1" class="wa-chat" data-chat="${chat.id}"${selected ? " data-selected" : ""}>
    ${chatAvatar(chat)}
    <span class="wa-chat-body">
      <span class="wa-chat-top"><span class="wa-name">${esc(chat.name)}</span><span class="wa-time"${chat.unread ? " data-new" : ""}>${esc(chat.time)}</span></span>
      <span class="wa-chat-bottom"><span class="wa-preview">${lead}<span>${esc(chat.preview)}</span></span><span class="wa-tail">${tail}</span></span>
    </span></button>`;
}

function threadMarkup(chat: WaChat) {
  return chat.messages
    .map((message) => {
      const body = message.rich
        ? `<div class="wa-rich">${message.rich.map(blockMarkup).join("")}</div>`
        : `${message.image ? `<button type="button" tabindex="-1" class="wa-img" data-image="${message.image}" aria-label="Open picture">${waImage(message.image)}</button>` : ""}${message.text ? `<span class="wa-text">${esc(message.text)}</span>` : ""}`;
      const sender = message.sender
        ? `<span class="wa-sender" data-tone="${[...message.sender].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 6}">${esc(message.sender)}</span>`
        : "";
      const flags = `${message.rich ? " data-rich" : ""}${message.image ? " data-image" : ""}${message.sender ? " data-group" : ""}`;
      return `${message.day ? `<div class="wa-day"><span>${esc(message.day)}</span></div>` : ""}<div class="wa-msg" data-from="${message.from}"${flags}>${sender}${body}<span class="wa-meta">${esc(message.time)}${message.from === "me" ? `<span class="wa-ticks" data-read>${icon("ticks")}</span>` : ""}</span></div>`;
    })
    .join("");
}

const pill = (iconName: WaIcon, label: string, primary = false) =>
  `<span class="wa-action"><span class="wa-action-btn"${primary ? " data-primary" : ""}>${icon(iconName)}</span><span>${label}</span></span>`;
const footer = (text: string) => `<p class="wa-foot">${icon("lock")}<span>${text}</span></p>`;
const heading = (title: string, tools: string) =>
  `<header class="wa-head"><h2>${title}</h2><span class="wa-head-tools">${tools}</span></header>`;
const search = (text: string) => `<div class="wa-search">${icon("search")}<span>${text}</span></div>`;

function callRow(call: (typeof WA_CALLS)[number], index: number) {
  const glyph =
    call.direction === "Missed" ? "callMissed" : call.direction === "Incoming" ? "callIn" : "callOut";
  return `<button type="button" tabindex="-1" class="wa-row wa-call-row" data-call-row="${index}">
    ${avatar(call.name, call.tone)}
    <span class="wa-chat-body">
      <span class="wa-chat-top"><span class="wa-name">${esc(call.name)}</span><span class="wa-time">${call.when}</span></span>
      <span class="wa-chat-bottom"><span class="wa-preview" data-kind="${call.direction === "Missed" ? "missed" : ""}"><span class="wa-lead">${icon(call.video ? "videoSmall" : glyph)}</span><span>${call.direction === "Missed" ? "Missed" : call.direction}</span></span></span>
    </span></button>`;
}

/** The right-hand Call info panel: who, the quick actions, and every call with them by day. */
function callInfoMarkup(call: (typeof WA_CALLS)[number]) {
  const calls = WA_CALLS.filter((entry) => entry.name === call.name);
  const days = [...new Set(calls.map((entry) => entry.when))];
  const line = (entry: (typeof WA_CALLS)[number]) => {
    const kind = entry.video ? "video" : "voice";
    const label =
      entry.direction === "Missed" ? `Missed ${kind} call` : `${entry.direction} ${kind} call`;
    const glyph =
      entry.direction === "Missed" ? "callMissed" : entry.direction === "Incoming" ? "callIn" : "callOut";
    return `<div class="wa-info-line"${entry.direction === "Missed" ? " data-missed" : ""}><span class="wa-lead">${icon(entry.video ? "videoSmall" : glyph)}</span><span>${label} at ${entry.at}</span><span class="wa-info-length">${entry.length ?? ""}</span></div>`;
  };
  const who = `data-name="${esc(call.name)}" data-tone="${call.tone}"`;
  return `<header class="wa-info-head"><h2>Call info</h2><button type="button" tabindex="-1" class="wa-icon-btn" data-info-close aria-label="Close call info">${icon("close")}</button></header>
    <div class="wa-info-card">
      <div class="wa-info-who">${avatar(call.name, call.tone)}<span class="wa-name">${esc(call.name)}</span><span class="wa-head-tools"><button type="button" tabindex="-1" class="wa-icon-btn" data-info-chat="${esc(call.name)}" aria-label="Message">${icon("chatBox")}</button><button type="button" tabindex="-1" class="wa-icon-btn" data-call="video" ${who} aria-label="Video call">${icon("video")}</button><button type="button" tabindex="-1" class="wa-icon-btn" data-call="voice" ${who} aria-label="Voice call">${icon("phone")}</button></span></div>
      ${days
        .map(
          (day) =>
            `<div class="wa-info-day">${day}</div>${calls.filter((entry) => entry.when === day).map(line).join("")}`,
        )
        .join("")}
    </div>`;
}

/** The round avatar ring, cut into one arc per update like the real app. */
function statusRing(count: number, seen: boolean, avatarMarkup: string) {
  const radius = 21;
  const circumference = 2 * Math.PI * radius;
  const gap = count > 1 ? 4 : 0;
  const dash = count > 1 ? `stroke-dasharray="${(circumference / count - gap).toFixed(2)} ${gap}"` : "";
  return `<span class="wa-ring"${seen ? " data-seen" : ""}><svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true"><circle cx="24" cy="24" r="${radius}" fill="none" stroke="currentColor" stroke-width="2.2" ${dash} transform="rotate(-90 24 24)"/></svg>${avatarMarkup}</span>`;
}

const statusRow = (status: WaStatus, index: number, seen: boolean) =>
  `<button type="button" tabindex="-1" class="wa-row wa-status-row" data-status="${index}">
    ${statusRing(status.items.length, seen, avatar(status.name, status.tone))}
    <span class="wa-chat-body"><span class="wa-name">${esc(status.name)}</span><span class="wa-preview"><span>${status.when}</span></span></span></button>`;

const channelRow = (channel: WaChannel) =>
  `<div class="wa-row wa-channel">${avatar(channel.name, channel.tone)}<span class="wa-chat-body"><span class="wa-channel-name"><span class="wa-name">${esc(channel.name)}</span>${channel.verified ? `<i class="wa-verified">${icon("verified")}</i>` : ""}</span><span class="wa-preview"><span>${esc(channel.followers)}</span></span></span><span class="wa-follow">Follow</span></div>`;

const communityMarkup = (community: (typeof WA_COMMUNITIES)[number]) =>
  `<section class="wa-community">
    <div class="wa-row">${avatar(community.name, community.tone, "wa-square")}<span class="wa-name wa-strong">${esc(community.name)}</span></div>
    ${community.groups
      .map(
        (group) =>
          `<div class="wa-row wa-sub"><span class="wa-av wa-square wa-announce">${icon("megaphone")}</span><span class="wa-chat-body"><span class="wa-chat-top"><span class="wa-name">${esc(group.name)}</span><span class="wa-time">${group.when}</span></span><span class="wa-chat-bottom"><span class="wa-preview"><span>${esc(group.preview)}</span></span></span></span></div>`,
      )
      .join("")}
    <span class="wa-viewall">View all</span>
  </section>`;

const ILLUSTRATION = `<svg viewBox="0 0 160 110" width="120" height="82" aria-hidden="true"><rect x="12" y="14" width="56" height="70" rx="6" fill="#21c063" opacity=".25"/><rect x="18" y="20" width="44" height="58" rx="4" fill="#21c063"/><path d="M26 36h22M26 46h22M26 56h16" stroke="#0b2e1a" stroke-width="3" stroke-linecap="round"/><rect x="54" y="16" width="80" height="60" rx="6" fill="#f6efe0"/><circle cx="94" cy="46" r="15" fill="#21c063"/><path d="M88 41c1 5 4 9 9 11l3-3-3-3-2 1c-1-1-2-2-3-3l1-2-3-3z" fill="#fff"/><rect x="6" y="84" width="140" height="8" rx="4" fill="#e8e0cf"/></svg>`;

function callWindow(mode: CallMode, name: string, tone: number) {
  const tools = `<div class="wa-call-tools">
    <span class="wa-pill wa-pill-light">${icon("camOff")}${icon("chevron")}</span>
    <span class="wa-pill">${icon("mic")}${icon("chevron")}</span>
    <span class="wa-call-mid"><i>${icon("emoji")}</i><i>${icon("screen")}</i><i>${icon("addPerson")}</i><i>${icon("chatBox")}</i></span>
    <button type="button" tabindex="-1" class="wa-end" data-end aria-label="End call">${icon("hangup")}</button></div>`;
  const stage =
    mode === "voice"
      ? `<div class="wa-call-stage"><span class="wa-call-person">${icon("person")}</span><b>${esc(name)}</b><span>Calling…</span></div>`
      : `<div class="wa-call-stage" data-video><div class="wa-remote">${avatar(name, tone, "wa-big")}</div><div class="wa-self"><span>${icon("person")}</span></div></div>`;
  return `<div class="wa-call-win" data-mode="${mode}">
    <div class="wa-call-bar">${icon("logo")}<span class="wa-call-title">${mode === "voice" ? "WhatsApp" : esc(name)}</span><span class="wa-e2e">${icon("lock")}End-to-end encrypted</span><span class="wa-call-controls">${controlsMarkup("call")}</span></div>
    ${stage}${tools}</div>`;
}

export type ScreenWhatsApp = {
  element: HTMLElement;
  /** Open (or bring back) the window. */
  open: () => void;
  /** Like a real taskbar button: hide a visible window, bring back a hidden one. */
  toggle: () => void;
  /** Whether the window is currently out of sight. */
  hidden: () => boolean;
  dispose: () => void;
};

type WhatsAppOptions = {
  /** Centre of the taskbar button, in the screen's own pixels. */
  target: () => { x: number; y: number } | undefined;
  /** Called with "open" while on show, "minimised" while shrunk into the taskbar, "closed" after close. */
  onChange: (state: WhatsAppState) => void;
};

/**
 * A static WhatsApp Desktop window for the simulated Windows desktop. The left
 * rail switches between Chats, Calls, Status, Channels and Communities; chats
 * can be opened and filtered, and the call buttons open a calling window that
 * closes again. The Channels list is display only. Every name and message is
 * made up (data/whatsapp.ts) except the channel names, which are real public
 * channels. Closing resets it to the start. Nothing in it is live.
 */
export function createScreenWhatsApp(
  parent: HTMLElement,
  { target, onChange }: WhatsAppOptions,
): ScreenWhatsApp {
  const root = create("div", "screen-whatsapp");
  root.dataset.window = "closed";
  root.dataset.view = "chats";
  root.inert = true;
  // A photo that is missing or fails to load just drops away, leaving the coloured initial.
  root.addEventListener(
    "error",
    (event) => {
      const image = event.target;
      if (image instanceof HTMLImageElement && image.classList.contains("wa-photo")) image.remove();
    },
    true,
  );
  root.addEventListener("pointerdown", (event) => event.stopPropagation());
  const win = create("div", "wa-window");
  root.appendChild(win);

  let counts = new Map<string, number>();
  // Messages typed in this window, kept per chat until it is closed.
  const sent = new Map<string, WaMessage[]>();
  const chatList = (): WaChat[] =>
    [WA_META_AI, ...WA_CHATS].map((chat) => ({ ...chat, unread: counts.get(chat.id) || undefined }));

  const railButton = (view: View, off: WaIcon, on: WaIcon | undefined, label: string, badge = "") =>
    `<button type="button" tabindex="-1" class="wa-rail-btn" data-rail="${view}" aria-label="${label}"><span class="wa-ic-off">${icon(off)}</span><span class="wa-ic-on">${icon(on ?? off)}</span>${badge}</button>`;

  win.innerHTML = `
    <div class="wa-titlebar">${icon("logo")}<span>WhatsApp</span><span class="wa-win-controls">${controlsMarkup("window")}</span></div>
    <div class="wa-app">
      <nav class="wa-rail">
        <div class="wa-rail-top">
          ${railButton("chats", "chats", "chatsActive", "Chats", `<b class="wa-badge"></b>`)}
          ${railButton("calls", "phone", "phoneActive", "Calls")}
          ${railButton("status", "status", "statusActive", "Status")}
          ${railButton("channels", "channels", "channelsActive", "Channels")}
          ${railButton("communities", "communities", undefined, "Communities")}
          <hr />
          <button type="button" tabindex="-1" class="wa-rail-btn" data-meta-ai aria-label="Meta AI">${icon("metaAi")}</button>
        </div>
        <div class="wa-rail-bottom">
          <span class="wa-rail-btn" aria-hidden="true">${icon("media")}</span>
          <span class="wa-av wa-me" data-tone="1">Me${photoTag("Me")}</span>
        </div>
      </nav>

      <section class="wa-view" data-for="chats">
        <div class="wa-pane">
          ${heading("Chats", `<span class="wa-icon-btn">${icon("dots")}</span><span class="wa-green-btn">${icon("plus")}</span>`)}
          ${search("Search or start a new chat")}
          <div class="wa-chips"></div>
          <div class="wa-chatlist wa-scroll"></div>
        </div>
        <div class="wa-main wa-chat-main">
          <header class="wa-thread-head"></header>
          <div class="wa-banner" hidden><span class="wa-banner-ic">${icon("external")}</span><span>On Meta AI web you can organise your Meta AI chats by topic, create AI-powered docs and more. <b>Try it</b></span><button type="button" tabindex="-1" class="wa-icon-btn" data-banner-close aria-label="Dismiss">${icon("close")}</button></div>
          <div class="wa-thread wa-scroll"></div>
          <div class="wa-emoji" data-open="false" role="dialog" aria-label="Emoji"></div>
          <form class="wa-composer" autocomplete="off"><span class="wa-icon-btn">${icon("plus")}</span><button type="button" tabindex="-1" class="wa-icon-btn wa-emoji-btn" data-emoji-toggle aria-label="Emoji" aria-expanded="false">${icon("emoji")}</button><input class="wa-input" type="text" name="message" placeholder="Type a message" aria-label="Type a message" maxlength="500" /><button type="button" tabindex="-1" class="wa-icon-btn wa-mic" aria-label="Voice message">${icon("mic")}</button><button type="submit" tabindex="-1" class="wa-icon-btn wa-send" aria-label="Send">${icon("send")}</button></form>
        </div>
      </section>

      <section class="wa-view" data-for="calls">
        <div class="wa-pane">
          ${heading("Calls", `<span class="wa-green-btn">${icon("phoneActive")}</span>`)}
          ${search("Search name, number or…")}
          <div class="wa-scroll wa-calls-scroll">
            <div class="wa-section"><b>Favourites</b><span class="wa-outline">View all</span></div>
            ${WA_FAVOURITES.map(
              (fav) =>
                `<div class="wa-row wa-fav">${avatar(fav.name, fav.tone)}<span class="wa-name">${esc(fav.name)}</span><span class="wa-fav-tools"><button type="button" tabindex="-1" class="wa-icon-btn" data-call="video" data-name="${esc(fav.name)}" data-tone="${fav.tone}" aria-label="Video call">${icon("video")}</button><button type="button" tabindex="-1" class="wa-icon-btn" data-call="voice" data-name="${esc(fav.name)}" data-tone="${fav.tone}" aria-label="Voice call">${icon("phone")}</button></span></div>`,
            ).join("")}
            <div class="wa-section"><b>Recent</b></div>
            ${WA_CALLS.map(callRow).join("")}
          </div>
        </div>
        <div class="wa-main wa-empty wa-calls-main">
          <div class="wa-call-info"></div>
          <div class="wa-empty-card">
            ${ILLUSTRATION}
            <h3>Voice and video calling</h3>
            <p>Share your screen, react with emoji and more, with up to 32 people.</p>
          </div>
          <div class="wa-actions">
            ${pill("videoPlus", "Start call", true)}${pill("link", "New call link")}${pill("dialpad", "Call a number")}${pill("calendar", "Schedule call")}
          </div>
          ${footer("Your personal calls are end-to-end encrypted")}
        </div>
      </section>

      <section class="wa-view" data-for="status">
        <div class="wa-pane">
          ${heading("Status", `<span class="wa-icon-btn">${icon("dots")}</span><span class="wa-icon-btn wa-circle">${icon("plus")}</span>`)}
          <div class="wa-scroll wa-status-scroll">
            <div class="wa-row wa-mine"><span class="wa-mine-av">${avatar("Me", 1)}<i>${icon("plus")}</i></span><span class="wa-chat-body"><span class="wa-name wa-strong">My status</span><span class="wa-preview"><span>Click to add status update</span></span></span></div>
            <div class="wa-section wa-quiet"><span>Recent</span></div>
            <div class="wa-status-list"></div>
          </div>
        </div>
        <div class="wa-main wa-empty">
          <div class="wa-empty-card wa-plain">
            <span class="wa-status-art">${icon("statusActive")}</span>
            <h3>Share statuses</h3>
            <p>Share photos, videos and text that disappear after 24 hours.</p>
            <div class="wa-actions">${pill("pencil", "Text status")}${pill("camera", "Photo and video")}</div>
          </div>
        </div>
      </section>

      <section class="wa-view" data-for="channels">
        <div class="wa-pane">
          ${heading("Channels", `<span class="wa-icon-btn wa-circle">${icon("plus")}</span>`)}
          <div class="wa-scroll wa-channels-scroll">
            <div class="wa-channels-intro"><h3>Stay updated on your favourite topics</h3><p>Find channels to follow below</p></div>
            ${WA_CHANNELS.map(channelRow).join("")}
            <span class="wa-wide-btn">${icon("grid")}<span>Discover more</span></span>
            <span class="wa-wide-btn">${icon("plus")}<span>Create channel</span></span>
          </div>
        </div>
        <div class="wa-main wa-empty">
          <div class="wa-empty-card wa-plain wa-wide">
            <span class="wa-status-art">${icon("channels")}</span>
            <h3>Discover channels</h3>
            <p>Entertainment, sports, news, lifestyle, people and more. Follow the channels that interest you</p>
            <div class="wa-actions">${pill("plus", "Create channel")}${pill("grid", "Explore channels")}</div>
          </div>
        </div>
      </section>

      <section class="wa-view" data-for="communities">
        <div class="wa-pane">
          ${heading("Communities", `<span class="wa-icon-btn wa-circle">${icon("plus")}</span>`)}
          <div class="wa-scroll wa-communities-scroll">
            <div class="wa-row"><span class="wa-av wa-square wa-new">${icon("communities")}</span><span class="wa-name wa-strong">New community</span></div>
            ${WA_COMMUNITIES.map(communityMarkup).join("")}
          </div>
        </div>
        <div class="wa-main wa-empty">
          <div class="wa-empty-card wa-plain">
            <span class="wa-status-art">${icon("communities")}</span>
            <h3>Create communities</h3>
            <p>Bring members together in topic-based groups and easily send them admin announcements.</p>
          </div>
          ${footer("Your personal messages in communities are end-to-end encrypted")}
        </div>
      </section>
      <div class="wa-call" data-open="false"></div>
      <div class="wa-story" data-open="false"></div>
      <div class="wa-lightbox" data-open="false"><button type="button" tabindex="-1" class="wa-icon-btn" data-lightbox-close aria-label="Close picture">${icon("close")}</button><div class="wa-lightbox-art"></div></div>
    </div>`;
  parent.appendChild(root);

  const $ = <T extends HTMLElement>(selector: string) => win.querySelector<T>(selector)!;
  const chips = $(".wa-chips");
  const list = $(".wa-chatlist");
  const thread = $(".wa-thread");
  const threadHead = $(".wa-thread-head");
  const banner = $(".wa-banner");
  const callLayer = $(".wa-call");
  const badge = $(".wa-badge");
  const callsView = $('[data-for="calls"]');
  const callInfo = $(".wa-call-info");
  const story = $(".wa-story");
  const statusList = $(".wa-status-list");
  const lightbox = $(".wa-lightbox");
  const lightboxArt = $(".wa-lightbox-art");
  const composer = $<HTMLFormElement>(".wa-composer");
  const field = $<HTMLInputElement>(".wa-input");
  const emojiPanel = $(".wa-emoji");
  const emojiToggle = $(".wa-emoji-btn");

  // ---- Chats ---------------------------------------------------------------
  let selected = WA_CHATS[0].id;
  let filter: "all" | "unread" = "all";

  function paintChats() {
    const chats = chatList();
    const unread = chats.filter((chat) => chat.unread).length;
    badge.textContent = String(unread);
    badge.hidden = unread === 0;
    chips.innerHTML = `<button type="button" tabindex="-1" class="wa-chip" data-filter="all"${filter === "all" ? " data-on" : ""}>All</button><button type="button" tabindex="-1" class="wa-chip" data-filter="unread"${filter === "unread" ? " data-on" : ""}>Unread ${unread}</button><span class="wa-chip wa-chip-more">${icon("chevron")}</span>`;
    list.innerHTML = chats
      .filter((chat) => filter === "all" || chat.unread)
      .map((chat) => chatRow(chat, chat.id === selected))
      .join("");
  }
  let bannerOpen = true;
  function paintThread() {
    const chat = findChat(selected) ?? WA_CHATS[0];
    const calls = chat.ai
      ? ""
      : `<button type="button" tabindex="-1" class="wa-icon-btn" data-call="video" data-name="${esc(chat.name)}" data-tone="${chat.tone}" aria-label="Video call">${icon("video")}</button><button type="button" tabindex="-1" class="wa-icon-btn" data-call="voice" data-name="${esc(chat.name)}" data-tone="${chat.tone}" aria-label="Voice call">${icon("phone")}</button>`;
    threadHead.innerHTML = `${chatAvatar(chat)}<span class="wa-name wa-strong">${esc(chat.name)}</span><span class="wa-head-tools">${calls}<span class="wa-icon-btn">${icon("search")}</span><span class="wa-icon-btn">${icon("dots")}</span></span>`;
    banner.hidden = !(chat.ai && bannerOpen);
    thread.innerHTML = threadMarkup({ ...chat, messages: [...chat.messages, ...(sent.get(chat.id) ?? [])] });
    thread.scrollTop = thread.scrollHeight;
  }
  function openChat(id: string) {
    selected = id;
    counts.set(id, 0);
    setEmojiOpen(false);
    paintChats();
    paintThread();
  }

  // ---- Status viewer -------------------------------------------------------------
  const viewed = new Set<number>(WA_STATUSES.flatMap((entry, index) => (entry.seen ? [index] : [])));
  const storyState = { person: 0, item: 0, paused: false, muted: true, liked: false };
  const paintStatusList = () => {
    statusList.innerHTML = WA_STATUSES.map((entry, index) => statusRow(entry, index, viewed.has(index))).join("");
  };
  function storyMedia(item: WaStatus["items"][number]) {
    if (item.kind === "text")
      return `<div class="wa-story-text" data-tone="${item.tone}"><p>${esc(item.text)}</p></div>`;
    return `<div class="wa-story-media">${waImage(item.image)}</div>${item.caption ? `<p class="wa-story-caption">${esc(item.caption)}</p>` : ""}`;
  }
  function paintStory() {
    const person = WA_STATUSES[storyState.person];
    const item = person.items[storyState.item];
    viewed.add(storyState.person);
    const last = storyState.person === WA_STATUSES.length - 1 && storyState.item === person.items.length - 1;
    const first = storyState.person === 0 && storyState.item === 0;
    story.innerHTML = `
      <div class="wa-story-backdrop" aria-hidden="true">${item.kind === "image" ? waImage(item.image) : ""}</div>
      <button type="button" tabindex="-1" class="wa-icon-btn wa-story-back" data-story-close aria-label="Back">${icon("arrowLeft")}</button>
      <button type="button" tabindex="-1" class="wa-icon-btn wa-story-x" data-story-close aria-label="Close">${icon("close")}</button>
      ${first ? "" : `<button type="button" tabindex="-1" class="wa-icon-btn wa-story-nav" data-story-prev aria-label="Previous">${icon("chevronLeft")}</button>`}
      ${last ? "" : `<button type="button" tabindex="-1" class="wa-icon-btn wa-story-nav" data-story-next aria-label="Next">${icon("chevronRight")}</button>`}
      <div class="wa-story-col"${storyState.paused ? " data-paused" : ""}>
        <div class="wa-story-bars">${person.items
          .map((_, index) => `<i${index < storyState.item ? " data-done" : index === storyState.item ? " data-now" : ""}></i>`)
          .join("")}</div>
        <div class="wa-story-head">
          ${avatar(person.name, person.tone)}
          <span class="wa-story-who"><b>${esc(person.name)}</b><span>${item.at}</span></span>
          <span class="wa-story-tools">
            <button type="button" tabindex="-1" class="wa-icon-btn" data-story-pause aria-label="${storyState.paused ? "Play" : "Pause"}">${icon(storyState.paused ? "play" : "pause")}</button>
            <button type="button" tabindex="-1" class="wa-icon-btn" data-story-mute aria-label="${storyState.muted ? "Unmute" : "Mute"}">${icon(storyState.muted ? "volumeOff" : "volume")}</button>
            <span class="wa-icon-btn">${icon("dots")}</span>
          </span>
        </div>
        ${storyMedia(item)}
      </div>
      <form class="wa-story-reply" autocomplete="off"><span class="wa-icon-btn">${icon("emoji")}</span><span class="wa-icon-btn">${icon("sticker")}</span><input type="text" class="wa-story-input" placeholder="Type a reply…" aria-label="Type a reply" maxlength="300" /><button type="button" tabindex="-1" class="wa-icon-btn wa-heart" data-story-like aria-label="Like">${icon(storyState.liked ? "heartFilled" : "heart")}</button></form>`;
    story.dataset.open = "true";
    const reply = story.querySelector<HTMLInputElement>(".wa-story-input")!;
    reply.addEventListener("keydown", (event) => event.stopPropagation());
    story.querySelector<HTMLFormElement>(".wa-story-reply")!.addEventListener("submit", (event) => {
      event.preventDefault();
      reply.value = "";
    });
  }
  function openStory(index: number) {
    Object.assign(storyState, { person: index, item: 0, paused: false, liked: false });
    paintStory();
  }
  function stepStory(direction: 1 | -1) {
    const person = WA_STATUSES[storyState.person];
    storyState.liked = false;
    if (direction === 1) {
      if (storyState.item < person.items.length - 1) storyState.item += 1;
      else if (storyState.person < WA_STATUSES.length - 1) Object.assign(storyState, { person: storyState.person + 1, item: 0 });
      else return closeStory();
    } else if (storyState.item > 0) storyState.item -= 1;
    else if (storyState.person > 0)
      Object.assign(storyState, {
        person: storyState.person - 1,
        item: WA_STATUSES[storyState.person - 1].items.length - 1,
      });
    paintStory();
  }
  function closeStory() {
    story.dataset.open = "false";
    story.innerHTML = "";
    paintStatusList();
  }
  // Each bar fills over a few seconds, then the next update starts (never with reduced motion).
  story.addEventListener("animationend", (event) => {
    if ((event.target as HTMLElement).matches("i[data-now]")) stepStory(1);
  });
  paintStatusList();

  // ---- Call info -----------------------------------------------------------------
  function showCallInfo(index: number | undefined) {
    const call = index === undefined ? undefined : WA_CALLS[index];
    callsView.querySelectorAll<HTMLElement>("[data-call-row]").forEach((row) => {
      if (call && Number(row.dataset.callRow) === index) row.dataset.selected = "";
      else delete row.dataset.selected;
    });
    if (!call) {
      delete callsView.dataset.info;
      callInfo.innerHTML = "";
      return;
    }
    callInfo.innerHTML = callInfoMarkup(call);
    callsView.dataset.info = "";
    callInfo.scrollTop = 0;
  }

  // ---- Emoji picker and sending ---------------------------------------------------
  let recent = [...WA_RECENT_EMOJI];
  let emojiGroup = "recent";

  const emojiCell = (value: string) =>
    `<button type="button" tabindex="-1" class="wa-emoji-cell" data-emoji="${value}">${value}</button>`;
  function paintEmoji() {
    const tabs = [{ id: "recent", label: "Recent", tab: "🕘", emoji: recent }, ...WA_EMOJI_GROUPS];
    const groups = tabs.filter((group) => group.id === emojiGroup);
    emojiPanel.innerHTML = `<div class="wa-emoji-tabs">${tabs
      .map(
        (group) =>
          `<button type="button" tabindex="-1" class="wa-emoji-tab" data-emoji-group="${group.id}"${group.id === emojiGroup ? " data-on" : ""} aria-label="${group.label}">${group.tab}</button>`,
      )
      .join("")}</div>
      <div class="wa-emoji-grid wa-scroll">${groups
        .map(
          (group) =>
            `<div class="wa-emoji-label">${group.label}</div><div class="wa-emoji-cells">${group.emoji.map(emojiCell).join("") || '<span class="wa-emoji-none">No emoji found</span>'}</div>`,
        )
        .join("")}</div>`;
  }
  function setEmojiOpen(open: boolean) {
    emojiPanel.dataset.open = String(open);
    emojiToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      emojiGroup = "recent";
      paintEmoji();
    }
  }
  function insertEmoji(value: string) {
    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? start;
    field.value = field.value.slice(0, start) + value + field.value.slice(end);
    const caret = start + value.length;
    field.setSelectionRange(caret, caret);
    recent = [value, ...recent.filter((entry) => entry !== value)].slice(0, 8);
    field.focus({ preventScroll: true });
    syncComposer();
  }
  function syncComposer() {
    composer.dataset.filled = String(field.value.trim().length > 0);
  }
  const clock = () =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  function send() {
    const text = field.value.trim();
    if (!text) return;
    const chat = findChat(selected);
    if (!chat) return;
    sent.set(selected, [...(sent.get(selected) ?? []), { from: "me", text, time: clock() }]);
    field.value = "";
    syncComposer();
    setEmojiOpen(false);
    paintThread();
  }
  composer.addEventListener("submit", (event) => {
    event.preventDefault();
    send();
  });
  field.addEventListener("input", syncComposer);
  // Typing must never reach the page's own key handling (scrolling, shortcuts).
  field.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key === "Escape") setEmojiOpen(false);
  });

  // ---- Views and calls --------------------------------------------------------
  function setView(view: View) {
    root.dataset.view = view;
    setEmojiOpen(false);
    win.querySelectorAll<HTMLElement>("[data-rail]").forEach((button) => {
      if (button.dataset.rail === view) button.dataset.active = "";
      else delete button.dataset.active;
    });
    closeCall();
  }
  function openCall(mode: CallMode, name: string, tone: number) {
    callLayer.innerHTML = callWindow(mode, name, tone);
    callLayer.dataset.open = "true";
  }
  function closeCall() {
    callLayer.dataset.open = "false";
  }

  function reset() {
    counts = new Map(WA_CHATS.map((chat) => [chat.id, chat.unread ?? 0]));
    selected = WA_CHATS[0].id;
    filter = "all";
    sent.clear();
    viewed.clear();
    WA_STATUSES.forEach((entry, index) => entry.seen && viewed.add(index));
    closeStory();
    lightbox.dataset.open = "false";
    bannerOpen = true;
    showCallInfo(undefined);
    field.value = "";
    syncComposer();
    setEmojiOpen(false);
    closeCall();
    setView("chats");
    paintChats();
    paintThread();
    list.scrollTop = 0;
    win.querySelectorAll<HTMLElement>(".wa-scroll").forEach((el) => {
      if (el !== thread) el.scrollTop = 0;
    });
  }
  reset();

  // ---- Window state ---------------------------------------------------------
  const buttons = Array.from(win.querySelectorAll<HTMLButtonElement>('[data-scope="window"]'));
  const button = (name: string) => buttons.find((entry) => entry.dataset.control === name)!;
  let state: WindowState = "closed";
  let restoreTo: "full" | "windowed" = "full";
  const hidden = () => state === "minimised" || state === "closed";

  function aim() {
    const point = target();
    if (!point) return;
    // Offsets from the window's own centre, in layout pixels.
    win.style.setProperty(
      "--min-x",
      `${point.x - root.offsetLeft - win.offsetLeft - win.offsetWidth / 2}px`,
    );
    win.style.setProperty(
      "--min-y",
      `${point.y - root.offsetTop - win.offsetTop - win.offsetHeight / 2}px`,
    );
  }
  function set(next: WindowState) {
    if (next === state) return;
    if (next === "minimised" && state !== "closed")
      restoreTo = state === "windowed" ? "windowed" : "full";
    if (next === "closed") restoreTo = "full";
    if (next === "minimised" || next === "closed") aim();
    state = next;
    root.dataset.window = next;
    root.inert = hidden();
    button("maximise").innerHTML = next === "full" ? WINDOW_ICONS.restore : WINDOW_ICONS.maximise;
    // A closed window starts over once it has shrunk away.
    if (next === "closed")
      setTimeout(() => {
        if (state === "closed") reset();
      }, 600);
    onChange(next === "closed" ? "closed" : next === "minimised" ? "minimised" : "open");
  }
  const open = () => {
    if (hidden()) set(state === "closed" ? "full" : restoreTo);
    else onChange("open");
  };

  // ---- Input ------------------------------------------------------------------
  root.addEventListener("click", (event) => {
    const hit = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-rail],[data-chat],[data-filter],[data-call],[data-end],[data-control],[data-emoji],[data-emoji-group],[data-emoji-toggle],[data-call-row],[data-info-close],[data-info-chat],[data-meta-ai],[data-banner-close],[data-copy],[data-image],[data-lightbox-close],[data-status],[data-story-close],[data-story-next],[data-story-prev],[data-story-pause],[data-story-mute],[data-story-like]",
    );
    if (!hit) {
      if (!(event.target as HTMLElement).closest(".wa-emoji")) setEmojiOpen(false);
      return;
    }
    if (hit.dataset.status !== undefined) openStory(Number(hit.dataset.status));
    else if (hit.dataset.storyClose !== undefined) closeStory();
    else if (hit.dataset.storyNext !== undefined) stepStory(1);
    else if (hit.dataset.storyPrev !== undefined) stepStory(-1);
    else if (hit.dataset.storyPause !== undefined) {
      storyState.paused = !storyState.paused;
      paintStory();
    } else if (hit.dataset.storyMute !== undefined) {
      storyState.muted = !storyState.muted;
      paintStory();
    } else if (hit.dataset.storyLike !== undefined) {
      storyState.liked = !storyState.liked;
      hit.innerHTML = icon(storyState.liked ? "heartFilled" : "heart");
    } else if (hit.dataset.image) {
      lightboxArt.innerHTML = hit.innerHTML;
      lightbox.dataset.open = "true";
    } else if (hit.dataset.lightboxClose !== undefined) {
      lightbox.dataset.open = "false";
    } else if (hit.dataset.metaAi !== undefined) {
      setView("chats");
      filter = "all";
      openChat(WA_META_AI.id);
    } else if (hit.dataset.bannerClose !== undefined) {
      bannerOpen = false;
      banner.hidden = true;
    } else if (hit.dataset.copy !== undefined) {
      const code = hit.closest(".wa-code")?.querySelector("pre")?.textContent ?? "";
      void navigator.clipboard?.writeText(code).catch(() => undefined);
      hit.innerHTML = icon("check");
      hit.dataset.done = "";
      setTimeout(() => {
        hit.innerHTML = icon("copy");
        delete hit.dataset.done;
      }, 1500);
    } else if (hit.dataset.callRow) showCallInfo(Number(hit.dataset.callRow));
    else if (hit.dataset.infoClose !== undefined) showCallInfo(undefined);
    else if (hit.dataset.infoChat) {
      const chat = WA_CHATS.find((entry) => entry.name === hit.dataset.infoChat);
      if (chat) {
        setView("chats");
        openChat(chat.id);
      }
    } else if (hit.dataset.emoji) insertEmoji(hit.dataset.emoji);
    else if (hit.dataset.emojiGroup) {
      emojiGroup = hit.dataset.emojiGroup;
      paintEmoji();
    } else if (hit.dataset.emojiToggle !== undefined) setEmojiOpen(emojiPanel.dataset.open !== "true");
    else if (hit.dataset.rail) setView(hit.dataset.rail as View);
    else if (hit.dataset.chat) openChat(hit.dataset.chat);
    else if (hit.dataset.filter) {
      filter = hit.dataset.filter as "all" | "unread";
      paintChats();
    } else if (hit.dataset.call)
      openCall(hit.dataset.call as CallMode, hit.dataset.name ?? "", Number(hit.dataset.tone ?? 0));
    else if (hit.dataset.end !== undefined) closeCall();
    else if (hit.dataset.control && hit.dataset.scope === "call") {
      if (hit.dataset.control === "close") closeCall();
    } else if (hit.dataset.control === "minimise") set("minimised");
    else if (hit.dataset.control === "close") set("closed");
    else if (hit.dataset.control === "maximise") {
      const next = state === "full" ? "windowed" : state === "windowed" ? "full" : undefined;
      if (!next) return;
      root.dataset.snap = next;
      set(next);
    }
  });
  win.addEventListener("animationend", (event) => {
    if (event.target === win) delete root.dataset.snap;
  });

  // The wheel scrolls a list or thread while it can; at either end the page takes it back
  // (after a moment, so a spinning wheel does not leak through).
  let lastScrollAt = 0;
  root.addEventListener(
    "wheel",
    (event) => {
      const box = (event.target as HTMLElement).closest<HTMLElement>(".wa-scroll");
      if (!box) return;
      const room = box.scrollHeight - box.clientHeight;
      if (room <= 1) return;
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      const next = Math.min(room, Math.max(0, box.scrollTop + delta));
      if (next === box.scrollTop) {
        if (performance.now() - lastScrollAt < WHEEL_LATCH_MS) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      lastScrollAt = performance.now();
      box.scrollTop = next;
    },
    { passive: false },
  );

  return {
    element: root,
    open,
    hidden,
    toggle() {
      if (hidden()) open();
      else set("minimised");
    },
    dispose() {
      root.remove();
    },
  };
}
