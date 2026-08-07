"use strict";

const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const copyBtn = document.getElementById("copyBtn");
const toast = document.getElementById("toast");
const clock = document.getElementById("clock");
const card = document.querySelector(".card");

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(window.__toastTimer);
  window.__toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function applyTheme(theme) {
  const useLight = theme === "light";
  body.classList.toggle("light", useLight);
  if (themeToggle) {
    themeToggle.textContent = useLight ? "切换深色" : "切换主题";
    themeToggle.setAttribute("aria-pressed", String(useLight));
  }
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("card-theme");
} catch (error) {
  savedTheme = null;
}
applyTheme(savedTheme === "light" ? "light" : "dark");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = body.classList.contains("light") ? "dark" : "light";
    applyTheme(nextTheme);
    try {
      localStorage.setItem("card-theme", nextTheme);
    } catch (error) {
    }
  });
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    textarea.remove();
  }
  return copied;
}

if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    const email = copyBtn.dataset.copy || "Me@AuCei.cn";
    try {
      const copied = await copyText(email);
      showToast(copied ? "邮箱已复制" : `邮箱：${email}`);
    } catch (error) {
      showToast(`邮箱：${email}`);
    }
  });
}

function updateClock() {
  if (!clock) return;
  const now = new Date();
  clock.textContent = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(now);
  clock.dateTime = now.toISOString();
}

let clockTimer = 0;
function startClock() {
  window.clearInterval(clockTimer);
  updateClock();
  if (!document.hidden) clockTimer = window.setInterval(updateClock, 1000);
}
startClock();
document.addEventListener("visibilitychange", startClock);

if (card && window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let tiltFrame = 0;
  let pointerX = 0;
  let pointerY = 0;

  card.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (tiltFrame) return;

    tiltFrame = window.requestAnimationFrame(() => {
      tiltFrame = 0;
      const rect = card.getBoundingClientRect();
      const x = pointerX - rect.left;
      const y = pointerY - rect.top;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 2;
      const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 2;
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  }, { passive: true });

  card.addEventListener("pointerleave", () => {
    window.cancelAnimationFrame(tiltFrame);
    tiltFrame = 0;
    card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  });
}
const currentYear = document.getElementById("currentYear");

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

const wechatBtn = document.getElementById("wechatBtn");
const wechatModal = document.getElementById("wechatModal");
const wechatClose = document.getElementById("wechatClose");
const wechatBackdrop = document.querySelector("[data-wechat-close]");
let lastFocusedElement = null;

let modalAnimationFrame = 0;

function openWechatModal() {
  if (!wechatModal || wechatModal.classList.contains("show")) return;

  lastFocusedElement = document.activeElement;
  wechatModal.setAttribute("aria-hidden", "false");

  window.cancelAnimationFrame(modalAnimationFrame);
  modalAnimationFrame = window.requestAnimationFrame(() => {
    wechatModal.classList.add("show");
    document.body.classList.add("modal-open");
    window.setTimeout(() => wechatClose?.focus(), 80);
  });
}

function closeWechatModal() {
  if (!wechatModal) return;

  window.cancelAnimationFrame(modalAnimationFrame);

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus({ preventScroll: true });
  } else {
    document.body.focus({ preventScroll: true });
  }

  wechatModal.classList.remove("show");
  document.body.classList.remove("modal-open");

  window.setTimeout(() => {
    if (!wechatModal.classList.contains("show")) {
      wechatModal.setAttribute("aria-hidden", "true");
    }
  }, 540);
}

wechatBtn?.addEventListener("click", openWechatModal);
wechatClose?.addEventListener("click", closeWechatModal);
wechatBackdrop?.addEventListener("click", closeWechatModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && wechatModal?.classList.contains("show")) {
    closeWechatModal();
  }
});

const moreContentBtn = document.getElementById("moreContentBtn");
moreContentBtn?.addEventListener("click", () => {
  showToast("正在准备中敬请期待");
});

const musicToggle = document.getElementById("musicToggle");
const musicPlayerRoot = document.getElementById("music-player-root");
const musicPlayerCdn = "https://player.xfyun.club/js/music-player/music-player.min.js";
let musicPlayerInstance = null;
let musicPlayerLoading = null;
let musicPlayerBusy = false;

function timeoutPromise(milliseconds, message) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => reject(new Error(message)), milliseconds);
  });
}

function loadMusicPlayerLibrary() {
  if (window.XfMusicPlayer?.MusicPlayer) return Promise.resolve();
  if (musicPlayerLoading) return musicPlayerLoading;
  musicPlayerLoading = new Promise((resolve, reject) => {
    const ready = () => {
      if (window.XfMusicPlayer?.MusicPlayer) resolve();
      else reject(new Error("播放器组件未正确注册"));
    };
    const existing = document.querySelector(`script[src="${musicPlayerCdn}"]`);
    if (existing) {
      if (window.XfMusicPlayer?.MusicPlayer) resolve();
      else {
        existing.addEventListener("load", ready, { once: true });
        existing.addEventListener("error", () => reject(new Error("播放器脚本加载失败")), { once: true });
      }
      return;
    }
    const loader = document.createElement("script");
    const originalLog = console.log.bind(console);
    console.log = (...args) => {
      const text = args.map((item) => String(item)).join(" ");
      if (!(text.includes("自豪采用") && text.includes("小枫音乐播放器"))) originalLog(...args);
    };
    const restoreConsole = () => {
      console.log = originalLog;
    };
    loader.src = musicPlayerCdn;
    loader.async = true;
    loader.addEventListener("load", () => {
      restoreConsole();
      ready();
    }, { once: true });
    loader.addEventListener("error", () => {
      restoreConsole();
      reject(new Error("播放器脚本加载失败"));
    }, { once: true });
    document.head.appendChild(loader);
  });
  return musicPlayerLoading;
}

function setMusicButton(enabled, loading = false) {
  if (!musicToggle) return;
  musicToggle.disabled = false;
  musicToggle.setAttribute("aria-busy", String(loading));
  musicToggle.textContent = loading ? "正在启动…" : enabled ? "关闭音乐" : "启用音乐";
  musicToggle.setAttribute("aria-pressed", String(enabled));
  musicToggle.setAttribute("aria-label", enabled ? "关闭音乐播放器" : "加载并显示音乐播放器");
}

async function enableMusicPlayer() {
  if (!musicPlayerRoot || musicPlayerInstance || musicPlayerBusy) return;
  musicPlayerBusy = true;
  setMusicButton(false, true);
  try {
    await Promise.race([
      loadMusicPlayerLibrary(),
      timeoutPromise(10000, "播放器加载超时")
    ]);
    const MusicPlayer = window.XfMusicPlayer?.MusicPlayer;
    if (!MusicPlayer) throw new Error("播放器初始化接口不可用");
    musicPlayerInstance = new MusicPlayer({
      tagName: "xf-aucei-player",
      mountElement: musicPlayerRoot,
      language: "zh",
      isMonitoring: false,
      attributes: {
        theme: "auto-theme",
        mode: "cloud",
        apiUrl: "https://music.api.xfyun.club/api/v1/music/top?platform=netease&topId=3778678",
        environment: "production",
        rememberPlayback: true,
        memoryKey: "aucei-music-player",
        playMode: "random",
        volume: 0.8,
        isAutoPopup: false,
        isAutoPlaylist: false
      }
    });
    setMusicButton(true);
  } catch (error) {
    musicPlayerLoading = null;
    musicPlayerInstance = null;
    musicPlayerRoot.replaceChildren();
    setMusicButton(false);
    showToast(error?.message || "音乐播放器加载失败，请稍后重试");
  } finally {
    musicPlayerBusy = false;
    musicToggle?.setAttribute("aria-busy", "false");
  }
}

async function disableMusicPlayer() {
  if (musicPlayerBusy) return;
  musicPlayerBusy = true;
  setMusicButton(true, true);
  try {
    if (musicPlayerInstance?.destroy) await musicPlayerInstance.destroy();
  } catch (error) {
  }
  document.querySelectorAll("audio").forEach((audio) => {
    try {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    } catch (error) {
    }
  });
  musicPlayerRoot?.replaceChildren();
  musicPlayerInstance = null;
  musicPlayerBusy = false;
  setMusicButton(false);
}

musicToggle?.addEventListener("click", () => {
  if (musicPlayerInstance) disableMusicPlayer();
  else enableMusicPlayer();
});
