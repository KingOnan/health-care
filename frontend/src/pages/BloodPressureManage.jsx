import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import { isIntInRange, isValidDate } from "../utils/formValidation";
import BottomNav from "../components/BottomNav";
import useToastNavigate from "../hooks/useToastNavigate";
import { createBloodPressure, getBloodPressure, updateBloodPressure } from "../api/bloodPressure";

// 입력 허용 범위 (서버 스키마와 같은 값) — 가정용 혈압계가 표시할 수 있는 값은 막지 않음
const SYSTOLIC_RANGE = [50, 299];
const DIASTOLIC_RANGE = [30, 250];
const PULSE_RANGE = [30, 200];
const MEMO_MAX_LENGTH = 100;

// 빈 칸이거나 정수가 아니거나 범위 밖이면 false
function isInRange(text, [min, max]) {
  const n = Number(text);
  return text !== "" && Number.isInteger(n) && n >= min && n <= max;
}

// "오전"/"오후" + 12시간제 시각을 24시간제 시(0~23)로 변환
function to24Hour(period, hour12) {
  const h = Number(hour12) % 12;
  return period === "오후" ? h + 12 : h;
}

function BloodPressureManage() {
  const { id } = useParams();
  const isEditMode = id !== undefined;

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
  // 수정 모드에선 기존 값을 다 받아오기 전까지 폼을 그리지 않음 (초기값인 현재 시각이 잠깐 보였다 바뀌는 것 방지)
  const [isLoaded, setIsLoaded] = useState(!isEditMode);

  // 수정 모드면 상세 조회 API로 기존 값을 불러와 폼에 채워넣음
  useEffect(() => {
    if (!isEditMode) return;

    getBloodPressure(id)
      .then((item) => {
        // "2026-10-01T07:30:00" -> 날짜/시각 입력칸 값으로 분해
        const [datePart, timePart] = item.measured_at.split("T");
        const [y, m, d] = datePart.split("-");
        const [h, min] = timePart.split(":");
        const hour24 = Number(h);

        setYear(y);
        setMonth(m);
        setDay(d);
        setPeriod(hour24 >= 12 ? "오후" : "오전");
        setHour(String(hour24 % 12 === 0 ? 12 : hour24 % 12).padStart(2, "0"));
        setMinute(min);
        setSystolic(String(item.systolic));
        setDiastolic(String(item.diastolic));
        setPulse(String(item.pulse));
        setMemo(item.memo ?? "");
        setIsLoaded(true);
      })
      .catch(() => {});
  }, [id, isEditMode]);

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
    if (!isLoaded) return;

    // 저장 전에 화면에서 먼저 확인해서 바로 안내 (서버도 같은 기준으로 한 번 더 검증함)
    if (!isValidDate(yearInput, monthInput, dayInput)) {
      handleSave("날짜를 올바르게 입력해 주세요", "error");
      return;
    }
    if (!isIntInRange(hour, 1, 12) || !isIntInRange(minute, 0, 59)) {
      handleSave("시간을 올바르게 입력해 주세요", "error");
      return;
    }
    // 수축기 → 이완기 → 맥박 순서로 하나씩 확인해서, 어느 칸이 문제인지 바로 알 수 있게 안내
    if (systolic === "") {
      handleSave("수축기를 입력해 주세요", "error");
      return;
    }
    if (!isInRange(systolic, SYSTOLIC_RANGE)) {
      handleSave(`수축기는 ${SYSTOLIC_RANGE[0]}~${SYSTOLIC_RANGE[1]} 사이로 입력해 주세요`, "error");
      return;
    }
    if (diastolic === "") {
      handleSave("이완기를 입력해 주세요", "error");
      return;
    }
    if (!isInRange(diastolic, DIASTOLIC_RANGE)) {
      handleSave(`이완기는 ${DIASTOLIC_RANGE[0]}~${DIASTOLIC_RANGE[1]} 사이로 입력해 주세요`, "error");
      return;
    }
    if (pulse === "") {
      handleSave("맥박을 입력해 주세요", "error");
      return;
    }
    if (!isInRange(pulse, PULSE_RANGE)) {
      handleSave(`맥박은 ${PULSE_RANGE[0]}~${PULSE_RANGE[1]} 사이로 입력해 주세요`, "error");
      return;
    }
    if (Number(diastolic) >= Number(systolic)) {
      handleSave("이완기는 수축기보다 낮아야 해요\n두 값이 바뀌지 않았는지 확인해 주세요", "error");
      return;
    }

    const hour24 = to24Hour(period, hour);
    const measuredAt = `${yearInput}-${String(monthInput).padStart(2, "0")}-${String(dayInput).padStart(
      2,
      "0",
    )}T${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;

    const data = {
      measured_at: measuredAt,
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      pulse: Number(pulse),
      memo: memo || null,
    };

    try {
      if (isEditMode) {
        await updateBloodPressure(id, data);
        handleSave("수정했어요");
      } else {
        await createBloodPressure(data);
        handleSave();
      }
    } catch {
      handleSave(isEditMode ? "수정에 실패했어요" : "저장에 실패했어요", "error");
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
          <h1 className="text-heading font-bold">{isEditMode ? "혈압 수정" : "혈압 입력"}</h1>
        </div>
        <Button
          py="py-1"
          px="px-6"
          shadow=""
          minH="min-h-11"
          onClick={handleSubmit}
        >
          <Save size={18} />
          {isEditMode ? "수정하기" : "저장하기"}
        </Button>
      </header>

      {isLoaded && (
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
              maxLength={MEMO_MAX_LENGTH}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </div>
      )}

      <Toast show={showToast} message={message} variant={variant} />

      <BottomNav active="bp" />
    </div>
  );
}

export default BloodPressureManage;
