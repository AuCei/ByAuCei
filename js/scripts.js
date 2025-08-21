// 更新时间显示
function updateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    document.getElementById("time").innerHTML = `
        <span class="rainbow">${hours}时${minutes}分${seconds}秒</span><br>
        <span class="rainbow">${year}年${month}月${day}日</span>
    `;
}

// 获取 IP 信息
async function fetchIP() {
    const ipInfoEl = document.getElementById("ip-info");

    try {
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();

        if (!data.success) throw new Error("API failed");

        const ip = data.ip || "未知 IP";
        const isp = data.connection?.isp || "未知运营商";
        const country = data.country || "未知国家";
        const region = data.region || "未知地区";
        const city = data.city || "未知城市";

        ipInfoEl.innerHTML = `
            <span>运营商：${isp}</span><br>
            <span>IP地址：${ip}</span><br>
            <span>归属地：${country} ${region} ${city}</span><br>
        `;
    } catch (err) {
        console.error("IP获取失败:", err);
        ipInfoEl.innerHTML = `
            <span style="color:red;">
                ⚠️ 无法获取 IP 信息，请检查网络连接或稍后再试。
            </span>
        `;
    }
}

// 模拟加载进度条填充
function simulateProgress() {
    const progress = document.querySelector(".progress");
    let current = 0;

    const interval = setInterval(() => {
        const increment = Math.random() * 5;
        current = Math.min(current + increment, 100);
        progress.style.width = `${current}%`;

        if (current >= 100) {
            clearInterval(interval);
        }
    }, 100);
}

// 设置头像点击切换音乐 + 动态旋转控制
function setupMusicToggleOnAvatar() {
    const avatar = document.getElementById("avatar");
    const audio = document.getElementById("background-music");

    const musicFiles = [
        "https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy9jY2U2ZTdkODY5ZWM3MDVkL0VVSDI5aWZHb1NORHFpYUNqRU1FbVE0Qm1kQmdScjFlYkZ3UnF5WDl4WUdyX2c_ZT1MR3JkeDQ.flac",
        "https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy9jY2U2ZTdkODY5ZWM3MDVkL0VROXVEWnVMNzlGRW5WNnhLUUF5TjVnQktUZE9FRmRaSUgxSTdZZ1pISzBVVVE_ZT1XeHVMNW0.m4a",
        "https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy9jY2U2ZTdkODY5ZWM3MDVkL0VjWm4wenp3cS1STmtPcGJROEVpT2RrQmZUaWJWRHU3UjVYZ1lHX1VtZHZyQlE_ZT1oeWxCZnY.flac",
        "https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy9jY2U2ZTdkODY5ZWM3MDVkL0VTamRiWExrT2ZKR2hTYUJNVGpSRzZJQmVoOVhmeGRHYnYySFRZMjM1WTZueHc_ZT1lRkcxYVg.mp3",
        "https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy9jY2U2ZTdkODY5ZWM3MDVkL0VUMlQ2WU85V2VoRXNSU09oOEhEMVE0Qi0ybU82SmxaYi1SSDJyYzN0VFRSRWc_ZT1yYWxpZHo.mp3",
        "https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy9jY2U2ZTdkODY5ZWM3MDVkL0VhYWJ1bmt1cG14TW9DS1pkYVlCMjNrQjU1cDNHZEdPaER1UzUtd1NuTWpCc1E_ZT1pNE5hMzA.flac"
    ];

    let currentRotation = 0;
    let rotateFrame;
    let lastTimestamp;

    function rotateLoop(timestamp) {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const delta = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        currentRotation += delta * 0.1; // 控制旋转速度
        avatar.style.transform = `rotate(${currentRotation}deg)`;

        if (!audio.paused) {
            rotateFrame = requestAnimationFrame(rotateLoop);
        }
    }

    function animateBackToZero(timestamp) {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const delta = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        let targetRotation = currentRotation % 360; // 限制在 0~360°
        const step = delta * 0.3;
        targetRotation = Math.max(targetRotation - step, 0);

        avatar.style.transform = `rotate(${targetRotation}deg)`;
        currentRotation = targetRotation;

        if (targetRotation > 0) {
            requestAnimationFrame(animateBackToZero);
        } else {
            avatar.style.transform = "";
            lastTimestamp = null;
        }
    }

    function toggleMusic() {
        if (audio.paused || !audio.src) {
            const randomIndex = Math.floor(Math.random() * musicFiles.length);
            audio.src = musicFiles[randomIndex];
            audio.play().then(() => {
                avatar.classList.add("rotating");
                currentRotation = 0;
                lastTimestamp = null;
                rotateFrame = requestAnimationFrame(rotateLoop);
            }).catch(err => {
                console.warn("播放失败:", err);
            });
        } else {
            audio.pause();
            avatar.classList.remove("rotating");
            cancelAnimationFrame(rotateFrame);
            lastTimestamp = null;
            requestAnimationFrame(animateBackToZero);
        }
    }

    avatar.addEventListener("click", toggleMusic);
    avatar.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleMusic();
        }
    });

    avatar.setAttribute("tabindex", "0");
    avatar.setAttribute("role", "button");
}

// 初始化
window.onload = () => {
    simulateProgress();
    updateTime();
    fetchIP();
    setupMusicToggleOnAvatar();

    setTimeout(() => {
        document.getElementById("loading-screen").classList.add("hidden");
    }, 2000);
};

// 每秒更新时间
setInterval(updateTime, 1000);
