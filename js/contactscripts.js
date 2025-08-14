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
    }, 10);
}

function closeModal(modal) {
    const content = modal.querySelector(".modal-content");
    content.classList.remove("show");

    setTimeout(() => {
        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = "none";
        }, 500);
    }, 300);
}

// 🌸 樱花 Canvas 动画
const canvas = document.getElementById("sakuraCanvas");
const ctx = canvas.getContext("2d", { alpha: true });

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const sakuraCount = 80;
const width = () => canvas.getBoundingClientRect().width;
const height = () => canvas.getBoundingClientRect().height;

function makePetal() {
    const size = 6 + Math.random() * 10;
    const depth = size / 16;
    return {
        baseX: Math.random() * width(),
        x: 0,
        y: Math.random() * height(),
        size,
        speedY: 0.3 + depth + Math.random() * 0.4,
        swayAmp: 10 + Math.random() * 20,
        swayFreq: 0.006 + Math.random() * 0.006,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        alpha: 0.7 + Math.random() * 0.3,
        shadow: 2 + Math.random() * 8
    };
}
const petals = Array.from({ length: sakuraCount }, makePetal);

function drawPetal(p) {
    const { x, y, size, rot, alpha, shadow } = p;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(size / 8, size / 8);

    const grad = ctx.createRadialGradient(-1, -2, 0, 0, 0, 6);
    grad.addColorStop(0, "rgba(255, 214, 224, 0.98)");
    grad.addColorStop(0.7, "rgba(255, 190, 205, 0.9)");
    grad.addColorStop(1, "rgba(255, 170, 190, 0.85)");

    ctx.globalAlpha = alpha;
    ctx.fillStyle = grad;
    ctx.shadowColor = "rgba(255, 170, 190, 0.6)";
    ctx.shadowBlur = shadow;

    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.quadraticCurveTo(3.2, -4.2, 4.2, -1.2);
    ctx.quadraticCurveTo(4.4, 2.2, 0.2, 4.2);
    ctx.quadraticCurveTo(-4.6, 2.0, -4.2, -1.0);
    ctx.quadraticCurveTo(-3.2, -4.0, 0, -4);
    ctx.closePath();
    ctx.fill();

    ctx.lineWidth = 0.4;
    ctx.strokeStyle = "rgba(255, 190, 205, 0.6)";
    ctx.stroke();

    ctx.restore();
}

function updatePetal(p) {
    p.y += p.speedY * (0.85 + Math.sin(p.y / 50) * 0.15);
    p.x = p.baseX + Math.sin(p.y * p.swayFreq + p.phase) * p.swayAmp;
    p.rot += p.rotSpeed;

    if (p.y - p.size > height()) {
        p.y = -20 - Math.random() * 100;
        p.baseX = Math.random() * width();
        p.phase = Math.random() * Math.PI * 2;
    }
}

function draw() {
    ctx.clearRect(0, 0, width(), height());
    petals.sort((a, b) => a.size - b.size);
    for (const p of petals) {
        updatePetal(p);
        drawPetal(p);
    }
    requestAnimationFrame(draw);
}

// ✅ 加载完成后淡出 loader，再启动动画
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    loader.classList.add("fade-out");

    setTimeout(() => {
        loader.style.display = "none";
        requestAnimationFrame(draw);
    }, 3000);
});
