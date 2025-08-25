import { useRef } from "preact/hooks";

export default function Cat() {
  const catRef = useRef(null);
  const handleCatClick = () => {
    const catContainer = catRef.current;
    if (!catContainer) return;
    const heart = document.createElement("span");
    heart.className = "cat-heart-anim";
    heart.textContent = "❤️";
    catContainer.appendChild(heart);
    setTimeout(() => {
      heart.remove();
    }, 1200);
  };

  return (
    <span class="cat-container" ref={catRef} onClick={handleCatClick}>
      <svg
        class="pixel-cat"
        width="40"
        height="40"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="20" y="28" width="24" height="20" rx="6" fill="#222" />
        <rect x="24" y="16" width="16" height="16" rx="4" fill="#222" />
        <rect x="22" y="10" width="6" height="8" rx="2" fill="#222" />
        <rect x="36" y="10" width="6" height="8" rx="2" fill="#222" />
        <rect
          class="cat-eye"
          x="28"
          y="22"
          width="3"
          height="3"
          rx="1"
          fill="#fff"
        />
        <rect
          class="cat-eye"
          x="35"
          y="22"
          width="3"
          height="3"
          rx="1"
          fill="#fff"
        />
        <rect
          class="cat-tail"
          x="42"
          y="44"
          width="16"
          height="6"
          rx="3"
          fill="#222"
        />
      </svg>
    </span>
  );
}
