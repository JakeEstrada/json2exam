import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deepEqual, functionName, runJavascript, testCall } from './runCode.js';

test('deepEqual compares arrays, objects, and maps', () => {
  assert.equal(deepEqual([1, { a: 2 }], [1, { a: 2 }]), true);
  assert.equal(deepEqual({ a: 1 }, { a: 2 }), false);
  assert.equal(deepEqual(new Map([['a', 1]]), new Map([['a', 1]])), true);
  assert.equal(deepEqual(undefined, undefined), true);
});

test('functionName reads a declaration', () => {
  assert.equal(functionName('function last(arr) {\n}\n'), 'last');
});

test('runJavascript calls the learner function with args', () => {
  const out = runJavascript(
    'function last(arr) { return arr[arr.length - 1]; }',
    [{ args: [[1, 2, 3]], expected: 3, label: 'last of three' }]
  );
  assert.equal(out.passed, true);
  assert.equal(out.results[0].actual, 3);
});

test('runJavascript reports a wrong return value', () => {
  const out = runJavascript(
    'function last(arr) { return arr[0]; }',
    [{ args: [[1, 2, 3]], expected: 3 }]
  );
  assert.equal(out.passed, false);
  assert.equal(out.results[0].actual, 1);
});

test('runJavascript supports setup, call, and assert', () => {
  const source = 'function makeIdFactory(prefix) {\n  let n = 0;\n  return () => { n += 1; return prefix + "-" + n; };\n}';
  const out = runJavascript(source, [{
    setup: 'const next = makeIdFactory("inv");',
    call: '[next(), next()]',
    expected: ['inv-1', 'inv-2'],
  }]);
  assert.equal(out.passed, true);
  assert.deepEqual(out.results[0].actual, ['inv-1', 'inv-2']);
});

test('testCall wraps a literal input as a function call', () => {
  assert.equal(testCall({ input: '"open"' }, 'function isOpenStatus(status) {}'), 'isOpenStatus("open")');
  assert.equal(testCall({ call: 'applyDiscount(0.1)(100)' }, ''), 'applyDiscount(0.1)(100)');
});
