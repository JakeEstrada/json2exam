import { matchReading, resolveReading } from '../lib/reading.js';
import { bookKey, findBook, shortBookLabel } from '../lib/books.js';

const COLORS = ['#2f6fed', '#e07a2f', '#1f9d6a', '#8b5cf6', '#d6456a', '#0e8a8a'];

function openFor(row, ref, located, chapter) {
  return {
    heading: ref && ref.section,
    page: (located && located.page) || (row && row.page) || (chapter && chapter.page) || 0,
    pageEnd: (located && located.pageEnd) || (row && row.pageEnd) || (chapter && chapter.pageEnd) || 0,
    scanFrom: (located && located.scanFrom) || (chapter && chapter.page) || 0,
    scanTo: (located && located.scanTo) || (chapter && chapter.pageEnd) || 0,
    excerpt: located ? (located.excerpt || '') : ((row && row.excerpt) || ''),
    book: (located && located.book) || (row && row.book) || (chapter && chapter.book) || '',
    chapter: (located && located.chapter) || (chapter && chapter.chapter) || '',
  };
}

export function bookReferenceTabs(q, bookReading, books) {
  const ref = q && q.reference;
  if (!ref || ref.url) return [];
  const reading = bookReading || [];
  const library = books || [];
  const chapter = matchReading(reading, ref.book);
  const rows = ref.citations && ref.citations.length
    ? ref.citations
    : (ref.book || ref.page)
      ? [{ book: ref.book, page: ref.page, pageEnd: ref.pageEnd, excerpt: ref.excerpt }]
      : [];
  const tabs = [];
  if (ref.section) {
    tabs.push({
      kind: 'notes',
      book: '',
      hover: 'Chapter notes',
      focus: { heading: ref.section, page: 0 },
    });
  }
  rows.forEach((row) => {
    const located = resolveReading({ reading, books: library }, {
      book: row.book || '',
      page: row.page || 0,
      pageEnd: row.pageEnd || 0,
      heading: ref.section,
      excerpt: row.excerpt || ref.excerpt || '',
    });
    const bookName = (located.chapter && located.book) || row.book || '';
    const hit = bookName ? findBook(library, bookName) : null;
    if (!hit && row.book) return;
    const title = (hit && hit.title) || located.book || row.book || '';
    tabs.push({
      kind: 'book',
      book: title,
      hover: (shortBookLabel(title) || 'Book') + ' PDF reference',
      focus: openFor(row, ref, located, null),
    });
  });
  if (!tabs.some((tab) => tab.kind === 'book') && chapter && (chapter.book || chapter.page)) {
    const title = chapter.book || 'Book';
    tabs.push({
      kind: 'book',
      book: title,
      hover: (shortBookLabel(title) || 'Book') + ' PDF reference',
      focus: openFor(null, ref, null, chapter),
    });
  }
  return tabs.map((tab, i) => ({
    ...tab,
    label: 'Ref ' + (i + 1) + '.',
    color: COLORS[i % COLORS.length],
  }));
}

export function activeReferenceIndex(tabs, focus) {
  if (!focus || !tabs.length) return -1;
  const want = bookKey(focus.book);
  if (!want) return -1;
  const page = Number(focus.page) || 0;
  const exact = tabs.findIndex((tab) => tab.kind !== 'notes' && bookKey(tab.book) === want && Number(tab.focus.page) === page);
  if (exact >= 0) return exact;
  return tabs.findIndex((tab) => tab.kind !== 'notes' && bookKey(tab.book) === want);
}

export default function RefArrows({ tabs, docked, active, onPick }) {
  if (!tabs || !tabs.length) return null;
  return (
    <div className={'ref-arrows' + (docked ? ' is-docked' : '')}>
      {tabs.map((tab, i) => {
        const on = active === i;
        return (
          <button
            key={tab.label}
            type="button"
            className={'ref-arrow' + (on ? ' is-on' : '')}
            style={{ '--ref': tab.color }}
            aria-label={tab.label + ', ' + tab.hover}
            onClick={() => onPick(tab, i)}
          >
            <span className={'ref-arrow-mark' + (docked ? '' : ' is-in')} aria-hidden="true" />
            <span className="ref-arrow-label">{tab.label}</span>
            <span className="ref-arrow-tip" role="tooltip">{tab.hover}</span>
          </button>
        );
      })}
    </div>
  );
}
