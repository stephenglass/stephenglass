import './cat.css';
import './style.css';

function showHeartAnimation(catContainer) {
    const heart = document.createElement("span");
    heart.className = "cat-heart-anim";
    heart.textContent = "❤️";
    catContainer.appendChild(heart);
    setTimeout(() => {
        heart.remove();
    }, 1200);
}

document.addEventListener("DOMContentLoaded", function () {
    const catContainer = document.querySelector(".cat-container");
    if (catContainer) {
        catContainer.addEventListener("click", function (e) {
            showHeartAnimation(catContainer);
        });
    }
});