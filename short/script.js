"use strict";
const IS_SHORT_DOMAIN = window.location.hostname === "s.aucei.cn";
const API_BASE = IS_SHORT_DOMAIN ? "" : "https://s.aucei.cn";
const API_URL = `${API_BASE}/api/links`;
const HEALTH_URL = `${API_BASE}/api/health`;
const root = document.documentElement;
const form = document.getElementById("shortForm");
const longUrl = document.getElementById("longUrl");
const customCode = document.getElementById("customCode");
const adminToken = document.getElementById("adminToken");
const rememberToken = document.getElementById("rememberToken");
const revealToken = document.getElementById("revealToken");
const submitButton = document.getElementById("submitButton");
const formMessage = document.getElementById("formMessage");
const resultPanel = document.getElementById("resultPanel");
const shortLink = document.getElementById("shortLink");
const originalLink = document.getElementById("originalLink");
const expiresAt = document.getElementById("expiresAt");
const copyLink = document.getElementById("copyLink");
const serviceStatus = document.getElementById("serviceStatus");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");
let currentShortUrl = "";
let toastTimer = 0;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-open");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-open"), 1800);
}
function setMessage(message, type = "error") {
  formMessage.textContent = message;
  formMessage.className = `message is-${type}`;
}
function clearMessage() {
  formMessage.textContent = "";
  formMessage.className = "message";
}
function validUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const area = document.createElement("textarea");
  area.value = value;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}
function applyTheme(theme) {
  const light = theme === "light";
  root.classList.toggle("light", light);
  root.dataset.theme = theme;
  const actionLabel = light ? "切换到深色主题" : "切换到浅色主题";
  themeToggle.setAttribute("aria-label", actionLabel);
  themeToggle.title = actionLabel;
}
function initTheme() {
  const colorScheme = window.matchMedia("(prefers-color-scheme: light)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeTransition = null;
  let cleanupTimer = 0;
  let isSwitching = false;
  let hasSavedTheme = false;

  const readSavedTheme = () => {
    try {
      const saved = localStorage.getItem("card-theme");
      hasSavedTheme = saved === "dark" || saved === "light";
      return hasSavedTheme ? saved : null;
    } catch {
      hasSavedTheme = false;
      return null;
    }
  };
  const saveTheme = (theme) => {
    try {
      localStorage.setItem("card-theme", theme);
      hasSavedTheme = true;
    } catch {}
  };
  const cleanupTransition = () => {
    if (!isSwitching) return;
    window.clearTimeout(cleanupTimer);
    cleanupTimer = 0;
    root.classList.remove("theme-transition-active");
    root.style.removeProperty("--theme-x");
    root.style.removeProperty("--theme-y");
    root.style.removeProperty("--theme-radius");
    activeTransition = null;
    isSwitching = false;
    themeToggle.classList.remove("is-switching");
  };

  applyTheme(readSavedTheme() || (colorScheme.matches ? "light" : "dark"));

  const switchTheme = (event) => {
    if (isSwitching) return;
    isSwitching = true;
    themeToggle.classList.add("is-switching");
    const next = root.classList.contains("light") ? "dark" : "light";
    const commitTheme = () => {
      applyTheme(next);
      saveTheme(next);
    };

    if (!document.startViewTransition || reduceMotion.matches) {
      commitTheme();
      window.setTimeout(cleanupTransition, reduceMotion.matches ? 0 : 460);
      return;
    }

    const rect = themeToggle.getBoundingClientRect();
    const x =
      Number.isFinite(event.clientX) && event.clientX > 0
        ? event.clientX
        : rect.left + rect.width / 2;
    const y =
      Number.isFinite(event.clientY) && event.clientY > 0
        ? event.clientY
        : rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
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
      }, 700);
    } catch {
      commitTheme();
      cleanupTransition();
    }
  };

  themeToggle.addEventListener("click", switchTheme);
  const syncSystemTheme = (event) => {
    if (!hasSavedTheme && !isSwitching)
      applyTheme(event.matches ? "light" : "dark");
  };
  colorScheme.addEventListener?.("change", syncSystemTheme);
  window.addEventListener(
    "pagehide",
    () => {
      activeTransition?.skipTransition?.();
      cleanupTransition();
    },
    { once: true },
  );
}
function restoreToken() {
  try {
    const token = sessionStorage.getItem("aucei-short-token");
    if (token) {
      adminToken.value = token;
      rememberToken.checked = true;
    }
  } catch {}
}
function saveToken() {
  try {
    if (rememberToken.checked)
      sessionStorage.setItem("aucei-short-token", adminToken.value);
    else sessionStorage.removeItem("aucei-short-token");
  } catch {}
}
async function checkHealth() {
  serviceStatus.classList.remove("is-online", "is-offline");
  serviceStatus.querySelector("span").textContent = "检查服务";
  try {
    const response = await fetch(HEALTH_URL, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error("Service unhealthy");
    serviceStatus.classList.remove("is-offline");
    serviceStatus.classList.add("is-online");
    serviceStatus.querySelector("span").textContent = "服务正常";
  } catch (error) {
    console.warn("健康检查失败", error);
    serviceStatus.classList.remove("is-online");
    serviceStatus.classList.add("is-offline");
    serviceStatus.querySelector("span").textContent = "服务异常";
  }
}
revealToken.addEventListener("click", () => {
  const willShow = adminToken.type === "password";
  adminToken.type = willShow ? "text" : "password";
  revealToken.classList.toggle("is-visible", willShow);
  revealToken.setAttribute("aria-pressed", String(willShow));
  revealToken.setAttribute("aria-label", willShow ? "隐藏管理密钥" : "显示管理密钥");
  revealToken.title = willShow ? "隐藏管理密钥" : "显示管理密钥";
  showToast(willShow ? "管理密钥已显示" : "管理密钥已隐藏");
});
copyLink.addEventListener("click", async () => {
  if (!currentShortUrl) return;
  try {
    await copyText(currentShortUrl);
    copyLink.querySelector("span").textContent = "已复制";
    showToast("短链接已复制");
    setTimeout(
      () => (copyLink.querySelector("span").textContent = "复制"),
      1500,
    );
  } catch {
    showToast("复制失败，请手动复制");
  }
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();
  resultPanel.hidden = true;
  const urlValue = longUrl.value.trim();
  const codeValue = customCode.value.trim();
  const tokenValue = adminToken.value.trim();
  if (!validUrl(urlValue)) {
    setMessage("请输入以 http:// 或 https:// 开头的有效链接");
    longUrl.focus();
    return;
  }
  if (codeValue && !/^[A-Za-z0-9]{3,7}$/.test(codeValue)) {
    setMessage("自定义短码需为 3 至 7 位，只能包含大小写字母和数字");
    customCode.focus();
    return;
  }
  if (!tokenValue) {
    setMessage("请输入管理密钥");
    adminToken.focus();
    return;
  }
  saveToken();
  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "正在生成...";
  setMessage("正在连接短链服务，请稍候", "info");
  try {
    const expiryDays = Number(form.elements.expiryDays.value);
    const payload = { url: urlValue, expiryDays };
    if (codeValue) payload.code = codeValue;
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenValue}`,
      },
      body: JSON.stringify(payload),
    });
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("服务器返回了无法识别的内容");
    }
    if (!response.ok || !data.success)
      throw new Error(data.message || `生成失败，状态码 ${response.status}`);
    currentShortUrl = data.shortUrl;
    shortLink.href = data.shortUrl;
    shortLink.textContent = data.shortUrl;
    originalLink.textContent = data.originalUrl;
    expiresAt.textContent = data.expiresAt
      ? `有效期至：${new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.expiresAt))}`
      : "";
    resultPanel.hidden = false;
    clearMessage();
    resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (error) {
    setMessage(
      error.message === "Failed to fetch"
        ? "无法连接短链服务，请检查网络或跨域访问设置"
        : error.message,
    );
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "生成短链接";
  }
});
initTheme();
restoreToken();
checkHealth();
document.getElementById("year").textContent = new Date().getFullYear();


const ADMIN_API_URL = `${API_BASE}/api/admin/links`;
const ADMIN_PAGE_SIZE = 10;
const adminLoad = document.getElementById("adminLoad");
const adminSearch = document.getElementById("adminSearch");
const adminSearchButton = document.getElementById("adminSearchButton");
const adminMessage = document.getElementById("adminMessage");
const adminList = document.getElementById("adminList");
const adminPagination = document.getElementById("adminPagination");
const adminPrevious = document.getElementById("adminPrevious");
const adminNext = document.getElementById("adminNext");
const adminPageInfo = document.getElementById("adminPageInfo");
const batchToolbar = document.getElementById("batchToolbar");
const batchSelectAll = document.getElementById("batchSelectAll");
const batchCount = document.getElementById("batchCount");
let adminPage = 1;
let adminTotalPages = 1;
let adminLoaded = false;

function localizedAdminError(error) {
  const message = String(error?.message || error || "");
  if (message === "Failed to fetch" || message.includes("NetworkError") || message.includes("Load failed")) return "无法连接短链服务，请检查网络后重试";
  if (message.includes("HTTP 401") || message.includes("Unauthorized")) return "管理密钥错误";
  return message || "操作失败，请稍后重试";
}
function adminTokenValue() { return adminToken.value.trim(); }
function setAdminMessage(message, type = "") { adminMessage.textContent = message; adminMessage.className = `admin-message${type ? ` is-${type}` : ""}`; }
function adminHeaders(jsonBody = false) { const headers = { Authorization: `Bearer ${adminTokenValue()}` }; if (jsonBody) headers["Content-Type"] = "application/json"; return headers; }
function formatAdminDate(value) {
  if (!value) return "未设置";
  const raw = String(value).trim();
  const hasTimeZone = /Z$|[+-]\d{2}:?\d{2}$/.test(raw);
  const normalized = hasTimeZone ? raw : `${raw.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}
function statusLabel(status) { return { active: "启用中", disabled: "已停用", expired: "已过期", "missing-expiry": "未设置有效期" }[status] || status; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }
function selectedCodes() { return [...adminList.querySelectorAll(".link-select:checked")].map(input => input.value); }
function updateBatchState() {
  const checkboxes = [...adminList.querySelectorAll(".link-select")];
  const selected = checkboxes.filter(input => input.checked).length;
  batchCount.textContent = `已选择 ${selected} 条`;
  batchSelectAll.checked = checkboxes.length > 0 && selected === checkboxes.length;
  batchSelectAll.indeterminate = selected > 0 && selected < checkboxes.length;
  batchToolbar.querySelectorAll("button[data-batch-action]").forEach(button => button.disabled = selected === 0);
}
function renderAdminLinks(links) {
  adminList.replaceChildren();
  batchToolbar.hidden = links.length === 0;
  batchSelectAll.checked = false;
  batchSelectAll.indeterminate = false;
  if (!links.length) {
    adminList.hidden = false;
    adminList.innerHTML = '<div class="link-item link-empty"><div class="link-main">没有找到短链。</div></div>';
    updateBatchState();
    return;
  }
  for (const link of links) {
    const item = document.createElement("article");
    item.className = "link-item";
    item.dataset.code = link.code;
    item.innerHTML = `<label class="link-selector" title="选择 ${escapeHtml(link.code)}"><input class="link-select" type="checkbox" value="${escapeHtml(link.code)}" aria-label="选择短链 ${escapeHtml(link.code)}"><span></span></label><div class="link-main"><div class="link-top"><span class="link-code">${escapeHtml(link.code)}</span><span class="link-status ${escapeHtml(link.status)}">${statusLabel(link.status)}</span></div><a class="link-url" href="${escapeHtml(link.shortUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.shortUrl)}</a><div class="link-meta"><span>访问 ${Number(link.clickCount) || 0} 次</span><span>创建 ${formatAdminDate(link.createdAt)}</span><span>到期 ${formatAdminDate(link.expiresAt)}</span></div></div><div class="link-actions"><button class="link-action" data-action="copy" type="button">复制</button><button class="link-action" data-action="toggle" type="button">${link.isActive ? "停用" : "启用"}</button><button class="link-action" data-action="extend" data-days="7" type="button">增加 7 天</button><button class="link-action" data-action="extend" data-days="30" type="button">增加 30 天</button><button class="link-action" data-action="extend" data-days="365" type="button">增加 1 年</button><button class="link-action danger" data-action="delete" type="button">删除</button></div>`;
    adminList.appendChild(item);
  }
  adminList.hidden = false;
  updateBatchState();
}
async function loadAdminLinks(page = 1) {
  const token = adminTokenValue();
  if (!token) { setAdminMessage("请先输入上方的管理密钥。", "error"); adminToken.focus(); return; }
  saveToken();
  adminLoad.disabled = true;
  adminLoad.classList.add("is-loading");
  adminLoad.querySelector("span:nth-of-type(2)").textContent = "正在加载";
  setAdminMessage("正在加载短链列表...");
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(ADMIN_PAGE_SIZE) });
    const search = adminSearch.value.trim();
    if (search) params.set("search", search);
    const response = await fetch(`${ADMIN_API_URL}?${params}`, { headers: adminHeaders(), cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "短链列表加载失败");
    adminLoaded = true;
    adminPage = data.page;
    adminTotalPages = data.totalPages;
    renderAdminLinks(data.links);
    adminPageInfo.textContent = `第 ${data.page} / ${data.totalPages} 页，共 ${data.total} 条`;
    adminPrevious.disabled = data.page <= 1;
    adminNext.disabled = data.page >= data.totalPages;
    adminPagination.hidden = data.totalPages <= 1;
    if (search) {
      setAdminMessage(
        data.links.length
          ? `找到 ${data.total} 条匹配的短链`
          : "未找到匹配的短链",
      );
    } else {
      setAdminMessage(
        data.total ? `已加载 ${data.total} 条短链` : "暂无短链",
      );
    }
  } catch (error) {
    setAdminMessage(localizedAdminError(error), "error");
  } finally {
    adminLoad.disabled = false;
    adminLoad.classList.remove("is-loading");
    adminLoad.querySelector("span:nth-of-type(2)").textContent = "加载短链";
  }
}
async function adminMutation(code, method, body) {
  const response = await fetch(`${ADMIN_API_URL}/${encodeURIComponent(code)}`, { method, headers: adminHeaders(Boolean(body)), body: body ? JSON.stringify(body) : undefined });
  let data;
  try { data = await response.json(); } catch { throw new Error("服务器返回了无法识别的内容"); }
  if (!response.ok || !data.success) throw new Error(data.message || "操作失败");
  return data;
}
async function batchMutation(codes, action, days) {
  const body = { codes, action };
  if (action === "setExpiry") body.days = days;
  if (action === "setActive") body.isActive = Boolean(days);
  const response = await fetch(`${ADMIN_API_URL}/batch`, { method: "POST", headers: adminHeaders(true), body: JSON.stringify(body) });
  let data;
  try { data = await response.json(); } catch { throw new Error("服务器返回了无法识别的内容"); }
  if (!response.ok || !data.success) throw new Error(data.message || "批量操作失败");
  return data;
}
adminList.addEventListener("change", event => { if (event.target.matches(".link-select")) updateBatchState(); });
batchSelectAll.addEventListener("change", () => {
  adminList.querySelectorAll(".link-select").forEach(input => input.checked = batchSelectAll.checked);
  updateBatchState();
});
batchToolbar.addEventListener("click", async event => {
  const button = event.target.closest("button[data-batch-action]");
  if (!button) return;
  const codes = selectedCodes();
  if (!codes.length) { showToast("请先选择短链"); return; }
  const uiAction = button.dataset.batchAction;
  const action = uiAction === "enable" || uiAction === "disable" ? "setActive" : uiAction === "expiry" ? "setExpiry" : "delete";
  const days = Number(button.dataset.days) || undefined;
  if (action === "delete" && !window.confirm(`确定永久删除选中的 ${codes.length} 条短链吗？此操作无法撤销。`)) return;
  batchToolbar.querySelectorAll("button[data-batch-action]").forEach(control => control.disabled = true);
  try {
    const data = await batchMutation(codes, action, days || (uiAction === "enable" ? 1 : uiAction === "disable" ? 0 : undefined));
    showToast(data.message || `已处理 ${codes.length} 条短链`);
    await loadAdminLinks(adminPage);
  } catch (error) {
    setAdminMessage(localizedAdminError(error), "error");
    updateBatchState();
  }
});
adminList.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const item = button.closest(".link-item");
  const code = item?.dataset.code;
  if (!code) return;
  const action = button.dataset.action;
  if (action === "copy") { await copyText(`${API_BASE || window.location.origin}/${code}`); showToast("短链接已复制"); return; }
  if (action === "delete" && !window.confirm(`确定永久删除短链 ${code} 吗？此操作无法撤销。`)) return;
  button.disabled = true;
  try {
    if (action === "delete") await adminMutation(code, "DELETE");
    else if (action === "toggle") await adminMutation(code, "PATCH", { action: "setActive", isActive: button.textContent.trim() === "启用" });
    else if (action === "extend") await adminMutation(code, "PATCH", { action: "setExpiry", days: Number(button.dataset.days) });
    showToast(action === "delete" ? "短链已删除" : "短链已更新");
    await loadAdminLinks(adminPage);
  } catch (error) { setAdminMessage(localizedAdminError(error), "error"); }
  finally { button.disabled = false; }
});
function searchAdminLinks() {
  if (!adminSearch.value.trim()) {
    setAdminMessage("请输入短码后再搜索。", "error");
    adminSearch.focus();
    return;
  }
  loadAdminLinks(1);
}
adminLoad.addEventListener("click", () => loadAdminLinks(adminLoaded ? adminPage : 1));
adminSearchButton.addEventListener("click", searchAdminLinks);
adminSearch.addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); searchAdminLinks(); } });
adminPrevious.addEventListener("click", () => loadAdminLinks(Math.max(1, adminPage - 1)));
adminNext.addEventListener("click", () => loadAdminLinks(Math.min(adminTotalPages, adminPage + 1)));
