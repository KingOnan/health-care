import { ChevronLeft, ChevronRight } from "lucide-react";

function MonthSelector({ year, month, onPrev, onNext, disableNext = false }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border-2 border-primary bg-surface p-2.5">
      <button
        onClick={onPrev}
        className="ml-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary text-primary transition active:scale-95 active:bg-page-bg"
      >
        <ChevronLeft size={22} strokeWidth={3} />
      </button>
      <span className="text-lg font-bold text-text">
        {year}년 {month}월
      </span>
      <button
        onClick={onNext}
        disabled={disableNext}
        className={`mr-2 flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
          disableNext
            ? "border-border text-text-muted opacity-40"
            : "border-primary text-primary active:scale-95 active:bg-page-bg"
        }`}
      >
        <ChevronRight size={22} strokeWidth={3} />
      </button>
    </div>
  );
}

export default MonthSelector;
