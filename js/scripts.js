async function fetchIP() {
    const ipInfoEl = document.getElementById('ip-info');

    try {
        const res = await fetch('https://api.vvhan.com/api/ipInfo');
        if (!res.ok) throw new Error(`接口错误：${res.status}`);
        const data = await res.json();

        const ip = data.ip || '未知';
        const info = data.info || {};

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
