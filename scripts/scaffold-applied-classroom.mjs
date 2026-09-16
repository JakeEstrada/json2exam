import fs from 'node:fs';
import path from 'node:path';
import { appliedScaffoldItems } from '../src/data/appliedClassroom.js';

const root = path.resolve(process.cwd());

function readme(item) {
  if (item.kind === 'program') {
    return [
      '# Applied Classroom Development',
      '',
      'The learning platform is the continuous project for the entire program.',
      'Every course will later produce lessons, exercises, assessments, or platform features.',
      '',
      'Each class and module below is a folder only for now. Add quiz JSON, notes, and',
      'cross-references when you have them. Wire a deck into `src/data/catalog.js`',
      '(via `src/data/appliedClassroom.js`) once a file is ready to study.',
      '',
    ].join('\n');
  }
  if (item.kind === 'course') {
    const mods = item.course.modules.map((m) => '- ' + m.label).join('\n');
    return [
      '# ' + item.title,
      '',
      item.course.tagline || '',
      '',
      '## Modules',
      '',
      mods,
      '',
    ].join('\n');
  }
  if (item.kind === 'module') {
    const decks = item.mod.decks.map((d) => '- ' + d.label).join('\n');
    return [
      '# ' + item.title,
      '',
      item.course.title + ' · module',
      '',
      '## Topics',
      '',
      decks || '_folders ready_',
      '',
    ].join('\n');
  }
  return [
    '# ' + item.title,
    '',
    item.course.title + ' · ' + item.mod.label,
    '',
    'Drop quiz JSON, notes, lecture files, or exercises here when you have them.',
    '',
  ].join('\n');
}

let made = 0;
appliedScaffoldItems().forEach((item) => {
  const dir = path.join(root, item.folder);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'README.md');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, readme(item));
    made += 1;
  }
});

console.log('Scaffolded ' + made + ' README files under applied-classroom/');
