import { useRef } from "preact/hooks";
import "./style.css";

export default function Cat() {
  const catRef = useRef(null);
  const handleCatClick = () => {
    const catContainer = catRef.current;
    if (!catContainer) return;
    const heart = document.createElement("span");
    heart.setAttribute(
      "class",
      "absolute left-1/2 top-0 text-2xl opacity-0 pointer-events-none z-20 animate-[heart-pop_1.2s_cubic-bezier(0.4,0,0.2,1)]",
    );
    heart.textContent = "❤️";
    catContainer.appendChild(heart);
    setTimeout(() => {
      heart.remove();
    }, 1200);
  };

  return (
    <span ref={catRef} onClick={handleCatClick} class="relative ml-4 flex h-full items-end">
      <svg
        width="40"
        height="40"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="mb-0 h-16 w-16 [image-rendering:pixelated]"
      >
        <rect x="20" y="28" width="24" height="20" rx="6" fill="#222" />
        <rect x="24" y="16" width="16" height="16" rx="4" fill="#222" />
        <rect x="22" y="10" width="6" height="8" rx="2" fill="#222" />
        <rect x="36" y="10" width="6" height="8" rx="2" fill="#222" />
        <rect x="28" y="22" width="3" height="3" rx="1" fill="#fff" />
        <rect x="35" y="22" width="3" height="3" rx="1" fill="#fff" />
        <rect x="42" y="44" width="16" height="6" rx="3" fill="#222" />
      </svg>
    </span>
  );
}
