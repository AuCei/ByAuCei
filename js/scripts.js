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
        const data = await res.json();
        const info = data.info || {};

        // 判断是否为国外 IP 或信息缺失
        const isForeign = info.country !== '中国' || !info.prov;

        if (isForeign) {
            throw new Error('国内接口无法识别该 IP，尝试国际接口');
        }

        const ispMap = {
            '移动': '中国移动',
            '联通': '中国联通',
            '电信': '中国电信',
            '教育网': '中国教育网',
            '广电': '中国广电',
            '长城宽带': '长城宽带',
            '鹏博士': '鹏博士电信',
            '铁通': '中国铁通',
        };

        const rawIsp = info.isp || '未知';
        const isp = ispMap[rawIsp] || rawIsp;

        const locationParts = [info.country, info.prov, info.city, info.district];
        const location = locationParts.filter(Boolean).join(' ');

        ipInfoEl.innerHTML = `
      <span>运营商: ${isp}</span><br>
      <span>IP地址: ${data.ip}</span><br>
      <span>归属地: ${location}</span><br>
    `;
    } catch (err) {
        console.warn('切换到国际接口:', err);

        try {
            const res = await fetch('https://ipapi.co/json');
            const data = await res.json();

            const locationParts = [data.country_name, data.region, data.city];
            const location = locationParts.filter(Boolean).join(' ');
            const isp = data.org || '未知';

            ipInfoEl.innerHTML = `
        <span>运营商: ${isp}</span><br>
        <span>IP地址: ${data.ip}</span><br>
        <span>归属地: ${location}</span><br>
      `;
        } catch (err2) {
            console.error('国际接口也失败了:', err2);
            ipInfoEl.innerHTML = `<span style="color:red;">⚠️ 无法获取 IP 信息，请检查网络连接或稍后再试。</span>`;
        }
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
