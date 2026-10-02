/**
 * Canonical display titles for the PDFs on disk. Filenames vary in how they
 * spell authors and editions; references and the UI should agree on one name.
 */
const TITLE_OVERRIDES = [
  [/hitchhikers-guide-to-pcb-design/i, "The Hitchhiker's Guide to PCB Design"],
  [/high-speed-pcb-design-guide/i, 'High-Speed PCB Design Guide'],
  [/system-design-interview/i, "System Design Interview – An Insider's Guide by Alex Xu"],
  [/designing-data-intensive/i, 'Designing Data-Intensive Applications by Martin Kleppmann'],
  [/fundamentals-of-software-architecture/i, 'Fundamentals of Software Architecture, 2nd Edition by Mark Richards and Neal Ford'],
  [/python crash course/i, 'Python Crash Course, 3rd Edition by Eric Matthes'],
  [/fluent python/i, 'Fluent Python, 2nd Edition by Luciano Ramalho'],
  [/^algorithms, 4th edition/i, 'Algorithms, 4th Edition by Robert Sedgewick and Kevin Wayne'],
  [/introduction to algorithms/i, 'Introduction to Algorithms, 4th Edition by Thomas Cormen, Charles Leiserson, Ronald Rivest, and Clifford Stein'],
  [/elements of programming interviews/i, 'Elements of Programming Interviews by Adnan Aziz, Tsung-Hsien Lee, and Amit Prakash'],
  [/cracking the coding interview/i, 'Cracking the Coding Interview by Gayle Laakmann McDowell'],
  [/responsible javascript/i, 'Responsible JavaScript by Jeremy Wagner'],
];

export function canonicalBookTitle(file) {
  const name = String(file || '').replace(/^.*\//, '');
  for (const [re, title] of TITLE_OVERRIDES) {
    if (re.test(name)) return title;
  }
  return name.replace(/\.pdf$/i, '');
}
