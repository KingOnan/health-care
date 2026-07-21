import { useState } from "react";
import { HeartPulse, ClipboardList, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopTabs from "../components/TopTabs";
import BottomNav from "../components/BottomNav";
import AddMenuButton from "../components/AddMenuButton";
import MonthSelector from "../components/MonthSelector";
import StatusLegend from "../components/StatusLegend";
import RecordTable from "../components/RecordTable";
import RowActionDialog from "../components/RowActionDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import useToastNavigate from "../hooks/useToastNavigate";
import useBackToClose from "../hooks/useBackToClose";
import { INITIAL_LOGS } from "../data/bloodPressureLogs";
import { getBpStatus } from "../utils/bpStatus";
import { STATUS_TEXT_CLASS } from "../utils/statusColor";

const COLUMNS = [
  {
    key: "datetime",
    label: "날짜",
    width: "",
    render: (row) => (
      <span className="flex items-center justify-center gap-4">
        <span>{row.date}</span>
        <span>{row.time}</span>
      </span>
    ),
  },
  { key: "systolic", label: "수축", width: "w-[4rem]", statusColored: true },
  { key: "diastolic", label: "이완", width: "w-[4rem]", statusColored: true },
  { key: "pulse", label: "맥박", width: "w-[4.2rem]" },
];

function BloodPressureRecord() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [activeLog, setActiveLog] = useState(null);
  const [dialogStep, setDialogStep] = useState("none"); // "none" | "action" | "confirm"
  useBackToClose(dialogStep !== "none", () => setDialogStep("none"));

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const monthLogs = INITIAL_LOGS.filter((log) => {
    const [y, m] = log.date.split("-").map(Number);
    return y === year && m === month;
  }).sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));

  const rows = monthLogs.map((log) => {
    const [, m, d] = log.date.split("-");
    return {
      id: log.id,
      date: `${m}/${d}`,
      time: log.time,
      systolic: log.systolic,
      diastolic: log.diastolic,
      pulse: log.pulse,
      status: getBpStatus(log.systolic, log.diastolic),
    };
  });

  const goPrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (isCurrentMonth) return;
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const { showToast, message, trigger: handleAction } = useToastNavigate({
    message: "삭제했어요",
  });

  const [, activeMonth, activeDay] = activeLog?.date.split("-") ?? [];
  const activeLogTitle = activeLog ? `${activeMonth}/${activeDay} ${activeLog.time}` : "";
  const activeStatusClass = activeLog
    ? (STATUS_TEXT_CLASS[getBpStatus(activeLog.systolic, activeLog.diastolic)] ?? "text-text")
    : "text-text";
  const activeLogDetails = activeLog && (
    <div className="overflow-hidden rounded-xl border-2 border-primary">
      <table className="w-full table-fixed text-center text-lg">
        <thead>
          <tr className="bg-primary text-white">
            <th className="px-2 py-1.5 font-semibold">수축기</th>
            <th className="px-2 py-1.5 font-semibold">이완기</th>
            <th className="px-2 py-1.5 font-semibold">맥박</th>
          </tr>
        </thead>
        <tbody className="bg-surface">
          <tr>
            <td className={`px-2 py-2 font-bold ${activeStatusClass}`}>{activeLog.systolic}</td>
            <td className={`px-2 py-2 font-bold ${activeStatusClass}`}>{activeLog.diastolic}</td>
            <td className="px-2 py-2 font-bold text-text">{activeLog.pulse}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      className="theme-bp flex h-svh flex-col gap-3 overflow-hidden px-3 pt-22 pb-23"
    >
      <TopTabs
        active="record"
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
      <MonthSelector
        year={year}
        month={month}
        onPrev={goPrevMonth}
        onNext={goNextMonth}
        disableNext={isCurrentMonth}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <StatusLegend />

        {rows.length > 0 ? (
          <div className="min-h-0 flex-1">
            <RecordTable
              rows={rows}
              columns={COLUMNS}
              onRowClick={(row) => {
                setActiveLog(monthLogs.find((log) => log.id === row.id));
                setDialogStep("action");
              }}
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-center text-lg text-text-muted">
              이 달의 기록이 없어요.
            </p>
          </div>
        )}
      </div>

      <RowActionDialog
        open={dialogStep === "action"}
        manageHistory={false}
        title={activeLogTitle}
        details={activeLogDetails}
        memo={activeLog?.memo ?? ""}
        onEdit={() => navigate(`/blood-pressure/manage/${activeLog.id}`)}
        onDelete={() => setDialogStep("confirm")}
        onClose={() => setDialogStep("none")}
      />

      <ConfirmDialog
        open={dialogStep === "confirm"}
        manageHistory={false}
        title="이 기록을 삭제할까요?"
        message="삭제하면 되돌릴 수 없어요."
        onCancel={() => setDialogStep("none")}
        onConfirm={() => {
          setDialogStep("none");
          handleAction();
        }}
      />

      <Toast show={showToast} message={message} />

      <BottomNav active="bp" />
    </div>
  );
}

export default BloodPressureRecord;
