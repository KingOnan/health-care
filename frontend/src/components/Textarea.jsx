import { Star } from "lucide-react";

function Textarea({
  label,
  placeholder,
  value,
  onChange,
  required,
  rows = 3,
  icon: Icon,
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-[10px]">
      {label && (
        <span className="ml-1 flex items-center gap-2 text-lg leading-none font-bold text-text">
          {required && <Star size={16} className="fill-warning text-warning" />}
          {Icon && <Icon size={16} className="text-primary" />}
          {label}
          {required !== undefined && (
            <span
              className={`text-body leading-none font-normal ${required ? "text-warning" : "text-text-muted"}`}
            >
              {required ? "(필수)" : "(선택)"}
            </span>
          )}
        </span>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full min-w-0 resize-none rounded-lg border border-primary bg-surface px-3 py-3 text-lg font-semibold text-text placeholder:text-gray-400 focus:border-2 focus:outline-none"
      />
    </label>
  );
}

export default Textarea;
