import { useState } from "react";
import {
  HeartPulse,
  Save,
  Calendar,
  Clock,
  Check,
  FileText,
} from "lucide-react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import Toast from "../components/Toast";
import BottomNav from "../components/BottomNav";
import useToastNavigate from "../hooks/useToastNavigate";
import { createBloodPressure } from "../api/bloodPressure";
import { getToken } from "../utils/user";

// "오전"/"오후" + 12시간제 시각을 24시간제 시(0~23)로 변환
function to24Hour(period, hour12) {
  const h = Number(hour12) % 12;
  return period === "오후" ? h + 12 : h;
}

function BloodPressureManage() {
  const now = new Date();
  const defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const defaultHour24 = now.getHours();
  const defaultPeriod = defaultHour24 >= 12 ? "오후" : "오전";
  const defaultHour12 = defaultHour24 % 12 === 0 ? 12 : defaultHour24 % 12;

  const [year, month, day] = defaultDate.split("-");
  const [yearInput, setYear] = useState(year);
  const [monthInput, setMonth] = useState(month);
  const [dayInput, setDay] = useState(day);
  const [period, setPeriod] = useState(defaultPeriod);
  const [hour, setHour] = useState(String(defaultHour12).padStart(2, "0"));
  const [minute, setMinute] = useState(String(now.getMinutes()).padStart(2, "0"));
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [memo, setMemo] = useState("");

  const {
    showToast,
    message,
    variant,
    trigger: handleSave,
  } = useToastNavigate({
    message: "저장했어요",
    to: "/blood-pressure",
  });

  const handleSubmit = async () => {
    const hour24 = to24Hour(period, hour);
    const measuredAt = `${yearInput}-${String(monthInput).padStart(2, "0")}-${String(dayInput).padStart(
      2,
      "0",
    )}T${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;

    try {
      await createBloodPressure(
        {
          measured_at: measuredAt,
          systolic: Number(systolic),
          diastolic: Number(diastolic),
          pulse: Number(pulse),
          memo: memo || null,
        },
        getToken(),
      );
      handleSave();
    } catch {
      handleSave("저장에 실패했어요", "error");
    }
  };

  return (
    <div
      className="theme-bp flex min-h-svh flex-col bg-page-bg"
    >
      <header className="fixed inset-x-0 top-0 z-10 mx-auto flex w-full max-w-[480px] items-center justify-between border-b-2 border-gray-200 bg-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <HeartPulse size={22} />
          </div>
          <h1 className="text-heading font-bold">혈압 입력</h1>
        </div>
        <Button
          py="py-1"
          px="px-6"
          shadow=""
          minH="min-h-11"
          onClick={handleSubmit}
        >
          <Save size={18} />
          저장하기
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
              value={yearInput}
              onChange={(e) => setYear(e.target.value)}
            />
            <InputField
              placeholder="월"
              type="number"
              value={monthInput}
              onChange={(e) => setMonth(e.target.value)}
            />
            <InputField
              placeholder="일"
              type="number"
              value={dayInput}
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

      <Toast show={showToast} message={message} variant={variant} />

      <BottomNav active="bp" />
    </div>
  );
}

export default BloodPressureManage;
