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
    tagline: 'Structure, semantics, forms, and accessibility.',
    modules: [
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
    tagline: 'Layout, responsiveness, and matching a visual target.',
    modules: [
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
    id: 'ts',
    code: 'TS',
    title: 'TypeScript',
    folder: 'typescript',
    group: 'languages',
    tagline: 'Types, interfaces, generics, and compile-time vs runtime checks.',
    modules: [
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
  plannedCourse({
    id: 'lc',
    code: 'LC',
    title: 'LeetCode-Style Practice',
    folder: 'leetcode',
    group: 'algorithms',
    tagline: 'Problems with tests, hints, complexity, and attempt history.',
    modules: [
      {
        label: 'Problem format',
        decks: [
          'Problem statement',
          'Examples',
          'Constraints',
          'Starter code',
          'Test cases',
          'Hidden test cases',
          'Hints',
          'Solution explanation',
          'Time-complexity analysis',
          'Space-complexity analysis',
          'Alternative solutions',
          'Attempt history',
          'Difficulty rating',
          'Topic tags',
        ],
      },
      {
        label: 'Filters',
        decks: [
          'Difficulty',
          'Data structure',
          'Algorithm pattern',
          'Completed status',
          'Failed attempts',
          'Confidence level',
          'Interview frequency',
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
    tagline: 'Design systems and compare tradeoffs, not one perfect answer.',
    modules: [
      {
        label: 'Systems',
        decks: [
          'URL shortener',
          'Quiz platform',
          'Timecard system',
          'File-upload system',
          'Notification service',
          'Product catalog',
          'Order-processing system',
          'Photo-processing pipeline',
        ],
      },
      {
        label: 'Design choices',
        decks: [
          'Application architecture',
          'Database',
          'Cache',
          'Queue',
          'API structure',
          'Authentication strategy',
          'Scaling strategy',
          'Failure-handling strategy',
          'Logging and monitoring',
          'Security controls',
        ],
      },
    ],
  }),
];

export const COURSE_GROUPS = [
  { id: 'platform', label: 'Platform' },
  { id: 'languages', label: 'Languages' },
  { id: 'algorithms', label: 'Algorithms' },
  { id: 'systems', label: 'Systems' },
  { id: 'quality', label: 'Quality' },
  { id: 'process', label: 'Software engineering' },
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
