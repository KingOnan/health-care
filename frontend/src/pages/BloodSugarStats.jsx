import { useState } from "react";
import { TrendingUp, Droplet, ClipboardList, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopTabs from "../components/TopTabs";
import BottomNav from "../components/BottomNav";
import TrendLineChart from "../components/TrendLineChart";
import StatusLegend from "../components/StatusLegend";
import SegmentedToggle from "../components/SegmentedToggle";
import AddMenuButton from "../components/AddMenuButton";
import { INITIAL_LOGS } from "../data/bloodSugarLogs";
import { getGlucoseStatus } from "../utils/glucoseStatus";
import { STATUS_TEXT_CLASS } from "../utils/statusColor";

const STATUS_COLOR_VAR = {
  low: "var(--color-low)",
  normal: "var(--color-text)",
  caution: "var(--color-caution)",
  warning: "var(--color-warning)",
};

const TIMING_OPTIONS = [
  { label: "공복", value: "공복" },
  { label: "식후 2시간", value: "식후 2시간" },
];

const Y_TICKS = {
  공복: [50, 70, 90, 110, 130, 150],
  "식후 2시간": [70, 100, 130, 160, 190, 220],
};

const INSIGHT_TEXT = {
  공복: {
    title: "공복 혈당이 안정적으로 유지되고 있어요",
    body: "공복 수치가 정상 범위 안에서 꾸준히 유지되고 있어요. 지금 패턴을 계속 이어가보세요.",
  },
  "식후 2시간": {
    title: "식후 2시간 혈당이 가끔 높게 나오는 편이에요",
    body: "식후 2시간 수치가 자주 기준을 넘는다면 식사량이나 시간을 조절해보세요.",
  },
};

function average(values) {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function extreme(values, fn) {
  return values.length === 0 ? null : fn(...values);
}

function isWithinDays(dateStr, days, today) {
  const logDate = new Date(dateStr);
  logDate.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today - logDate) / 86400000);
  return diffDays >= 0 && diffDays < days;
}

function formatMonthDay(dateStr) {
  return dateStr.slice(5).replace("-", "/");
}

function dateRange(logs) {
  if (logs.length === 0) return { start: null, end: null };
  const dates = logs.map((log) => log.date).sort();
  return {
    start: formatMonthDay(dates[0]),
    end: formatMonthDay(dates[dates.length - 1]),
  };
}

function SummaryValue({ label, value, timing, valueSize = "text-xl" }) {
  const hasData = value !== null;
  const status = hasData ? getGlucoseStatus(timing, value) : null;
  return (
    <div className="flex flex-1 flex-col items-center gap-0 p-3">
      <span className="text-lg font-bold text-text-muted">{label}</span>
      <span
        className={`${valueSize} font-bold ${hasData ? STATUS_TEXT_CLASS[status] : "text-text-muted"}`}
      >
        {hasData ? value : "기록 없음"}
      </span>
    </div>
  );
}

function BloodSugarStats() {
  const navigate = useNavigate();
  const [timing, setTiming] = useState("공복");
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const timingLogs = INITIAL_LOGS.filter((log) => log.timing === timing);
  const last7Logs = timingLogs.filter((log) => isWithinDays(log.date, 7, now));
  const last30Logs = timingLogs.filter((log) => isWithinDays(log.date, 30, now));

  const avg7 = average(last7Logs.map((log) => log.value));
  const avg30 = average(last30Logs.map((log) => log.value));
  const max30 = extreme(last30Logs.map((log) => log.value), Math.max);
  const min30 = extreme(last30Logs.map((log) => log.value), Math.min);

  const { start: chartStart, end: chartEnd } = dateRange(last30Logs);

  const chartData = last30Logs
    .slice()
    .sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1))
    .map((log) => {
      const [, , d] = log.date.split("-").map(Number);
      return {
        label: `${d}일`,
        value: log.value,
        statusColor: STATUS_COLOR_VAR[getGlucoseStatus(log.timing, log.value)],
      };
    });

  const insight = INSIGHT_TEXT[timing];

  return (
    <div className="theme-glucose flex flex-col gap-8 px-3 pt-22 pb-26">
      <TopTabs
        active="stats"
        basePath="/blood-sugar"
        rightSlot={
          <AddMenuButton
            themeClass="theme-glucose"
            options={[
              {
                icon: Droplet,
                label: "혈당 입력",
                onClick: () => navigate("/blood-sugar/manage"),
              },
              {
                icon: ClipboardList,
                label: "혈당 기준표",
                onClick: () => navigate("/blood-sugar/reference"),
              },
              {
                icon: Bot,
                label: "혈당 챗봇",
                onClick: () => navigate("/chatbot/glucose"),
              },
            ]}
          />
        }
      />

      <div className="-mb-3">
        <SegmentedToggle options={TIMING_OPTIONS} value={timing} onChange={setTiming} />
      </div>

      <div className="flex flex-col gap-2">
        <StatusLegend lowLabel="저혈당" highLabel="고혈당" />

        <div className="flex flex-col gap-3">
          <div className="flex divide-x divide-primary/30 rounded-xl border-2 border-primary bg-surface">
            <SummaryValue label="7일 평균" value={avg7} timing={timing} valueSize="text-xl" />
            <SummaryValue label="30일 평균" value={avg30} timing={timing} valueSize="text-xl" />
          </div>

          <div className="flex divide-x divide-primary/30 rounded-xl border-2 border-primary bg-surface">
            <SummaryValue label="30일 최고" value={max30} timing={timing} valueSize="text-xl" />
            <SummaryValue label="30일 최저" value={min30} timing={timing} valueSize="text-xl" />
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="ml-1 flex items-center gap-2 text-heading font-bold">
          <TrendingUp size={20} strokeWidth={3} className="text-primary" />
          30일 혈당 그래프 ({timing})
        </h2>
        <TrendLineChart
          data={chartData}
          lines={[{ key: "value", label: "혈당", color: "var(--color-text-muted)" }]}
          yTicks={Y_TICKS[timing]}
          dotColorKey="statusColor"
          dateRangeStart={chartStart}
          dateRangeEnd={chartEnd}
        />
      </section>

      <div className="flex flex-col gap-2 rounded-xl border-2 border-primary bg-surface p-4">
        <p className="text-lg font-bold text-text">{insight.title}</p>
        <p className="text-lg text-text-muted">{insight.body}</p>
      </div>

      <BottomNav active="glucose" />
    </div>
  );
}

export default BloodSugarStats;
