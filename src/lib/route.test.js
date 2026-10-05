import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute, routePath, routeTrail } from './route.js';

test('paths follow home, module, chapter, quiz', () => {
  const quiz = { screen: 'quiz', courseId: '541', deckId: '541-ch1' };
  assert.deepEqual(routeTrail(quiz).map(routePath), [
    '/',
    '/c/541',
    '/c/541/541-ch1',
    '/c/541/541-ch1/quiz',
  ]);
});

test('parseRoute reads each step back', () => {
  assert.deepEqual(parseRoute('/'), { screen: 'home' });
  assert.deepEqual(parseRoute('/c/py'), { screen: 'course', courseId: 'py' });
  assert.deepEqual(parseRoute('/c/py/py-language-lists'), {
    screen: 'lesson',
    courseId: 'py',
    deckId: 'py-language-lists',
  });
  assert.deepEqual(parseRoute('/c/py/py-language-lists/quiz'), {
    screen: 'quiz',
    courseId: 'py',
    deckId: 'py-language-lists',
  });
  assert.deepEqual(parseRoute('/quiz'), { screen: 'quiz' });
  assert.equal(routePath(parseRoute('/nope')), '/');
});
