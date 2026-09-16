function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Map) && !(value instanceof Set);
}

export function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof Map || b instanceof Map) {
    if (!(a instanceof Map) || !(b instanceof Map) || a.size !== b.size) return false;
    for (const [key, value] of a) {
      if (!b.has(key) || !deepEqual(value, b.get(key))) return false;
    }
    return true;
  }
  if (a instanceof Set || b instanceof Set) {
    if (!(a instanceof Set) || !(b instanceof Set) || a.size !== b.size) return false;
    const right = [...b];
    return [...a].every((value) => right.some((other) => deepEqual(value, other)));
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((value, i) => deepEqual(value, b[i]));
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    return keys.every((key) => Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]));
  }
  return false;
}

export function previewValue(value) {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return JSON.stringify(value);
  if (value instanceof Map) {
    return 'Map(' + JSON.stringify([...value.entries()]) + ')';
  }
  if (value instanceof Set) {
    return 'Set(' + JSON.stringify([...value]) + ')';
  }
  try {
    return JSON.stringify(value);
  } catch (err) {
    return String(value);
  }
}

export function parseValue(raw) {
  if (raw === undefined) return undefined;
  if (typeof raw !== 'string') return raw;
  const text = raw.trim();
  if (!text) return '';
  if (text === 'undefined') return undefined;
  try {
    return JSON.parse(text);
  } catch (err) {
    try {
      return Function('"use strict"; return (' + text + ');')();
    } catch (inner) {
      return raw;
    }
  }
}

export function functionName(source) {
  const text = String(source || '');
  const declared = text.match(/function\s+([A-Za-z_$][\w$]*)/);
  if (declared) return declared[1];
  const bound = text.match(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/);
  return bound ? bound[1] : '';
}

function looksLikeCall(text) {
  const src = String(text || '').trim();
  return /^[A-Za-z_$][\w$]*\s*\(/.test(src) || /\(.*\)\s*\(/.test(src);
}

export function testCall(test, source) {
  if (!test) return '';
  if (test.call) return String(test.call);
  if (Array.isArray(test.args)) {
    const name = test.fn || functionName(source);
    if (!name) return '';
    return name + '(' + test.args.map((arg) => previewValue(arg)).join(', ') + ')';
  }
  const input = String(test.input || '').trim();
  if (looksLikeCall(input)) return input;
  const name = functionName(source);
  if (name && input) return name + '(' + input + ')';
  return input;
}

export function expectedValue(test) {
  if (!test) return undefined;
  if (Object.prototype.hasOwnProperty.call(test, 'expected')) return test.expected;
  return parseValue(test.output);
}

export function formatTest(test, source) {
  const call = testCall(test, source);
  const expected = Object.prototype.hasOwnProperty.call(test || {}, 'expected')
    ? previewValue(test.expected)
    : String((test && test.output) || (test && test.assert ? 'assert' : ''));
  return {
    label: (test && test.label) || 'Test',
    input: call || (test && test.input) || '',
    output: expected,
  };
}

function runOne(source, test) {
  const label = (test && test.label) || 'Test';
  const setup = String((test && test.setup) || '').trim();
  const assert = String((test && test.assert) || '').trim();
  const call = testCall(test, source);
  const expected = expectedValue(test);
  if (!String(source || '').trim()) {
    return { ok: false, label, call, expected, actual: undefined, error: 'Write some code first.' };
  }
  if (!call && !assert) {
    return { ok: false, label, call, expected, actual: undefined, error: 'This test has no call to run.' };
  }
  const body = [
    '"use strict";',
    String(source || ''),
    setup,
    'const actual = (' + (call || 'undefined') + ');',
    assert ? 'return { actual, ok: !!(' + assert + ') };' : 'return { actual, ok: null };',
  ].join('\n');
  try {
    const ran = Function(body)();
    const actual = ran && ran.actual;
    const ok = ran && ran.ok !== null ? !!ran.ok : deepEqual(actual, expected);
    return { ok, label, call, expected, actual, error: null };
  } catch (err) {
    return {
      ok: false,
      label,
      call,
      expected,
      actual: undefined,
      error: err && err.message ? String(err.message) : String(err),
    };
  }
}

export function runJavascript(source, tests) {
  const list = Array.isArray(tests) ? tests : [];
  if (!list.length) {
    return {
      passed: false,
      results: [{ ok: false, label: 'Tests', call: '', expected: undefined, actual: undefined, error: 'This card has no tests.' }],
    };
  }
  const results = list.map((test) => runOne(source, test));
  return { passed: results.every((row) => row.ok), results };
}
