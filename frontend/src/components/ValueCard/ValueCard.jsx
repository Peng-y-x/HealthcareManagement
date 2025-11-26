import "./ValueCard.css";

export default function ValueCard({ icon, title, desc }) {
  return (
    <div className="value-card">
      <div className="value-icon">{icon}</div>
      <h4 className="value-title">{title}</h4>
      <p className="value-desc">{desc}</p>
    </div>
  );
}
