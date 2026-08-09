"use strict";

const SELECTORS = {
  focusable: [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",")
};

const body = document.body;
const pageContent = document.getElementById("pageContent");
const themeToggle = document.getElementById("themeToggle");
const copyBtn = document.getElementById("copyBtn");
const shareBtn = document.getElementById("shareBtn");
const toast = document.getElementById("toast");
const clock = document.getElementById("clock");
const card = document.querySelector(".card");
const currentYear = document.getElementById("currentYear");
const wechatBtn = document.getElementById("wechatBtn");
const emailContactBtn = document.getElementById("emailContactBtn");
const douyinContactBtn = document.getElementById("douyinContactBtn");
const wechatModal = document.getElementById("wechatModal");
const wechatClose = document.getElementById("wechatClose");
const wechatBackdrop = document.querySelector("[data-wechat-close]");
const moreContentBtn = document.getElementById("moreContentBtn");
const musicToggle = document.getElementById("musicToggle");
const musicPlayerRoot = document.getElementById("music-player-root");

let toastTimer = 0;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function initTheme() {
  const applyTheme = (theme) => {
    const useLight = theme === "light";
    document.documentElement.classList.toggle("light", useLight);
    if (!themeToggle) return;
    themeToggle.textContent = useLight ? "切换深色" : "切换浅色";
    themeToggle.setAttribute("aria-pressed", String(useLight));
    themeToggle.setAttribute("aria-label", useLight ? "切换到深色主题" : "切换到浅色主题");
  };

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem("card-theme");
  } catch (error) {
    savedTheme = null;
  }

  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initialTheme = savedTheme === "light" || savedTheme === "dark"
    ? savedTheme
    : prefersLight ? "light" : "dark";
  applyTheme(initialTheme);

  themeToggle?.addEventListener("click", () => {
    const nextTheme = document.documentElement.classList.contains("light") ? "dark" : "light";
    applyTheme(nextTheme);
    try {
      localStorage.setItem("card-theme", nextTheme);
    } catch (error) {
      // 存储不可用时仍允许本次切换生效。
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

function initClipboard() {
  copyBtn?.addEventListener("click", async () => {
    const email = copyBtn.dataset.copy || "Me@AuCei.cn";
    try {
      const copied = await copyText(email);
      showToast(copied ? "邮箱已复制" : `邮箱：${email}`);
    } catch (error) {
      showToast(`邮箱：${email}`);
    }
  });
}
function initShare() {
  shareBtn?.addEventListener("click", async () => {
    const isWebPage = window.location.protocol === "http:" || window.location.protocol === "https:";

    // file:// 是本地文件地址，Windows 分享面板无法可靠处理，避免触发浏览器错误页。
    if (!isWebPage) {
      showToast("当前是本地预览，发布网站后即可分享");
      return;
    }

    const shareData = {
      title: document.title,
      text: "CNAuCei 的个人主页",
      url: window.location.href
    };

    try {
      if (window.isSecureContext && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      const copied = await copyText(shareData.url);
      showToast(copied ? "主页链接已复制" : shareData.url);
    } catch (error) {
      if (error?.name === "AbortError") return;
      try {
        const copied = await copyText(shareData.url);
        showToast(copied ? "主页链接已复制" : "暂时无法分享主页");
      } catch (copyError) {
        showToast("暂时无法分享主页");
      }
    }
  });
}

const clockFormatter = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});

function initClock() {
  if (!clock) return;
  let clockTimer = 0;

  const updateClock = () => {
    const now = new Date();
    clock.textContent = clockFormatter.format(now);
    clock.dateTime = now.toISOString();
  };

  const startClock = () => {
    window.clearInterval(clockTimer);
    updateClock();
    if (!document.hidden) clockTimer = window.setInterval(updateClock, 1000);
  };

  startClock();
  document.addEventListener("visibilitychange", startClock);
}

function initCardTilt() {
  if (!card || !window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let tiltFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let cardRect = null;
  const maxTilt = 1.2;

  const cacheCardRect = () => {
    cardRect = card.getBoundingClientRect();
  };

  const resetCardTilt = () => {
    window.cancelAnimationFrame(tiltFrame);
    tiltFrame = 0;
    cardRect = null;
    card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  };

  card.addEventListener("pointerenter", cacheCardRect, { passive: true });
  card.addEventListener("pointermove", (event) => {
    if (body.classList.contains("music-playing")) {
      resetCardTilt();
      return;
    }

    if (!cardRect) cacheCardRect();
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (tiltFrame) return;

    tiltFrame = window.requestAnimationFrame(() => {
      tiltFrame = 0;
      if (!cardRect) return;
      const x = pointerX - cardRect.left;
      const y = pointerY - cardRect.top;
      const rotateY = ((x - cardRect.width / 2) / (cardRect.width / 2)) * maxTilt;
      const rotateX = -((y - cardRect.height / 2) / (cardRect.height / 2)) * maxTilt;
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  }, { passive: true });

  card.addEventListener("pointerleave", resetCardTilt);
  window.addEventListener("resize", () => { cardRect = null; }, { passive: true });
  document.addEventListener("musicperformancechange", (event) => {
    if (event.detail?.playing) resetCardTilt();
  });
}

function initWechatModal() {
  if (!wechatModal) return;

  let lastFocusedElement = null;
  let modalAnimationFrame = 0;
  let closeTimer = 0;
  const getFocusableElements = () => Array.from(
    wechatModal.querySelectorAll(SELECTORS.focusable)
  ).filter((element) => element instanceof HTMLElement && !element.hasAttribute("hidden"));

  const openWechatModal = () => {
    if (wechatModal.classList.contains("show")) return;
    lastFocusedElement = document.activeElement;
    window.clearTimeout(closeTimer);
    wechatModal.setAttribute("aria-hidden", "false");
    pageContent?.setAttribute("inert", "");

    window.cancelAnimationFrame(modalAnimationFrame);
    modalAnimationFrame = window.requestAnimationFrame(() => {
      wechatModal.classList.add("show");
      body.classList.add("modal-open");
      window.setTimeout(() => wechatClose?.focus(), 80);
    });
  };

  const closeWechatModal = () => {
    if (!wechatModal.classList.contains("show")) return;
    window.cancelAnimationFrame(modalAnimationFrame);
    wechatModal.classList.remove("show");
    body.classList.remove("modal-open");
    pageContent?.removeAttribute("inert");

    if (lastFocusedElement instanceof HTMLElement && lastFocusedElement.isConnected) {
      lastFocusedElement.focus({ preventScroll: true });
    }

    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      if (!wechatModal.classList.contains("show")) {
        wechatModal.setAttribute("aria-hidden", "true");
      }
    }, 540);
  };

  const trapFocus = (event) => {
    if (event.key !== "Tab" || !wechatModal.classList.contains("show")) return;
    const focusable = getFocusableElements();
    if (!focusable.length) {
      event.preventDefault();
      wechatClose?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  wechatBtn?.addEventListener("click", openWechatModal);
  wechatClose?.addEventListener("click", closeWechatModal);
  wechatBackdrop?.addEventListener("click", closeWechatModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && wechatModal.classList.contains("show")) {
      closeWechatModal();
      return;
    }
    trapFocus(event);
  });
}


function initContactNavigation() {
  emailContactBtn?.addEventListener("click", () => {
    window.location.href = "mailto:Me@AuCei.cn";
  });

  douyinContactBtn?.addEventListener("click", () => {
    window.open("https://v.douyin.com/vyspksoAxyg", "_blank", "noopener,noreferrer");
  });
}

function initMoreContent() {
  moreContentBtn?.addEventListener("click", () => showToast("准备中敬请期待"));
}

function initContactTouchFeedback() {
  const contactItems = document.querySelectorAll(".contact-item");
  if (!contactItems.length) return;

  const clearPressed = (item, delay = 0) => {
    window.setTimeout(() => item.classList.remove("is-pressed"), delay);
  };

  contactItems.forEach((item) => {
    item.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      item.classList.add("is-pressed");

      const rect = item.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "contact-ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      ripple.setAttribute("aria-hidden", "true");
      item.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    });

    item.addEventListener("pointerup", () => clearPressed(item, 90));
    item.addEventListener("pointercancel", () => clearPressed(item));
    item.addEventListener("pointerleave", () => clearPressed(item));
    item.addEventListener("blur", () => clearPressed(item));
  });
}

const musicPlayerCdn = "https://player.xfyun.club/js/music-player/music-player.min.js";
let musicPlayerInstance = null;
let musicPlayerLoading = null;
let musicPlayerBusy = false;

function setMusicPerformanceMode(playing) {
  const shouldOptimize = Boolean(playing) && !document.hidden;
  if (body.classList.contains("music-playing") === shouldOptimize) return;
  body.classList.toggle("music-playing", shouldOptimize);
  document.dispatchEvent(new CustomEvent("musicperformancechange", {
    detail: { playing: shouldOptimize }
  }));
}

function syncMusicPerformanceMode() {
  const activeAudio = Array.from(document.querySelectorAll("audio"))
    .some((audio) => !audio.paused && !audio.ended && audio.readyState > 1);
  setMusicPerformanceMode(activeAudio);
}

function loadMusicPlayerLibrary(timeoutMs = 10000) {
  if (window.XfMusicPlayer?.MusicPlayer) return Promise.resolve();
  if (musicPlayerLoading) return musicPlayerLoading;

  musicPlayerLoading = new Promise((resolve, reject) => {
    let loader = document.querySelector(`script[src="${musicPlayerCdn}"]`);
    const createdLoader = !loader;
    if (!loader) {
      loader = document.createElement("script");
      loader.src = musicPlayerCdn;
      loader.async = true;
    }

    let settled = false;
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      loader.removeEventListener("load", handleLoad);
      loader.removeEventListener("error", handleError);
    };
    const finish = (callback) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback();
    };
    const handleLoad = () => finish(() => {
      if (window.XfMusicPlayer?.MusicPlayer) resolve();
      else reject(new Error("播放器组件未正确注册"));
    });
    const handleError = () => finish(() => reject(new Error("播放器脚本加载失败")));
    const timeoutId = window.setTimeout(() => finish(() => {
      if (createdLoader) loader.remove();
      reject(new Error("播放器加载超时"));
    }), timeoutMs);

    loader.addEventListener("load", handleLoad, { once: true });
    loader.addEventListener("error", handleError, { once: true });
    if (createdLoader) document.head.appendChild(loader);
  });

  musicPlayerLoading.catch(() => {
    musicPlayerLoading = null;
  });
  return musicPlayerLoading;
}

function setMusicButton(enabled, loading = false) {
  if (!musicToggle) return;
  const label = musicToggle.querySelector(".action-label");
  musicToggle.setAttribute("aria-busy", String(loading));
  if (label) label.textContent = loading ? "加载中" : enabled ? "关闭音乐" : "音乐";
  musicToggle.setAttribute("aria-pressed", String(enabled));
  musicToggle.setAttribute("aria-label", loading
    ? "音乐播放器正在加载"
    : enabled ? "关闭音乐播放器" : "加载并显示音乐播放器");
}

async function enableMusicPlayer() {
  if (!musicPlayerRoot || musicPlayerInstance || musicPlayerBusy) return;
  musicPlayerBusy = true;
  setMusicButton(false, true);

  try {
    await loadMusicPlayerLibrary();
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
        apiUrl: "https://music.api.xfyun.club/api/v1/music/top?platform=netease&topId=18234945688",
        environment: "production",
        rememberPlayback: true,
        memoryKey: "aucei-music-player-18234945688",
        playMode: "random",
        volume: 0.8,
        isAutoPopup: false,
        isAutoPlaylist: false,
        colorfulLyric: false,
        audioVisualizer: false
      }
    });

    body.classList.add("music-player-enabled");
    setMusicButton(true);
    showToast("音乐播放器已开启");
    window.setTimeout(syncMusicPerformanceMode, 0);
  } catch (error) {
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
    console.warn("播放器销毁失败", error);
  }

  musicPlayerRoot?.querySelectorAll("audio").forEach((audio) => {
    try {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    } catch (error) {
      console.warn("播放器音频清理失败", error);
    }
  });

  musicPlayerRoot?.replaceChildren();
  musicPlayerInstance = null;
  body.classList.remove("music-player-enabled", "music-playing");
  musicPlayerBusy = false;
  setMusicButton(false);
  showToast("音乐播放器已关闭");
}

function initActionTouchFeedback() {
  document.querySelectorAll(".action-btn").forEach((button) => {
    const release = () => window.setTimeout(() => button.classList.remove("is-touching"), 90);
    button.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse") return;
      button.classList.add("is-touching");
    });
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", () => button.classList.remove("is-touching"));
    button.addEventListener("pointerleave", () => button.classList.remove("is-touching"));
  });
}

function initMusicPlayer() {
  document.addEventListener("play", syncMusicPerformanceMode, true);
  document.addEventListener("playing", syncMusicPerformanceMode, true);
  document.addEventListener("pause", syncMusicPerformanceMode, true);
  document.addEventListener("ended", syncMusicPerformanceMode, true);
  document.addEventListener("emptied", syncMusicPerformanceMode, true);
  document.addEventListener("visibilitychange", syncMusicPerformanceMode);

  musicToggle?.addEventListener("click", () => {
    if (musicPlayerInstance) disableMusicPlayer();
    else enableMusicPlayer();
  });
}

function initPage() {
  initTheme();
  initClipboard();
  initShare();
  initClock();
  initCardTilt();
  initWechatModal();
  initContactNavigation();
  initMoreContent();
  initContactTouchFeedback();
  initActionTouchFeedback();
  initMusicPlayer();

  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
}

initPage();
