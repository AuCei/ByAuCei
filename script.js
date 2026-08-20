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
const shareBtn = document.getElementById("shareBtn");
const toast = document.getElementById("toast");
const clock = document.getElementById("clock");
const card = document.querySelector(".profile-card");
const currentYear = document.getElementById("currentYear");
const wechatBtn = document.getElementById("wechatBtn");
const wechatModal = document.getElementById("wechatModal");
const wechatClose = document.getElementById("wechatClose");
const copyWechatBtn = document.getElementById("copyWechatBtn");
const wechatBackdrop = document.querySelector("[data-wechat-close]");
const qqBtn = document.getElementById("qqBtn");
const qqModal = document.getElementById("qqModal");
const qqClose = document.getElementById("qqClose");
const qqBackdrop = document.querySelector("[data-qq-close]");
const copyQqBtn = document.getElementById("copyQqBtn");
const qqOpenBtn = document.getElementById("qqOpenBtn");
const musicToggle = document.getElementById("musicToggle");
const musicPlayerRoot = document.getElementById("music-player-root");

let toastTimer = 0;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  window.clearTimeout(toastTimer);

  // 重新触发弹性展开，让连续操作时提示也有清晰反馈。
  toast.classList.remove("is-open", "is-closing");
  void toast.offsetWidth;
  toast.classList.add("is-open");

  toastTimer = window.setTimeout(() => {
    toast.classList.add("is-closing");
    toast.classList.remove("is-open");
    window.setTimeout(() => toast.classList.remove("is-closing"), 420);
  }, 1900);
}

function initTheme() {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeTransition = null;
  let cleanupTimer = 0;
  let isSwitching = false;

  const applyTheme = (theme) => {
    const useLight = theme === "light";
    root.classList.toggle("light", useLight);
    if (!themeToggle) return;
    themeToggle.setAttribute("aria-pressed", String(useLight));
    themeToggle.setAttribute("aria-label", useLight ? "切换到深色主题" : "切换到浅色主题");
    themeToggle.title = useLight ? "切换到深色主题" : "切换到浅色主题";
  };
  const saveTheme = (theme) => {
    try { localStorage.setItem("card-theme", theme); } catch {}
  };
  const cleanupTransition = () => {
    window.clearTimeout(cleanupTimer);
    cleanupTimer = 0;
    root.classList.remove("theme-transition-active", "theme-ripple-fallback");
    root.style.removeProperty("--theme-x");
    root.style.removeProperty("--theme-y");
    root.style.removeProperty("--theme-radius");
    activeTransition = null;
    isSwitching = false;
  };

  let savedTheme = null;
  try { savedTheme = localStorage.getItem("card-theme"); } catch {}
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initialTheme = savedTheme === "light" || savedTheme === "dark"
    ? savedTheme : prefersLight ? "light" : "dark";
  applyTheme(initialTheme);

  themeToggle?.addEventListener("click", (event) => {
    if (isSwitching) return;
    isSwitching = true;
    const nextTheme = root.classList.contains("light") ? "dark" : "light";
    const commitTheme = () => { applyTheme(nextTheme); saveTheme(nextTheme); };

    if (!document.startViewTransition || reduceMotion.matches) {
      root.classList.add("theme-ripple-fallback");
      commitTheme();
      cleanupTimer = window.setTimeout(cleanupTransition, reduceMotion.matches ? 30 : 240);
      return;
    }
    const rect = themeToggle.getBoundingClientRect();
    const x = Number.isFinite(event.clientX) && event.clientX > 0
      ? event.clientX
      : rect.left + rect.width / 2;
    const y = Number.isFinite(event.clientY) && event.clientY > 0
      ? event.clientY
      : rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    root.style.setProperty("--theme-radius", `${Math.ceil(radius)}px`);
    root.classList.add("theme-transition-active");

    try {
      activeTransition = document.startViewTransition(commitTheme);
      activeTransition.finished.catch(() => {}).finally(cleanupTransition);
      cleanupTimer = window.setTimeout(() => {
        activeTransition?.skipTransition?.();
        cleanupTransition();
      }, 900);
    } catch (error) {
      commitTheme();
      cleanupTransition();
    }
  });

  window.addEventListener("pagehide", () => {
    activeTransition?.skipTransition?.();
    cleanupTransition();
  }, { once: true });
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
  copyWechatBtn?.addEventListener("click", async () => {
    const wechatId = copyWechatBtn.dataset.wechatId || "ByAuCei";
    const originalText = "复制微信号";
    window.clearTimeout(copyWechatBtn._resetTimer);
    try {
      const copied = await copyText(wechatId);
      if (!copied) throw new Error("复制失败");
      copyWechatBtn.textContent = "已复制 ✓";
      copyWechatBtn.classList.add("is-copied");
      copyWechatBtn.setAttribute("aria-label", "微信号 ByAuCei 已复制");
    } catch (error) {
      copyWechatBtn.textContent = "复制失败";
      copyWechatBtn.classList.add("is-error");
      copyWechatBtn.setAttribute("aria-label", `复制失败，微信号为 ${wechatId}`);
    }
    copyWechatBtn._resetTimer = window.setTimeout(() => {
      copyWechatBtn.textContent = originalText;
      copyWechatBtn.classList.remove("is-copied", "is-error");
      copyWechatBtn.setAttribute("aria-label", `复制微信号 ${wechatId}`);
    }, 1600);
  });
  copyQqBtn?.addEventListener("click", async () => {
    const qqId = copyQqBtn.dataset.qqId || "3442695370";
    window.clearTimeout(copyQqBtn._resetTimer);
    try {
      const copied = await copyText(qqId);
      if (!copied) throw new Error("复制失败");
      copyQqBtn.textContent = "已复制 ✓";
      copyQqBtn.classList.add("is-copied");
      copyQqBtn.setAttribute("aria-label", `QQ号 ${qqId} 已复制`);
    } catch (error) {
      copyQqBtn.textContent = "复制失败";
      copyQqBtn.classList.add("is-error");
      copyQqBtn.setAttribute("aria-label", `复制失败，QQ号为 ${qqId}`);
    }
    copyQqBtn._resetTimer = window.setTimeout(() => {
      copyQqBtn.textContent = "复制QQ号";
      copyQqBtn.classList.remove("is-copied", "is-error");
      copyQqBtn.setAttribute("aria-label", `复制QQ号 ${qqId}`);
    }, 1600);
  });
}
function initShare() {
  shareBtn?.addEventListener("click", async () => {
    const isWebPage = window.location.protocol === "http:" || window.location.protocol === "https:";

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
      } catch {
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

function initWechatModal() {
  if (!wechatModal) return;

  let lastFocusedElement = null;
  let modalAnimationFrame = 0;
  let closeTimer = 0;
  const getFocusableElements = () => Array.from(
    wechatModal.querySelectorAll(SELECTORS.focusable)
  ).filter((element) => element instanceof HTMLElement && !element.hasAttribute("hidden"));

  const openWechatModal = () => {
    if (wechatModal.classList.contains("is-open")) return;
    lastFocusedElement = document.activeElement;
    window.clearTimeout(closeTimer);
    wechatModal.setAttribute("aria-hidden", "false");
    pageContent?.setAttribute("inert", "");

    window.cancelAnimationFrame(modalAnimationFrame);
    modalAnimationFrame = window.requestAnimationFrame(() => {
      wechatModal.classList.add("is-open");
      body.classList.add("modal-open");
      window.setTimeout(() => wechatClose?.focus(), 80);
    });
  };

  const closeWechatModal = () => {
    if (!wechatModal.classList.contains("is-open")) return;
    window.cancelAnimationFrame(modalAnimationFrame);
    wechatModal.classList.remove("is-open");
    body.classList.remove("modal-open");
    pageContent?.removeAttribute("inert");

    if (lastFocusedElement instanceof HTMLElement && lastFocusedElement.isConnected) {
      lastFocusedElement.focus({ preventScroll: true });
    }

    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      if (!wechatModal.classList.contains("is-open")) {
        wechatModal.setAttribute("aria-hidden", "true");
      }
    }, 540);
  };

  const trapFocus = (event) => {
    if (event.key !== "Tab" || !wechatModal.classList.contains("is-open")) return;
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
    if (event.key === "Escape" && wechatModal.classList.contains("is-open")) {
      closeWechatModal();
      return;
    }
    trapFocus(event);
  });
}

function initQqModal() {
  if (!qqModal) return;
  let lastFocusedElement = null;
  let closeTimer = 0;

  const focusableElements = () => Array.from(qqModal.querySelectorAll(SELECTORS.focusable))
    .filter((element) => element instanceof HTMLElement && !element.hasAttribute("hidden"));

  const openQqModal = () => {
    if (qqModal.classList.contains("is-open")) return;
    lastFocusedElement = document.activeElement;
    window.clearTimeout(closeTimer);
    qqModal.setAttribute("aria-hidden", "false");
    pageContent?.setAttribute("inert", "");
    window.requestAnimationFrame(() => {
      qqModal.classList.add("is-open");
      body.classList.add("modal-open");
      window.setTimeout(() => qqClose?.focus(), 80);
    });
  };

  const closeQqModal = () => {
    if (!qqModal.classList.contains("is-open")) return;
    qqModal.classList.remove("is-open");
    body.classList.remove("modal-open");
    pageContent?.removeAttribute("inert");
    lastFocusedElement?.focus?.({ preventScroll: true });
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      if (!qqModal.classList.contains("is-open")) qqModal.setAttribute("aria-hidden", "true");
    }, 540);
  };

  qqBtn?.addEventListener("click", openQqModal);
  qqClose?.addEventListener("click", closeQqModal);
  qqBackdrop?.addEventListener("click", closeQqModal);
  document.addEventListener("keydown", (event) => {
    if (!qqModal.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      closeQqModal();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = focusableElements();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

function initQqOpenButton() {
  if (!qqOpenBtn) return;
  qqOpenBtn.setAttribute("draggable", "false");
  qqOpenBtn.addEventListener("dragstart", (event) => event.preventDefault());
  qqOpenBtn.addEventListener("contextmenu", (event) => event.preventDefault());
}

function initContactTouchFeedback() {
  const contactItems = document.querySelectorAll(".contact-card");
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
      ripple.className = "contact-card__ripple";
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

// 仅过滤第三方音乐播放器输出的品牌提示，不影响其他控制台日志或报错。
function installMusicPlayerConsoleFilter() {
  const filterMark = Symbol.for("aucei.musicPlayerConsoleFilter");
  if (console[filterMark]) return;

  const methods = ["log", "info", "debug"];
  const blockedPhrases = ["自豪采用", "小枫音乐播放器"];

  methods.forEach((method) => {
    const original = console[method];
    if (typeof original !== "function") return;

    console[method] = function (...args) {
      const message = args
        .filter((value) => typeof value === "string")
        .join(" ");

      if (blockedPhrases.some((phrase) => message.includes(phrase))) return;
      return original.apply(console, args);
    };
  });

  Object.defineProperty(console, filterMark, {
    value: true,
    configurable: false,
    enumerable: false
  });
}

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
  installMusicPlayerConsoleFilter();
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
  const label = musicToggle.querySelector(".action-button__label");
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
  document.querySelectorAll(".action-button").forEach((button) => {
    const release = () => window.setTimeout(() => button.classList.remove("is-pressed"), 90);
    button.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse") return;
      button.classList.add("is-pressed");
    });
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", () => button.classList.remove("is-pressed"));
    button.addEventListener("pointerleave", () => button.classList.remove("is-pressed"));
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
  initWechatModal();
  initQqModal();
  initQqOpenButton();
  initContactTouchFeedback();
  initActionTouchFeedback();
  initMusicPlayer();

  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
}

initPage();
