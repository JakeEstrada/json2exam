import { useEffect, useRef, useState } from 'react';
import { highlightItemIndexes, itemRect } from '../lib/pdfHighlight.js';

const docs = {};

async function loadPdf(url) {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  }
  if (!docs[url]) docs[url] = pdfjs.getDocument(url).promise;
  return docs[url];
}

export default function PdfPage({ url, page, query }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [rects, setRects] = useState([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let gone = false;
    const canvas = canvasRef.current;
    if (!url || !canvas) return undefined;

    (async () => {
      setStatus('loading');
      setRects([]);
      try {
        const pdf = await loadPdf(url);
        const pageNo = Math.min(Math.max(1, page || 1), pdf.numPages);
        const pdfPage = await pdf.getPage(pageNo);
        const wrap = wrapRef.current;
        const width = (wrap && wrap.clientWidth) || 720;
        const unscaled = pdfPage.getViewport({ scale: 1 });
        const scale = width / unscaled.width;
        const viewport = pdfPage.getViewport({ scale });
        if (gone) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setSize({ w: viewport.width, h: viewport.height });
        const ctx = canvas.getContext('2d');
        await pdfPage.render({ canvasContext: ctx, viewport }).promise;
        const content = await pdfPage.getTextContent();
        const items = content.items.filter((it) => it && it.str);
        const indexes = highlightItemIndexes(items, query);
        const next = indexes.map((i) => itemRect(items[i], viewport));
        if (!gone) {
          setRects(next);
          setStatus(next.length ? 'ready' : 'ready-plain');
        }
      } catch (err) {
        if (!gone) setStatus('error');
      }
    })();

    return () => { gone = true; };
  }, [url, page, query]);

  useEffect(() => {
    if (!rects.length) return;
    const mark = wrapRef.current && wrapRef.current.querySelector('.pdf-hit');
    if (mark) mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [rects]);

  return (
    <div className="pdf-page-wrap" ref={wrapRef}>
      {status === 'loading' && <p className="pdf-page-status">Loading this page…</p>}
      {status === 'error' && <p className="pdf-page-status">Could not open this page.</p>}
      <div className="pdf-page" style={{ width: size.w || '100%', height: size.h || undefined }}>
        <canvas ref={canvasRef} className="pdf-page-canvas" />
        {rects.map((r, i) => (
          <span
            key={i}
            className="pdf-hit"
            style={{
              left: r.left + 'px',
              top: r.top + 'px',
              width: r.width + 'px',
              height: r.height + 'px',
            }}
          />
        ))}
      </div>
    </div>
  );
}
