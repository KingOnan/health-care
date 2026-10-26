import { useEffect, useState } from "react";
import { Droplet, ClipboardList, Bot } from "lucide-react";
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
import { deleteBloodSugar, getBloodSugarList } from "../api/bloodSugar";
import { levelToStatus } from "../utils/glucoseStatus";
import { STATUS_TEXT_CLASS } from "../utils/statusColor";

const TIMING_FILTER_OPTIONS = ["전체", "공복", "식후 2시간"];

// "2026-09-15T09:00:00" -> { date: "09/15", time: "09:00" }
function splitMeasuredAt(measuredAt) {
  const [datePart, timePart] = measuredAt.split("T");
  const [, m, d] = datePart.split("-");
  return { date: `${m}/${d}`, time: timePart.slice(0, 5) };
}

function BloodSugarRecord() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [logs, setLogs] = useState([]);
  const [activeLog, setActiveLog] = useState(null);
  const [dialogStep, setDialogStep] = useState("none"); // "none" | "action" | "confirm"
  const [timingFilter, setTimingFilter] = useState("전체");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  useBackToClose(showFilterDialog, () => setShowFilterDialog(false));
  useBackToClose(dialogStep !== "none", () => setDialogStep("none"));

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  // 시기 필터는 서버에 check_timing 파라미터로 넘겨서 걸러 받음 (정렬도 서버가 최신순으로 해서 내려줌)
  useEffect(() => {
    const checkTiming = timingFilter === "전체" ? null : timingFilter;
    getBloodSugarList(year, month, checkTiming)
      .then(setLogs)
      .catch(() => setLogs([]));
  }, [year, month, timingFilter]);

  const rows = logs.map((log) => {
    const { date, time } = splitMeasuredAt(log.measured_at);
    return {
      id: log.blood_sugar_seq,
      date,
      time,
      timing: log.check_timing,
      value: log.glucose_value,
      memo: log.memo,
      status: levelToStatus(log.level),
    };
  });

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
    {
      key: "timing",
      label: timingFilter === "전체" ? "시기" : timingFilter.replace(" 2시간", ""),
      width: "w-[6rem]",
      onHeaderClick: () => setShowFilterDialog(true),
      render: (row) => row.timing.replace(" 2시간", ""),
    },
    { key: "value", label: "수치", width: "w-[6.2rem]", statusColored: true },
  ];

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
      await deleteBloodSugar(activeLog.id);
      setLogs((prev) => prev.filter((log) => log.blood_sugar_seq !== activeLog.id));
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
            <th className="px-2 py-1.5 font-semibold">시기</th>
            <th className="px-2 py-1.5 font-semibold">수치 (mg/dL)</th>
          </tr>
        </thead>
        <tbody className="bg-surface">
          <tr>
            <td className="px-2 py-2 font-bold text-text">{activeLog.timing}</td>
            <td className={`px-2 py-2 font-bold ${activeStatusClass}`}>{activeLog.value}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      className="theme-glucose flex h-svh flex-col gap-3 overflow-hidden px-3 pt-22 pb-23"
    >
      <TopTabs
        active="record"
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
      <MonthSelector
        year={year}
        month={month}
        onPrev={goPrevMonth}
        onNext={goNextMonth}
        disableNext={isCurrentMonth}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* 4단계 범례는 표에 기록이 있을 때만 의미가 있어서, 비어 있으면 숨김 */}
        {rows.length > 0 && <StatusLegend lowLabel="저혈당" highLabel="고혈당" />}

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
          <>
            {/* 시기 필터 결과가 비어도 헤더(필터 버튼)는 남겨둬야 다른 시기로 다시 바꿀 수 있음 */}
            {timingFilter !== "전체" && (
              <div>
                <RecordTable rows={[]} columns={COLUMNS} />
              </div>
            )}
            <EmptyState
              icon={Droplet}
              message={timingFilter === "전체" ? "이 달의 기록이 없어요" : "해당 시기의 기록이 없어요"}
              subMessage="혈당을 입력하면 여기에 나타나요"
              actionLabel="혈당 입력하기"
              onAction={() => navigate("/blood-sugar/manage")}
            />
          </>
        )}
      </div>

      {showFilterDialog && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowFilterDialog(false)}
          />
          <div className="fixed inset-0 z-50 m-auto flex h-fit w-[85%] max-w-sm flex-col gap-6 rounded-2xl bg-surface p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-center text-2xl font-semibold text-text">
              측정 시기 선택
            </h2>
            <div className="flex flex-col gap-3">
              {TIMING_FILTER_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setTimingFilter(option);
                    setShowFilterDialog(false);
                  }}
                  className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl text-lg font-bold transition active:scale-[97.5%] ${
                    timingFilter === option
                      ? "bg-primary text-white"
                      : "border-2 border-primary bg-surface text-primary"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <RowActionDialog
        open={dialogStep === "action"}
        manageHistory={false}
        title={activeLogTitle}
        details={activeLogDetails}
        memo={activeLog?.memo ?? ""}
        onEdit={() => navigate(`/blood-sugar/manage/${activeLog.id}`)}
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

      <BottomNav active="glucose" />
    </div>
  );
}

export default BloodSugarRecord;
