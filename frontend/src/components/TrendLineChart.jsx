const WIDTH = 320;
const HEIGHT = 200;
const PADDING_LEFT = 42;
const PADDING_RIGHT = 12;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 32;
const TICK_COUNT = 4;
const DATE_LABEL_GAP = 58; // "MM/DD" 텍스트(fontSize 18) 폭 + 여백 — 점선이 텍스트를 침범하지 않게 확보

function TrendLineChart({
  data,
  lines,
  dotColorKey,
  yTicks,
  dateRangeStart,
  dateRangeEnd,
}) {
  const values = data.flatMap((d) => lines.map((line) => d[line.key]));
  const rangeValues = yTicks ?? [];
  const buffer = yTicks ? 0 : 10;
  const maxVal = Math.max(...values, ...rangeValues) + buffer;
  const minVal = Math.min(...values, ...rangeValues) - buffer;
  const span = maxVal - minVal || 1;

  const plotWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const xStep = data.length > 1 ? plotWidth / (data.length - 1) : 0;
  const toX = (i) => PADDING_LEFT + i * xStep;
  const toY = (val) =>
    PADDING_TOP + plotHeight - ((val - minVal) / span) * plotHeight;

  const ticks =
    yTicks ??
    Array.from({ length: TICK_COUNT + 1 }, (_, i) =>
      Math.round(minVal + (span * i) / TICK_COUNT),
    );

  const linePath = (key) =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d[key])}`)
      .join(" ");

  return (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-primary bg-surface px-1 pt-6 pb-4">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full">
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING_LEFT}
              x2={WIDTH - PADDING_RIGHT}
              y1={toY(tick)}
              y2={toY(tick)}
              stroke="var(--color-text-muted)"
              strokeOpacity={0.15}
              strokeWidth={1}
            />
            <text
              x={PADDING_LEFT - 10}
              y={toY(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={15}
              fontWeight={600}
              fill="var(--color-text-muted)"
            >
              {tick}
            </text>
          </g>
        ))}

        {lines.map((line) => (
          <path
            key={line.key}
            d={linePath(line.key)}
            fill="none"
            stroke={line.color}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {lines.map((line) =>
          data.map((d, i) => (
            <line
              key={`${line.key}-${i}`}
              x1={toX(i)}
              x2={toX(i)}
              y1={toY(d[line.key]) - 7.8}
              y2={toY(d[line.key]) - 1.8}
              stroke={dotColorKey ? d[dotColorKey] : line.color}
              strokeWidth={dotColorKey ? 3 : 1.5}
              strokeLinecap="butt"
            />
          )),
        )}

        {dateRangeStart && dateRangeEnd && data.length > 0 && (
          <>
            <line
              x1={toX(0) + DATE_LABEL_GAP}
              x2={toX(data.length - 1) - DATE_LABEL_GAP}
              y1={HEIGHT - 10}
              y2={HEIGHT - 10}
              stroke="var(--color-text)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="0.5 6"
            />
            <text
              x={toX(0)}
              y={HEIGHT - 4}
              textAnchor="start"
              fontSize={18}
              fontWeight={600}
              fill="var(--color-text-muted)"
            >
              {dateRangeStart}
            </text>
            <text
              x={toX(data.length - 1)}
              y={HEIGHT - 4}
              textAnchor="end"
              fontSize={18}
              fontWeight={600}
              fill="var(--color-text-muted)"
            >
              {dateRangeEnd}
            </text>
          </>
        )}
      </svg>
      <div className="flex justify-center gap-4">
        {lines.map((line) => (
          <span
            key={line.key}
            className="flex items-center gap-1.5 text-body font-semibold text-text-muted"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: line.color }}
            />
            {line.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default TrendLineChart;
