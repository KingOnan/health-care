import { TrendingUp, HeartPulse, ClipboardList, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopTabs from "../components/TopTabs";
import BottomNav from "../components/BottomNav";
import TrendLineChart from "../components/TrendLineChart";
import StatusLegend from "../components/StatusLegend";
import AddMenuButton from "../components/AddMenuButton";
import { INITIAL_LOGS } from "../data/bloodPressureLogs";
import { getBpStatus } from "../utils/bpStatus";
import { STATUS_TEXT_CLASS } from "../utils/statusColor";

const STATUS_COLOR_VAR = {
  low: "var(--color-low)",
  normal: "var(--color-text)",
  caution: "var(--color-caution)",
  warning: "var(--color-warning)",
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

function SummaryValue({ label, systolic, diastolic, valueSize = "text-display" }) {
  const hasData = systolic !== null && diastolic !== null;
  const status = hasData ? getBpStatus(systolic, diastolic) : null;
  return (
    <div className="flex flex-1 flex-col items-center gap-0 p-3">
      <span className="text-lg font-bold text-text-muted">{label}</span>
      <span
        className={`${valueSize} font-bold ${hasData ? STATUS_TEXT_CLASS[status] : "text-text-muted"}`}
      >
        {hasData ? `${systolic} / ${diastolic}` : "기록 없음"}
      </span>
    </div>
  );
}

function BloodPressureStats() {
  const navigate = useNavigate();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const last7Logs = INITIAL_LOGS.filter((log) => isWithinDays(log.date, 7, now));
  const last30Logs = INITIAL_LOGS.filter((log) => isWithinDays(log.date, 30, now));

  const avg7 = {
    systolic: average(last7Logs.map((log) => log.systolic)),
    diastolic: average(last7Logs.map((log) => log.diastolic)),
  };
  const avg30 = {
    systolic: average(last30Logs.map((log) => log.systolic)),
    diastolic: average(last30Logs.map((log) => log.diastolic)),
  };
  const max30 = {
    systolic: extreme(last30Logs.map((log) => log.systolic), Math.max),
    diastolic: extreme(last30Logs.map((log) => log.diastolic), Math.max),
  };
  const min30 = {
    systolic: extreme(last30Logs.map((log) => log.systolic), Math.min),
    diastolic: extreme(last30Logs.map((log) => log.diastolic), Math.min),
  };

  const { start: chartStart, end: chartEnd } = dateRange(last30Logs);

  const chartData = last30Logs
    .slice()
    .sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1))
    .map((log) => {
      const [, , d] = log.date.split("-").map(Number);
      return {
        label: `${d}일`,
        systolic: log.systolic,
        diastolic: log.diastolic,
        statusColor: STATUS_COLOR_VAR[getBpStatus(log.systolic, log.diastolic)],
      };
    });

  return (
    <div
      className="theme-bp flex flex-col gap-8 px-3 pt-22 pb-26"
    >
      <TopTabs
        active="stats"
        basePath="/blood-pressure"
        rightSlot={
          <AddMenuButton
            themeClass="theme-bp"
            options={[
              {
                icon: HeartPulse,
                label: "혈압 입력",
                onClick: () => navigate("/blood-pressure/manage"),
              },
              {
                icon: ClipboardList,
                label: "혈압 기준표",
                onClick: () => navigate("/blood-pressure/reference"),
              },
              {
                icon: Bot,
                label: "혈압 챗봇",
                onClick: () => navigate("/chatbot/bp"),
              },
            ]}
          />
        }
      />

      <div className="flex flex-col gap-2">
        <StatusLegend />

        <div className="flex flex-col gap-3">
          <div className="flex divide-x divide-primary/30 rounded-xl border-2 border-primary bg-surface">
            <SummaryValue
              label="7일 평균"
              systolic={avg7.systolic}
              diastolic={avg7.diastolic}
              valueSize="text-xl"
            />
            <SummaryValue
              label="30일 평균"
              systolic={avg30.systolic}
              diastolic={avg30.diastolic}
              valueSize="text-xl"
            />
          </div>

          <div className="flex divide-x divide-primary/30 rounded-xl border-2 border-primary bg-surface">
            <SummaryValue
              label="30일 최고"
              systolic={max30.systolic}
              diastolic={max30.diastolic}
              valueSize="text-xl"
            />
            <SummaryValue
              label="30일 최저"
              systolic={min30.systolic}
              diastolic={min30.diastolic}
              valueSize="text-xl"
            />
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="ml-1 flex items-center gap-2 text-heading font-bold">
          <TrendingUp size={20} strokeWidth={3} className="text-primary" />
          30일 혈압 그래프
        </h2>
        <TrendLineChart
          data={chartData}
          lines={[
            { key: "systolic", label: "수축기", color: "#a06ed2" },
            { key: "diastolic", label: "이완기", color: "var(--color-text-muted)" },
          ]}
          yTicks={[60, 80, 100, 120, 140, 160]}
          dotColorKey="statusColor"
          dateRangeStart={chartStart}
          dateRangeEnd={chartEnd}
        />
      </section>

      <div className="flex flex-col gap-2 rounded-xl border-2 border-primary bg-surface p-4">
        <p className="text-lg font-bold text-text">
          이번 달 혈압이 지난달보다 안정적이에요
        </p>
        <p className="text-lg text-text-muted">
          평균 범위 안에서 잘 유지되고 있어요. 이 상태를 유지해보세요.
        </p>
      </div>

      <BottomNav active="bp" />
    </div>
  );
}

export default BloodPressureStats;
