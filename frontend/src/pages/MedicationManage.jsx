import { useState } from "react";
import { Pill, Plus, Save, Star, X } from "lucide-react";
import { useParams } from "react-router-dom";
import InputField from "../components/InputField";
import Textarea from "../components/Textarea";
import Button from "../components/Button";
import PhotoPicker from "../components/PhotoPicker";
import SegmentedToggle from "../components/SegmentedToggle";
import Toast from "../components/Toast";
import BottomNav from "../components/BottomNav";
import useToastNavigate from "../hooks/useToastNavigate";
import { INITIAL_ITEMS } from "../data/medicationItems";

const TIMING_OPTIONS = [
  { label: "공복", value: "공복" },
  { label: "식전", value: "식전" },
  { label: "식후", value: "식후" },
];

const STATUS_OPTIONS = [
  { label: "복용 중", value: false },
  { label: "중지", value: true },
];

const PRESCRIPTION_OPTIONS = [
  { label: "일반의약품", value: false },
  { label: "병원 처방약", value: true },
];

function MedicationManage() {
  const { id } = useParams();
  const isEditMode = id !== undefined;
  const existingItem = isEditMode
    ? INITIAL_ITEMS.find((item) => item.id === Number(id))
    : null;

  const [name, setName] = useState(existingItem?.name ?? "");
  const [timing, setTiming] = useState(existingItem?.timing ?? "식후");
  const [paused, setPaused] = useState(existingItem?.paused ?? false);
  const [isPrescription, setIsPrescription] = useState(
    existingItem?.isPrescription ?? false,
  );
  const [timeEntries, setTimeEntries] = useState(
    existingItem?.times?.length
      ? existingItem.times.map((t) => {
          const [hour, minute] = t.split(":");
          return { period: Number(hour) >= 12 ? "오후" : "오전", hour, minute };
        })
      : [{ period: "오전", hour: "", minute: "" }],
  );

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
      { period: "오전", hour: "", minute: "" },
    ]);

  const removeTimeEntry = (index) =>
    setTimeEntries((prev) => prev.filter((_, i) => i !== index));

  const [photoUrl, setPhotoUrl] = useState(null);
  const handleSelectPhoto = (file) => setPhotoUrl(URL.createObjectURL(file));
  const handleRemovePhoto = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
  };

  const {
    showToast,
    message,
    trigger: handleSave,
  } = useToastNavigate({
    message: isEditMode ? "수정했어요" : "저장했어요",
    to: "/medication/list",
  });

  return (
    <div
      className="theme-medication flex min-h-svh flex-col bg-page-bg"
    >
      <header className="fixed inset-x-0 top-0 z-10 mx-auto flex w-full max-w-[480px] items-center justify-between border-b-2 border-gray-200 bg-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Pill size={22} />
          </div>
          <h1 className="text-heading font-bold">
            {isEditMode ? "약 수정" : "약 추가"}
          </h1>
        </div>
        <Button py="py-1" px="px-6" shadow="" minH="min-h-11" onClick={() => handleSave()}>
          <Save size={18} />
          {isEditMode ? "수정하기" : "저장하기"}
        </Button>
      </header>

      <div className="flex flex-col divide-y-[6px] divide-white pb-26 pt-[100px]">
        <div className="px-6 pb-6">
          <span className="text-lg leading-none font-bold">구분</span>
          <div className="mt-2">
            <SegmentedToggle
              options={PRESCRIPTION_OPTIONS}
              value={isPrescription}
              onChange={setIsPrescription}
            />
          </div>
        </div>

        <div className="px-6 py-6">
          <InputField
            label="명칭"
            placeholder="혈압약"
            type="text"
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
            label={isPrescription ? "처방봉지 사진 (참고용)" : "사진으로 자동 입력"}
            helperText={
              isPrescription ? "처방봉지 사진 첨부하기" : "사진 찍고 자동으로 채우기"
            }
            photoUrl={photoUrl}
            onSelect={handleSelectPhoto}
            onRemove={handleRemovePhoto}
            requireConfirm={isPrescription}
            confirmMessage="개인정보(이름, 병원명 등)가 보이지 않게 찍어주세요."
          />
        </div>

        {!isPrescription && (
          <>
            <div className="px-6 py-6">
              <InputField
                label="제품명"
                placeholder="노바스크정 5mg"
                type="text"
                required={false}
              />
            </div>
            <div className="px-6 py-6">
              <InputField
                label="회사명"
                placeholder="한국화이자제약"
                type="text"
                required={false}
              />
            </div>
            <div className="px-6 py-6">
              <Textarea
                label="함량/영양정보"
                placeholder="주요 성분, 1회 복용량 등"
                required={false}
              />
            </div>
          </>
        )}

        <div className="px-6 pt-6">
          <Textarea label="설명" placeholder="효능, 주의사항 등" required={false} />
        </div>
      </div>

      <Toast show={showToast} message={message} />

      <BottomNav active="medication" />
    </div>
  );
}

export default MedicationManage;
