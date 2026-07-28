import { Check } from "lucide-react";

function Toast({ show, message, variant = "success" }) {
  if (!show) return null;

  const isError = variant === "error";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" />
      <div
        className={`fixed inset-0 z-50 m-auto flex h-fit w-fit items-center gap-2 rounded-full px-9 py-4 text-lg font-semibold text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] ${
          isError ? "bg-warning" : "bg-primary"
        }`}
      >
        {!isError && <Check size={20} strokeWidth={3} />}
        <span className="text-center whitespace-pre-line">{message}</span>
      </div>
    </>
  );
}

export default Toast;
