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
      // 隐私浏览或本地文件环境不允许存储时，主题切换仍然正常工作。
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

updateClock();
window.setInterval(updateClock, 1000);

if (card && window.matchMedia("(pointer: fine)").matches) {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 2.5;
    const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 2.5;
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  });
}

const currentYear = document.getElementById("currentYear");

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

// 微信二维码弹窗
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

  // 下一帧启动轻量的遮罩淡入和弹窗动画。
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

  // 先把焦点移回触发按钮，避免焦点仍在弹窗内部时设置 aria-hidden。
  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus({ preventScroll: true });
  } else {
    document.body.focus({ preventScroll: true });
  }

  wechatModal.classList.remove("show");
  document.body.classList.remove("modal-open");

  // 等关闭动画播放完成后，再对辅助技术隐藏弹窗。
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

// “更多内容”卡片暂未开放，点击后使用现有 Toast 提示。
const moreContentBtn = document.getElementById("moreContentBtn");
moreContentBtn?.addEventListener("click", () => {
  showToast("更多内容正在准备中，敬请期待");
});

