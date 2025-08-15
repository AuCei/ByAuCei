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
    const isMobileNetwork = navigator.connection?.type === 'cellular';

    const countryMap = {
        'CN': '中国', 'HK': '中国香港', 'TW': '中国台湾', 'MO': '中国澳门',
        'JP': '日本', 'KR': '韩国', 'US': '美国', 'CA': '加拿大',
        'GB': '英国', 'FR': '法国', 'DE': '德国', 'IT': '意大利',
        'ES': '西班牙', 'RU': '俄罗斯', 'IN': '印度', 'ID': '印度尼西亚',
        'SG': '新加坡', 'TH': '泰国', 'VN': '越南', 'PH': '菲律宾',
        'MY': '马来西亚', 'AU': '澳大利亚', 'NZ': '新西兰',
        'BR': '巴西', 'MX': '墨西哥', 'AR': '阿根廷',
        'ZA': '南非', 'SA': '沙特阿拉伯', 'AE': '阿联酋',
        'TR': '土耳其', 'EG': '埃及'
    };

    const regionMap = {
        'Shanghai': '上海', 'Beijing': '北京', 'Guangdong': '广东', 'Zhejiang': '浙江',
        'Jiangsu': '江苏', 'Sichuan': '四川', 'Hunan': '湖南', 'Hubei': '湖北',
        'Shandong': '山东', 'Fujian': '福建', 'Chongqing': '重庆', 'Tianjin': '天津',
        'Hebei': '河北', 'Henan': '河南', 'Anhui': '安徽', 'Shanxi': '山西',
        'Shaanxi': '陕西', 'Guangxi': '广西', 'Yunnan': '云南', 'Guizhou': '贵州',
        'Jilin': '吉林', 'Heilongjiang': '黑龙江', 'Liaoning': '辽宁',
        'Inner Mongolia': '内蒙古', 'Ningxia': '宁夏', 'Xinjiang': '新疆',
        'Qinghai': '青海', 'Gansu': '甘肃', 'Hong Kong': '香港',
        'Macau': '澳门', 'Taiwan': '台湾'
    };

    try {
        const res = await fetch('https://ipinfo.io/json?token=44ccaae437eafb');
        const data = await res.json();

        const ip = data.ip || '未知 IP';
        let isp = data.org || '未知运营商';
        if (isp.includes('Mobile')) isp = '中国移动';
        else if (isp.includes('Unicom') || isp.includes('CNC')) isp = '中国联通';
        else if (isp.includes('Telecom') || isp.includes('Chinanet')) isp = '中国电信';

        const country = countryMap[data.country] || data.country;
        const region = regionMap[data.region] || data.region;
        const city = regionMap[data.city] || data.city;

        let location = '';
        if (country === '中国香港') {
            location = '中国香港特别行政区';
        } else if (country === '中国澳门') {
            location = '中国澳门特别行政区';
        } else if (country === '中国') {
            if (['北京', '上海', '天津', '重庆'].includes(region)) {
                location = `${country}${region}市`;
            } else if (region && city && region !== city) {
                location = `${country}${region}省 ${city}市`;
            } else if (region) {
                location = `${country}${region}省`;
            } else {
                location = country;
            }
        } else {
            location = `${country} ${region}`;
        }

        ipInfoEl.innerHTML = `
            <span>运营商：${isp}</span><br>
            <span>IP地址：${ip}</span><br>
            <span>归属地：${location}</span><br>
        `;

        if (isMobileNetwork) {
            ipInfoEl.innerHTML += `<span style="color:orange;">⚠️ 当前使用移动网络，IP信息可能不准确</span>`;
        }
    } catch (err) {
        console.error('IP获取失败:', err);
        ipInfoEl.innerHTML = `<span style="color:red;">⚠️ 无法获取 IP 信息，请检查网络连接或稍后再试。</span>`;
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
    const audio = document.getElementById('background-music');

    button.addEventListener('click', () => {
        if (audio.paused) {
            playRandomMusic();
            button.textContent = '⏸️ 暂停背景音乐';
        } else {
            audio.pause();
            button.textContent = '🎵 播放背景音乐';
        }
    });
}

setInterval(updateTime, 1000);

window.onload = () => {
    updateTime();
    fetchIP();
    setupMusicToggle();
    document.getElementById('loading-screen').classList.add('hidden');
};
