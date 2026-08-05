import { useEffect, useState } from "react";
import {
  PillBottle,
  ChevronRight,
  Pencil,
  Pause,
  Play,
  Trash2,
  Tag,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteSupplement, getSupplementItemList, updateSupplementStatus } from "../api/supplement";
import { getToken } from "../utils/user";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import BottomNav from "../components/BottomNav";
import useToastNavigate from "../hooks/useToastNavigate";
import { eulReul } from "../utils/korean";

// 백엔드 응답(SupplementItemResponse)을 화면이 쓰는 모양으로 변환
const toViewItem = (item) => ({
  id: item.supplement_item_seq,
  name: item.name,
  times: item.scheduled_times.map((t) => t.slice(0, 5)),
  paused: item.status === "중지",
});

function SupplementList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [pendingPauseId, setPendingPauseId] = useState(null);
  const pendingDeleteItem = items.find((item) => item.id === pendingDeleteId);
  const pendingPauseItem = items.find((item) => item.id === pendingPauseId);
  const { showToast, message, variant, trigger: handleAction } = useToastNavigate({
    message: "삭제했어요",
  });

  useEffect(() => {
    getSupplementItemList(getToken())
      .then((data) => setItems(data.map(toViewItem)))
      .catch(() => {});
  }, []);

  const handlePauseToggle = async () => {
    const id = pendingPauseId;
    const wasPaused = pendingPauseItem?.paused;
    setPendingPauseId(null);

    try {
      await updateSupplementStatus(id, wasPaused ? "복용중" : "중지", getToken());
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, paused: !item.paused } : item)),
      );
      handleAction(wasPaused ? "재개했어요" : "중지했어요");
    } catch {
      handleAction(wasPaused ? "재개에 실패했어요" : "중지에 실패했어요", "error");
    }
  };

  const handleDelete = async () => {
    const id = pendingDeleteId;
    setPendingDeleteId(null);

    try {
      await deleteSupplement(id, getToken());
      setItems((prev) => prev.filter((item) => item.id !== id));
      handleAction("삭제했어요");
    } catch {
      handleAction("삭제에 실패했어요", "error");
    }
  };

  return (
    <div className="theme-supplement flex min-h-svh flex-col bg-page-bg">
      <header className="fixed inset-x-0 top-0 z-10 mx-auto flex w-full max-w-[480px] items-center gap-3 border-b-2 border-gray-200 bg-surface px-6 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <PillBottle size={22} />
        </div>
        <h1 className="text-heading font-bold">영양제 목록</h1>
      </header>

      <div className="flex flex-col gap-7 p-6 pt-[100px] pb-26">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_2px_10px_rgba(0,0,0,0.14)] ${
              item.paused ? "opacity-50" : ""
            }`}
          >
            <div className="h-1.5 w-full shrink-0 bg-primary" />
            <button
              onClick={() => navigate(`/supplement/detail/${item.id}`)}
              className="flex items-center justify-between gap-2 px-4 pt-4 pb-4 text-left transition active:scale-[97.5%]"
            >
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-lg font-extrabold text-text">
                  <Tag size={18} strokeWidth={3} className="shrink-0 text-primary" />
                  {item.name}
                </span>
                <span className="flex items-center gap-1.5 text-lg text-text-muted">
                  <Clock size={18} strokeWidth={3} className="shrink-0 text-primary" />
                  {item.times.join(", ")}
                  {item.paused && " · 중지"}
                </span>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <ChevronRight size={20} strokeWidth={2.5} />
              </div>
            </button>
            <div className="flex gap-3 px-3 pt-1 pb-3">
              <button
                onClick={() => navigate(`/supplement/manage/${item.id}`)}
                className="flex h-[46px] flex-1 items-center justify-center gap-1 rounded-xl border-2 border-primary bg-surface text-body font-semibold text-primary transition active:scale-[97.5%]"
              >
                <Pencil size={18} />
                수정
              </button>
              <button
                onClick={() => setPendingPauseId(item.id)}
                className="flex h-[46px] flex-1 items-center justify-center gap-1 rounded-xl border-2 border-text-muted bg-surface text-body font-semibold text-text-muted transition active:scale-[97.5%]"
              >
                {item.paused ? <Play size={18} /> : <Pause size={18} />}
                {item.paused ? "재개" : "중지"}
              </button>
              <button
                onClick={() => setPendingDeleteId(item.id)}
                className="flex h-[46px] flex-1 items-center justify-center gap-1 rounded-xl border-2 border-warning bg-surface text-body font-semibold text-warning transition active:scale-[97.5%] active:bg-warning-bg"
              >
                <Trash2 size={18} />
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title={
          pendingDeleteItem &&
          `${pendingDeleteItem.name}${eulReul(pendingDeleteItem.name)} 삭제할까요?`
        }
        message="삭제하면 되돌릴 수 없어요."
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={pendingPauseId !== null}
        title={
          pendingPauseItem &&
          `${pendingPauseItem.name}${eulReul(pendingPauseItem.name)} ${
            pendingPauseItem.paused ? "다시 복용할까요?" : "중지할까요?"
          }`
        }
        message={
          pendingPauseItem?.paused
            ? "오늘 복용 목록에 다시 나타나요."
            : "오늘 복용 목록에서만 빠지고, 언제든 다시 재개할 수 있어요."
        }
        confirmLabel={pendingPauseItem?.paused ? "재개" : "중지"}
        tone="primary"
        onCancel={() => setPendingPauseId(null)}
        onConfirm={handlePauseToggle}
      />

      <Toast show={showToast} message={message} variant={variant} />

      <BottomNav active="supplement" />
    </div>
  );
}

export default SupplementList;
