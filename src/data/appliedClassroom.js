const ROOT = 'applied-classroom';

export function slug(label) {
  return String(label || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function plannedDeck(parentId, parentFolder, label, extra) {
  const s = (extra && extra.slug) || slug(label);
  return {
    id: parentId + '-' + s,
    label,
    subtitle: (extra && extra.subtitle) || 'Folder ready · add quiz JSON when you have it',
    comingSoon: true,
    folder: parentFolder + '/' + s,
    sheet: extra && extra.sheet,
  };
}

function plannedModule(courseId, courseFolder, spec) {
  const s = spec.slug || slug(spec.label);
  const folder = courseFolder + '/' + s;
  const id = courseId + '-' + s;
  return {
    id,
    label: spec.label,
    folder,
    decks: (spec.decks || []).map((d) => (
      typeof d === 'string' ? plannedDeck(id, folder, d) : plannedDeck(id, folder, d.label, d)
    )),
  };
}

function plannedCourse(spec) {
  const dir = ROOT + '/' + (spec.folder || slug(spec.title));
  return {
    id: spec.id,
    code: spec.code,
    title: spec.title,
    tagline: spec.tagline || '',
    group: spec.group || 'platform',
    program: true,
    folder: dir,
    modules: (spec.modules || []).map((m) => plannedModule(spec.id, dir, m)),
  };
}

export const APPLIED_COURSES = [
  plannedCourse({
    id: 'acd',
    code: 'ACD',
    title: 'Platform Build',
    folder: 'platform',
    group: 'platform',
    tagline: 'The learning platform is the continuous project for the entire program.',
    modules: [
      {
        label: 'Core Features',
        slug: 'core-classroom-features',
        decks: [
          'Written lessons',
          'Code examples',
          'Multiple-choice quizzes',
          'True/false questions',
          'Short-answer questions',
          'Fill-in-the-blank code',
          'Code-ordering exercises',
          'Bug-fixing exercises',
          'Browser-based coding playgrounds',
          'Automatic test cases',
          'Explanations after each answer',
          'Hints that can be revealed gradually',
          'Difficulty levels',
          'Topic prerequisites',
          'Course progress',
          'Lesson completion',
          'Quiz scores',
          'Attempt history',
          'Weak-topic detection',
          'Spaced repetition',
          'Bookmarks',
          'Personal notes',
          'Searchable resources',
        ],
      },
      {
        label: 'Stage 1: Learning Content',
        decks: [
          'Courses',
          'Modules',
          'Lessons',
          'Written explanations',
          'External resources',
          'Basic quizzes',
          'Progress tracking',
        ],
      },
      {
        label: 'Stage 2: Interactive Exercises',
        decks: [
          'Code editor',
          'Live output',
          'Test-case execution',
          'Exercise validation',
          'Hints',
          'Solution explanations',
          'Attempt tracking',
        ],
      },
      {
        label: 'Stage 3: User Learning System',
        decks: [
          'Accounts',
          'Personal dashboard',
          'Course enrollment',
          'Completion tracking',
          'Scores',
          'Study streaks',
          'Bookmarks',
          'Notes',
          'Weak-topic identification',
        ],
      },
      {
        label: 'Stage 4: Algorithm Practice',
        decks: [
          'Problem library',
          'Topic filters',
          'Code submissions',
          'Public and hidden tests',
          'Runtime results',
          'Complexity questions',
          'Submission history',
        ],
      },
      {
        label: 'Stage 5: Intelligent Review',
        decks: [
          'Spaced repetition',
          'Personalized review queues',
          'Confidence ratings',
          'Recommended next lessons',
          'Repeated practice for weak topics',
          'Progress reports',
        ],
      },
      {
        label: 'Stage 6: Community Features',
        decks: [
          'Public profiles',
          'Discussion threads',
          'Shared solutions',
          'Solution ratings',
          'Course feedback',
          'Study groups',
          'Leaderboards',
          'Instructor-created courses',
        ],
      },
      {
        label: 'Stage 7: Production Engineering',
        decks: [
          'PostgreSQL',
          'Authentication',
          'Authorization',
          'Automated testing',
          'Docker',
          'CI/CD',
          'Caching',
          'Background jobs',
          'Rate limiting',
          'Logging',
          'Monitoring',
          'Load testing',
          'Database optimization',
          'Horizontal scaling',
          'Security reviews',
        ],
      },
      {
        label: 'Completion Requirements',
        decks: [
          'Explain major concepts without notes',
          'Complete core exercises without AI solutions',
          'Debug representative problems',
          'Build a related platform feature',
          'Write automated tests',
          'Document what you built',
          'Review the feature weeks later',
          'Modify it without relearning everything',
        ],
      },
    ],
  }),
  plannedCourse({
    id: 'ts',
    code: 'TS',
    title: 'TypeScript',
    folder: 'typescript',
    group: 'languages',
    tagline: 'Seven short lessons. Types first, then the rest of the language.',
    modules: [
      {
        label: 'Language',
        decks: [
          { label: 'Types', slug: 'types-and-annotations', sheet: 'BASIC TYPES' },
          { label: 'Unions', slug: 'unions-and-narrowing', sheet: 'UNIONS AND INTERSECTIONS' },
          { label: 'Functions', slug: 'functions', sheet: 'FUNCTIONS' },
          { label: 'Arrays', slug: 'arrays-and-tuples', sheet: 'ARRAYS AND TUPLES' },
          { label: 'Objects', slug: 'object-types', sheet: 'OBJECT TYPES' },
          { label: 'Interfaces', slug: 'interfaces', sheet: 'INTERFACES' },
          { label: 'Generics', slug: 'generics', sheet: 'GENERICS' },
        ],
      },
      {
        label: 'Studio',
        decks: [
          'Add missing types',
          'Repair type errors',
          'Create interfaces',
          'Narrow union types',
          'Build generic functions',
          'Validate unknown data',
          'Convert JavaScript into TypeScript',
          'Compare compile-time and runtime validation',
        ],
      },
    ],
  }),
  plannedCourse({
    id: 'js',
    code: 'JS',
    title: 'JavaScript',
    folder: 'javascript',
    group: 'languages',
    tagline: 'Seven short lessons. Read the code, then practice it.',
    modules: [
      {
        label: 'Language',
        decks: [
          { label: 'Variables', slug: 'variables-and-data-types', sheet: 'VARIABLES AND TYPES' },
          { label: 'Comparisons', slug: 'conditionals', sheet: 'TYPE COERCION' },
          { label: 'Loops', sheet: 'CONTROL FLOW' },
          { label: 'Functions', slug: 'functions', sheet: 'FUNCTIONS' },
          { label: 'Arrays', slug: 'arrays', sheet: 'ARRAY' },
          { label: 'Objects', slug: 'objects', sheet: 'OBJECTS' },
          { label: 'Maps and Sets', slug: 'maps-and-sets', sheet: 'MAP' },
          { label: 'Array methods', sheet: 'ARRAY HIGHER ORDER METHODS' },
          { label: 'Closures', sheet: 'CLOSURES' },
          { label: 'Recursion', sheet: 'RECURSION AND MEMOIZATION' },
          { label: 'Classes', sheet: 'CLASSES' },
          { label: 'Error handling', sheet: 'ERROR HANDLING' },
          { label: 'Asynchronous JavaScript', sheet: 'ASYNC' },
        ],
      },
      {
        label: 'Interactive exercises',
        decks: [
          'Predict the output',
          'Complete the function',
          'Find the bug',
          'Refactor the code',
          'Choose the correct data structure',
          'Pass the provided test cases',
          'Explain why the output occurred',
        ],
      },
    ],
  }),
  plannedCourse({
    id: 'html',
    code: 'HTML',
    title: 'HTML',
    folder: 'html',
    group: 'languages',
    tagline: 'Seven short lessons. Markup first, then forms and accessibility.',
    modules: [
      {
        label: 'Language',
        decks: [
          { label: 'Document', slug: 'document-and-structure' },
          { label: 'Text and lists', slug: 'text-and-lists' },
          { label: 'Links and images', slug: 'links-and-images' },
          { label: 'Semantic elements', slug: 'semantic-elements' },
          { label: 'Forms', slug: 'forms' },
          { label: 'Tables and media', slug: 'tables-and-media' },
          { label: 'Accessibility', slug: 'accessibility' },
        ],
      },
      {
        label: 'Studio',
        decks: [
          'Construct page structures',
          'Correct invalid markup',
          'Choose semantic elements',
          'Build accessible forms',
          'Fix accessibility problems',
          'Preview rendered HTML',
          'Compare structure with an expected result',
        ],
      },
    ],
  }),
  plannedCourse({
    id: 'css',
    code: 'CSS',
    title: 'CSS',
    folder: 'css',
    group: 'languages',
    tagline: 'Seven short lessons. Cascade and boxes, then flex, grid, and responsive.',
    modules: [
      {
        label: 'Language',
        decks: [
          { label: 'Selectors', slug: 'selectors-and-cascade' },
          { label: 'Box model', slug: 'box-model' },
          { label: 'Type and color', slug: 'typography-and-color' },
          { label: 'Flexbox', slug: 'flexbox' },
          { label: 'Grid', slug: 'grid' },
          { label: 'Positioning', slug: 'positioning' },
          { label: 'Responsive', slug: 'responsive' },
        ],
      },
      {
        label: 'Studio',
        decks: [
          'Modify live CSS',
          'Practice Flexbox',
          'Practice Grid',
          'Recreate layouts',
          'Fix broken responsive designs',
          'Practice selectors and specificity',
          'Build animations',
          'Test mobile, tablet, and desktop layouts',
          'Match a provided visual target',
        ],
      },
    ],
  }),
  plannedCourse({
    id: 'py',
    code: 'PY',
    title: 'Python',
    folder: 'python',
    group: 'languages',
    tagline: 'Seven short lessons. Indentation, then lists, dicts, and comprehensions.',
    modules: [
      {
        label: 'Language',
        decks: [
          { label: 'Variables', slug: 'variables-and-types', sheet: 'VARIABLES AND TYPES' },
          { label: 'Conditionals', slug: 'conditionals', sheet: 'CONDITIONALS' },
          { label: 'Loops', slug: 'loops', sheet: 'LOOPS' },
          { label: 'Functions', slug: 'functions', sheet: 'FUNCTIONS' },
          { label: 'Lists', slug: 'lists', sheet: 'LISTS' },
          { label: 'Dicts and sets', slug: 'dicts-and-sets', sheet: 'DICTS AND SETS' },
          { label: 'Comprehensions', slug: 'comprehensions', sheet: 'COMPREHENSIONS' },
        ],
      },
      {
        label: 'Studio',
        decks: [
          'Predict the output',
          'Complete the function',
          'Find the bug',
          'Refactor the code',
          'Choose the correct data structure',
          'Pass the provided test cases',
          'Explain why the output occurred',
        ],
      },
    ],
  }),
  plannedCourse({
    id: 'ds',
    code: 'DS',
    title: 'Data Structures',
    folder: 'data-structures',
    group: 'algorithms',
    tagline: 'Visualize, traverse, and implement structures from scratch.',
    modules: [
      {
        label: 'Studio',
        decks: [
          'Visualize arrays, stacks, queues, and linked lists',
          'Step through tree traversals',
          'Construct binary-search trees',
          'Manipulate heaps',
          'Explore hash collisions',
          'Traverse graphs',
          'Compare operations and runtime complexity',
          'Implement each structure from scratch',
        ],
      },
    ],
  }),
  plannedCourse({
    id: 'algo',
    code: 'ALGO',
    title: 'Algorithms',
    folder: 'algorithms',
    group: 'algorithms',
    tagline: 'Step through algorithms and compare brute-force with optimized solutions.',
    modules: [
      {
        label: 'Studio',
        decks: [
          'Run algorithms step by step',
          'Visualize sorting',
          'Visualize binary search',
          'Trace recursion',
          'Move sliding-window boundaries',
          'Explore two-pointer solutions',
          'Traverse trees and graphs',
          'Compare brute-force and optimized solutions',
          'Measure runtime',
          'Submit solutions against hidden test cases',
        ],
      },
    ],
  }),
  (() => {
    const folder = ROOT + '/leetcode';
    const topic = (label, slug, subtitle) => {
      const s = slug || label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const modFolder = folder + '/' + s;
      const deckFolder = modFolder + '/patterns';
      return {
        id: 'lc-' + s,
        label,
        folder: modFolder,
        decks: [
          {
            id: 'lc-' + s + '-patterns',
            label: 'Patterns',
            subtitle: subtitle || 'Folder ready · add quiz JSON when you have it',
            comingSoon: true,
            folder: deckFolder,
          },
        ],
      };
    };
    return {
      id: 'lc',
      code: 'LC',
      title: 'LeetCode-Style Practice',
      tagline: 'Topic modules. Memorize pattern skeletons, then recognize them on problems.',
      group: 'algorithms',
      program: true,
      folder,
      modules: [
        topic('Arrays', 'arrays', 'Pattern skeletons, then recognize them on array problems'),
        topic('Strings and hash', 'strings-and-hash'),
        topic('Linked lists', 'linked-lists'),
        topic('Trees', 'trees'),
        topic('Graphs', 'graphs'),
        topic('Dynamic programming', 'dynamic-programming'),
      ],
    };
  })(),
  plannedCourse({
    id: 'electronics',
    code: 'EE',
    title: 'Electronics',
    folder: 'Electronics',
    group: 'process',
    tagline: 'PCB design literacy plus interview prep for electronics sourcing roles.',
    modules: [
      {
        label: 'PCB Design Guide',
        slug: 'pcb-design-guide',
        decks: [
          { label: 'Chapter 1', slug: 'chapter-1-a-new-design-gig', subtitle: 'A New Design Gig · SpaceX sourcing prep' },
          { label: 'Chapter 2', slug: 'chapter-2-dfm', subtitle: 'DFM · fab vs assembly' },
          { label: 'Chapter 3', slug: 'chapter-3-stakeholders', subtitle: 'Stakeholders before layout' },
          { label: 'Chapter 4', slug: 'chapter-4-schematic', subtitle: 'Schematic capture' },
          { label: 'Chapter 5', slug: 'chapter-5-layout-placement', subtitle: 'Setup and placement' },
          { label: 'Chapter 6', slug: 'chapter-6-dft', subtitle: 'DFT for ICT and JTAG' },
          { label: 'Chapter 7', slug: 'chapter-7-stackup', subtitle: 'Stackup · impedance overlap' },
          { label: 'Chapter 8', slug: 'chapter-8-routing-planes', subtitle: 'Routing, planes, SI' },
          { label: 'Chapter 9', slug: 'chapter-9-fab-data', subtitle: 'Fab data package' },
          { label: 'Chapter 10', slug: 'chapter-10-assembly', subtitle: 'Assembly data package' },
        ],
      },
    ],
  }),
  plannedCourse({
    id: 'db',
    code: 'DB',
    title: 'Database',
    folder: 'database',
    group: 'systems',
    tagline: 'SQL, schemas, indexes, and query plans on sample business data.',
    modules: [
      {
        label: 'Studio',
        decks: [
          'Write SQL queries',
          'Create tables',
          'Add relationships',
          'Practice joins',
          'Build indexes',
          'Normalize schemas',
          'Analyze query plans',
          'Repair inefficient queries',
          'Work with sample business databases',
          'Compare relational and document models',
        ],
      },
    ],
  }),
  plannedCourse({
    id: 'api',
    code: 'API',
    title: 'API',
    folder: 'api',
    group: 'systems',
    tagline: 'HTTP, auth, pagination, webhooks, and REST design.',
    modules: [
      {
        label: 'Studio',
        decks: [
          'Send HTTP requests',
          'Inspect request and response headers',
          'Practice HTTP methods',
          'Interpret status codes',
          'Build request bodies',
          'Handle authentication',
          'Work with pagination',
          'Implement retries',
          'Process webhooks',
          'Diagnose broken API requests',
          'Design REST endpoints',
        ],
      },
    ],
  }),
  plannedCourse({
    id: 'test',
    code: 'TEST',
    title: 'Testing',
    folder: 'testing',
    group: 'quality',
    tagline: 'Unit tests, mocks, API and React tests, and coverage.',
    modules: [
      {
        label: 'Studio',
        decks: [
          'Write unit tests',
          'Repair failing tests',
          'Test asynchronous functions',
          'Create mocks and stubs',
          'Test API endpoints',
          'Test React components',
          'Interpret test output',
          'Improve weak test coverage',
          'Add regression tests for bugs',
        ],
      },
    ],
  }),
  plannedCourse({
    id: 'dbg',
    code: 'DBG',
    title: 'Debugging',
    folder: 'debugging',
    group: 'quality',
    tagline: 'Broken programs plus a reproduce → fix → regression-test workflow.',
    modules: [
      {
        label: 'Broken programs',
        decks: [
          'Syntax errors',
          'Logic errors',
          'Incorrect conditions',
          'Infinite loops',
          'Invalid state',
          'Promise errors',
          'Race conditions',
          'API failures',
          'Database problems',
          'React rendering problems',
          'Performance problems',
        ],
      },
      {
        label: 'Workflow',
        decks: [
          'Reproduce the problem',
          'Identify the cause',
          'Explain the cause',
          'Correct the code',
          'Add a test that prevents regression',
        ],
      },
    ],
  }),
  plannedCourse({
    id: 'sd',
    code: 'SD',
    title: 'System Design',
    folder: 'system-design',
    group: 'systems',
    tagline: 'Tradeoffs first: foundations, building blocks, then classic systems.',
    modules: [
      {
        label: 'Foundations',
        slug: 'foundations',
        decks: [
          { label: 'What is system design', slug: 'what-is-system-design', subtitle: 'Tradeoffs · three books' },
          { label: 'Reliability · scale · maintain', slug: 'reliability-scalability-maintainability', subtitle: 'DDIA nonfunctional pillars' },
          { label: 'Architecture thinking', slug: 'architecture-thinking', subtitle: 'FSA laws & -ilities' },
          { label: 'Scale building blocks', slug: 'scale-building-blocks', subtitle: 'Xu Ch1 zero → millions' },
          { label: 'Estimation & framework', slug: 'estimation-and-framework', subtitle: 'Xu Ch2–3 interview path' },
        ],
      },
      {
        label: 'Design choices',
        slug: 'design-choices',
        decks: [
          { label: 'Application architecture', subtitle: 'Styles · stateless web' },
          { label: 'Database', subtitle: 'SQL · NoSQL · when' },
          { label: 'Cache', subtitle: 'Hits · consistent hashing' },
          { label: 'Queue', subtitle: 'Async · idempotency' },
          { label: 'API structure', subtitle: 'REST · rate limits' },
          { label: 'Authentication strategy', subtitle: 'Identity · tokens' },
          { label: 'Scaling strategy', subtitle: 'LB · shards · 10×' },
          { label: 'Failure-handling strategy', subtitle: 'Redundancy · retries' },
          { label: 'Logging and monitoring', subtitle: 'Metrics · fitness' },
          { label: 'Security controls', subtitle: 'Authz · abuse limits' },
        ],
      },
      {
        label: 'Systems',
        slug: 'systems',
        decks: [
          { label: 'URL shortener', subtitle: 'Xu Ch8 redirects & IDs' },
          { label: 'Notification service', subtitle: 'Xu Ch10 push · SMS · email' },
          { label: 'News feed', slug: 'news-feed', subtitle: 'Fan-out push vs pull' },
          { label: 'File-upload system', subtitle: 'Drive-like blobs & CDN' },
          { label: 'Quiz platform', subtitle: 'Design Json2Exam itself' },
          { label: 'Timecard system', subtitle: 'Folder ready · expand later' },
          { label: 'Product catalog', subtitle: 'Folder ready · expand later' },
          { label: 'Order-processing system', subtitle: 'Folder ready · expand later' },
          { label: 'Photo-processing pipeline', subtitle: 'Folder ready · expand later' },
        ],
      },
    ],
  }),
];

export const COURSE_GROUPS = [
  { id: 'process', label: 'Software engineering' },
  { id: 'languages', label: 'Languages' },
  { id: 'algorithms', label: 'Algorithms' },
  { id: 'systems', label: 'Systems' },
  { id: 'quality', label: 'Quality' },
  { id: 'platform', label: 'Platform' },
];

export function appliedScaffoldItems() {
  const items = [{
    folder: ROOT,
    title: 'Applied Classroom Development',
    kind: 'program',
  }];
  APPLIED_COURSES.forEach((course) => {
    items.push({ folder: course.folder, title: course.title, kind: 'course', course });
    course.modules.forEach((mod) => {
      items.push({ folder: mod.folder, title: mod.label, kind: 'module', course, mod });
      mod.decks.forEach((deck) => {
        items.push({ folder: deck.folder, title: deck.label, kind: 'deck', course, mod, deck });
      });
    });
  });
  return items;
}
