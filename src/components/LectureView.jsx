import { useEffect } from 'react';
import { lectureParagraphs, matchingLectureIndexes } from '../lib/lecture.js';

export default function LectureView({ source, highlight }) {
  const paras = lectureParagraphs(source);
  const hits = matchingLectureIndexes(paras, highlight);
  const hitSet = {};
  hits.forEach((i) => { hitSet[i] = true; });

  useEffect(() => {
    if (!hits.length) return;
    const el = document.getElementById('lecture-hit');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlight]);

  return (
    <article className="lecture-text">
      {paras.map((p, i) => (
        <p
          key={i}
          id={hits[0] === i ? 'lecture-hit' : undefined}
          className={hitSet[i] ? 'lecture-hit' : undefined}
        >
          {p}
        </p>
      ))}
    </article>
  );
}
