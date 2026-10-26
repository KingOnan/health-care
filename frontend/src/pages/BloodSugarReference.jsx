import { ClipboardList, Droplet, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import AddMenuButton from "../components/AddMenuButton";

const ROWS = [
  { label: "저혈당", badge: "bg-low/10 text-low border-low/50", fasting: "70 미만", postMeal: "70 미만" },
  { label: "정 상", badge: "bg-text/5 text-text border-text/50", fasting: "70 ~ 99", postMeal: "70 ~ 139" },
  { label: "주 의", badge: "bg-caution/10 text-caution border-caution/50", fasting: "100 ~ 125", postMeal: "140 ~ 199" },
  { label: "고혈당", badge: "bg-warning/10 text-warning border-warning/50", fasting: "126 이상", postMeal: "200 이상" },
];

function BloodSugarReference() {
  const navigate = useNavigate();

  return (
    <div
      className="theme-glucose flex min-h-svh flex-col bg-page-bg"
    >
      <header className="fixed inset-x-0 top-0 z-10 mx-auto flex w-full max-w-[480px] items-center justify-between border-b-2 border-gray-200 bg-surface px-6 py-[14px]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <ClipboardList size={22} />
          </div>
          <h1 className="text-heading font-bold">혈당 기준표</h1>
        </div>
        <AddMenuButton
          themeClass="theme-glucose"
          size="sm"
          options={[
            {
              icon: Droplet,
              label: "혈당 입력",
              onClick: () => navigate("/blood-sugar/manage"),
            },
            {
              icon: Bot,
              label: "혈당 챗봇",
              onClick: () => navigate("/chatbot/glucose"),
            },
          ]}
        />
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
                <th className="px-1 py-2 font-semibold">식후 2시간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/30 bg-surface text-center">
              {ROWS.map((row) => (
                <tr key={row.label} className="divide-x divide-primary/30">
                  {/* 단계 이름을 모든 행에서 같은 폭의 알약에 담아 가운데 배치 — 글자 수가 달라도 같은 모양으로 보임 */}
                  <td className="px-3 py-4">
                    <span className={`mx-auto block w-[80px] rounded-full border-2 py-1 font-bold ${row.badge}`}>
                      {row.label}
                    </span>
                  </td>
                  <td className="px-1 py-4 font-bold whitespace-nowrap text-text-muted">{row.fasting}</td>
                  <td className="px-1 py-4 font-bold whitespace-nowrap text-text-muted">{row.postMeal}</td>
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
