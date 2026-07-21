import { ChevronDown } from "lucide-react";
import { STATUS_TEXT_CLASS } from "../utils/statusColor";

function RecordTable({ rows, columns, onRowClick }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border-2 border-primary">
      <div className="flex-1 overflow-y-auto">
        <table className="w-full table-fixed text-lg">
          <colgroup>
            {columns.map((col) => (
              <col key={col.key} className={col.width} />
            ))}
          </colgroup>
          <thead className="sticky top-0">
            <tr className="bg-primary text-white">
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  onClick={col.onHeaderClick}
                  className={`whitespace-nowrap px-1 py-1.5 font-semibold ${
                    col.onHeaderClick
                      ? "cursor-pointer underline decoration-dotted underline-offset-4"
                      : ""
                  } ${i === columns.length - 1 ? "pr-3" : ""}`}
                >
                  <span className="flex items-center justify-center gap-0.5">
                    {col.label}
                    {col.onHeaderClick && <ChevronDown size={16} strokeWidth={3} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-surface text-center">
            {rows.map((row, i) => {
              // 저혈압/정상/주의/고혈압 판정은 항상 코드가 계산해서 status로 넘겨준다 — 여기서는 색만 매핑
              const statusClass = STATUS_TEXT_CLASS[row.status] ?? "text-text";
              return (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  className={`${onRowClick ? "cursor-pointer active:bg-page-bg" : ""} ${
                    i < rows.length - 1 ? "border-b border-primary" : ""
                  }`}
                >
                  {columns.map((col, ci) => (
                    <td
                      key={col.key}
                      className={`whitespace-nowrap px-1 py-2 ${
                        col.statusColored ? `font-bold ${statusClass}` : ""
                      } ${ci === columns.length - 1 ? "pr-3" : ""}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecordTable;
