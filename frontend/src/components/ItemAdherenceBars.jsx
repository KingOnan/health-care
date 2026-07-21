function ItemAdherenceBars({ items }) {
  const sorted = [...items].sort((a, b) => a.percent - b.percent);

  return (
    <div className="flex flex-col divide-y divide-primary/30 rounded-xl border-2 border-primary bg-surface p-4">
      {sorted.map((item) => (
        <div key={item.name} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
          <span className="w-28 shrink-0 truncate rounded-full bg-primary/15 px-3 py-1 text-center text-body font-semibold text-text">
            {item.name}
          </span>
          <div className="h-8 flex-1 overflow-hidden rounded-full bg-gray-200">
            <div
              className="flex h-full items-center justify-start rounded-full bg-primary pl-3"
              style={{ width: `${item.percent}%` }}
            >
              <span className="text-body font-bold text-white">
                {item.percent}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ItemAdherenceBars;
