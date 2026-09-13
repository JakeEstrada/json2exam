import { useEffect, useState } from 'react';
import { QUIZ_VOICES, SPEECH_RATES, normalizeRate, normalizeVoice, prefetchSpeech, speakText, stopSpeech } from '../lib/speech.js';

const SAMPLE = 'This is how this voice will read your quiz questions.';

export default function Settings({ settings, onChange, onReset, onClose }) {
  const voice = normalizeVoice(settings.voice);
  const rate = normalizeRate(settings.speechRate);
  const [previewing, setPreviewing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    prefetchSpeech(SAMPLE, voice);
  }, [voice]);

  return (
    <div className="sheet panel">
      <div className="grp">
        <span>Right answers in a row before a card retires</span>
        <div className="seg">
          {[1, 2, 3, 4].map((n) => (
            <button key={n} className={settings.maxBox === n + 1 ? 'on' : ''} onClick={() => onChange({ maxBox: n + 1 })}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="grp">
        <label className="check">
          <input type="checkbox" checked={settings.shuffle} onChange={(e) => onChange({ shuffle: e.target.checked })} />
          Shuffle the answer order each time
        </label>
        <label className="check">
          <input type="checkbox" checked={settings.instant} onChange={(e) => onChange({ instant: e.target.checked })} />
          Check the answer the moment I pick one
        </label>
      </div>
      <div className="grp">
        <span>Read-aloud speed</span>
        <div className="seg">
          {SPEECH_RATES.map((n) => (
            <button
              key={n}
              type="button"
              className={rate === n ? 'on' : ''}
              onClick={() => onChange({ speechRate: n })}
            >
              {n === 1 ? '1×' : n + '×'}
            </button>
          ))}
        </div>
      </div>
      <div className="grp">
        <label htmlFor="voice-pick">Read-aloud voice</label>
        <select
          id="voice-pick"
          className="voice-combo"
          value={voice}
          onChange={(e) => onChange({ voice: e.target.value })}
        >
          {QUIZ_VOICES.map((v) => (
            <option key={v.id} value={v.id}>{v.label} — {v.hint}</option>
          ))}
        </select>
        <button
          type="button"
          className="text-link"
          style={{ marginTop: '8px' }}
          onClick={() => {
            if (previewing || loading) {
              stopSpeech();
              setPreviewing(false);
              setLoading(false);
              return;
            }
            setLoading(true);
            setPreviewing(true);
            speakText(SAMPLE, () => { setPreviewing(false); setLoading(false); }, voice, rate).then((started) => {
              setLoading(false);
              if (!started) setPreviewing(false);
            });
          }}
        >
          {loading ? 'Loading voice…' : previewing ? 'Stop preview' : 'Preview this voice'}
        </button>
      </div>
      <div className="row">
        <button className="btn" onClick={onReset}>Start this deck over</button>
        <button className="btn quiet" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
