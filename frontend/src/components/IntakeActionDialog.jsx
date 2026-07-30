import { Check, X } from "lucide-react";
import Modal from "./Modal";

function IntakeActionDialog({ open, name, time, status, onDone, onSkip, onClose }) {
  const isDoneCancel = status === "done";
  const isSkipCancel = status === "skipped";
  const doneLabel = isDoneCancel ? "복용취소" : "복용완료";
  const skipLabel = isSkipCancel ? "건너뛰기 취소" : "건너뛰기";

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-2xl font-semibold text-text">{name}</h2>
        <span className="text-heading font-medium text-text-muted">{time}</span>
      </div>
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onDone}
          className="flex min-h-14 w-4/5 items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-white transition active:scale-[97.5%]"
        >
          {isDoneCancel ? (
            <span className="relative inline-flex h-5 w-5 items-center justify-center">
              <Check size={20} strokeWidth={6} className="absolute text-white" />
              <Check size={20} strokeWidth={3} className="absolute text-warning" />
            </span>
          ) : (
            <Check size={20} strokeWidth={3} />
          )}
          {doneLabel}
        </button>
        <button
          onClick={onSkip}
          className="flex min-h-14 w-4/5 items-center justify-center gap-2 rounded-2xl border-2 border-text-muted bg-surface text-lg font-bold text-text-muted transition active:scale-[97.5%]"
        >
          <X size={20} strokeWidth={3} className={isSkipCancel ? "text-warning" : ""} />
          {skipLabel}
        </button>
      </div>
    </Modal>
  );
}

export default IntakeActionDialog;
