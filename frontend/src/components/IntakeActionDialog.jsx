import { Check, X } from "lucide-react";
import useBackToClose from "../hooks/useBackToClose";

function IntakeActionDialog({ open, name, time, status, onDone, onSkip, onClose }) {
  useBackToClose(open, onClose);

  if (!open) return null;

  const doneLabel = status === "done" ? "복용완료 취소" : "복용완료";
  const skipLabel = status === "skipped" ? "건너뛰기 취소" : "건너뛰기";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 m-auto flex h-fit w-[85%] max-w-sm flex-col gap-6 rounded-2xl bg-surface p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-2xl font-semibold text-text">{name}</h2>
          <span className="text-heading font-medium text-text-muted">
            {time}
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onDone}
            className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-white transition active:scale-[97.5%]"
          >
            <Check size={20} strokeWidth={3} />
            {doneLabel}
          </button>
          <button
            onClick={onSkip}
            className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-text-muted bg-surface text-lg font-bold text-text-muted transition active:scale-[97.5%]"
          >
            <X size={20} strokeWidth={3} />
            {skipLabel}
          </button>
        </div>
      </div>
    </>
  );
}

export default IntakeActionDialog;
