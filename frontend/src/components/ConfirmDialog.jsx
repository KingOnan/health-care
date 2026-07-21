import useBackToClose from "../hooks/useBackToClose";

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "삭제",
  cancelLabel = "취소",
  tone = "warning",
  manageHistory = true,
}) {
  useBackToClose(manageHistory ? open : false, onCancel);

  if (!open) return null;

  const confirmBg = tone === "warning" ? "bg-warning" : "bg-primary";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onCancel} />
      <div className="fixed inset-0 z-50 m-auto flex h-fit w-[85%] max-w-sm flex-col gap-4 rounded-2xl bg-surface p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
        <h2 className="text-lg font-bold text-text">{title}</h2>
        {message && <p className="text-body text-text-muted">{message}</p>}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="min-h-14 flex-1 rounded-2xl border-2 border-border bg-surface text-lg font-bold text-text-muted transition active:scale-[97.5%]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`min-h-14 flex-1 rounded-2xl ${confirmBg} text-lg font-bold text-white transition active:scale-[97.5%]`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

export default ConfirmDialog;
