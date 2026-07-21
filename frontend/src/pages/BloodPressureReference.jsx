import { ClipboardList } from "lucide-react";
import BottomNav from "../components/BottomNav";

const ROWS = [
  { label: "저혈압", dot: "bg-low", systolic: "90 미만", diastolic: "60 미만" },
  { label: "정상", dot: "bg-text", systolic: "90~119", diastolic: "60~79" },
  { label: "주의", dot: "bg-caution", systolic: "120~139", diastolic: "80~89" },
  { label: "고혈압", dot: "bg-warning", systolic: "140 이상", diastolic: "90 이상" },
];

function BloodPressureReference() {
  return (
    <div
      className="theme-bp flex min-h-svh flex-col bg-page-bg"
    >
      <header className="fixed inset-x-0 top-0 z-10 mx-auto flex w-full max-w-[480px] items-center gap-3 border-b-2 border-gray-200 bg-surface px-6 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <ClipboardList size={22} />
        </div>
        <h1 className="text-heading font-bold">혈압 기준표</h1>
      </header>

      <div className="flex flex-col gap-4 p-6 pt-[100px] pb-26">
        <div className="overflow-hidden rounded-xl border-2 border-primary">
          <table className="w-full table-fixed text-lg">
            <colgroup>
              <col className="w-[30.5%]" />
              <col className="w-[34.5%]" />
              <col className="w-[34.5%]" />
            </colgroup>
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-3 py-2 font-semibold">단계</th>
                <th className="px-1 py-2 font-semibold">수축기</th>
                <th className="px-1 py-2 pr-3 font-semibold">이완기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/30 bg-surface text-center">
              {ROWS.map((row) => (
                <tr key={row.label}>
                  <td className="px-3 py-4">
                    <span className="flex items-center justify-center gap-2 font-bold text-text">
                      <span className={`h-3.5 w-3.5 shrink-0 rounded-full ${row.dot}`} />
                      {row.label}
                    </span>
                  </td>
                  <td className="px-1 py-4 text-text-muted">{row.systolic}</td>
                  <td className="px-1 py-4 pr-3 text-text-muted">{row.diastolic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BottomNav active="bp" />
    </div>
  );
}

export default BloodPressureReference;
