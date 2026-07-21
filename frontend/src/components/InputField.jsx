import { Star } from "lucide-react";

function InputField({
  label,
  placeholder,
  type = "number",
  border = "border",
  value,
  onChange,
  required,
  centerLabel = false,
  icon: Icon,
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-[10px]">
      {label && (
        <span
          className={`flex items-center gap-2 text-lg leading-none font-bold text-text ${
            centerLabel ? "justify-center" : "ml-1"
          }`}
        >
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
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`min-h-14 w-full min-w-0 rounded-lg ${border} border-primary bg-surface px-3 text-lg font-semibold text-text placeholder:text-gray-400 focus:border-2 focus:outline-none`}
      />
    </label>
  );
}

export default InputField;
