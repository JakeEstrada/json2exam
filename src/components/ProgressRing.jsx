export default function ProgressRing({ value, max, size, label }) {
  const total = Number(max) || 0;
  const got = Math.max(0, Number(value) || 0);
  const pct = total ? Math.max(0, Math.min(1, got / total)) : 0;
  const shown = Math.round(pct * 100);
  const dim = Number(size) || 96;
  const stroke = dim < 72 ? 6 : 8;
  const cx = dim / 2;
  const r = (dim - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const caption = label || (total ? shown + '% complete' : 'No progress yet');

  return (
    <svg
      className={'progress-ring' + (shown === 100 && total > 0 ? ' is-complete' : '')}
      width={dim}
      height={dim}
      viewBox={'0 0 ' + dim + ' ' + dim}
      role="img"
      aria-label={caption}
    >
      <circle
        className="progress-ring-track"
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        strokeWidth={stroke}
      />
      <circle
        className="progress-ring-fill"
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - dash}
        transform={'rotate(-90 ' + cx + ' ' + cx + ')'}
      />
      <text
        className="progress-ring-pct"
        x={cx}
        y={cx}
        textAnchor="middle"
        dominantBaseline="central"
        dy="0.08em"
        fontSize={dim < 64 ? 13 : dim < 90 ? 16 : 22}
      >
        {shown + '%'}
      </text>
    </svg>
  );
}
