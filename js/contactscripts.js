var weixinModal = document.getElementById("weixinModal");
var qqModal = document.getElementById("qqModal");
var emailModal = document.getElementById("emailModal");
var weixinBtn = document.getElementById("weixinLink");
var qqBtn = document.getElementById("qqLink");
var emailBtn = document.getElementById("emailLink");
var closeBtns = document.getElementsByClassName("close");

weixinBtn.onclick = function () {
    weixinModal.style.display = "flex";
    setTimeout(function () {
        weixinModal.classList.add("show");
        document.querySelector("#weixinModal .modal-content").classList.add("show");
    }, 10);
}

qqBtn.onclick = function () {
    qqModal.style.display = "flex";
    setTimeout(function () {
        qqModal.classList.add("show");
        document.querySelector("#qqModal .modal-content").classList.add("show");
    }, 10);
}

emailBtn.onclick = function () {
    emailModal.style.display = "flex";
    setTimeout(function () {
        emailModal.classList.add("show");
        document.querySelector("#emailModal .modal-content").classList.add("show");
    }, 10);
}

for (var i = 0; i < closeBtns.length; i++) {
    closeBtns[i].onclick = function () {
        var modal = this.closest(".modal");
        modal.querySelector(".modal-content").classList.remove("show");
        setTimeout(function () {
            modal.classList.remove("show");
            setTimeout(function () {
                modal.style.display = "none";
            }, 500);
        }, 500);
    }
}

window.onclick = function (event) {
    if (event.target.classList.contains("modal")) {
        var modal = event.target;
        modal.querySelector(".modal-content").classList.remove("show");
        setTimeout(function () {
            modal.classList.remove("show");
            setTimeout(function () {
                modal.style.display = "none";
            }, 500);
        }, 500);
    }
}
