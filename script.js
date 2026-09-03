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
  const resetTimers = new WeakMap();

  const bindCopyButton = (button, { value, defaultText, labelName }) => {
    if (!button) return;

    button.addEventListener("click", async () => {
      const textToCopy = button.dataset.copyValue || value;
      window.clearTimeout(resetTimers.get(button));
      button.classList.remove("is-copied", "is-error");

      try {
        const copied = await copyText(textToCopy);
        if (!copied) throw new Error("复制失败");
        button.textContent = "已复制 ✓";
        button.classList.add("is-copied");
        button.setAttribute("aria-label", `${labelName} ${textToCopy} 已复制`);
      } catch {
        button.textContent = "复制失败";
        button.classList.add("is-error");
        button.setAttribute("aria-label", `复制失败，${labelName}为 ${textToCopy}`);
      }

      const timer = window.setTimeout(() => {
        button.textContent = defaultText;
        button.classList.remove("is-copied", "is-error");
        button.setAttribute("aria-label", `${defaultText} ${textToCopy}`);
        resetTimers.delete(button);
      }, 1600);
      resetTimers.set(button, timer);
    });
  };

  bindCopyButton(copyWechatBtn, {
    value: "ByAuCei",
    defaultText: "复制微信号",
    labelName: "微信号"
  });
  bindCopyButton(copyQqBtn, {
    value: "3442695370",
    defaultText: "复制QQ号",
    labelName: "QQ号"
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

function initModals() {
  const modalConfigs = [
    { modal: wechatModal, openButton: wechatBtn, closeButton: wechatClose, backdrop: wechatBackdrop },
    { modal: qqModal, openButton: qqBtn, closeButton: qqClose, backdrop: qqBackdrop }
  ].filter(({ modal }) => modal);

  let activeModal = null;
  let lastFocusedElement = null;
  const closeTimers = new WeakMap();
  let modalAnimationFrame = 0;

  const getFocusableElements = (modal) => Array.from(
    modal.querySelectorAll(SELECTORS.focusable)
  ).filter((element) => element instanceof HTMLElement && !element.hasAttribute("hidden"));

  const syncPageLock = () => {
    const hasOpenModal = modalConfigs.some(({ modal }) => modal.classList.contains("is-open"));
    body.classList.toggle("modal-open", hasOpenModal);
    if (hasOpenModal) pageContent?.setAttribute("inert", "");
    else pageContent?.removeAttribute("inert");
  };

  const closeModal = (modal, { restoreFocus = true } = {}) => {
    if (!modal?.classList.contains("is-open")) return;
    window.cancelAnimationFrame(modalAnimationFrame);
    modal.classList.remove("is-open");
    if (activeModal === modal) activeModal = null;
    syncPageLock();

    if (restoreFocus && lastFocusedElement instanceof HTMLElement && lastFocusedElement.isConnected) {
      lastFocusedElement.focus({ preventScroll: true });
    }

    window.clearTimeout(closeTimers.get(modal));
    const timer = window.setTimeout(() => {
      if (!modal.classList.contains("is-open")) modal.setAttribute("aria-hidden", "true");
      closeTimers.delete(modal);
    }, 540);
    closeTimers.set(modal, timer);
  };

  const openModal = (modal, closeButton) => {
    if (!modal || modal.classList.contains("is-open")) return;
    if (activeModal && activeModal !== modal) closeModal(activeModal, { restoreFocus: false });

    lastFocusedElement = document.activeElement;
    activeModal = modal;
    window.clearTimeout(closeTimers.get(modal));
    closeTimers.delete(modal);
    modal.setAttribute("aria-hidden", "false");
    syncPageLock();
    window.cancelAnimationFrame(modalAnimationFrame);
    modalAnimationFrame = window.requestAnimationFrame(() => {
      modal.classList.add("is-open");
      syncPageLock();
      window.setTimeout(() => closeButton?.focus(), 80);
    });
  };

  modalConfigs.forEach(({ modal, openButton, closeButton, backdrop }) => {
    openButton?.addEventListener("click", () => openModal(modal, closeButton));
    closeButton?.addEventListener("click", () => closeModal(modal));
    backdrop?.addEventListener("click", () => closeModal(modal));
  });

  document.addEventListener("keydown", (event) => {
    if (!activeModal?.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      closeModal(activeModal);
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = getFocusableElements(activeModal);
    if (!focusable.length) {
      event.preventDefault();
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
  });
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
    if (loader && loader.dataset.loadState !== "loading") {
      loader.remove();
      loader = null;
    }
    if (!loader) {
      loader = document.createElement("script");
      loader.src = musicPlayerCdn;
      loader.async = true;
      loader.dataset.loadState = "loading";
      document.head.appendChild(loader);
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
    const fail = (message) => finish(() => {
      loader.dataset.loadState = "error";
      loader.remove();
      reject(new Error(message));
    });
    const handleLoad = () => finish(() => {
      if (window.XfMusicPlayer?.MusicPlayer) {
        loader.dataset.loadState = "loaded";
        resolve();
      } else {
        loader.dataset.loadState = "error";
        loader.remove();
        reject(new Error("播放器组件未正确注册"));
      }
    });
    const handleError = () => fail("播放器脚本加载失败");
    const timeoutId = window.setTimeout(() => fail("播放器加载超时"), timeoutMs);

    loader.addEventListener("load", handleLoad, { once: true });
    loader.addEventListener("error", handleError, { once: true });
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
        colorfulLyric: true,
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

function initPageVisibility() {
  const syncVisibilityState = () => {
    body.classList.toggle("page-hidden", document.hidden);
  };
  syncVisibilityState();
  document.addEventListener("visibilitychange", syncVisibilityState);
}

function initPage() {
  initTheme();
  initClipboard();
  initShare();
  initClock();
  initModals();
  initContactTouchFeedback();
  initActionTouchFeedback();
  initMusicPlayer();
  initPageVisibility();

  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
}

initPage();
