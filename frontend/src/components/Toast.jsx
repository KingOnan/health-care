import { Check } from "lucide-react";

function Toast({ show, message }) {
  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" />
      <div className="fixed inset-0 z-50 m-auto flex h-fit w-fit items-center gap-2 rounded-full bg-primary px-5 py-3 text-lg font-semibold text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
        <Check size={20} strokeWidth={3} />
        {message}
      </div>
    </>
  );
}

export default Toast;
