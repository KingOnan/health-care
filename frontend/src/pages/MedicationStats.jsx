import { BarChart3, Calendar, Clock, Pill, List, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopTabs from "../components/TopTabs";
import BottomNav from "../components/BottomNav";
import StatCard from "../components/StatCard";
import ItemAdherenceBars from "../components/ItemAdherenceBars";
import AddMenuButton from "../components/AddMenuButton";

const MOCK_ITEMS = [
  { name: "혈압약", percent: 98 },
  { name: "당뇨약", percent: 92 },
  { name: "진통제", percent: 85 },
  { name: "소화제", percent: 78 },
  { name: "수면제", percent: 70 },
];

function MedicationStats() {
  const navigate = useNavigate();
  return (
    <div
      className="theme-medication flex flex-col gap-8 px-3 pt-22 pb-26"
    >
      <TopTabs
        active="stats"
        basePath="/medication"
        rightSlot={
          <AddMenuButton
            themeClass="theme-medication"
            options={[
              {
                icon: List,
                label: "약 목록",
                onClick: () => navigate("/medication/list"),
              },
              {
                icon: Pill,
                label: "약 추가",
                onClick: () => navigate("/medication/manage"),
              },
              {
                icon: Bot,
                label: "약 챗봇",
                onClick: () => navigate("/chatbot/medication"),
              },
            ]}
          />
        }
      />

      <StatCard
        label="7월 복용률"
        value="96%"
        status="neutral"
        icon={Calendar}
      />

      <section className="flex flex-col gap-3">
        <h2 className="ml-1 flex items-center gap-2 text-heading font-bold">
          <BarChart3 size={20} strokeWidth={3} className="text-primary" />
          항목별 복용률
        </h2>
        <ItemAdherenceBars items={MOCK_ITEMS} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="ml-1 flex items-center gap-2 text-heading font-bold">
          <BarChart3 size={20} strokeWidth={3} className="text-primary" />
          자주 거르는 시간대
        </h2>
        <div className="flex flex-col gap-2 rounded-xl border-2 border-primary bg-surface p-4">
          <p className="flex items-center gap-2 text-lg font-bold text-text">
            <Clock size={20} strokeWidth={3} className="text-primary" />
            아침 시간대
          </p>
          <p className="text-lg text-text-muted">
            아침 약을 가장 자주 거르시는 편이에요. 기상 알림과 함께 복용
            알림을 같이 보내보는 건 어떨까요?
          </p>
        </div>
      </section>

      <BottomNav active="medication" />
    </div>
  );
}

export default MedicationStats;
