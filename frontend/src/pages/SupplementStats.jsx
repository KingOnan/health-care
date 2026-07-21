import { BarChart3, Calendar, Clock, PillBottle, List, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopTabs from "../components/TopTabs";
import BottomNav from "../components/BottomNav";
import StatCard from "../components/StatCard";
import ItemAdherenceBars from "../components/ItemAdherenceBars";
import AddMenuButton from "../components/AddMenuButton";

const MOCK_ITEMS = [
  { name: "종합비타민", percent: 98 },
  { name: "오메가3", percent: 96 },
  { name: "유산균", percent: 90 },
  { name: "루테인", percent: 85 },
  { name: "철분제", percent: 68 },
  { name: "마그네슘", percent: 62 },
];

function SupplementStats() {
  const navigate = useNavigate();
  return (
    <div className="theme-supplement flex flex-col gap-8 px-3 pt-22 pb-26">
      <TopTabs
        active="stats"
        basePath="/supplement"
        rightSlot={
          <AddMenuButton
            themeClass="theme-supplement"
            options={[
              {
                icon: List,
                label: "영양제 목록",
                onClick: () => navigate("/supplement/list"),
              },
              {
                icon: PillBottle,
                label: "영양제 추가",
                onClick: () => navigate("/supplement/manage"),
              },
              {
                icon: Bot,
                label: "영양제 챗봇",
                onClick: () => navigate("/chatbot/supplement"),
              },
            ]}
          />
        }
      />

      <StatCard
        label="7월 복용률"
        value="92%"
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
            저녁 시간대
          </p>
          <p className="text-lg text-text-muted">
            저녁 영양제를 가장 자주 거르시는 편이에요. 저녁 식사 후 알림을
            조금 더 눈에 띄게 해보는 건 어떨까요?
          </p>
        </div>
      </section>

      <BottomNav active="supplement" />
    </div>
  );
}

export default SupplementStats;
