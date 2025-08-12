// 模态弹窗逻辑
const weixinModal = document.getElementById("weixinModal");
const qqModal = document.getElementById("qqModal");
const emailModal = document.getElementById("emailModal");

document.getElementById("weixinLink").onclick = () => openModal(weixinModal);
document.getElementById("qqLink").onclick = () => openModal(qqModal);
document.getElementById("emailLink").onclick = () => openModal(emailModal);

document.querySelectorAll(".close").forEach(btn => {
    btn.onclick = () => closeModal(btn.closest(".modal"));
});

window.onclick = event => {
    if (event.target.classList.contains("modal")) {
        closeModal(event.target);
    }
};

function openModal(modal) {
    modal.style.display = "flex";
    setTimeout(() => {
        modal.classList.add("show");
        modal.querySelector(".modal-content").classList.add("show");
    }, 10); // 触发 CSS 动画
}

function closeModal(modal) {
    const content = modal.querySelector(".modal-content");
    content.classList.remove("show");

    // 等待内容缩放动画完成，再淡出背景
    setTimeout(() => {
        modal.classList.remove("show");

        // 等待背景淡出完成，再隐藏整个弹窗
        setTimeout(() => {
            modal.style.display = "none";
        }, 500); // 与 .modal 的 transition 时间一致
    }, 300); // 与 .modal-content 的 transition 时间一致
}

// 🌸 樱花 Canvas 动画
const canvas = document.getElementById("sakuraCanvas");
const ctx = canvas.getContext("2d", { alpha: true });

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const sakuraCount = 60;
const sakuras = Array.from({ length: sakuraCount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 6 + Math.random() * 4,
    speed: 1 + Math.random() * 2,
    angle: Math.random() * 360
}));

function drawSakura() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,182,193,0.8)";
    ctx.beginPath();
    sakuras.forEach(s => {
        ctx.moveTo(s.x, s.y);
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    });
    ctx.fill();
    updateSakura();
}

function updateSakura() {
    sakuras.forEach(s => {
        s.y += s.speed;
        s.x += Math.sin(s.angle) * 0.5;
        s.angle += 0.01;

        if (s.y > canvas.height) {
            s.y = -10;
            s.x = Math.random() * canvas.width;
        }
    });
}

// 每秒约30帧更新
setInterval(drawSakura, 33);
