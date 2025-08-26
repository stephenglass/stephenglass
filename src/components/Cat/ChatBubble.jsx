export default function ChatBubble({ text }) {
  return (
    <div class="absolute left-12 top-0 bg-white rounded-2xl px-4 py-1 shadow-lg text-base z-30">
      {text}
    </div>
  );
}
