import { useEffect, useRef, useState } from 'react';
import { highlightItemIndexes, highlightSlideIndexes, itemRect } from '../lib/pdfHighlight.js';
import { findBestSlidePages } from '../lib/slides.js';

const docs = {};
const textCache = {};

async function pageTexts(url, pdf, range) {
  const start = range && range.from >= 1 ? Math.trunc(range.from) : 1;
  const end = range && range.to >= start ? Math.min(pdf.numPages, Math.trunc(range.to)) : pdf.numPages;
  const key = range ? url + ':' + start + ':' + end : url;
  if (textCache[key]) return textCache[key];
  const out = new Array(pdf.numPages).fill('');
  for (let i = start; i <= end; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    out[i - 1] = content.items.map((it) => (it && it.str) || '').join(' ');
  }
  textCache[key] = out;
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

function outputScale() {
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  // HiDPI: keep glyphs sharp in the side pane (often ~500–640 CSS px).
  return Math.min(4, Math.max(2.5, dpr * 2));
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
        const sharp = outputScale();
        if (gone) return;
        canvas.width = Math.floor(viewport.width * sharp);
        canvas.height = Math.floor(viewport.height * sharp);
        canvas.style.width = Math.floor(viewport.width) + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';
        setSize({ w: viewport.width, h: viewport.height });
        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        await pdfPage.render({
          canvasContext: ctx,
          viewport,
          transform: sharp !== 1 ? [sharp, 0, 0, sharp, 0, 0] : null,
        }).promise;
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
    <article className={'pdf-sheet' + (rects.length ? ' has-hit' : '')}>
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

function PdfSlot({ page, eager, pdf, width, query, slideMode, kind }) {
  const ref = useRef(null);
  const [on, setOn] = useState(!!eager);

  useEffect(() => {
    if (eager) setOn(true);
  }, [eager]);

  useEffect(() => {
    if (on) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setOn(true);
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setOn(true);
    }, { root: el.closest('.pdf-page-scroll'), rootMargin: '900px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [on]);

  return (
    <div ref={ref} className="pdf-slot" data-page={page}>
      {on ? (
        <PdfSheet pdf={pdf} page={page} width={width} query={query} slideMode={slideMode} />
      ) : (
        <article className="pdf-sheet is-ph">
          <p className="pdf-sheet-label">{kind} {page}</p>
          <div className="pdf-page-ph" />
        </article>
      )}
    </div>
  );
}

export default function PdfPage({ url, page, pageEnd, scanFrom, scanTo, query, label, stack, auto }) {
  const wrapRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [pages, setPages] = useState(0);
  const [status, setStatus] = useState('loading');
  const [width, setWidth] = useState(0);
  const [zoom, setZoom] = useState(1.25);
  const [located, setLocated] = useState(null);
  const [seen, setSeen] = useState(() => Math.max(1, page || 1));
  const slideMode = !!stack;
  const kind = label || (slideMode ? 'Slide' : 'Page');
  const rangeFrom = Math.max(1, Number(scanFrom) || Number(page) || 1);
  const rangeTo = Math.max(rangeFrom, Number(scanTo) || Number(pageEnd) || rangeFrom);
  const chapterSearch = !slideMode && !!query && rangeTo > rangeFrom;
  const search = !!(auto && slideMode && query) || chapterSearch;
  const focusStart = Math.max(1, (located && located.start) || page || 1);
  const focusEnd = Math.max(focusStart, (located && located.end) || pageEnd || focusStart);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const apply = () => {
      const sc = wrap.querySelector('.pdf-page-scroll') || wrap;
      // Leave room for sheet side margins so the canvas is not CSS-shrunk (blur).
      const raw = Math.floor(sc.clientWidth);
      const w = Math.max(240, raw - 28);
      if (w > 0) setWidth(Math.floor(w * zoom));
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
  }, [url, zoom]);

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
    const bounds = chapterSearch ? { from: rangeFrom, to: rangeTo, fallback: page || rangeFrom } : null;
    pageTexts(url, pdf, bounds).then((texts) => {
      if (!gone) setLocated(findBestSlidePages(texts, query, bounds));
    }, () => {
      if (!gone) setLocated(bounds ? { start: bounds.fallback, end: bounds.fallback } : { start: 1, end: 3 });
    });
    return () => { gone = true; };
  }, [pdf, url, search, query, chapterSearch, rangeFrom, rangeTo, page]);

  useEffect(() => {
    if (!pages) return;
    setSeen(Math.min(focusStart, pages));
  }, [url, focusStart, pages]);

  useEffect(() => {
    if (!pdf || !pages || !width || (search && !located)) return undefined;
    const t = window.setTimeout(() => {
      const wrap = wrapRef.current;
      const sc = wrap && wrap.querySelector('.pdf-page-scroll');
      const hit = wrap && (
        wrap.querySelector('.pdf-sheet.has-hit')
        || wrap.querySelector('[data-page="' + focusStart + '"]')
      );
      if (sc && hit) sc.scrollTop = hit.offsetTop;
    }, 60);
    return () => window.clearTimeout(t);
  }, [url, focusStart, query, pdf, pages, width, search, located]);

  useEffect(() => {
    const sc = wrapRef.current && wrapRef.current.querySelector('.pdf-page-scroll');
    if (!sc) return undefined;
    const onScroll = () => {
      const slots = sc.querySelectorAll('[data-page]');
      let best = seen;
      let bestDist = Infinity;
      const top = sc.scrollTop + 24;
      slots.forEach((el) => {
        const dist = Math.abs(el.offsetTop - top);
        if (dist < bestDist) {
          bestDist = dist;
          best = Number(el.getAttribute('data-page')) || best;
        }
      });
      setSeen(best);
    };
    sc.addEventListener('scroll', onScroll, { passive: true });
    return () => sc.removeEventListener('scroll', onScroll);
  }, [pdf, pages, seen]);

  const list = [];
  for (let n = 1; n <= pages; n += 1) list.push(n);
  const rangeLabel = pages
    ? kind + ' ' + seen + ' of ' + pages
    : 'Opening…';

  function jumpToHighlight() {
    const wrap = wrapRef.current;
    const sc = wrap && wrap.querySelector('.pdf-page-scroll');
    const hit = wrap && (
      wrap.querySelector('.pdf-sheet.has-hit')
      || wrap.querySelector('[data-page="' + focusStart + '"]')
    );
    if (sc && hit) sc.scrollTop = hit.offsetTop;
  }

  return (
    <div className="pdf-page-wrap is-stack" ref={wrapRef}>
      <div className="pdf-toolbar">
        <span className="pdf-toolbar-label">{status === 'error' ? 'Could not open' : rangeLabel}</span>
        <div className="pdf-toolbar-actions">
          <button
            type="button"
            className="text-link"
            onClick={() => setZoom((z) => Math.max(0.85, Math.round((z - 0.15) * 100) / 100))}
            aria-label="Zoom out"
          >
            Zoom −
          </button>
          <button
            type="button"
            className="text-link"
            onClick={() => setZoom((z) => Math.min(2.4, Math.round((z + 0.15) * 100) / 100))}
            aria-label="Zoom in"
          >
            Zoom +
          </button>
          <span className="pdf-toolbar-zoom">{Math.round(zoom * 100)}%</span>
          {pages > 1 && (
            <button type="button" className="text-link" onClick={jumpToHighlight}>
              Jump to highlight
            </button>
          )}
        </div>
      </div>
      {status === 'loading' && <p className="pdf-page-status">Loading…</p>}
      {search && !located && status === 'ready' && (
        <p className="pdf-page-status">{slideMode ? 'Finding the matching slides…' : 'Finding the passage in this chapter…'}</p>
      )}
      {status === 'error' && <p className="pdf-page-status">Could not open this page.</p>}
      <div className="pdf-page-scroll">
        {pdf && width > 0 && list.map((n) => (
          <PdfSlot
            key={url + ':' + n}
            page={n}
            eager={n >= focusStart - 1 && n <= focusEnd + 1}
            pdf={pdf}
            width={width}
            query={query}
            slideMode={slideMode}
            kind={kind}
          />
        ))}
      </div>
    </div>
  );
}
