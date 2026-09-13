import { useState } from 'react';
import { QUIZ_VOICES, SPEECH_RATES, normalizeRate, normalizeVoice, speakText, stopSpeech } from '../lib/speech.js';

const SAMPLE = 'This is how this voice will read your quiz questions.';

export default function Settings({ settings, onChange, onReset, onClose }) {
  const voice = normalizeVoice(settings.voice);
  const rate = normalizeRate(settings.speechRate);
  const [previewing, setPreviewing] = useState(false);

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
        <span>Read-aloud voice</span>
        <div className="voice-picks">
          {QUIZ_VOICES.map((v) => (
            <button
              key={v.id}
              type="button"
              className={voice === v.id ? 'on' : ''}
              onClick={() => onChange({ voice: v.id })}
            >
              <b>{v.label}</b>
              <span>{v.hint}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="text-link"
          style={{ marginTop: '8px' }}
          onClick={() => {
            if (previewing) {
              stopSpeech();
              setPreviewing(false);
              return;
            }
            setPreviewing(true);
            speakText(SAMPLE, () => setPreviewing(false), voice, rate).then((started) => {
              if (!started) setPreviewing(false);
            });
          }}
        >
          {previewing ? 'Stop preview' : 'Preview this voice'}
        </button>
      </div>
      <div className="row">
        <button className="btn" onClick={onReset}>Start this deck over</button>
        <button className="btn quiet" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
