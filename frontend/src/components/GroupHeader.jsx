import { Sunrise, Sun, Sunset, Moon } from "lucide-react";

const GROUP_ICONS = {
  아침: Sunrise,
  점심: Sun,
  저녁: Sunset,
  밤: Moon,
};

function GroupHeader({ group, completedCount, totalCount, bg = "bg-[#18404d]" }) {
  const Icon = GROUP_ICONS[group];

  return (
    <div
      className={`flex w-full items-center justify-between rounded-xl ${bg} px-4 py-2 text-white`}
    >
      <div className="flex items-center gap-2">
        <Icon size={20} />
        <span className="text-lg font-bold">{group}</span>
      </div>
      <span className="text-body font-semibold text-white">
        {completedCount}/{totalCount} 완료
      </span>
    </div>
  );
}

export default GroupHeader;
