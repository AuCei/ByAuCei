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

function showToast(message){toast.textContent=message;toast.classList.add("is-open");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("is-open"),1800)}
function setMessage(message,type="error"){formMessage.textContent=message;formMessage.className=`message is-${type}`}
function clearMessage(){formMessage.textContent="";formMessage.className="message"}
function validUrl(value){try{const url=new URL(value);return url.protocol==="http:"||url.protocol==="https:"}catch{return false}}
async function copyText(value){if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(value);return}const area=document.createElement("textarea");area.value=value;area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();document.execCommand("copy");area.remove()}
function applyTheme(theme){const light=theme==="light";root.classList.toggle("light",light);themeToggle.setAttribute("aria-pressed",String(light));themeToggle.setAttribute("aria-label",light?"切换到深色主题":"切换到浅色主题")}
function initTheme(){
  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeTransition=null;
  let cleanupTimer=0;
  let isSwitching=false;

  const saveTheme=(theme)=>{
    try{localStorage.setItem("card-theme",theme)}catch{}
  };

  const cleanupTransition=()=>{
    window.clearTimeout(cleanupTimer);
    cleanupTimer=0;
    root.classList.remove("theme-transition-active","theme-ripple-fallback");
    root.style.removeProperty("--theme-x");
    root.style.removeProperty("--theme-y");
    root.style.removeProperty("--theme-radius");
    activeTransition=null;
    isSwitching=false;
    themeToggle.disabled=false;
  };

  let saved=null;
  try{saved=localStorage.getItem("card-theme")}catch{}
  const initial=saved==="dark"||saved==="light"
    ? saved
    : window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";
  applyTheme(initial);

  themeToggle.addEventListener("click",(event)=>{
    if(isSwitching)return;
    isSwitching=true;
    themeToggle.disabled=true;
    const next=root.classList.contains("light")?"dark":"light";
    const commitTheme=()=>{
      applyTheme(next);
      saveTheme(next);
    };

    if(!document.startViewTransition||reduceMotion.matches){
      root.classList.add("theme-ripple-fallback");
      commitTheme();
      cleanupTimer=window.setTimeout(cleanupTransition,reduceMotion.matches?30:240);
      return;
    }

    const rect=themeToggle.getBoundingClientRect();
    const x=event.clientX||rect.left+rect.width/2;
    const y=event.clientY||rect.top+rect.height/2;
    const radius=Math.hypot(
      Math.max(x,window.innerWidth-x),
      Math.max(y,window.innerHeight-y)
    );

    root.style.setProperty("--theme-x",`${x}px`);
    root.style.setProperty("--theme-y",`${y}px`);
    root.style.setProperty("--theme-radius",`${Math.ceil(radius)}px`);
    root.classList.add("theme-transition-active");

    try{
      activeTransition=document.startViewTransition(commitTheme);
      activeTransition.finished.catch(()=>{}).finally(cleanupTransition);
      cleanupTimer=window.setTimeout(()=>{
        activeTransition?.skipTransition?.();
        cleanupTransition();
      },900);
    }catch{
      commitTheme();
      cleanupTransition();
    }
  });

  window.addEventListener("pagehide",()=>{
    activeTransition?.skipTransition?.();
    cleanupTransition();
  },{once:true});
}
function restoreToken(){try{const token=sessionStorage.getItem("aucei-short-token");if(token){adminToken.value=token;rememberToken.checked=true}}catch{}}
function saveToken(){try{if(rememberToken.checked)sessionStorage.setItem("aucei-short-token",adminToken.value);else sessionStorage.removeItem("aucei-short-token")}catch{}}
async function checkHealth(){serviceStatus.classList.remove("is-online","is-offline");serviceStatus.querySelector("span").textContent="检查服务";try{const response=await fetch(HEALTH_URL,{headers:{Accept:"application/json"},cache:"no-store"});if(!response.ok)throw new Error(`HTTP ${response.status}`);const data=await response.json();if(!data.success)throw new Error("Service unhealthy");serviceStatus.classList.remove("is-offline");serviceStatus.classList.add("is-online");serviceStatus.querySelector("span").textContent="服务正常"}catch(error){console.warn("健康检查失败",error);serviceStatus.classList.remove("is-online");serviceStatus.classList.add("is-offline");serviceStatus.querySelector("span").textContent="服务异常"}}
revealToken.addEventListener("click",()=>{const showing=adminToken.type==="text";adminToken.type=showing?"password":"text";revealToken.setAttribute("aria-label",showing?"显示管理密钥":"隐藏管理密钥")});
copyLink.addEventListener("click",async()=>{if(!currentShortUrl)return;try{await copyText(currentShortUrl);copyLink.querySelector("span").textContent="已复制";showToast("短链接已复制");setTimeout(()=>copyLink.querySelector("span").textContent="复制",1500)}catch{showToast("复制失败，请手动复制")}});
form.addEventListener("submit",async(event)=>{event.preventDefault();clearMessage();resultPanel.hidden=true;const urlValue=longUrl.value.trim();const codeValue=customCode.value.trim();const tokenValue=adminToken.value.trim();if(!validUrl(urlValue)){setMessage("请输入以 http:// 或 https:// 开头的有效链接");longUrl.focus();return}if(codeValue&&!/^[A-Za-z0-9_-]{3,32}$/.test(codeValue)){setMessage("自定义短码需为 3 至 32 位，只能包含字母、数字、下划线或连字符");customCode.focus();return}if(!tokenValue){setMessage("请输入管理密钥");adminToken.focus();return}saveToken();submitButton.disabled=true;submitButton.querySelector("span").textContent="正在生成...";setMessage("正在连接短链服务，请稍候","info");try{const expiryDays=Number(form.elements.expiryDays.value);const payload={url:urlValue,expiryDays};if(codeValue)payload.code=codeValue;const response=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${tokenValue}`},body:JSON.stringify(payload)});let data;try{data=await response.json()}catch{throw new Error("服务器返回了无法识别的内容")}if(!response.ok||!data.success)throw new Error(data.message||`生成失败，状态码 ${response.status}`);currentShortUrl=data.shortUrl;shortLink.href=data.shortUrl;shortLink.textContent=data.shortUrl;originalLink.textContent=data.originalUrl;expiresAt.textContent=data.expiresAt?`有效期至：${new Intl.DateTimeFormat("zh-CN",{dateStyle:"medium",timeStyle:"short"}).format(new Date(data.expiresAt))}`:"";resultPanel.hidden=false;clearMessage();resultPanel.scrollIntoView({behavior:"smooth",block:"nearest"})}catch(error){setMessage(error.message==="Failed to fetch"?"无法连接短链服务，请检查网络或跨域访问设置":error.message)}finally{submitButton.disabled=false;submitButton.querySelector("span").textContent="生成短链接"}});
initTheme();restoreToken();checkHealth();document.getElementById("year").textContent=new Date().getFullYear();
