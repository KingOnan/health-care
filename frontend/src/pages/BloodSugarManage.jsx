import { useEffect, useState } from "react";
import { Droplet, Save, Calendar, Clock, FileText } from "lucide-react";
import { useParams } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import SegmentedToggle from "../components/SegmentedToggle";
import Toast from "../components/Toast";
import BottomNav from "../components/BottomNav";
import useToastNavigate from "../hooks/useToastNavigate";
import { createBloodSugar, getBloodSugar, updateBloodSugar } from "../api/bloodSugar";
import { getToken } from "../utils/user";

const TIMING_OPTIONS = [
  { label: "공복", value: "공복" },
  { label: "식후 2시간", value: "식후 2시간" },
];

// 입력 허용 범위 (서버 스키마와 같은 값) — 가정용 혈당측정기의 측정 범위
const GLUCOSE_RANGE = [20, 600];
const MEMO_MAX_LENGTH = 100;

// "오전"/"오후" + 12시간제 시각을 24시간제 시(0~23)로 변환
function to24Hour(period, hour12) {
  const h = Number(hour12) % 12;
  return period === "오후" ? h + 12 : h;
}

function BloodSugarManage() {
  const { id } = useParams();
  const isEditMode = id !== undefined;

  // 등록 화면은 오늘 날짜·현재 시각으로 미리 채움 (수정 화면은 아래에서 기존 값으로 덮어씀)
  const now = new Date();
  const hour24Now = now.getHours();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [day, setDay] = useState(String(now.getDate()).padStart(2, "0"));
  const [period, setPeriod] = useState(hour24Now >= 12 ? "오후" : "오전");
  const [hour, setHour] = useState(String(hour24Now % 12 === 0 ? 12 : hour24Now % 12).padStart(2, "0"));
  const [minute, setMinute] = useState(String(now.getMinutes()).padStart(2, "0"));
  const [timing, setTiming] = useState("공복");
  const [value, setValue] = useState("");
  const [memo, setMemo] = useState("");
  // 수정 모드에선 기존 값을 다 받아오기 전까지 폼을 그리지 않음 (초기값인 현재 시각이 잠깐 보였다 바뀌는 것 방지)
  const [isLoaded, setIsLoaded] = useState(!isEditMode);

  // 수정 모드면 상세 조회 API로 기존 값을 불러와 폼에 채워넣음
  useEffect(() => {
    if (!isEditMode) return;

    getBloodSugar(id, getToken())
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
        setTiming(item.check_timing);
        setValue(String(item.glucose_value));
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
    to: "/blood-sugar",
  });

  const handleSubmit = async () => {
    if (!isLoaded) return;

    // 저장 전에 화면에서 먼저 확인해서 바로 안내 (서버도 같은 기준으로 한 번 더 검증함)
    const glucose = Number(value);
    if (value === "") {
      handleSave("혈당 수치를 입력해 주세요", "error");
      return;
    }
    if (!Number.isInteger(glucose) || glucose < GLUCOSE_RANGE[0] || glucose > GLUCOSE_RANGE[1]) {
      handleSave(`혈당 수치는 ${GLUCOSE_RANGE[0]}~${GLUCOSE_RANGE[1]} 사이로 입력해 주세요`, "error");
      return;
    }

    const hour24 = to24Hour(period, hour);
    const measuredAt = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0",
    )}T${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;

    const data = {
      measured_at: measuredAt,
      check_timing: timing,
      glucose_value: glucose,
      memo: memo || null,
    };

    try {
      if (isEditMode) {
        await updateBloodSugar(id, data, getToken());
        handleSave("수정했어요");
      } else {
        await createBloodSugar(data, getToken());
        handleSave();
      }
    } catch {
      handleSave(isEditMode ? "수정에 실패했어요" : "저장에 실패했어요", "error");
    }
  };

  return (
    <div
      className="theme-glucose flex min-h-svh flex-col bg-page-bg"
    >
      <header className="fixed inset-x-0 top-0 z-10 mx-auto flex w-full max-w-[480px] items-center justify-between border-b-2 border-gray-200 bg-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Droplet size={22} />
          </div>
          <h1 className="text-heading font-bold">
            {isEditMode ? "혈당 수정" : "혈당 입력"}
          </h1>
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

          <div className="px-6 py-6">
            <span className="text-lg leading-none font-bold">측정 시기</span>
            <div className="mt-2">
              <SegmentedToggle options={TIMING_OPTIONS} value={timing} onChange={setTiming} />
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-6">
            <span className="mr-2 flex items-center gap-1 text-lg font-bold text-text">
              <Droplet size={18} strokeWidth={3} className="text-primary" />
              혈당 수치
            </span>
            <InputField
              placeholder="90"
              value={value}
              onChange={(e) => setValue(e.target.value)}
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

      <BottomNav active="glucose" />
    </div>
  );
}

export default BloodSugarManage;
