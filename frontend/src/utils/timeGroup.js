export function getTimeGroup(time) {
  const hour = Number(time.split(":")[0]);

  if (hour >= 5 && hour < 11) return "아침";
  if (hour >= 11 && hour < 17) return "점심";
  if (hour >= 17 && hour < 21) return "저녁";
  return "밤";
}

export function getCurrentTimeGroup() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return getTimeGroup(`${hh}:${mm}`);
}
