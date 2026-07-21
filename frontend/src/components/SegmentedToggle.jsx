function SegmentedToggle({ options, value, onChange }) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={String(option.value)}
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-full border-2 py-3 text-lg font-semibold transition ${
            value === option.value
              ? "border-primary bg-primary text-white"
              : "border-border bg-surface text-text-muted"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default SegmentedToggle;
