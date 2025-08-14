function updateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('time').innerHTML =
        `<span class="rainbow">${hours}时${minutes}分${seconds}秒</span><br><span class="rainbow">${year}年${month}月${day}日</span>`;
}

async function fetchIP() {
    const ipInfoEl = document.getElementById('ip-info');

    try {
        const res = await fetch('https://api.vvhan.com/api/ipInfo');
        if (!res.ok) throw new Error(`接口错误：${res.status}`);
        const data = await res.json();

        const ip = data.ip || '未知';
        const info = data.info || {};

        const isp = info.isp || '未知';
        const country = info.country || '';
        const province = info.prov || '';
        const city = info.city || '';
        const district = info.district || '';

        const location = `${country} ${province} ${city} ${district}`.trim();

        ipInfoEl.innerHTML = `
            <span>运营商: ${isp}</span><br>
            <span>IP地址: ${ip}</span><br>
            <span>归属地: ${location}</span><br>
        `;
    } catch (err) {
        console.error('获取 IP 信息失败:', err);
        ipInfoEl.innerText = '无法获取IP信息，请检查网络连接';
    }
}




function playRandomMusic() {
    const musicFiles = [
        'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy9jY2U2ZTdkODY5ZWM3MDVkL0VVSDI5aWZHb1NORHFpYUNqRU1FbVE0Qm1kQmdScjFlYkZ3UnF5WDl4WUdyX2c_ZT1MR3JkeDQ.flac',
        'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy9jY2U2ZTdkODY5ZWM3MDVkL0VROXVEWnVMNzlGRW5WNnhLUUF5TjVnQktUZE9FRmRaSUgxSTdZZ1pISzBVVVE_ZT1XeHVMNW0.m4a',
        'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy9jY2U2ZTdkODY5ZWM3MDVkL0VjWm4wenp3cS1STmtPcGJROEVpT2RrQmZUaWJWRHU3UjVYZ1lHX1VtZHZyQlE_ZT1oeWxCZnY.flac',
        'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy9jY2U2ZTdkODY5ZWM3MDVkL0VTamRiWExrT2ZKR2hTYUJNVGpSRzZJQmVoOVhmeGRHYnYySFRZMjM1WTZueHc_ZT1lRkcxYVg.mp3',
        'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy9jY2U2ZTdkODY5ZWM3MDVkL0VUMlQ2WU85V2VoRXNSU09oOEhEMVE0Qi0ybU82SmxaYi1SSDJyYzN0VFRSRWc_ZT1yYWxpZHo.mp3',
        'https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy9jY2U2ZTdkODY5ZWM3MDVkL0VhYWJ1bmt1cG14TW9DS1pkYVlCMjNrQjU1cDNHZEdPaER1UzUtd1NuTWpCc1E_ZT1pNE5hMzA.flac',
    ];

    const randomIndex = Math.floor(Math.random() * musicFiles.length);
    const audioElement = document.getElementById('background-music');
    audioElement.src = musicFiles[randomIndex];
    audioElement.play().catch(err => {
        console.warn('自动播放失败，可能被浏览器拦截:', err);
    });
}

function setupMusicToggle() {
    const button = document.getElementById('music-toggle');
    const audioElement = document.getElementById('background-music');

    button.addEventListener('click', () => {
        if (audioElement.paused) {
            playRandomMusic();
            button.textContent = '⏸️ 暂停背景音乐';
        } else {
            audioElement.pause();
            button.textContent = '🎵 播放背景音乐';
        }
    });
}

setInterval(updateTime, 1000);

window.onload = function() {
    updateTime();
    fetchIP();
    setupMusicToggle();

    // 隐藏加载界面
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('hidden');
};
