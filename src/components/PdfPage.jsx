import { useEffect, useRef, useState } from 'react';
import { highlightItemIndexes, highlightSlideIndexes, itemRect } from '../lib/pdfHighlight.js';
import { findBestSlidePages } from '../lib/slides.js';

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

function outputScale() {
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  return Math.min(3, Math.max(2, dpr * 1.25));
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

export default function PdfPage({ url, page, pageEnd, query, label, stack, auto }) {
  const wrapRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [pages, setPages] = useState(0);
  const [status, setStatus] = useState('loading');
  const [width, setWidth] = useState(0);
  const [located, setLocated] = useState(null);
  const [seen, setSeen] = useState(() => Math.max(1, page || 1));
  const slideMode = !!stack;
  const kind = label || (slideMode ? 'Slide' : 'Page');
  const search = !!(auto && slideMode && query);
  const focusStart = Math.max(1, (located && located.start) || page || 1);
  const focusEnd = Math.max(focusStart, (located && located.end) || pageEnd || focusStart);

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
    if (!pages) return;
    setSeen(Math.min(focusStart, pages));
  }, [url, focusStart, pages]);

  useEffect(() => {
    if (!pdf || !pages || (search && !located)) return undefined;
    const t = window.setTimeout(() => {
      const wrap = wrapRef.current;
      const hit = wrap && (
        wrap.querySelector('.pdf-sheet.has-hit')
        || wrap.querySelector('[data-page="' + focusStart + '"]')
      );
      if (hit) hit.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(t);
  }, [url, focusStart, query, pdf, pages, search, located]);

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
    const hit = wrap && (
      wrap.querySelector('.pdf-sheet.has-hit')
      || wrap.querySelector('[data-page="' + focusStart + '"]')
    );
    if (hit) hit.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="pdf-page-wrap is-stack" ref={wrapRef}>
      <div className="pdf-toolbar">
        <span className="pdf-toolbar-label">{status === 'error' ? 'Could not open' : rangeLabel}</span>
        {pages > 1 && (
          <button type="button" className="text-link" onClick={jumpToHighlight}>
            Jump to highlight
          </button>
        )}
      </div>
      {status === 'loading' && <p className="pdf-page-status">Loading…</p>}
      {search && !located && status === 'ready' && (
        <p className="pdf-page-status">Finding the matching slides…</p>
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
