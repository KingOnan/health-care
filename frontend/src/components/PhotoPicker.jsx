import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

function PhotoPicker({
  label,
  helperText = "사진 촬영하기",
  photoUrl,
  onSelect,
  onRemove,
  requireConfirm = false,
  confirmMessage,
}) {
  const inputRef = useRef(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const handleTrigger = () => {
    if (requireConfirm) {
      setShowConfirm(true);
    } else {
      openPicker();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-lg leading-none font-bold">{label}</span>
      {photoUrl ? (
        <div className="relative">
          <img
            src={photoUrl}
            alt=""
            className="h-40 w-full rounded-xl object-cover"
          />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-warning bg-surface text-warning transition active:scale-95 active:bg-warning-bg"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleTrigger}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface text-text-muted transition active:scale-[97.5%]"
        >
          <Camera size={28} />
          <span className="text-body font-semibold">{helperText}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = "";
        }}
      />

      {requireConfirm && (
        <ConfirmDialog
          open={showConfirm}
          title="촬영 전 확인"
          message={confirmMessage}
          confirmLabel="촬영하기"
          tone="primary"
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false);
            openPicker();
          }}
        />
      )}
    </div>
  );
}

export default PhotoPicker;
