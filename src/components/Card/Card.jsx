export default function Card({ href, icon, title, desc }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      class="block rounded-xl border border-[#e0e0e6] bg-white px-5 py-4 text-inherit no-underline shadow-xs transition-all duration-200 hover:-translate-y-[1px] hover:scale-[1.00] hover:shadow-md"
    >
      <div class="mb-0 flex h-[100px] items-center justify-center rounded-2xl bg-[#f7f7f7] shadow-sm">
        <span class="flex h-16 w-16 items-center justify-center rounded-[18px] bg-white shadow-md">
          {icon}
        </span>
      </div>
      <div class="px-2 pt-4 pb-2">
        <div class="mb-1 text-[1.15rem] font-semibold text-[#222]">{title}</div>
        <div class="text-[0.97rem] leading-relaxed text-[#555]">{desc}</div>
      </div>
    </a>
  );
}
