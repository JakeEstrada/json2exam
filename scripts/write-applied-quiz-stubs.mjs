import fs from 'node:fs';
import path from 'node:path';
import { appliedScaffoldItems } from '../src/data/appliedClassroom.js';

const root = path.resolve(process.cwd());

function writeIfMissing(file, body) {
  if (fs.existsSync(file)) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  return true;
}

let quizzes = 0;
let notes = 0;

appliedScaffoldItems().forEach((item) => {
  if (item.kind !== 'deck') return;
  const dir = path.join(root, item.folder);
  const title = item.course.title + ' — ' + item.title;
  if (writeIfMissing(path.join(dir, 'quiz.json'), JSON.stringify({
    title,
    questions: [],
  }, null, 2) + '\n')) quizzes += 1;
  if (writeIfMissing(path.join(dir, 'notes.md'), [
    '# ' + item.title,
    '',
    item.course.title + ' · ' + item.mod.label,
    '',
    'Paste notes, links, and free-source excerpts here.',
    '',
  ].join('\n'))) notes += 1;
});

console.log('Wrote ' + quizzes + ' quiz.json and ' + notes + ' notes.md stubs');
