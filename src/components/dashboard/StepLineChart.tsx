import React, { useMemo } from 'react';

interface StepLineChartProps {
  data: { date: number; cumulativeAmount: number }[];
  targetAmount: number;
}

const W = 300;
const H = 120;

/**
 * Cumulative revenue through the month, as a step.
 *
 * Previously the y-axis was scaled to the full target, so early in the month
 * the trace sat pinned to the floor of an otherwise empty box -- at 10% of
 * target there was nothing to read. The trace now scales to its own running
 * total and the target becomes a dashed reference line that only enters the
 * frame once it is within reach, which is the comparison that actually matters
 * day to day.
 */
export const StepLineChart: React.FC<StepLineChartProps> = ({ data, targetAmount }) => {
  const { pathD, areaD, targetY, reached, current } = useMemo(() => {
    const last = data.length > 0 ? data[data.length - 1].cumulativeAmount : 0;

    // Headroom above the current total; pull the target line in only when the
    // month is close enough for it to be a live comparison.
    const ceiling = Math.max(last * 1.35, Math.min(targetAmount, last * 2.2), 1);
    const y = (v: number) => H - 6 - (Math.min(v, ceiling) / ceiling) * (H - 12);
    const x = (day: number) => ((day - 1) / 30) * W;

    if (data.length === 0) {
      return { pathD: `M 0,${H - 6} L ${W},${H - 6}`, areaD: '', targetY: null, reached: 0, current: 0 };
    }

    let d = `M 0,${H - 6} L ${x(data[0].date).toFixed(2)},${H - 6}`;
    let prevY = H - 6;
    data.forEach((p) => {
      const px = x(p.date);
      const py = y(p.cumulativeAmount);
      d += ` L ${px.toFixed(2)},${prevY.toFixed(2)} L ${px.toFixed(2)},${py.toFixed(2)}`;
      prevY = py;
    });
    d += ` L ${W},${prevY.toFixed(2)}`;

    const ty = y(targetAmount);
    return {
      pathD: d,
      areaD: `${d} L ${W},${H} L 0,${H} Z`,
      targetY: targetAmount <= ceiling ? ty : null,
      reached: targetAmount > 0 ? Math.round((last / targetAmount) * 100) : 0,
      current: last,
    };
  }, [data, targetAmount]);

  return (
    <div className="w-full h-32 relative border border-[var(--color-ink)]/15 bg-[var(--color-ink)]/[0.06] overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="stepReveal">
            <rect
              x="0" y="0" height={H} width={W}
              className="reveal-wipe"
              style={{ '--wipe-to': `${W}px`, animationDelay: '200ms' } as React.CSSProperties}
            />
          </clipPath>
        </defs>

        {targetY !== null && (
          <line
            x1="0" y1={targetY} x2={W} y2={targetY}
            stroke="var(--color-ink)" strokeWidth="1" strokeDasharray="4 4"
            opacity="0.35" vectorEffect="non-scaling-stroke"
          />
        )}

        <g clipPath="url(#stepReveal)">
          {areaD && <path d={areaD} fill="var(--color-ink)" fillOpacity="0.1" />}
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="2"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>

      <div className="relative h-full p-3.5 flex flex-col justify-between pointer-events-none">
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-[var(--color-ink)]/55">
            Cumulative
          </span>
          <span className="text-[9px] font-mono tabular font-bold text-[var(--color-ink)]/75">
            ${Math.round(current).toLocaleString('en-US')} · {reached}%
          </span>
        </div>
        <div className="flex justify-between text-[9px] font-mono tabular text-[var(--color-ink)]/40">
          <span>01</span>
          <span>15</span>
          <span>31</span>
        </div>
      </div>
    </div>
  );
};
