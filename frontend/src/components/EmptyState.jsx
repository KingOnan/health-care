import Button from "./Button";

// 목록에 아무 데이터도 없을 때(첫 사용, 전부 삭제됨 등) 대신 보여주는 안내 블록
function EmptyState({ icon: Icon, message, subMessage, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface px-6 pt-10 pb-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.14)]">
      <div className="mb-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        <Icon size={32} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-heading font-bold text-text">{message}</p>
        {subMessage && <p className="text-lg text-text-muted">{subMessage}</p>}
      </div>
      {actionLabel && (
        <Button px="px-8" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
