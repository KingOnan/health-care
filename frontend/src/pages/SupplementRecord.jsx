import { useEffect, useState, Fragment } from "react";
import { motion } from "framer-motion";
import { PillBottle, List, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopTabs from "../components/TopTabs";
import BottomNav from "../components/BottomNav";
import AddMenuButton from "../components/AddMenuButton";
import IntakeItemBox from "../components/IntakeItemBox";
import IntakeActionDialog from "../components/IntakeActionDialog";
import GroupHeader from "../components/GroupHeader";
import Toast from "../components/Toast";
import { checkSupplement, getSupplementItemTodayList } from "../api/supplement";
import { getToken } from "../utils/user";
import useToastNavigate from "../hooks/useToastNavigate";

// 백엔드 CheckStatus 값을 화면이 쓰는 status 문자열로 변환 (null이면 아직 미확인)
const STATUS_MAP = { 복용완료: "done", 건너뛰기: "skipped" };

// 백엔드 응답(SupplementTodayItemResponse)을 화면이 쓰는 occurrence 모양으로 변환.
// 시간대 분류/정렬/다음 항목·놓침 판단은 서버가 이미 끝내서 내려줌
const toOccurrence = (item) => ({
  key: item.supplement_schedule_seq,
  name: item.name,
  time: item.scheduled_time.slice(0, 5),
  group: item.time_group,
  status: item.status ? STATUS_MAP[item.status] : "pending",
  isNext: item.is_next,
  isMissed: item.is_missed,
});

function SupplementRecord() {
  const navigate = useNavigate();
  const [occurrences, setOccurrences] = useState([]);
  const [activeOcc, setActiveOcc] = useState(null);
  const { showToast, message, variant, trigger: handleAction } = useToastNavigate({
    message: "체크했어요",
  });

  const fetchToday = () => {
    getSupplementItemTodayList(getToken())
      .then((data) => setOccurrences(data.map(toOccurrence)))
      .catch(() => {});
  };

  useEffect(fetchToday, []);

  // status는 화면이 쓰는 값("done"/"skipped")이 아니라 백엔드 CheckStatus 값("복용완료"/"건너뛰기")을 받음
  const check = async (supplementScheduleSeq, status) => {
    setActiveOcc(null);

    try {
      await checkSupplement(supplementScheduleSeq, status, getToken());
      fetchToday();
      handleAction(status);
    } catch {
      handleAction("체크에 실패했어요", "error");
    }
  };

  // occurrences는 서버가 이미 정렬해서 준 순서라, 그 순서 그대로 연속된 같은 그룹끼리만 묶음
  // (고정된 아침→점심→저녁→밤 순으로 다시 나누면 "지난 시간대는 뒤로"가 무시돼버림)
  const visibleGroups = [];
  for (const occ of occurrences) {
    const lastGroup = visibleGroups[visibleGroups.length - 1];
    if (lastGroup && lastGroup.group === occ.group) {
      lastGroup.occurrences.push(occ);
    } else {
      visibleGroups.push({ group: occ.group, occurrences: [occ] });
    }
  }

  return (
    <div className="theme-supplement flex flex-col gap-8 px-3 pt-22 pb-26">
      <TopTabs
        active="record"
        basePath="/supplement"
        rightSlot={
          <AddMenuButton
            themeClass="theme-supplement"
            options={[
              {
                icon: List,
                label: "영양제 목록",
                onClick: () => navigate("/supplement/list"),
              },
              {
                icon: PillBottle,
                label: "영양제 추가",
                onClick: () => navigate("/supplement/manage"),
              },
              {
                icon: Bot,
                label: "영양제 챗봇",
                onClick: () => navigate("/chatbot/supplement"),
              },
            ]}
          />
        }
      />

      {visibleGroups.map(({ group, occurrences: groupOccurrences }, index) => {
        const completedCount = groupOccurrences.filter((occ) => occ.status !== "pending").length;
        return (
          <Fragment key={group}>
            {index > 0 && <div className="h-px bg-gray-200" />}
            <motion.section
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col gap-3"
            >
              <GroupHeader
                group={group}
                completedCount={completedCount}
                totalCount={groupOccurrences.length}
              />
              <div className="flex flex-col gap-3">
                {groupOccurrences.map((occ) => (
                  <IntakeItemBox
                    key={occ.key}
                    name={occ.name}
                    time={occ.time}
                    status={occ.status}
                    isNext={occ.isNext}
                    isMissed={occ.isMissed}
                    icon={PillBottle}
                    onPress={() => setActiveOcc(occ)}
                  />
                ))}
              </div>
            </motion.section>
          </Fragment>
        );
      })}

      <IntakeActionDialog
        open={activeOcc !== null}
        name={activeOcc?.name}
        time={activeOcc?.time}
        status={activeOcc?.status}
        onClose={() => setActiveOcc(null)}
        onDone={() => check(activeOcc.key, "복용완료")}
        onSkip={() => check(activeOcc.key, "건너뛰기")}
      />

      <Toast show={showToast} message={message} variant={variant} />

      <BottomNav active="supplement" />
    </div>
  );
}

export default SupplementRecord;
