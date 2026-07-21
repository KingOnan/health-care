import { Pill, PillBottle, HeartPulse, Droplet } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { key: "supplement", label: "영양제", Icon: PillBottle, route: "/supplement" },
  { key: "medication", label: "약", Icon: Pill, route: "/medication" },
  { key: "bp", label: "혈압", Icon: HeartPulse, route: "/blood-pressure" },
  { key: "glucose", label: "혈당", Icon: Droplet, route: "/blood-sugar" },
];

function BottomNav({ active = "bp" }) {
  const navigate = useNavigate();

  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[480px] divide-x-[1.5px] divide-gray-200 bg-surface shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
      {NAV_ITEMS.map(({ key, label, Icon, route }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            onClick={() => route && navigate(route)}
            className={`relative flex flex-1 flex-col items-center gap-0.5 pt-3 pb-2 transition active:scale-95 active:bg-page-bg ${
              isActive ? "text-primary" : "text-text-muted"
            }`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-b-full bg-primary" />
            )}
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-body font-semibold">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
