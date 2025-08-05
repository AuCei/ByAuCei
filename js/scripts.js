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
    fetch('https://qifu-api.baidubce.com/ip/local/geo/v1/district')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.data) {
                let ip = data.ip;
                if (ip.startsWith("::ffff:")) {
                    ip = ip.split(":").pop();
                }
                document.getElementById('ip-info').innerHTML = 
                     `<span>运营商: ${data.data.isp || '未知'}</span><br>
					 <span>IP地址: ${ip}</span><br>
                     <span>归属地: ${data.data.country || ''}${data.data.prov || ''}${data.data.city || ''}${data.data.district || ''}</span><br>
                     `;
            } else {
                document.getElementById('ip-info').innerText = '无法获取IP信息';
            }
        })
        .catch(error => {
            console.error('Error fetching IP address:', error);
            document.getElementById('ip-info').innerText = '无法获取IP信息';
        });
}

function playRandomMusic() {
    const musicFiles = [
        'music/花心是本性.flac',
	'music/Raindrops.mp3',
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

