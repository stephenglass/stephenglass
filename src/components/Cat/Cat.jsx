import { render } from "preact";
import { useRef } from "preact/hooks";
import Emoji from "./Emoji.jsx";
import ChatBubble from "./ChatBubble.jsx";
import { getAnimationByClickCount, getEmojiByClickCount } from "./utils.js";
import { useReward } from "react-rewards";
import "./style.css";

export default function Cat({ clicks = 0, onClicksChange }) {
  const clickCountRef = useRef(clicks);
  const catSvgRef = useRef(null);
  const emojiContainerRef = useRef(null);

  const { reward } = useReward("rewardId", "emoji", {
    elementCount: 10,
    lifetime: 100,
    startVelocity: 15,
    emoji: ["🐈‍⬛"],
    rotate: false,
  });

  const handleCatClick = () => {
    clickCountRef.current += 1;
    if (onClicksChange) {
      onClicksChange(clickCountRef.current);
    }

    const emojiContainer = emojiContainerRef.current;
    if (!emojiContainer) {
      return;
    }

    const emojiNode = document.createElement("span");
    render(
      <Emoji text={getEmojiByClickCount(clickCountRef.current)} />,
      emojiNode,
    );
    const emojiElement = emojiNode.firstChild;
    if (!emojiElement) {
      return;
    }

    emojiContainer.appendChild(emojiElement);
    setTimeout(() => {
      if (emojiContainer.contains(emojiElement)) {
        emojiElement.remove();
      }
    }, 1200);

    // Show chat bubble every 15th click
    if (clickCountRef.current % 15 === 0) {
      const chatBubbleNode = document.createElement("span");
      render(<ChatBubble text="meow" />, chatBubbleNode);
      const parent = emojiContainer.parentNode;
      parent.appendChild(chatBubbleNode);
      setTimeout(() => {
        if (parent.contains(chatBubbleNode)) {
          chatBubbleNode.remove();
        }
      }, 1500);
    }

    // Animations
    const svg = catSvgRef.current;
    if (svg) {
      const animationClassList = getAnimationByClickCount(
        clickCountRef.current,
      );
      if (animationClassList) {
        svg.classList.add(animationClassList);
        setTimeout(() => {
          svg.classList.remove(animationClassList);
        }, 800);
      }
    }

    // Show emoji rewards
    if (clickCountRef.current % 50 === 0) {
      reward();
    }
  };

  return (
    <span onClick={handleCatClick} class="relative ml-4 flex h-full items-end">
      <span id="rewardId" />
      <div
        ref={emojiContainerRef}
        class="absolute left-0 top-0 w-full h-full pointer-events-none z-20"
      />
      <svg
        ref={catSvgRef}
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
