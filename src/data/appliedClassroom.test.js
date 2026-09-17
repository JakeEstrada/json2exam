import { test } from 'node:test';
import assert from 'node:assert/strict';
import { APPLIED_COURSES, appliedScaffoldItems } from './appliedClassroom.js';

test('applied classroom courses have unique ids and folders', () => {
  const ids = [];
  const folders = [];
  APPLIED_COURSES.forEach((course) => {
    ids.push(course.id);
    folders.push(course.folder);
    course.modules.forEach((mod) => {
      ids.push(mod.id);
      folders.push(mod.folder);
      mod.decks.forEach((deck) => {
        ids.push(deck.id);
        folders.push(deck.folder);
        assert.equal(deck.comingSoon, true);
      });
    });
  });
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(folders).size, folders.length);
  assert.ok(APPLIED_COURSES.length >= 12);
});

test('applied classroom courses are tagged with a home-page group', () => {
  const groups = new Set(['platform', 'languages', 'algorithms', 'systems', 'quality', 'process']);
  APPLIED_COURSES.forEach((course) => {
    assert.ok(groups.has(course.group), course.title + ' missing group');
  });
});

test('applied scaffold lists the program root and every topic folder', () => {
  const items = appliedScaffoldItems();
  assert.equal(items[0].folder, 'applied-classroom');
  assert.ok(items.some((i) => i.folder === 'applied-classroom/javascript/language/variables-and-data-types'));
  assert.ok(items.some((i) => i.folder === 'applied-classroom/typescript/language/types-and-annotations'));
  const langs = APPLIED_COURSES.filter((c) => c.group === 'languages').map((c) => c.id);
  assert.equal(langs[0], 'ts');
  assert.equal(langs[1], 'js');
  assert.ok(items.some((i) => i.folder === 'applied-classroom/system-design/systems/url-shortener'));
});
