import { useState, Fragment } from "react";
import { motion } from "framer-motion";
import { PillBottle, List, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopTabs from "../components/TopTabs";
import BottomNav from "../components/BottomNav";
import AddMenuButton from "../components/AddMenuButton";
import IntakeItemBox from "../components/IntakeItemBox";
import IntakeActionDialog from "../components/IntakeActionDialog";
import GroupHeader from "../components/GroupHeader";
import { INITIAL_ITEMS } from "../data/supplementItems";
import { getTimeGroup, getCurrentTimeGroup } from "../utils/timeGroup";

const GROUP_ORDER = ["아침", "점심", "저녁", "밤"];
const currentGroupIndex = GROUP_ORDER.indexOf(getCurrentTimeGroup());
const isPastGroup = (group) => GROUP_ORDER.indexOf(group) < currentGroupIndex;

function SupplementRecord() {
  const navigate = useNavigate();
  const [statusByKey, setStatusByKey] = useState({});
  const [activeOcc, setActiveOcc] = useState(null);

  const activeItems = INITIAL_ITEMS.filter((item) => !item.paused);

  const occurrences = activeItems
    .flatMap((item) =>
      item.times.map((time) => ({
        key: `${item.id}-${time}`,
        name: item.name,
        time,
        group: getTimeGroup(time),
      })),
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  const setStatus = (key, status) => {
    setStatusByKey((prev) => {
      const next = { ...prev };
      if (prev[key] === status) {
        delete next[key];
      } else {
        next[key] = status;
      }
      return next;
    });
  };

  const nextKey = occurrences.find(
    (occ) => !statusByKey[occ.key] && !isPastGroup(occ.group),
  )?.key;

  const isGroupComplete = (group) => {
    const items = occurrences.filter((occ) => occ.group === group);
    return items.length > 0 && items.every((occ) => statusByKey[occ.key]);
  };

  const sortedGroups = [...GROUP_ORDER].sort((a, b) => {
    const aPast = isPastGroup(a);
    const bPast = isPastGroup(b);
    if (aPast !== bPast) return aPast ? 1 : -1;
    if (aPast && bPast) return 0;

    const aDone = isGroupComplete(a);
    const bDone = isGroupComplete(b);
    return aDone === bDone ? 0 : aDone ? 1 : -1;
  });

  const visibleGroups = sortedGroups
    .map((group) => ({
      group,
      occurrences: occurrences.filter((occ) => occ.group === group),
    }))
    .filter(({ occurrences }) => occurrences.length > 0);

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
        const completedCount = groupOccurrences.filter(
          (occ) => statusByKey[occ.key],
        ).length;
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
                    status={statusByKey[occ.key] ?? "pending"}
                    isNext={occ.key === nextKey}
                    isMissed={isPastGroup(occ.group) && !statusByKey[occ.key]}
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
        status={activeOcc && statusByKey[activeOcc.key]}
        onClose={() => setActiveOcc(null)}
        onDone={() => {
          setStatus(activeOcc.key, "done");
          setActiveOcc(null);
        }}
        onSkip={() => {
          setStatus(activeOcc.key, "skipped");
          setActiveOcc(null);
        }}
      />

      <BottomNav active="supplement" />
    </div>
  );
}

export default SupplementRecord;
