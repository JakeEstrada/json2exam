import { useEffect, useRef, useState } from 'react';
import {
  cueTimeRange,
  formatLectureTime,
  matchingLectureIndexes,
  parseLecture,
} from '../lib/lecture.js';

function seekAndPlay(el, seconds) {
  const go = () => {
    try { el.currentTime = seconds; } catch (err) { /* not ready */ }
    const play = el.play();
    if (play && play.catch) play.catch(() => {});
  };
  if (el.readyState >= 1) go();
  else el.addEventListener('loadedmetadata', go, { once: true });
}

export default function LectureView({ source, highlight, audioUrl, videoUrl }) {
  const parsed = parseLecture(source);
  const cues = parsed.cues;
  const hits = matchingLectureIndexes(cues, highlight);
  const [picked, setPicked] = useState(null);
  const [now, setNow] = useState(-1);
  const mediaRef = useRef(null);
  const mediaUrl = videoUrl || audioUrl;
  const playKey = highlight + '|' + (picked ? 'p' + picked : hits.join(','));
  const indexes = picked != null ? [picked] : hits;
  const range = cueTimeRange(cues, indexes);
  const hitSet = {};
  indexes.forEach((i) => { hitSet[i] = true; });

  useEffect(() => {
    setPicked(null);
  }, [highlight]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !mediaUrl || !range) return undefined;
    seekAndPlay(el, range.start);
    const onTime = () => {
      setNow(el.currentTime || 0);
      if (!videoUrl && range.end != null && el.currentTime >= range.end - 0.05) {
        el.pause();
        try { el.currentTime = range.end; } catch (err) { /* ignore */ }
      }
    };
    el.addEventListener('timeupdate', onTime);
    return () => el.removeEventListener('timeupdate', onTime);
  }, [mediaUrl, videoUrl, playKey, range && range.start, range && range.end]);

  useEffect(() => {
    if (!indexes.length) return;
    const el = document.getElementById('lecture-hit');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [playKey]);

  const live = cues.findIndex((c, i) => {
    const next = cues[i + 1];
    return now >= c.start && (!next || now < next.start);
  });

  return (
    <div className="lecture-view">
      {mediaUrl && (
        <div className={'lecture-player' + (videoUrl ? ' is-video' : '')}>
          {videoUrl ? (
            <video ref={mediaRef} src={videoUrl} controls preload="metadata" playsInline />
          ) : (
            <audio ref={mediaRef} src={audioUrl} controls preload="metadata" />
          )}
          {range && (
            <p className="lecture-clip">
              {videoUrl ? 'Starting at ' : 'Playing '}
              {formatLectureTime(range.start)}
              {!videoUrl && (range.end != null ? '–' + formatLectureTime(range.end) : ' to end')}
            </p>
          )}
        </div>
      )}
      <article className="lecture-text">
        {cues.map((c, i) => (
          <button
            key={i}
            type="button"
            id={indexes[0] === i ? 'lecture-hit' : undefined}
            className={
              'lecture-cue'
              + (hitSet[i] ? ' lecture-hit' : '')
              + (live === i ? ' is-live' : '')
            }
            onClick={() => {
              setPicked(i);
              const el = mediaRef.current;
              const clip = cueTimeRange(cues, [i]);
              if (el && clip) seekAndPlay(el, clip.start);
            }}
          >
            <span className="lecture-time">{formatLectureTime(c.start)}</span>
            <span>{c.text}</span>
          </button>
        ))}
      </article>
    </div>
  );
}
