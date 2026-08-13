import { useEffect, useState } from "react";
import {
  Pill,
  ChevronRight,
  Pencil,
  CheckCheck,
  Trash2,
  Tag,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  deleteMedication,
  getMedicationItemList,
  updateMedicationStatus,
} from "../api/medication";
import { getToken } from "../utils/user";
import Toast from "../components/Toast";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import BottomNav from "../components/BottomNav";
import useToastNavigate from "../hooks/useToastNavigate";
import { eulReul } from "../utils/korean";

// 백엔드 응답(MedicationItemListResponse)을 화면이 쓰는 모양으로 변환
const toViewItem = (item) => ({
  id: item.medication_item_seq,
  name: item.name,
  times: item.scheduled_times.map((t) => t.slice(0, 5)),
  status: item.status,
});

function MedicationList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [pendingEndId, setPendingEndId] = useState(null);
  const pendingDeleteItem = items.find((item) => item.id === pendingDeleteId);
  const pendingEndItem = items.find((item) => item.id === pendingEndId);
  const {
    showToast,
    message,
    variant,
    trigger: handleAction,
  } = useToastNavigate({
    message: "삭제했어요",
  });

  useEffect(() => {
    getMedicationItemList(getToken())
      .then((data) => setItems(data.map(toViewItem)))
      .catch(() => {});
  }, []);

  const handleEnd = async () => {
    const id = pendingEndId;
    setPendingEndId(null);

    try {
      await updateMedicationStatus(id, "종료", getToken());
      // 종료된 약은 목록 맨 뒤로 내려가야 해서, 서버가 정렬해준 순서를 다시 받아옴
      const data = await getMedicationItemList(getToken());
      setItems(data.map(toViewItem));
      handleAction("종료했어요");
    } catch {
      handleAction("종료에 실패했어요", "error");
    }
  };

  const handleDelete = async () => {
    const id = pendingDeleteId;
    setPendingDeleteId(null);

    try {
      await deleteMedication(id, getToken());
      setItems((prev) => prev.filter((item) => item.id !== id));
      handleAction("삭제했어요");
    } catch {
      handleAction("삭제에 실패했어요", "error");
    }
  };

  return (
    <div className="theme-medication flex min-h-svh flex-col bg-page-bg">
      <header className="fixed inset-x-0 top-0 z-10 mx-auto flex w-full max-w-[480px] items-center gap-3 border-b-2 border-gray-200 bg-surface px-6 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <Pill size={22} />
        </div>
        <h1 className="text-heading font-bold">약 목록</h1>
      </header>

      <div className="flex flex-col gap-7 p-6 pt-[100px] pb-26">
        {items.length === 0 && (
          <EmptyState
            icon={Pill}
            message="등록된 약이 없어요"
            subMessage="추가하면 목록에 나타나요"
            actionLabel="약 추가하기"
            onAction={() => navigate("/medication/manage")}
          />
        )}

        {items.map((item) => {
          const isEnded = item.status === "종료";
          return (
            <div
              key={item.id}
              className={`flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_2px_10px_rgba(0,0,0,0.14)] ${
                item.status === "복용중" ? "" : "opacity-50"
              }`}
            >
              <div className="h-1.5 w-full shrink-0 bg-primary" />
              <button
                onClick={() => navigate(`/medication/detail/${item.id}`)}
                className="flex items-center justify-between gap-2 px-4 pt-4 pb-4 text-left transition active:scale-[97.5%]"
              >
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-lg font-extrabold text-text">
                    <Tag
                      size={18}
                      strokeWidth={3}
                      className="shrink-0 text-primary"
                    />
                    {item.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-lg text-text-muted">
                    <Clock
                      size={18}
                      strokeWidth={3}
                      className="shrink-0 text-primary"
                    />
                    {item.times.join(", ")}
                    {item.status === "중지" && " · 중지"}
                  </span>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <ChevronRight size={20} strokeWidth={2.5} />
                </div>
              </button>
              <div className="flex gap-3 px-3 pt-1 pb-3">
                {/* 종료는 되돌릴 수 없어서, 이미 종료된 약에는 버튼 대신 상태 표시만 둠 */}
                {isEnded && (
                  <span className="flex h-[46px] flex-1 items-center justify-center gap-1 text-body font-semibold text-text-muted">
                    <CheckCheck size={18} />
                    종료됨
                  </span>
                )}
                <button
                  onClick={() => navigate(`/medication/manage/${item.id}`)}
                  className="flex h-[46px] flex-1 items-center justify-center gap-1 rounded-xl border-2 border-primary bg-surface text-body font-semibold text-primary transition active:scale-[97.5%]"
                >
                  <Pencil size={18} />
                  수정
                </button>
                {!isEnded && (
                  <button
                    onClick={() => setPendingEndId(item.id)}
                    className="flex h-[46px] flex-1 items-center justify-center gap-1 rounded-xl border-2 border-text-muted bg-surface text-body font-semibold text-text-muted transition active:scale-[97.5%]"
                  >
                    <CheckCheck size={18} />
                    종료
                  </button>
                )}
                <button
                  onClick={() => setPendingDeleteId(item.id)}
                  className="flex h-[46px] flex-1 items-center justify-center gap-1 rounded-xl border-2 border-warning bg-surface text-body font-semibold text-warning transition active:scale-[97.5%] active:bg-warning-bg"
                >
                  <Trash2 size={18} />
                  삭제
                </button>
              </div>
            </div>
          );
        })}
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
        open={pendingEndId !== null}
        title={
          pendingEndItem &&
          `${pendingEndItem.name}${eulReul(pendingEndItem.name)} 종료할까요?`
        }
        message="기록은 남지만 오늘 복용 목록에서 빠지고, 다시 되돌릴 수 없어요."
        confirmLabel="종료"
        tone="primary"
        onCancel={() => setPendingEndId(null)}
        onConfirm={handleEnd}
      />

      <Toast show={showToast} message={message} variant={variant} />

      <BottomNav active="medication" />
    </div>
  );
}

export default MedicationList;
