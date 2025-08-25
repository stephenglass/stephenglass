export default function Card({ href, icon, title, desc }) {
  return (
    <a class="card" href={href} target="_blank" rel="noopener noreferrer">
      <div class="card-header">
        <span class="icon">{icon}</span>
      </div>
      <div class="card-content">
        <div class="card-title">{title}</div>
        <div class="card-desc">{desc}</div>
      </div>
    </a>
  );
}
