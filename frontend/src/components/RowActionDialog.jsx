import { Pencil, Trash2 } from "lucide-react";
import Modal from "./Modal";

function RowActionDialog({
  open,
  title,
  details,
  memo,
  onEdit,
  onDelete,
  onClose,
  manageHistory = true,
}) {
  return (
    <Modal open={open} onClose={onClose} manageHistory={manageHistory}>
      <div className="flex flex-col items-center gap-3">
        <h2 className="text-center text-2xl font-semibold text-text">
          {title}
        </h2>
        {details && <div className="w-full">{details}</div>}
        {memo !== undefined && (
          <p className="w-full rounded-xl bg-page-bg px-4 py-3 text-left text-body text-text-muted">
            {memo || "메모 없음"}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-white transition active:scale-[97.5%]"
        >
          <Pencil size={20} strokeWidth={3} />
          수정
        </button>
        <button
          onClick={onDelete}
          className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-warning bg-surface text-lg font-bold text-warning transition active:scale-[97.5%] active:bg-warning-bg"
        >
          <Trash2 size={20} strokeWidth={3} />
          삭제
        </button>
      </div>
    </Modal>
  );
}

export default RowActionDialog;
