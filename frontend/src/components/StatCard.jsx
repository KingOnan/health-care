const STATUS_STYLES = {
  low: { border: "border-low", bg: "bg-low-bg", text: "text-low" },
  normal: { border: "border-border", bg: "bg-surface", text: "text-text" },
  caution: { border: "border-caution", bg: "bg-caution-bg", text: "text-caution" },
  warning: {
    border: "border-warning",
    bg: "bg-warning-bg",
    text: "text-warning",
  },
  neutral: { border: "border-primary", bg: "bg-surface", text: "text-primary" },
};

function StatCard({ label, value, status = "neutral", icon: Icon }) {
  const { border, bg, text } = STATUS_STYLES[status];

  return (
    <div
      className={`flex items-center justify-between rounded-xl border-2 ${border} ${bg} px-6 py-3`}
    >
      <p className="flex items-center gap-2 text-lg font-bold text-text-muted">
        {Icon && <Icon size={20} strokeWidth={3} className="text-primary" />}
        {label}
      </p>
      <p className={`text-display font-bold ${text}`}>{value}</p>
    </div>
  );
}

export default StatCard;
