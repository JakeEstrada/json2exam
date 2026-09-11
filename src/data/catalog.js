import deck541Ch1 from '../../541-Mod1/Ch1/ch1.json';
import deck541Ch2 from '../../541-Mod1/Ch2/Ch2.json';
import deck541Ch3 from '../../541-Mod1/Ch3/Ch3.json';
import deck541Ch4 from '../../541-Mod1/Ch4/Ch4.json';
import deck541Ch5 from '../../541-Mod1/Ch5/Ch5.json';
import notes541Mod1 from '../../541-Mod1/00-how-the-chapters-connect.md?raw';
import notes541Ch1 from '../../541-Mod1/Ch1/ch01-essential-software-requirement.md?raw';
import notes541Ch2 from '../../541-Mod1/Ch2/ch02-customer-perspective.md?raw';
import notes541Ch3 from '../../541-Mod1/Ch3/ch03-good-practices.md?raw';
import notes541Ch4 from '../../541-Mod1/Ch4/ch04-business-analyst.md?raw';
import notes541Ch5 from '../../541-Mod1/Ch5/ch05-business-requirements.md?raw';
import lecture541Ch1 from '../../541-Mod1/Ch1/Chapter 1V2.txt?raw';
import lecture541Ch2 from '../../541-Mod1/Ch2/Chapter 2v2.txt?raw';
import lecture541Ch3 from '../../541-Mod1/Ch3/Chapter 3v2.txt?raw';
import lecture541Ch4 from '../../541-Mod1/Ch4/Chapter 4v2.txt?raw';
import lecture541Ch5 from '../../541-Mod1/Ch5/Chapter 5v2.txt?raw';
import book541Ch1 from '../../541-Mod1/Ch1/Book-chapter 1.pdf?url';
import book541Ch2 from '../../541-Mod1/Ch2/Book-chapter 2.pdf?url';
import book541Ch3 from '../../541-Mod1/Ch3/Book-chapter 3.pdf?url';
import book541Ch4 from '../../541-Mod1/Ch4/Book-chapter 4.pdf?url';
import book541Ch5 from '../../541-Mod1/Ch5/Book-chapter 5.pdf?url';

export function courseDecks(course) {
  if (course && Array.isArray(course.modules) && course.modules.length) {
    return course.modules.flatMap((mod) => mod.decks || []);
  }
  return (course && course.decks) || [];
}

export const COURSES = [
  {
    id: '541',
    code: '541',
    title: 'Requirements Engineering',
    modules: [
      {
        id: '541-mod1',
        label: 'Module 1',
        overviewFile: '00-how-the-chapters-connect.md',
        overview: notes541Mod1,
        decks: [
          {
            id: '541-ch1',
            label: 'Chapter 1',
            subtitle: 'The Essential Software Requirement',
            file: 'ch1.json',
            data: deck541Ch1,
            notesFile: 'ch01-essential-software-requirement.md',
            notes: notes541Ch1,
            lectureFile: 'Chapter 1V2.txt',
            lecture: lecture541Ch1,
            bookFile: 'Book-chapter 1.pdf',
            bookUrl: book541Ch1,
          },
          {
            id: '541-ch2',
            label: 'Chapter 2',
            subtitle: "Requirements from the Customer's Perspective",
            file: 'Ch2.json',
            data: deck541Ch2,
            notesFile: 'ch02-customer-perspective.md',
            notes: notes541Ch2,
            lectureFile: 'Chapter 2v2.txt',
            lecture: lecture541Ch2,
            bookFile: 'Book-chapter 2.pdf',
            bookUrl: book541Ch2,
          },
          {
            id: '541-ch3',
            label: 'Chapter 3',
            subtitle: 'Good Practices for Requirements Engineering',
            file: 'Ch3.json',
            data: deck541Ch3,
            notesFile: 'ch03-good-practices.md',
            notes: notes541Ch3,
            lectureFile: 'Chapter 3v2.txt',
            lecture: lecture541Ch3,
            bookFile: 'Book-chapter 3.pdf',
            bookUrl: book541Ch3,
          },
          {
            id: '541-ch4',
            label: 'Chapter 4',
            subtitle: 'The Requirements (Business) Analyst',
            file: 'Ch4.json',
            data: deck541Ch4,
            notesFile: 'ch04-business-analyst.md',
            notes: notes541Ch4,
            lectureFile: 'Chapter 4v2.txt',
            lecture: lecture541Ch4,
            bookFile: 'Book-chapter 4.pdf',
            bookUrl: book541Ch4,
          },
          {
            id: '541-ch5',
            label: 'Chapter 5',
            subtitle: 'Establishing the Business Requirements',
            file: 'Ch5.json',
            data: deck541Ch5,
            notesFile: 'ch05-business-requirements.md',
            notes: notes541Ch5,
            lectureFile: 'Chapter 5v2.txt',
            lecture: lecture541Ch5,
            bookFile: 'Book-chapter 5.pdf',
            bookUrl: book541Ch5,
          },
        ],
      },
    ],
  },
  {
    id: '544',
    code: '544',
    decks: [],
  },
];
