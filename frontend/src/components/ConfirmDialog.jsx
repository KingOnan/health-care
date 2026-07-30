import Modal from "./Modal";

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
  const confirmBg = tone === "warning" ? "bg-warning" : "bg-primary";

  return (
    <Modal open={open} onClose={onCancel} manageHistory={manageHistory} gap="gap-4">
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
    </Modal>
  );
}

export default ConfirmDialog;
