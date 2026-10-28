import { useEffect, useState } from "react";
import { PillBottle, Plus, Save, Star, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import InputField from "../components/InputField";
import Textarea from "../components/Textarea";
import Button from "../components/Button";
import PhotoPicker from "../components/PhotoPicker";
import SegmentedToggle from "../components/SegmentedToggle";
import Toast from "../components/Toast";
import { isBlank, isIntInRange } from "../utils/formValidation";
import BottomNav from "../components/BottomNav";
import {
  createSupplement,
  getSupplementItem,
  getSupplementItemPhotoUrl,
  updateSupplement,
} from "../api/supplement";

const TIMING_OPTIONS = [
  { label: "공복", value: "공복" },
  { label: "식전", value: "식전" },
  { label: "식후", value: "식후" },
];

const STATUS_OPTIONS = [
  { label: "복용 중", value: false },
  { label: "중지", value: true },
];

function SupplementManage() {
  const { id } = useParams();
  const isEditMode = id !== undefined;

  const [name, setName] = useState("");
  const [timing, setTiming] = useState("식후");
  const [paused, setPaused] = useState(false);
  const [productName, setProductName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [nutritionInfo, setNutritionInfo] = useState("");
  const [description, setDescription] = useState("");
  // scheduleSeq는 기존 스케줄과 매칭하기 위한 값. 새로 추가한 시간은 null(신규로 처리)
  const [timeEntries, setTimeEntries] = useState([
    { scheduleSeq: null, period: "오전", hour: "", minute: "" },
  ]);

  const updateTimeEntry = (index, field, value) => {
    setTimeEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const addTimeEntry = () =>
    setTimeEntries((prev) => [
      ...prev,
      { scheduleSeq: null, period: "오전", hour: "", minute: "" },
    ]);

  const removeTimeEntry = (index) =>
    setTimeEntries((prev) => prev.filter((_, i) => i !== index));

  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const handleSelectPhoto = (file) => {
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };
  const handleRemovePhoto = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoFile(null);
    setPhotoUrl(null);
  };

  // 수정 모드면 상세 조회 API로 기존 값을 불러와 폼에 채워넣음
  useEffect(() => {
    if (!isEditMode) return;

    let objectUrl = null;

    getSupplementItem(id)
      .then((item) => {
        setName(item.name);
        setTiming(item.timing);
        setPaused(item.status === "중지");
        setProductName(item.product_name ?? "");
        setCompanyName(item.company_name ?? "");
        setNutritionInfo(item.nutrition_info ?? "");
        setDescription(item.description ?? "");
        setTimeEntries(
          item.schedules.map((schedule) => {
            const [hour, minute] = schedule.scheduled_time.split(":");
            return {
              scheduleSeq: schedule.supplement_schedule_seq,
              period: Number(hour) >= 12 ? "오후" : "오전",
              hour,
              minute,
            };
          }),
        );

        if (!item.photo_path) return;
        return getSupplementItemPhotoUrl(id).then((url) => {
          objectUrl = url;
          setPhotoUrl(url);
        });
      })
      .catch(() => {});

    // Blob URL은 브라우저 메모리에 남아있어서 화면을 벗어나면 직접 해제해줘야 함
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, isEditMode]);

  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });

  // 시각 입력(오전/오후 + 시 + 분)을 백엔드가 받는 "HH:MM:SS" 문자열로 변환
  const buildTimeString = (entry) => {
    let hour = Number(entry.hour) % 12;
    if (entry.period === "오후") hour += 12;
    const minute = Number(entry.minute) || 0;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  };

  // 등록 요청용: 시각 값만 배열로
  const buildScheduledTimes = () => timeEntries.map(buildTimeString);

  // 수정 요청용: 기존 스케줄과 매칭할 수 있게 scheduleSeq를 함께 보냄 (신규 시각은 null)
  const buildSchedules = () =>
    timeEntries.map((entry) => ({
      supplement_schedule_seq: entry.scheduleSeq,
      scheduled_time: buildTimeString(entry),
    }));

  const handleSaveSuccess = (message) => {
    setToast({ show: true, message, variant: "success" });
    setTimeout(() => navigate("/supplement/list"), 1000);
  };

  const handleSaveError = (message) => {
    setToast({ show: true, message, variant: "error" });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 1500);
  };

  const handleSave = async () => {
    // 저장 전에 필수값을 화면에서 먼저 확인해서 바로 안내 (서버도 같은 기준으로 한 번 더 검증함)
    if (isBlank(name)) {
      handleSaveError("명칭을 입력해 주세요");
      return;
    }
    if (timeEntries.some((entry) => isBlank(entry.hour) || isBlank(entry.minute))) {
      handleSaveError("복용 시간을 모두 입력해 주세요");
      return;
    }
    // 수정 화면은 기존 시각을 24시간제 시(예: 19)로 채우므로 시는 0~23까지 허용
    if (timeEntries.some((entry) => !isIntInRange(entry.hour, 0, 23) || !isIntInRange(entry.minute, 0, 59))) {
      handleSaveError("복용 시간을 올바르게 입력해 주세요");
      return;
    }

    const commonData = {
      name: name.trim(),
      timing,
      status: paused ? "중지" : "복용중",
      product_name: productName || null,
      company_name: companyName || null,
      nutrition_info: nutritionInfo || null,
      description: description || null,
    };

    try {
      if (isEditMode) {
        const data = { ...commonData, schedules: buildSchedules() };
        await updateSupplement(id, data, photoFile);
        handleSaveSuccess("수정했어요");
      } else {
        const data = { ...commonData, scheduled_times: buildScheduledTimes() };
        await createSupplement(data, photoFile);
        handleSaveSuccess("저장했어요");
      }
    } catch {
      handleSaveError(isEditMode ? "수정에 실패했어요" : "등록에 실패했어요");
    }
  };

  return (
    <div className="theme-supplement flex min-h-svh flex-col bg-page-bg">
      <header className="fixed inset-x-0 top-0 z-10 mx-auto flex w-full max-w-[480px] items-center justify-between border-b-2 border-gray-200 bg-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <PillBottle size={22} />
          </div>
          <h1 className="text-heading font-bold">
            {isEditMode ? "영양제 수정" : "영양제 추가"}
          </h1>
        </div>
        <Button py="py-1" px="px-6" shadow="" minH="min-h-11" onClick={() => handleSave()}>
          <Save size={18} />
          {isEditMode ? "수정하기" : "저장하기"}
        </Button>
      </header>

      <div className="flex flex-col divide-y-[6px] divide-white pb-26 pt-[100px]">
        <div className="px-6 pb-6">
          <InputField
            label="명칭"
            placeholder="오메가3"
            type="text"
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-[12px] px-6 py-6">
          <span className="ml-1 flex items-center gap-2 text-lg leading-none font-bold text-text">
            <Star size={16} className="fill-warning text-warning" />
            시간
            <span className="text-body leading-none font-normal text-warning">(필수)</span>
          </span>
          <div className="flex flex-col gap-4">
            {timeEntries.map((entry, index) => (
              <div key={index} className="flex items-end gap-3">
                <div className="flex h-14 shrink-0 overflow-hidden rounded-lg border-2 border-primary">
                  <button
                    onClick={() => updateTimeEntry(index, "period", "오전")}
                    className={`px-3 text-body font-semibold transition ${
                      entry.period === "오전"
                        ? "bg-primary text-white"
                        : "bg-surface text-primary"
                    }`}
                  >
                    오전
                  </button>
                  <button
                    onClick={() => updateTimeEntry(index, "period", "오후")}
                    className={`px-3 text-body font-semibold transition ${
                      entry.period === "오후"
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
                  value={entry.hour}
                  onChange={(e) =>
                    updateTimeEntry(index, "hour", e.target.value)
                  }
                />
                <InputField
                  placeholder="분"
                  type="number"
                  value={entry.minute}
                  onChange={(e) =>
                    updateTimeEntry(index, "minute", e.target.value)
                  }
                />
                {timeEntries.length > 1 && (
                  <button
                    onClick={() => removeTimeEntry(index)}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-warning bg-surface text-warning transition active:scale-[97.5%] active:bg-warning-bg"
                  >
                    <X size={22} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addTimeEntry}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-border bg-surface py-3 text-lg font-semibold text-text-muted transition active:scale-[97.5%]"
            >
              <Plus size={20} />
              시간 추가
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          <span className="text-lg leading-none font-bold">복용 방법</span>
          <div className="mt-2">
            <SegmentedToggle
              options={TIMING_OPTIONS}
              value={timing}
              onChange={setTiming}
            />
          </div>
        </div>

        <div className="px-6 py-6">
          <span className="text-lg leading-none font-bold">복용 상태</span>
          <div className="mt-2">
            <SegmentedToggle
              options={STATUS_OPTIONS}
              value={paused}
              onChange={setPaused}
            />
          </div>
        </div>

        <div className="px-6 py-6">
          <PhotoPicker
            label="사진 (참고용)"
            helperText="제품 사진 첨부하기"
            photoUrl={photoUrl}
            onSelect={handleSelectPhoto}
            onRemove={handleRemovePhoto}
          />
        </div>

        <div className="px-6 py-6">
          <InputField
            label="제품명"
            placeholder="프로메가 오메가3 1200mg"
            type="text"
            maxLength={50}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required={false}
          />
        </div>

        <div className="px-6 py-6">
          <InputField
            label="회사명"
            placeholder="종근당건강"
            type="text"
            maxLength={50}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required={false}
          />
        </div>

        <div className="px-6 py-6">
          <Textarea
            label="함량/영양정보"
            placeholder="주요 성분, 1회 섭취량 등"
            maxLength={500}
            value={nutritionInfo}
            onChange={(e) => setNutritionInfo(e.target.value)}
            required={false}
          />
        </div>

        <div className="px-6 pt-6">
          <Textarea
            label="설명"
            placeholder="효능, 주의사항 등"
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required={false}
          />
        </div>
      </div>

      <Toast show={toast.show} message={toast.message} variant={toast.variant} />

      <BottomNav active="supplement" />
    </div>
  );
}

export default SupplementManage;
