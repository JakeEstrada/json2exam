#!/usr/bin/env node
/**
 * Removes the length-padding filler an earlier generator appended to wrong
 * answers. The filler was meant to even out option lengths but it only ever
 * landed on distractors, so it marked them as wrong on sight.
 *
 * Run from repo root: node scripts/strip-option-filler.mjs [--write]
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'applied-classroom';
const WRITE = process.argv.includes('--write');

const FILLER = [
  / for real production programs/g,
  / in real production systems at scale/g,
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name === 'quiz.json') out.push(full);
  }
  return out;
}

function strip(text) {
  let out = String(text);
  for (const re of FILLER) out = out.replace(re, '');
  out = out.replace(/\s{2,}/g, ' ').trim();
  // Padding was appended before the final period, leaving "word ." or no stop.
  out = out.replace(/\s+\./g, '.');
  if (/[a-z0-9)”"']$/i.test(out)) out += '.';
  return out;
}

let files = 0;
let changed = 0;

for (const file of walk(ROOT)) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  let touched = false;
  (data.questions || []).forEach((q) => {
    if (!Array.isArray(q.options)) return;
    q.options = q.options.map((opt) => {
      if (typeof opt !== 'string') return opt;
      if (!FILLER.some((re) => re.test(opt))) return opt;
      const next = strip(opt);
      if (next !== opt) { changed += 1; touched = true; }
      return next;
    });
  });
  if (touched) {
    files += 1;
    if (WRITE) writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  }
}

console.log((WRITE ? 'stripped' : 'would strip') + ` filler from ${changed} options across ${files} files`);
