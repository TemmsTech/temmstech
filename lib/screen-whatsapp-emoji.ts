/** Emoji offered by the simulated WhatsApp window's picker, grouped like the real one. */
export type WaEmojiGroup = { id: string; label: string; tab: string; emoji: string[] };

const split = (text: string) => text.split(/\s+/).filter(Boolean);

export const WA_EMOJI_GROUPS: WaEmojiGroup[] = [
  {
    id: "smileys",
    label: "Smileys",
    tab: "😀",
    emoji: split(
      "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😋 😛 😜 🤪 😎 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 😶 😐 😑 😬 🙄 😯 😴 🤤 😷 🤒 🤕 🥱",
    ),
  },
  {
    id: "gestures",
    label: "People",
    tab: "👋",
    emoji: split(
      "👋 🤚 🖐️ ✋ 👌 🤌 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 👐 🤝 🙏 💪 🫶 🫡 🤷 🙋 🤦 💁 🙆",
    ),
  },
  {
    id: "hearts",
    label: "Hearts and symbols",
    tab: "❤️",
    emoji: split(
      "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 ✨ ⭐ 🌟 💫 🔥 💯 ✅ ❌ ❗ ❓ ⚡ 🎉 🎊 🎁",
    ),
  },
  {
    id: "objects",
    label: "Objects",
    tab: "💡",
    emoji: split(
      "💡 💻 🖥️ ⌨️ 📱 📞 📧 📄 📎 📅 ⏰ 📸 🎥 🎧 🔒 🔑 🛠️ ⚙️ 🚀 🧾 💳 🛒 📦 🏷️ 🖊️ 📝 📌 📈 🔔 💼",
    ),
  },
  {
    id: "food",
    label: "Food and nature",
    tab: "🍕",
    emoji: split(
      "🍕 🍔 🍟 🌮 🍜 🍣 🍰 🍩 ☕ 🍵 🍺 🥂 🍎 🍌 🍉 🍓 🌴 🌸 🌻 🌍 ☀️ 🌙 ⛅ 🌧️ 🐶 🐱 🦁 🐢",
    ),
  },
];

export const WA_RECENT_EMOJI = split("😂 👍 🙏 😊 ❤️ 🔥 😍 🎉");
