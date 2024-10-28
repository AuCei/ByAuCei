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

function fetchIP() {
    fetch('https://ipapi.co/json/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let ip = data.ip;
            if (ip.startsWith("::ffff:")) {
                ip = ip.split(":").pop();
            }
            document.getElementById('ip-info').innerHTML = 
                `<span>IP地址: ${ip}</span><br>服务商: ${data.org}<br>归属地: ${data.country_name}, ${data.region}, ${data.city}<br><img src="https://flagcdn.com/w320/${data.country_code.toLowerCase()}.png" alt="国旗">`;
        })
        .catch(error => {
            console.error('Error fetching IP address:', error);
            document.getElementById('ip-info').innerText = '无法获取IP信息';
        });
}

function playRandomMusic() {
    const musicFiles = [
        'music/老人与海.mp3',
        'music/画心.mp3',
        'music/璀璨冒险人.mp3',
        'music/玄鸟.mp3',
        'music/要不然我们就这样一万年.mp3',
    ];
    const randomIndex = Math.floor(Math.random() * musicFiles.length);
    const audioElement = document.getElementById('background-music');
    audioElement.src = musicFiles[randomIndex];
    audioElement.play();
}

setInterval(updateTime, 1000); 
window.onload = function() {
    updateTime();
    fetchIP();
    playRandomMusic();
};
