import { Calendar, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TopTabs({ active = "record", basePath, rightSlot }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-x-0 top-0 z-10 mx-auto w-full max-w-[480px] bg-page-bg px-3 pt-3 pb-3">
      <div className="flex gap-3">
        <div className="flex flex-1 gap-1 rounded-full border-2 border-gray-300 bg-surface p-1">
          <button
            onClick={() => basePath && navigate(basePath)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-body font-semibold ${
              active === "record" ? "bg-primary text-white" : "text-text-muted"
            }`}
          >
            <Calendar size={18} strokeWidth={active === "record" ? 2.5 : 2} />
            기록
          </button>
          <button
            onClick={() => basePath && navigate(`${basePath}/stats`)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-body font-semibold ${
              active === "stats" ? "bg-primary text-white" : "text-text-muted"
            }`}
          >
            <BarChart3 size={18} strokeWidth={active === "stats" ? 2.5 : 2} />
            통계
          </button>
        </div>
        {rightSlot}
      </div>
    </div>
  );
}

export default TopTabs;
