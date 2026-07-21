import { Check, X, Pill } from "lucide-react";

function IntakeItemBox({
  name,
  time,
  status = "pending",
  isNext = false,
  isMissed = false,
  icon: Icon = Pill,
  onPress,
}) {
  const isDone = status === "done";
  const isSkipped = status === "skipped";
  const isResolved = isDone || isSkipped;

  return (
    <button
      onClick={onPress}
      className={`flex w-full justify-between overflow-hidden rounded-2xl bg-surface text-left shadow-[0_2px_10px_rgba(0,0,0,0.14)] transition active:scale-[97.5%] active:shadow-none active:brightness-90 ${
        isResolved ? "opacity-50" : ""
      }`}
    >
      <div
        className={`w-1.5 shrink-0 ${
          isNext && !isResolved ? "bg-primary" : "bg-gray-300"
        }`}
      />
      <div className="flex flex-1 items-center gap-3 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon size={20} />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          {isNext && !isResolved && (
            <span className="text-body font-semibold text-primary">다음</span>
          )}
          <span
            className={`flex items-center gap-1.5 text-lg font-semibold ${
              isResolved ? "text-text-muted line-through" : "text-text"
            }`}
          >
            {isMissed && <X size={22} strokeWidth={3} className="text-warning" />}
            {name}
          </span>
          <span className="text-lg text-text-muted">{time}</span>
        </div>
      </div>
      <div className="flex items-center pr-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
            isDone
              ? "border-primary bg-primary"
              : isSkipped
                ? "border-text-muted bg-text-muted"
                : "border-primary bg-surface"
          }`}
        >
          {isDone && <Check size={20} strokeWidth={3} className="text-white" />}
          {isSkipped && <X size={20} strokeWidth={3} className="text-white" />}
        </div>
      </div>
    </button>
  );
}

export default IntakeItemBox;
