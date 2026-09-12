import { test } from 'node:test';
import assert from 'node:assert/strict';
import { highlightItemIndexes, highlightSlideIndexes, queryTokens } from './pdfHighlight.js';

test('queryTokens drops short and common words', () => {
  assert.deepEqual(queryTokens('The customer is a stakeholder who benefits'), ['customer', 'stakeholder', 'benefits']);
});

test('highlightItemIndexes finds a quoted phrase on the page', () => {
  const items = [
    { str: 'Figure 2-2 ' },
    { str: 'Potential stakeholders ' },
    { str: 'Customers are a subset of stakeholders. ' },
    { str: 'A customer is an individual or organization that derives ' },
    { str: 'either direct or indirect benefit from a product. ' },
    { str: 'Software customers could request, pay for, or use the software.' },
    { str: 'The developers sit in another building.' },
  ];
  const hits = highlightItemIndexes(
    items,
    'A customer is an individual or organization that derives either direct or indirect benefit from a product.'
  );
  assert.ok(hits.includes(3));
  assert.ok(hits.includes(4));
});

test('highlightItemIndexes falls back to keyword density', () => {
  const items = [
    { str: 'Welcome to the chapter.' },
    { str: 'Gold plating adds extra unrequested functionality.' },
    { str: 'Developers sometimes include features they think customers will like.' },
    { str: 'The next section is about testing.' },
  ];
  const hits = highlightItemIndexes(items, 'Gold plating is adding functionality that was not required.');
  assert.ok(hits.includes(1));
});

test('highlightSlideIndexes marks matching words on a slide', () => {
  const items = [
    { str: 'Customer’s Bill of Rights' },
    { str: 'Expect analysts to speak your language' },
    { str: 'Copyright notice' },
  ];
  const hits = highlightSlideIndexes(
    items,
    'Slides 4 to 7 show the rights of customers, that is, what the customer can expect from the analysts'
  );
  assert.ok(hits.includes(0));
  assert.ok(hits.includes(1));
});
