import { useState } from "react";
import {
  HeartPulse,
  Save,
  Calendar,
  Clock,
  Check,
  FileText,
} from "lucide-react";
import { useParams } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import Toast from "../components/Toast";
import BottomNav from "../components/BottomNav";
import useToastNavigate from "../hooks/useToastNavigate";
import { INITIAL_LOGS } from "../data/bloodPressureLogs";

function BloodPressureManage() {
  const { id } = useParams();
  const isEditMode = id !== undefined;
  const existingLog = isEditMode
    ? INITIAL_LOGS.find((log) => log.id === Number(id))
    : null;

  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
  const initialTime = existingLog?.time ?? defaultTime;
  const [initialHour, initialMinute] = initialTime.split(":");
  const initialDate = existingLog?.date ?? defaultDate;
  const [initialYear, initialMonth, initialDay] = initialDate.split("-");

  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [day, setDay] = useState(initialDay);
  const [period, setPeriod] = useState(
    Number(initialHour) >= 12 ? "오후" : "오전",
  );
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  const [systolic, setSystolic] = useState(existingLog?.systolic ?? "");
  const [diastolic, setDiastolic] = useState(existingLog?.diastolic ?? "");
  const [pulse, setPulse] = useState(existingLog?.pulse ?? "");
  const [memo, setMemo] = useState(existingLog?.memo ?? "");

  const {
    showToast,
    message,
    trigger: handleSave,
  } = useToastNavigate({
    message: isEditMode ? "수정했어요" : "저장했어요",
    to: "/blood-pressure",
  });

  return (
    <div
      className="theme-bp flex min-h-svh flex-col bg-page-bg"
    >
      <header className="fixed inset-x-0 top-0 z-10 mx-auto flex w-full max-w-[480px] items-center justify-between border-b-2 border-gray-200 bg-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <HeartPulse size={22} />
          </div>
          <h1 className="text-heading font-bold">
            {isEditMode ? "혈압 수정" : "혈압 입력"}
          </h1>
        </div>
        <Button
          py="py-1"
          px="px-6"
          shadow=""
          minH="min-h-11"
          onClick={() => handleSave()}
        >
          <Save size={18} />
          {isEditMode ? "수정하기" : "저장하기"}
        </Button>
      </header>

      <div className="flex flex-col divide-y-[6px] divide-white pb-26 pt-[100px]">
        <div className="flex items-center gap-3 px-6 pb-6">
          <span className="mr-2 flex items-center gap-1 text-lg font-bold text-text">
            <Calendar size={18} strokeWidth={3} className="text-primary" />
            날짜
          </span>
          <div className="flex flex-1 gap-2">
            <InputField
              placeholder="년"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <InputField
              placeholder="월"
              type="number"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <InputField
              placeholder="일"
              type="number"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-6">
          <span className="mr-2 flex items-center gap-1 text-lg font-bold text-text">
            <Clock size={18} strokeWidth={3} className="text-primary" />
            시간
          </span>
          <div className="flex flex-1 items-center gap-2">
            <div className="flex h-14 shrink-0 overflow-hidden rounded-lg border-2 border-primary">
              <button
                onClick={() => setPeriod("오전")}
                className={`px-3 text-body font-semibold transition ${
                  period === "오전"
                    ? "bg-primary text-white"
                    : "bg-surface text-primary"
                }`}
              >
                오전
              </button>
              <button
                onClick={() => setPeriod("오후")}
                className={`px-3 text-body font-semibold transition ${
                  period === "오후"
                    ? "bg-primary text-white"
                    : "bg-surface text-primary"
                }`}
              >
                오후
              </button>
            </div>
            <InputField
              placeholder="시간"
              type="number"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
            />
            <InputField
              placeholder="분"
              type="number"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-6">
          <InputField
            label="수축기"
            placeholder="130"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            icon={Check}
          />
          <InputField
            label="이완기"
            placeholder="80"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            icon={Check}
          />
          <InputField
            label="맥박수"
            placeholder="72"
            value={pulse}
            onChange={(e) => setPulse(e.target.value)}
            icon={Check}
          />
        </div>

        <div className="flex items-center gap-3 px-6 pt-6">
          <span className="mr-2 flex items-center gap-1 text-lg font-bold text-text">
            <FileText size={18} strokeWidth={3} className="text-primary" />
            비고
          </span>
          <InputField
            placeholder="메모를 남겨보세요"
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      </div>

      <Toast show={showToast} message={message} />

      <BottomNav active="bp" />
    </div>
  );
}

export default BloodPressureManage;
