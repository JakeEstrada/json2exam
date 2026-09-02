import { boxOf } from '../lib/leitner.js';

export default function BoxTrack({ questions, boxes, maxBox, currentBox }) {
  const counts = [];
  for (let b = 1; b <= maxBox; b++) counts.push(0);
  questions.forEach((q) => { counts[Math.min(boxOf(boxes, q), maxBox) - 1] += 1; });

  return (
    <div className="track">
      {counts.map((n, i) => {
        const b = i + 1;
        const done = b === maxBox;
        return (
          <div key={b} className={'box' + (done ? ' done' : '') + (currentBox === b && !done ? ' here' : '')}>
            <span className="n">{n}</span>
            <span className="lbl">{done ? 'mastered' : b === 1 ? 'still shaky' : 'box ' + b}</span>
          </div>
        );
      })}
    </div>
  );
}
