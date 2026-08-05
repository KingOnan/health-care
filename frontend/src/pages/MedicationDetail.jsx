import {
  Pill,
  Pencil,
  Image as ImageIcon,
  Tag,
  ClipboardList,
  Package,
  Building2,
  FlaskConical,
  Clock,
  Utensils,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import Button from "../components/Button";
import { INITIAL_ITEMS } from "../data/medicationItems";

// "08:00" -> 오전은 주황, 오후는 파랑으로 강조하고, 시간표처럼 행 사이에 구분선을 넣어 보여줌
const formatScheduledTime = (time, key, isFirst, isLast) => {
  const hour = Number(time.slice(0, 2));
  const isAm = hour < 12;
  return (
    <span
      key={key}
      className={`grid grid-cols-[3.5rem_auto] ${isFirst ? "pt-0" : "pt-2"} ${
        isLast ? "pb-0" : "pb-2 border-b border-gray-200"
      }`}
    >
      <span className={isAm ? "text-orange-500" : "text-blue-500"}>
        {isAm ? "오전" : "오후"}
      </span>
      <span>{time.slice(0, 5)}</span>
    </span>
  );
};

const ROW_ICONS = {
  명칭: Tag,
  구분: ClipboardList,
  제품명: Package,
  회사명: Building2,
  "함량/영양정보": FlaskConical,
  "예정 시각": Clock,
  "복용 방법": Utensils,
  "복용 상태": CheckCircle2,
  설명: FileText,
};

function MedicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = INITIAL_ITEMS.find((i) => i.id === Number(id));

  if (!item) return null;

  const rows = [
    ["명칭", item.name],
    ["구분", item.isPrescription ? "병원 처방약" : "일반의약품"],
    ...(item.isPrescription
      ? []
      : [
          ["제품명", item.productName ?? "노바스크정 5mg"],
          ["회사명", item.companyName ?? "한국화이자제약"],
          [
            "함량/영양정보",
            item.nutritionInfo ?? "암로디핀베실산염 5mg",
          ],
        ]),
    [
      "예정 시각",
      item.times?.map((t, i, arr) =>
        formatScheduledTime(t, i, i === 0, i === arr.length - 1),
      ),
    ],
    ["복용 방법", item.timing ?? "식후"],
    ["복용 상태", item.paused ? "중지" : "복용 중"],
    [
      "설명",
      item.description ?? "고혈압 치료에 사용되는 칼슘채널차단제예요.",
    ],
  ];

  return (
    <div
      className="theme-medication flex min-h-svh flex-col bg-page-bg"
    >
      <header className="fixed inset-x-0 top-0 z-10 mx-auto flex w-full max-w-[480px] items-center justify-between border-b-2 border-gray-200 bg-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Pill size={22} />
          </div>
          <h1 className="text-heading font-bold">약 상세</h1>
        </div>
        <Button
          py="py-1"
          px="px-6"
          shadow=""
          minH="min-h-11"
          bg="bg-surface"
          text="text-primary"
          className="border-2 border-primary"
          onClick={() => navigate(`/medication/manage/${item.id}`)}
        >
          <Pencil size={18} />
          수정하기
        </Button>
      </header>

      <div className="flex flex-col divide-y-[6px] divide-white pb-26 pt-[100px]">
        <div className="px-6 pb-6">
          {item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt=""
              className="h-48 w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-xl bg-surface text-text-muted">
              <ImageIcon size={40} />
            </div>
          )}
        </div>

        {rows.map(([label, value], i) => {
          const Icon = ROW_ICONS[label];
          return (
            <div
              key={label}
              className={`flex flex-col gap-2 px-6 ${
                i === rows.length - 1 ? "pt-6" : "py-6"
              }`}
            >
              <span className="flex items-center gap-2 text-lg font-bold text-text-muted">
                {Icon && <Icon size={20} strokeWidth={3} className="text-primary" />}
                {label}
              </span>
              <div className="rounded-xl border-t border-r border-b border-l-[6px] border-l-border border-t-gray-300 border-r-gray-300 border-b-gray-300 bg-surface px-4 py-3">
                <span className="text-lg font-medium whitespace-pre-wrap text-text">
                  {value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav active="medication" />
    </div>
  );
}

export default MedicationDetail;
