import { ClipboardList } from "lucide-react";
import BottomNav from "../components/BottomNav";

const ROWS = [
  { label: "저혈당", dot: "bg-low", fasting: "70 이하", postMeal: "70 이하" },
  { label: "정상", dot: "bg-text", fasting: "71~99", postMeal: "71~139" },
  { label: "주의", dot: "bg-caution", fasting: "100~125", postMeal: "140~199" },
  { label: "고혈당", dot: "bg-warning", fasting: "126 이상", postMeal: "200 이상" },
];

function BloodSugarReference() {
  return (
    <div
      className="theme-glucose flex min-h-svh flex-col bg-page-bg"
    >
      <header className="fixed inset-x-0 top-0 z-10 mx-auto flex w-full max-w-[480px] items-center gap-3 border-b-2 border-gray-200 bg-surface px-6 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <ClipboardList size={22} />
        </div>
        <h1 className="text-heading font-bold">혈당 기준표</h1>
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
                <th className="px-1 py-2 font-semibold">공복</th>
                <th className="px-1 py-2 pr-3 font-semibold">식후 2시간</th>
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
                  <td className="px-1 py-4 text-text-muted">{row.fasting}</td>
                  <td className="px-1 py-4 pr-3 text-text-muted">{row.postMeal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BottomNav active="glucose" />
    </div>
  );
}

export default BloodSugarReference;
