import { useEffect, useState } from "react";
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
import EmptyState from "../components/EmptyState";
import useBackToClose from "../hooks/useBackToClose";
import { deleteBloodPressure, getBloodPressureList } from "../api/bloodPressure";
import { levelToStatus } from "../utils/bpStatus";
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
  { key: "systolic", label: "수축", width: "w-[65px]", statusColored: true },
  { key: "diastolic", label: "이완", width: "w-[65px]", statusColored: true },
  { key: "pulse", label: "맥박", width: "w-[65px]" },
];

// "2026-09-15T09:00:00" -> { date: "09/15", time: "09:00" }
function splitMeasuredAt(measuredAt) {
  const [datePart, timePart] = measuredAt.split("T");
  const [, m, d] = datePart.split("-");
  return { date: `${m}/${d}`, time: timePart.slice(0, 5) };
}

function BloodPressureRecord() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [logs, setLogs] = useState([]);
  const [activeLog, setActiveLog] = useState(null);
  const [dialogStep, setDialogStep] = useState("none"); // "none" | "action" | "confirm"
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  useBackToClose(dialogStep !== "none", () => setDialogStep("none"));

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  useEffect(() => {
    getBloodPressureList(year, month)
      .then(setLogs)
      .catch(() => setLogs([]));
  }, [year, month]);

  const rows = logs.map((log) => {
    const { date, time } = splitMeasuredAt(log.measured_at);
    return {
      id: log.blood_pressure_seq,
      date,
      time,
      systolic: log.systolic,
      diastolic: log.diastolic,
      pulse: log.pulse,
      memo: log.memo,
      status: levelToStatus(log.level),
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

  const notify = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  const handleDelete = async () => {
    setDialogStep("none");

    try {
      await deleteBloodPressure(activeLog.id);
      setLogs((prev) => prev.filter((log) => log.blood_pressure_seq !== activeLog.id));
      notify("삭제했어요");
    } catch {
      notify("삭제에 실패했어요", "error");
    }
  };

  const activeLogTitle = activeLog ? `${activeLog.date} ${activeLog.time}` : "";
  const activeStatusClass = activeLog
    ? (STATUS_TEXT_CLASS[activeLog.status] ?? "text-text")
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

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* 4단계 범례는 표에 기록이 있을 때만 의미가 있어서, 비어 있으면 숨김 */}
        {rows.length > 0 && <StatusLegend />}

        {rows.length > 0 ? (
          <div className="min-h-0 flex-1">
            <RecordTable
              rows={rows}
              columns={COLUMNS}
              onRowClick={(row) => {
                setActiveLog(row);
                setDialogStep("action");
              }}
            />
          </div>
        ) : (
          <EmptyState
            icon={HeartPulse}
            message="이 달의 기록이 없어요"
            subMessage="혈압을 입력하면 여기에 나타나요"
            actionLabel="혈압 입력하기"
            onAction={() => navigate("/blood-pressure/manage")}
          />
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
        onConfirm={handleDelete}
      />

      <Toast show={showToast} message={toastMessage} variant={toastVariant} />

      <BottomNav active="bp" />
    </div>
  );
}

export default BloodPressureRecord;
