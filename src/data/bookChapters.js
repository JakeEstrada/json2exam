/**
 * PDF chapter ranges for the language decks. Page numbers are file positions
 * from each book's outline or a checked contents offset, not printed page numbers.
 * A citation that falls outside the chapter is opened at the chapter instead.
 */

const ELO = 'Eloquent JavaScript, 4th Edition by Marijn Haverbeke';
const FLAN = 'JavaScript: The Definitive Guide, 7th Edition by David Flanagan';
const GOOD = 'JavaScript: The Good Parts by Douglas Crockford';
const YDK = "You Don't Know JS Yet: Scope & Closures, 2nd Edition by Kyle Simpson";
const PTS = 'Programming TypeScript by Boris Cherny';
const ETS = 'Effective TypeScript, 2nd Edition by Dan Vanderkam';
const QTS = 'TypeScript Quickly by Yakov Fain and Anton Moiseev';
const CSS = 'CSS in Depth, 1st Edition by Keith J. Grant';
const DUCK = 'HTML and CSS: Design and Build Websites by Jon Duckett';
const INC = 'Inclusive Components by Heydon Pickering';
const CRASH = 'Python Crash Course, 3rd Edition by Eric Matthes';
const FLUENT = 'Fluent Python, 2nd Edition by Luciano Ramalho';

function span(book, chapter, page, pageEnd, sections) {
  const row = { book, chapter, page, pageEnd };
  if (sections && sections.length) row.sections = sections;
  return row;
}

function bit(heading, page, pageEnd) {
  return { heading, page, pageEnd: pageEnd || page };
}

const DECK_CHAPTERS = {
  'js-language-variables-and-data-types': [
    span(ELO, 'Values, Types, and Operators', 31, 47, [
      bit('Values and primitive types', 32, 42),
      bit('Type conversion', 43, 46),
      bit('Bindings: let, const, and var', 50, 53),
    ]),
    span(FLAN, 'Chapter 3. Types, Values, and Variables', 41, 78, [
      bit('Type conversion', 63, 70),
      bit('Bindings: let, const, and var', 71, 78),
    ]),
    span(YDK, "Chapter 1: What's the Scope?", 19, 35, [
      bit('Bindings: let, const, and var', 92, 117),
    ]),
  ],
  'js-language-conditionals': [
    span(ELO, 'Program Structure', 48, 73, [
      bit('Truthiness', 40, 42),
      bit('Control flow', 56, 66),
    ]),
    span(FLAN, 'Chapter 4. Expressions and Operators', 79, 114, [
      bit('Control flow', 115, 146),
    ]),
  ],
  'js-language-loops': [
    span(ELO, 'Program Structure', 59, 65, [
      bit('while and do loops', 59, 62),
      bit('for loops', 63, 64),
      bit('Breaking Out of a Loop', 65, 65),
      bit('Walking arrays', 117, 120),
    ]),
    span(FLAN, 'Chapter 5. Statements', 115, 146),
  ],
  'js-language-functions': [
    span(ELO, 'Functions', 74, 99, [
      bit('Defining a function', 75, 75),
      bit('Bindings and scopes', 76, 78),
      bit('Closure', 86, 87),
      bit('Recursion', 88, 91),
    ]),
    span(FLAN, 'Chapter 8. Functions', 199, 238, [
      bit('Defining a function', 200, 203),
    ]),
    span(GOOD, 'Chapter 4. Functions', 67, 102),
    span(YDK, 'Chapter 2: Illustrating Lexical Scope', 36, 54, [
      bit('Closure', 149, 185),
    ]),
  ],
  'js-language-arrays': [
    span(ELO, 'Data Structures: Objects and Arrays', 100, 137, [
      bit('Arrays are objects', 100, 121),
      bit('map, filter, reduce', 146, 149),
    ]),
    span(FLAN, 'Chapter 7. Arrays', 173, 198, [
      bit('map, filter, reduce', 183, 194),
    ]),
    span(GOOD, 'Chapter 6. Arrays', 121, 136),
  ],
  'js-language-objects': [
    span(ELO, 'Data Structures: Objects and Arrays', 100, 137, [
      bit('Objects', 106, 109),
      bit('Mutability and identity', 110, 111),
    ]),
    span(FLAN, 'Chapter 6. Objects', 147, 172),
    span(GOOD, 'Chapter 3. Objects', 47, 66),
  ],
  'js-language-maps-and-sets': [
    span(ELO, 'Maps', 173, 176, [
      bit('Map', 173, 174),
      bit('Set', 173, 176),
      bit('Lookup and membership', 173, 176),
    ]),
    span(FLAN, 'Sets and Maps', 286, 292),
  ],
  'js-language-array-methods': [
    span(ELO, 'Higher-Order Functions', 138, 159, [
      bit('filter', 146, 146),
      bit('map', 147, 147),
      bit('reduce', 148, 149),
    ]),
    span(FLAN, 'Array Methods', 183, 194, [
      bit('map', 184, 184),
      bit('filter', 185, 185),
      bit('some and every', 186, 186),
      bit('reduce', 187, 187),
      bit('slice and splice', 190, 191),
      bit('sort', 194, 194),
    ]),
    span(GOOD, 'Chapter 6. Arrays', 121, 136),
  ],
  'js-language-closures': [
    span(ELO, 'Closure', 86, 87),
    span(YDK, 'Chapter 7: Using Closures', 149, 185, [
      bit('Closure', 149, 155),
      bit('Live link', 156, 161),
      bit('Loop bindings', 162, 167),
    ]),
  ],
  'js-language-recursion': [
    span(ELO, 'Recursion', 88, 91, [
      bit('Recursion', 88, 91),
      bit('Base case', 88, 91),
      bit('Call stack', 82, 83),
    ]),
  ],
  'js-language-classes': [
    span(ELO, 'Classes', 166, 186, [
      bit('Classes', 166, 168),
      bit('Private properties', 169, 170),
      bit('Inheritance', 184, 186),
    ]),
    span(FLAN, 'Chapter 9. Classes', 239, 266, [
      bit('Classes', 247, 253),
      bit('Inheritance', 255, 266),
    ]),
    span(GOOD, 'Chapter 5. Inheritance', 103, 120),
  ],
  'js-language-error-handling': [
    span(ELO, 'Bugs and Errors', 218, 225, [
      bit('Exceptions', 218, 219),
      bit('finally', 220, 222),
      bit('Error kinds', 218, 225),
    ]),
    span(FLAN, 'Error Classes', 322, 344, [
      bit('Error kinds', 322, 344),
    ]),
  ],
  'js-language-asynchronous-javascript': [
    span(ELO, 'Asynchronous Programming', 284, 315, [
      bit('Promises', 289, 294),
      bit('async and await', 299, 300),
      bit('Promise.all', 306, 307),
      bit('The event loop', 308, 309),
    ]),
    span(FLAN, 'Chapter 13. Asynchronous JavaScript', 359, 396, [
      bit('Promises', 364, 384),
      bit('async and await', 385, 387),
    ]),
  ],
  'js-language-prototypes-and-this': [
    span(ELO, 'The Secret Life of Objects', 162, 186, [
      bit('Methods', 162, 163),
      bit('Prototypes', 164, 165),
      bit('this', 162, 165),
      bit('Arrow methods', 81, 81),
    ]),
    span(FLAN, 'Chapter 9. Classes', 239, 266, [
      bit('Prototypes', 240, 246),
      bit('this', 204, 210),
    ]),
  ],
  'js-language-modules': [
    span(ELO, 'Modules', 265, 283, [
      bit('export', 267, 269),
      bit('import', 267, 269),
      bit('default', 267, 269),
    ]),
    span(FLAN, 'Chapter 10. Modules', 267, 284, [
      bit('export', 273, 284),
      bit('import', 273, 284),
    ]),
    span(YDK, 'Chapter 8: The Module Pattern', 186, 202),
  ],
  'js-language-iterators-and-generators': [
    span(ELO, 'The iterator interface', 181, 183, [
      bit('Iterators', 181, 183),
      bit('Generators', 301, 302),
      bit('yield', 301, 302),
    ]),
    span(FLAN, 'Chapter 12. Iterators and Generators', 345, 358, [
      bit('Iterators', 346, 349),
      bit('Generators', 350, 353),
      bit('yield', 350, 353),
    ]),
  ],

  'ts-language-types-and-annotations': [
    span(PTS, '3. All About Types', 31, 69, [
      bit('Annotations and inference', 31, 69),
    ]),
    span(ETS, 'Chapter 2. TypeScript’s Type System', 53, 114),
    span(QTS, 'Basic and custom types', 33, 57),
  ],
  'ts-language-unions-and-narrowing': [
    span(ETS, 'Chapter 3. Type Inference and Control Flow Analysis', 115, 162, [
      bit('What a union is', 53, 114),
      bit('Narrowing', 115, 162),
    ]),
    span(PTS, '6. Advanced Types', 157, 215),
    span(QTS, 'Basic and custom types', 33, 57, [
      bit('What a union is', 40, 42),
      bit('Narrowing', 40, 42),
    ]),
  ],
  'ts-language-functions': [
    span(PTS, '4. Functions', 70, 118, [
      bit('Defining a function', 70, 80),
      bit('Optional, default, rest', 70, 118),
    ]),
    span(ETS, 'Chapter 2. TypeScript’s Type System', 53, 114),
    span(QTS, 'Basic and custom types', 33, 57),
  ],
  'ts-language-arrays-and-tuples': [
    span(PTS, '3. All About Types', 31, 69, [
      bit('Arrays', 31, 69),
      bit('Tuples', 31, 69),
    ]),
    span(ETS, 'Chapter 2. TypeScript’s Type System', 53, 114),
    span(QTS, 'Basic and custom types', 33, 57),
  ],
  'ts-language-object-types': [
    span(PTS, '3. All About Types', 31, 69, [
      bit('Object type literals', 31, 69),
      bit('Optional and readonly', 31, 69),
    ]),
    span(ETS, 'Chapter 4. Type Design', 163, 210),
    span(QTS, 'Basic and custom types', 33, 57),
  ],
  'ts-language-interfaces': [
    span(PTS, '5. Classes and Interfaces', 119, 156, [
      bit('interface versus type', 129, 156),
      bit('Extending', 129, 156),
    ]),
    span(ETS, 'Chapter 4. Type Design', 163, 210),
    span(QTS, 'Object-oriented programming with classes and interfaces', 58, 58),
  ],
  'ts-language-generics': [
    span(ETS, 'Chapter 6. Generics and Type-Level Programming', 241, 286, [
      bit('identity', 241, 286),
      bit('Constraints', 241, 286),
    ]),
    span(PTS, '6. Advanced Types', 157, 215),
  ],

  'css-language-selectors-and-cascade': [
    span(CSS, 'Cascade, specificity, and inheritance', 31, 55, [
      bit('The cascade', 31, 55),
      bit('Rules', 31, 55),
    ]),
    span(DUCK, 'Chapter 10: Introducing CSS', 233, 252),
  ],
  'css-language-box-model': [
    span(CSS, 'Mastering the box model', 83, 114, [
      bit('Boxes', 83, 114),
      bit('Width and box-sizing', 83, 114),
    ]),
    span(DUCK, 'Chapter 13: Boxes', 307, 336),
  ],
  'css-language-typography-and-color': [
    span(CSS, 'Typography', 357, 380, [
      bit('Color', 328, 356),
      bit('Type', 357, 380),
      bit('Relative units', 56, 82),
    ]),
    span(DUCK, 'Chapter 12: Text', 271, 306, [
      bit('Color', 253, 270),
      bit('Type', 271, 306),
    ]),
  ],
  'css-language-flexbox': [
    span(CSS, 'Flexbox', 144, 171, [
      bit('Flexbox principles', 144, 155),
      bit('Main axis and cross axis', 144, 171),
      bit('Sizing', 156, 171),
    ]),
  ],
  'css-language-grid': [
    span(CSS, 'Grid layout', 172, 204, [
      bit('Grid containers', 172, 190),
      bit('Placing items', 172, 204),
    ]),
  ],
  'css-language-positioning': [
    span(CSS, 'Positioning and stacking contexts', 205, 228, [
      bit('Static and positioned', 205, 228),
      bit('Types', 205, 220),
      bit('Stacking', 218, 228),
    ]),
    span(DUCK, 'Chapter 15: Layout', 365, 412),
  ],
  'css-language-responsive': [
    span(CSS, 'Responsive design', 229, 260, [
      bit('Responsive design', 229, 260),
      bit('Media queries', 229, 260),
    ]),
    span(DUCK, 'Chapter 15: Layout', 365, 412),
  ],

  'html-language-document-and-structure': [
    span(DUCK, 'Chapter 1: Structure', 19, 46, [
      bit('Tags and elements', 19, 30),
      bit('Attributes', 19, 46),
      bit('Document skeleton', 19, 46),
    ]),
  ],
  'html-language-text-and-lists': [
    span(DUCK, 'Chapter 2: Text', 47, 68, [
      bit('Headings', 47, 55),
      bit('Paragraphs', 47, 68),
      bit('Lists', 69, 80),
    ]),
  ],
  'html-language-links-and-images': [
    span(DUCK, 'Chapter 4: Links', 81, 100, [
      bit('Writing links', 81, 100),
      bit('Adding images', 101, 132),
    ]),
  ],
  'html-language-semantic-elements': [
    span(DUCK, 'Chapter 17: HTML5 Layout', 435, 458, [
      bit('Extra markup', 183, 206),
      bit('HTML5 layout elements', 435, 458),
    ]),
  ],
  'html-language-forms': [
    span(DUCK, 'Chapter 7: Forms', 151, 182, [
      bit('How forms work', 151, 165),
      bit('Form controls', 151, 182),
      bit('Labels', 151, 182),
    ]),
    span(INC, 'A Todo List', 38, 69),
  ],
  'html-language-tables-and-media': [
    span(DUCK, 'Chapter 6: Tables', 133, 150, [
      bit('Basic table structure', 133, 150),
    ]),
    span(INC, 'Data Tables', 259, 292),
  ],
  'html-language-accessibility': [
    span(INC, 'Introduction', 4, 7, [
      bit('Labels', 4, 7),
      bit('Inclusive controls', 8, 37),
      bit('Keyboard access', 8, 37),
    ]),
    span(DUCK, 'Chapter 5: Images', 101, 132, [
      bit('Meaningful images', 101, 132),
    ]),
    span(CSS, 'Contrast, color, and spacing', 328, 356),
  ],

  'py-language-variables-and-types': [
    span(CRASH, 'Chapter 2: Variables and Simple Data Types', 53, 70, [
      bit('Values and names', 53, 62),
      bit('Built-in types', 53, 70),
    ]),
    span(FLUENT, '1. The Python Data Model', 24, 53),
  ],
  'py-language-conditionals': [
    span(CRASH, 'Chapter 5: if Statements', 109, 128, [
      bit('Comparisons', 109, 115),
      bit('If / elif / else', 116, 128),
    ]),
  ],
  'py-language-loops': [
    span(CRASH, 'Chapter 4: Working with Lists', 87, 108, [
      bit('for and range', 87, 108),
      bit('while', 151, 166),
      bit('break and continue', 151, 166),
    ]),
    span(FLUENT, '2. An Array of Sequences', 55, 143),
  ],
  'py-language-functions': [
    span(CRASH, 'Chapter 8: Functions', 167, 194, [
      bit('def', 167, 175),
      bit('Defaults and keyword args', 167, 194),
    ]),
  ],
  'py-language-lists': [
    span(CRASH, 'Chapter 3: Introducing Lists', 71, 108, [
      bit('Create and index', 71, 86),
      bit('Slice', 71, 86),
      bit('Mutate', 87, 108),
    ]),
    span(FLUENT, '2. An Array of Sequences', 55, 143, [
      bit('Alias vs copy', 55, 143),
    ]),
  ],
  'py-language-dicts-and-sets': [
    span(CRASH, 'Chapter 6: Dictionaries', 129, 150, [
      bit('Dicts', 129, 140),
      bit('Lookup and membership', 129, 150),
    ]),
    span(FLUENT, '3. Dictionaries and Sets', 144, 205, [
      bit('Dicts', 144, 180),
      bit('Sets', 181, 205),
      bit('Lookup and membership', 144, 205),
    ]),
  ],
  'py-language-comprehensions': [
    span(CRASH, 'Chapter 4: Working with Lists', 87, 108, [
      bit('List comprehensions', 87, 108),
    ]),
    span(FLUENT, '2. An Array of Sequences', 55, 143, [
      bit('List comprehensions', 55, 143),
      bit('Dict and set', 144, 205),
    ]),
  ],
  'py-language-classes': [
    span(CRASH, 'Chapter 9: Classes', 195, 220, [
      bit('Classes', 195, 205),
      bit('Methods', 195, 210),
      bit('Inheritance', 206, 220),
    ]),
  ],
  'py-language-exceptions': [
    span(CRASH, 'Chapter 10: Files and Exceptions', 231, 248, [
      bit('try and except', 231, 240),
      bit('else and finally', 231, 248),
      bit('Raising', 231, 248),
    ]),
  ],
  'py-language-files': [
    span(CRASH, 'Chapter 10: Files and Exceptions', 221, 230, [
      bit('Opening a file', 221, 224),
      bit('Reading', 221, 228),
      bit('Writing', 225, 230),
    ]),
  ],
  'py-language-iterators-and-generators': [
    span(FLUENT, '2. An Array of Sequences', 55, 143, [
      bit('Iterables', 55, 143),
      bit('Generators', 55, 143),
    ]),
  ],
};

export function chaptersForDeck(deckId) {
  const rows = DECK_CHAPTERS[deckId];
  return rows && rows.length ? rows : null;
}
