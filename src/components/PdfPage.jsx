import { useEffect, useRef, useState } from 'react';
import { highlightItemIndexes, highlightSlideIndexes, itemRect } from '../lib/pdfHighlight.js';
import { findBestSlidePages, formatSlideRange, slidePageList } from '../lib/slides.js';

const docs = {};
const textCache = {};

async function pageTexts(url, pdf) {
  if (textCache[url]) return textCache[url];
  const out = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    out.push(content.items.map((it) => (it && it.str) || '').join(' '));
  }
  textCache[url] = out;
  return out;
}

async function loadEngine() {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  }
  return pdfjs;
}

async function loadPdf(url) {
  if (docs[url]) return docs[url];
  const pdfjs = await loadEngine();
  const pending = pdfjs.getDocument({
    url,
    standardFontDataUrl: '/standard_fonts/',
  }).promise.then((pdf) => pdf, (err) => {
    delete docs[url];
    throw err;
  });
  docs[url] = pending;
  return pending;
}

function PdfSheet({ pdf, page, width, query, slideMode }) {
  const canvasRef = useRef(null);
  const [rects, setRects] = useState([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let gone = false;
    const canvas = canvasRef.current;
    if (!pdf || !canvas || !width) return undefined;

    (async () => {
      setStatus('loading');
      setRects([]);
      try {
        const pdfPage = await pdf.getPage(page);
        const unscaled = pdfPage.getViewport({ scale: 1 });
        const viewport = pdfPage.getViewport({ scale: width / unscaled.width });
        if (gone) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setSize({ w: viewport.width, h: viewport.height });
        const ctx = canvas.getContext('2d');
        await pdfPage.render({ canvasContext: ctx, viewport }).promise;
        if (gone) return;
        const content = await pdfPage.getTextContent();
        const items = content.items.filter((it) => it && it.str);
        const indexes = slideMode
          ? highlightSlideIndexes(items, query)
          : highlightItemIndexes(items, query);
        const next = indexes.map((i) => itemRect(items[i], viewport));
        if (!gone) {
          setRects(next);
          setStatus(next.length ? 'ready' : 'ready-plain');
        }
      } catch (err) {
        console.error(err);
        if (!gone) setStatus('error');
      }
    })();

    return () => { gone = true; };
  }, [pdf, page, width, query, slideMode]);

  return (
    <article
      className={'pdf-sheet' + (rects.length ? ' has-hit' : '')}
      data-page={page}
    >
      <p className="pdf-sheet-label">{slideMode ? 'Slide' : 'Page'} {page}</p>
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
    </article>
  );
}

export default function PdfPage({ url, page, pageEnd, query, label, stack, auto }) {
  const wrapRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [pages, setPages] = useState(0);
  const [status, setStatus] = useState('loading');
  const [width, setWidth] = useState(0);
  const [pageNo, setPageNo] = useState(() => Math.max(1, page || 1));
  const [located, setLocated] = useState(null);
  const slideMode = !!stack;
  const kind = label || (slideMode ? 'Slide' : 'Page');
  const search = !!(auto && slideMode && query);

  useEffect(() => {
    setPageNo(Math.max(1, page || 1));
  }, [url, page]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const apply = () => {
      const w = Math.floor(wrap.clientWidth);
      if (w > 0) setWidth(w);
    };
    apply();
    const later = window.requestAnimationFrame(apply);
    if (typeof ResizeObserver === 'undefined') {
      return () => window.cancelAnimationFrame(later);
    }
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    return () => {
      window.cancelAnimationFrame(later);
      ro.disconnect();
    };
  }, [url]);

  useEffect(() => {
    let gone = false;
    if (!url) return undefined;
    setStatus('loading');
    setPdf(null);
    loadPdf(url).then((doc) => {
      if (gone) return;
      setPdf(doc);
      setPages(doc.numPages);
      setStatus('ready');
    }, () => {
      if (!gone) setStatus('error');
    });
    return () => { gone = true; };
  }, [url]);

  useEffect(() => {
    let gone = false;
    setLocated(null);
    if (!pdf || !search) return undefined;
    pageTexts(url, pdf).then((texts) => {
      if (!gone) setLocated(findBestSlidePages(texts, query));
    }, () => {
      if (!gone) setLocated({ start: 1, end: 3 });
    });
    return () => { gone = true; };
  }, [pdf, url, search, query]);

  useEffect(() => {
    if (!slideMode) return undefined;
    const t = window.setTimeout(() => {
      const hit = wrapRef.current && (
        wrapRef.current.querySelector('.pdf-sheet.has-hit')
        || wrapRef.current.querySelector('.pdf-sheet')
      );
      if (hit) hit.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(t);
  }, [slideMode, url, page, pageEnd, query, pdf, located]);

  const list = slideMode
    ? slidePageList(
      (located && located.start) || page || 1,
      (located && located.end) || pageEnd || 0,
      pages
    )
    : [Math.min(Math.max(1, pageNo), pages || pageNo || 1)];
  const rangeLabel = slideMode
    ? formatSlideRange({ start: list[0], end: list[list.length - 1] }) || kind
    : (pages ? kind + ' ' + list[0] + ' of ' + pages : 'Opening…');

  return (
    <div className={'pdf-page-wrap' + (slideMode ? ' is-stack' : '')} ref={wrapRef}>
      <div className="pdf-toolbar">
        {!slideMode && (
          <button
            type="button"
            className="btn quiet"
            disabled={pageNo <= 1}
            onClick={() => setPageNo((n) => Math.max(1, n - 1))}
          >
            Previous
          </button>
        )}
        <span className="pdf-toolbar-label">{status === 'error' ? 'Could not open' : rangeLabel}</span>
        {!slideMode && (
          <button
            type="button"
            className="btn quiet"
            disabled={!pages || pageNo >= pages}
            onClick={() => setPageNo((n) => n + 1)}
          >
            Next
          </button>
        )}
      </div>
      {status === 'loading' && <p className="pdf-page-status">Loading…</p>}
      {search && !located && status === 'ready' && (
        <p className="pdf-page-status">Finding the matching slides…</p>
      )}
      {status === 'error' && <p className="pdf-page-status">Could not open this page.</p>}
      <div className="pdf-page-scroll">
        {pdf && width > 0 && !(search && !located) && list.map((n) => (
          <PdfSheet
            key={url + ':' + n}
            pdf={pdf}
            page={n}
            width={width}
            query={query}
            slideMode={slideMode}
          />
        ))}
      </div>
    </div>
  );
}
