/** The simulated power states of the laptop's Windows desktop: lock, sleep, shut down, restart. */

export type PowerAction = "lock" | "sleep" | "shutdown" | "restart";
type View = "none" | "lock" | "signin" | "wait" | "black" | "boot";

const SHUTDOWN_MS = 1700;
const RESTART_MS = 1800;
const BLACK_MS = 700;
const BOOT_MS = 2500;
const CLOCK_MS = 10_000;
/** How long the "Welcome" spinner shows after a correct password. */
const WELCOME_MS = 1600;
/** The sign-in password, in any letter case. */
const PASSWORD = "password";
const MAX_LENGTH = 32;

const LOGO =
  '<svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden="true"><g fill="#03b2fa"><rect x="3" y="3" width="12.500" height="12.500" rx="1.500"/><rect x="16.500" y="3" width="12.500" height="12.500" rx="1.500"/><rect x="3" y="16.500" width="12.500" height="12.500" rx="1.500"/><rect x="16.500" y="16.500" width="12.500" height="12.500" rx="1.500"/></g></svg>';

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

export type ScreenPower = {
  element: HTMLElement;
  run: (action: PowerAction) => void;
  dispose: () => void;
};

type PowerOptions = {
  /** The name on the sign-in screen. */
  name: string;
};

/**
 * A full-screen layer above every window. Lock shows the lock screen, then a
 * sign-in; sleep goes black until a click or key, then the lock screen; shut
 * down says so, then stays black until the page is refreshed; restart says so,
 * goes black, boots (logo and spinner), then lands on the lock screen. Open
 * windows are not touched. Nothing in it is live.
 */
export function createScreenPower(
  parent: HTMLElement,
  { name }: PowerOptions,
): ScreenPower {
  const root = create("div", "screen-power");
  root.dataset.view = "none";
  root.inert = true;
  root.tabIndex = -1;
  root.addEventListener("pointerdown", (event) => event.stopPropagation());

  const wall = create("div", "pw-layer pw-wall");
  const dim = create("div", "pw-layer pw-dim");
  const time = create("span", "pw-time");
  const date = create("span", "pw-date");
  const lock = create("div", "pw-layer pw-lock");
  lock.append(time, date, create("span", "pw-hint", "Click or press any key to unlock"));
  const signin = create("div", "pw-layer pw-signin");
  const button = create("button", "pw-signin-button", "Sign in");
  const field = create("div", "pw-field");
  const fieldText = create("span", "pw-field-text");
  field.appendChild(fieldText);
  const problem = create("span", "pw-problem");
  const tip = create("span", "pw-tip", "Hint: what do you need to log in?");
  button.type = "button";
  button.tabIndex = -1;
  // The password box, error, button and hint sit in one area; after a correct password only
  // that area turns into spinning dots, while the avatar, name and wallpaper stay put.
  const form = create("div", "pw-form");
  form.append(field, problem, button, tip);
  const busyArea = create("div", "pw-busy");
  busyArea.setAttribute("aria-hidden", "true");
  const dots = create("span", "pw-dots");
  for (let i = 0; i < 5; i++) dots.appendChild(create("i", "pw-dot"));
  busyArea.appendChild(dots);
  const actions = create("div", "pw-actions");
  actions.append(form, busyArea);
  signin.append(
    create("span", "pw-avatar", name.slice(0, 1)),
    create("span", "pw-name", name),
    actions,
  );
  const blue = create("div", "pw-layer pw-blue");
  const waitText = create("span", "pw-wait-text");
  blue.append(create("i", "pw-spinner"), waitText);
  const black = create("div", "pw-layer pw-black");
  const boot = create("div", "pw-layer pw-boot");
  boot.append(create("span", "pw-logo", LOGO), create("i", "pw-spinner"));
  // A real button, so a click reaches it on the laptop screen; it covers the screen while
  // the lock screen or the black (asleep) screen is up, and gets out of the way otherwise.
  const wakeButton = create("button", "pw-wake");
  wakeButton.type = "button";
  wakeButton.tabIndex = -1;
  wakeButton.setAttribute("aria-label", "Wake");
  root.append(wall, dim, lock, signin, blue, black, boot, wakeButton);
  parent.appendChild(root);

  let view: View = "none";
  let typed = "";
  let busy = false;
  let off = false;
  let timers: ReturnType<typeof setTimeout>[] = [];
  let clock: ReturnType<typeof setInterval> | undefined;

  const later = (ms: number, run: () => void) => timers.push(setTimeout(run, ms));
  const tick = () => {
    const now = new Date();
    time.textContent = now
      .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      .replace(/\s?[AP]M$/i, "");
    date.textContent = now.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  function show(next: View) {
    view = next;
    root.dataset.view = next;
    root.inert = next === "none";
    if (next === "lock" || next === "signin") {
      tick();
      clock ??= setInterval(tick, CLOCK_MS);
    } else {
      clearInterval(clock);
      clock = undefined;
    }
    if (next === "signin") reset();
  }

  /** The password field shows one dot per key typed, or its prompt. */
  function paintField() {
    fieldText.textContent = typed ? "•".repeat(typed.length) : "Password";
    field.dataset.empty = String(typed === "");
  }
  function reset() {
    typed = "";
    busy = false;
    delete signin.dataset.busy;
    problem.textContent = "";
    delete signin.dataset.shake;
    paintField();
  }
  function submit() {
    if (busy) return;
    if (typed.toLowerCase() === PASSWORD) {
      // Right password: the box and button turn into spinning dots, then the desktop.
      busy = true;
      typed = "";
      signin.dataset.busy = "";
      later(WELCOME_MS, () => show("none"));
      return;
    }
    typed = "";
    paintField();
    problem.textContent = "The password is incorrect. Try again.";
    delete signin.dataset.shake;
    void signin.offsetWidth;
    signin.dataset.shake = "";
  }

  function run(action: PowerAction) {
    if (off) return;
    for (const timer of timers) clearTimeout(timer);
    timers = [];
    if (action === "lock") show("lock");
    else if (action === "sleep") show("black");
    else if (action === "shutdown") {
      waitText.textContent = "Shutting down";
      show("wait");
      later(SHUTDOWN_MS, () => {
        off = true;
        show("black");
      });
    } else {
      waitText.textContent = "Restarting";
      show("wait");
      later(RESTART_MS, () => show("black"));
      later(RESTART_MS + BLACK_MS, () => show("boot"));
      later(RESTART_MS + BLACK_MS + BOOT_MS, () => show("lock"));
    }
  }

  // Asleep: any press or key wakes to the lock screen. Locked: any press or key
  // goes on to the sign-in. Shut down: nothing wakes it until the page is refreshed.
  const wake = () => {
    if (off) return;
    if (view === "black") show("lock");
    else if (view === "lock") show("signin");
  };
  root.addEventListener("click", wake);
  wakeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    wake();
  });
  // Keys are heard on the whole page, not just the layer: on the real page the layer does not
  // keep keyboard focus. Browser shortcuts (Ctrl, Cmd, Alt, F-keys) are left alone.
  const onKey = (event: KeyboardEvent) => {
    if (off || view === "none" || view === "wait" || view === "boot") return;
    if (event.ctrlKey || event.metaKey || event.altKey || /^F\d+$/.test(event.key)) return;
    if (event.key === "Shift" || event.key === "Control" || event.key === "Alt" || event.key === "Meta") return;
    event.preventDefault();
    event.stopPropagation();
    if (view === "signin") {
      if (busy) return;
      if (event.key === "Enter") submit();
      else if (event.key === "Escape") show("lock");
      else if (event.key === "Backspace") {
        typed = typed.slice(0, -1);
        problem.textContent = "";
        paintField();
      } else if (event.key.length === 1 && typed.length < MAX_LENGTH) {
        typed += event.key;
        problem.textContent = "";
        paintField();
      }
    } else wake();
  };
  document.addEventListener("keydown", onKey, true);
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    submit();
  });

  return {
    element: root,
    run,
    dispose() {
      document.removeEventListener("keydown", onKey, true);
      for (const timer of timers) clearTimeout(timer);
      clearInterval(clock);
      root.remove();
    },
  };
}
