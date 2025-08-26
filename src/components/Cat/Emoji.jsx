export default function Emoji({ text = "❤️" }) {
  return (
    <span class="absolute left-1/2 top-0 text-2xl opacity-0 pointer-events-none z-20 animate-[emoji-pop_1.2s_cubic-bezier(0.4,0,0.2,1)]">
      {text}
    </span>
  );
}
