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
import audio541Ch1 from '../../541-Mod1/Ch1/Chapter 1V2.mp3?url';
import audio541Ch2 from '../../541-Mod1/Ch2/Chapter 2v2.mp3?url';
import audio541Ch3 from '../../541-Mod1/Ch3/Chapter 3v2.mp3?url';
import audio541Ch4 from '../../541-Mod1/Ch4/Chapter 4v2.mp3?url';
import audio541Ch5 from '../../541-Mod1/Ch5/Chapter 5v2.mp3?url';
import book541Ch1 from '../../541-Mod1/Ch1/Book-chapter 1.pdf?url';
import book541Ch2 from '../../541-Mod1/Ch2/Book-chapter 2.pdf?url';
import book541Ch3 from '../../541-Mod1/Ch3/Book-chapter 3.pdf?url';
import book541Ch4 from '../../541-Mod1/Ch4/Book-chapter 4.pdf?url';
import book541Ch5 from '../../541-Mod1/Ch5/Book-chapter 5.pdf?url';
import slides541Ch1 from '../../541-Mod1/Ch1/chapter 1.pdf?url';
import slides541Ch2 from '../../541-Mod1/Ch2/chapter 2V2.pdf?url';
import slides541Ch3 from '../../541-Mod1/Ch3/chapter 3.pdf?url';
import slides541Ch4 from '../../541-Mod1/Ch4/chapter 4.pdf?url';
import slides541Ch5 from '../../541-Mod1/Ch5/chapter 5.pdf?url';
import deck544Ch1 from '../../544-Mod-1/Ch1/SWmaturity.json';
import deck544Ch2 from '../../544-Mod-1/Ch2/processChange.json';
import deck544Ch3 from '../../544-Mod-1/Ch3/processAssessment.json';
import deck544Ch4 from '../../544-Mod-1/Ch4/cpsc544_04_initial_process_quiz.json';
import deck544Ch5 from '../../544-Mod-1/Ch5/cpsc544_ch5_managing_software_organizations_quiz.json';
import lecture544Ch1 from '../../544-Mod-1/Ch1/cpsc544_01_v_SWmaturity.txt?raw';
import lecture544Ch2 from '../../544-Mod-1/Ch2/cpsc544_02_v_ProcessChange(2).txt?raw';
import lecture544Ch3 from '../../544-Mod-1/Ch3/cpsc544_03_v_ProcessAssessment.txt?raw';
import lecture544Ch4 from '../../544-Mod-1/Ch4/cpsc544_04_v_InitialProcess.txt?raw';
import lecture544Ch5 from '../../544-Mod-1/Ch5/cpsc544_05_v_ManagingSWorg.txt?raw';
import slides544Ch1 from '../../544-Mod-1/Ch1/cpsc544-01-SWmaturity.pdf?url';
import slides544Ch2 from '../../544-Mod-1/Ch2/cpsc544-02-ProcessChange.pdf?url';
import slides544Ch3 from '../../544-Mod-1/Ch3/cpsc544-03-ProcessAssessment.pdf?url';
import slides544Ch4 from '../../544-Mod-1/Ch4/cpsc544-04-InitialProcess.pdf?url';
import slides544Ch5 from '../../544-Mod-1/Ch5/Ch.pdf?url';
import deck544Agile from '../../544-Mod-1/Agile_XP/agile_xp_quiz.json';
import lecture544Agile from '../../544-Mod-1/Agile_XP/Agile_XP_video.txt?raw';
import slides544Agile from '../../544-Mod-1/Agile_XP/Agile_XP.pdf?url';
import deck544Scrum from '../../544-Mod-1/Scrum/Scrum.json';
import lecture544Scrum from '../../544-Mod-1/Scrum/Scrum_video.txt?raw';
import slides544Scrum from '../../544-Mod-1/Scrum/Scrum.pdf?url';

import { APPLIED_COURSES } from './appliedClassroom.js';
import jsCheatsheet from '../../applied-classroom/javascript-cheatsheet.txt?raw';
import tsCheatsheet from '../../applied-classroom/typescript-cheatsheet.txt?raw';

const lectureVideos = import.meta.glob('../../544-Mod-1/**/*.mp4', {
  query: '?url',
  import: 'default',
  eager: true,
});

const DEFAULT_VIDEO_BASE = 'https://pub-ea8a251ae8ec4d72aff3a85dc2b9627b.r2.dev';

function lectureVideo(rel) {
  const base = String(import.meta.env.VITE_LECTURE_VIDEO_BASE || DEFAULT_VIDEO_BASE).replace(/\/$/, '');
  if (base) return base + '/' + rel;
  return lectureVideos['../../544-Mod-1/' + rel] || '';
}

const appliedQuizzes = import.meta.glob('../../applied-classroom/**/quiz.json', { eager: true });
const appliedNotes = import.meta.glob('../../applied-classroom/**/notes.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const appliedBookFiles = import.meta.glob('../../applied-classroom/javascript/sources/*.pdf', {
  query: '?url',
  import: 'default',
  eager: true,
});

function appliedQuiz(folder) {
  const mod = appliedQuizzes['../../' + folder + '/quiz.json'];
  return (mod && mod.default) || mod || null;
}

function booksIn(folder) {
  const prefix = '../../' + folder + '/sources/';
  const list = [];
  Object.keys(appliedBookFiles).forEach((key) => {
    if (!key.startsWith(prefix) || !key.toLowerCase().endsWith('.pdf')) return;
    const file = key.slice(prefix.length);
    list.push({
      title: file.replace(/\.pdf$/i, ''),
      file,
      url: appliedBookFiles[key],
    });
  });
  list.sort((a, b) => a.title.localeCompare(b.title));
  return list;
}

function courseSheet(course) {
  if (course && course.id === 'js') return jsCheatsheet;
  if (course && course.id === 'ts') return tsCheatsheet;
  return '';
}

function hydrateApplied(course) {
  const books = booksIn(course.folder);
  const cheatsheet = courseSheet(course);
  return Object.assign({}, course, {
    books,
    cheatsheet,
    modules: (course.modules || []).map((mod) => Object.assign({}, mod, {
      decks: (mod.decks || []).map((deck) => {
        const data = appliedQuiz(deck.folder);
        const questions = data && Array.isArray(data.questions) ? data.questions : [];
        const notes = appliedNotes['../../' + deck.folder + '/notes.md'] || '';
        return Object.assign({}, deck, {
          file: 'quiz.json',
          data: data,
          notesFile: 'notes.md',
          notes: notes,
          books,
          cheatsheet,
          jsIntro: course.id === 'js' && mod.label === 'Language',
          comingSoon: questions.length === 0,
          subtitle: questions.length ? (deck.subtitle || '') : (deck.folder + '/quiz.json'),
        });
      }),
    })),
  });
}

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
    program: true,
    group: 'process',
    tagline: 'Software requirements, from need to specification.',
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
            lectureAudioFile: 'Chapter 1V2.mp3',
            lectureAudio: audio541Ch1,
            bookFile: 'Book-chapter 1.pdf',
            bookUrl: book541Ch1,
            slidesFile: 'chapter 1.pdf',
            slidesUrl: slides541Ch1,
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
            lectureAudioFile: 'Chapter 2v2.mp3',
            lectureAudio: audio541Ch2,
            bookFile: 'Book-chapter 2.pdf',
            bookUrl: book541Ch2,
            slidesFile: 'chapter 2V2.pdf',
            slidesUrl: slides541Ch2,
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
            lectureAudioFile: 'Chapter 3v2.mp3',
            lectureAudio: audio541Ch3,
            bookFile: 'Book-chapter 3.pdf',
            bookUrl: book541Ch3,
            slidesFile: 'chapter 3.pdf',
            slidesUrl: slides541Ch3,
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
            lectureAudioFile: 'Chapter 4v2.mp3',
            lectureAudio: audio541Ch4,
            bookFile: 'Book-chapter 4.pdf',
            bookUrl: book541Ch4,
            slidesFile: 'chapter 4.pdf',
            slidesUrl: slides541Ch4,
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
            lectureAudioFile: 'Chapter 5v2.mp3',
            lectureAudio: audio541Ch5,
            bookFile: 'Book-chapter 5.pdf',
            bookUrl: book541Ch5,
            slidesFile: 'chapter 5.pdf',
            slidesUrl: slides541Ch5,
          },
        ],
      },
    ],
  },
  {
    id: '544',
    code: '544',
    title: 'Advanced Software Process',
    program: true,
    group: 'process',
    tagline: 'Process maturity, change, assessment, Agile, and Scrum.',
    modules: [
      {
        id: '544-mod1',
        label: 'Module 1',
        decks: [
          {
            id: '544-ch1',
            label: 'Chapter 1',
            subtitle: 'A Software Maturity Framework',
            file: 'SWmaturity.json',
            data: deck544Ch1,
            lectureFile: 'cpsc544_01_v_SWmaturity.txt',
            lecture: lecture544Ch1,
            lectureVideoFile: 'cpsc544_01_v_SWmaturity.mp4',
            lectureVideo: lectureVideo('Ch1/cpsc544_01_v_SWmaturity.mp4'),
            bookFile: 'cpsc544-01-SWmaturity.pdf',
            bookUrl: slides544Ch1,
            slidesFile: 'cpsc544-01-SWmaturity.pdf',
            slidesUrl: slides544Ch1,
          },
          {
            id: '544-ch2',
            label: 'Chapter 2',
            subtitle: 'The Principles of Software Process Change',
            file: 'processChange.json',
            data: deck544Ch2,
            lectureFile: 'cpsc544_02_v_ProcessChange(2).txt',
            lecture: lecture544Ch2,
            lectureVideoFile: 'cpsc544_02_v_ProcessChange.mp4',
            lectureVideo: lectureVideo('Ch2/cpsc544_02_v_ProcessChange.mp4'),
            bookFile: 'cpsc544-02-ProcessChange.pdf',
            bookUrl: slides544Ch2,
            slidesFile: 'cpsc544-02-ProcessChange.pdf',
            slidesUrl: slides544Ch2,
          },
          {
            id: '544-ch3',
            label: 'Chapter 3',
            subtitle: 'Software Process Assessment',
            file: 'processAssessment.json',
            data: deck544Ch3,
            lectureFile: 'cpsc544_03_v_ProcessAssessment.txt',
            lecture: lecture544Ch3,
            lectureVideoFile: 'cpsc544_03_v_ProcessAssessment.mp4',
            lectureVideo: lectureVideo('Ch3/cpsc544_03_v_ProcessAssessment.mp4'),
            bookFile: 'cpsc544-03-ProcessAssessment.pdf',
            bookUrl: slides544Ch3,
            slidesFile: 'cpsc544-03-ProcessAssessment.pdf',
            slidesUrl: slides544Ch3,
          },
          {
            id: '544-ch4',
            label: 'Chapter 4',
            subtitle: 'The Initial Process',
            file: 'cpsc544_04_initial_process_quiz.json',
            data: deck544Ch4,
            lectureFile: 'cpsc544_04_v_InitialProcess.txt',
            lecture: lecture544Ch4,
            lectureVideoFile: 'cpsc544_04_v_InitialProcess.mp4',
            lectureVideo: lectureVideo('Ch4/cpsc544_04_v_InitialProcess.mp4'),
            bookFile: 'cpsc544-04-InitialProcess.pdf',
            bookUrl: slides544Ch4,
            slidesFile: 'cpsc544-04-InitialProcess.pdf',
            slidesUrl: slides544Ch4,
          },
          {
            id: '544-ch5',
            label: 'Chapter 5',
            subtitle: 'Managing Software Organizations',
            file: 'cpsc544_ch5_managing_software_organizations_quiz.json',
            data: deck544Ch5,
            lectureFile: 'cpsc544_05_v_ManagingSWorg.txt',
            lecture: lecture544Ch5,
            lectureVideoFile: 'cpsc544_05_v_ManagingSWorg.mp4',
            lectureVideo: lectureVideo('Ch5/cpsc544_05_v_ManagingSWorg.mp4'),
            bookFile: 'Ch.pdf',
            bookUrl: slides544Ch5,
            slidesFile: 'Ch.pdf',
            slidesUrl: slides544Ch5,
          },
          {
            id: '544-agile',
            label: 'Agile & XP',
            subtitle: 'Agile Process and Extreme Programming',
            file: 'agile_xp_quiz.json',
            data: deck544Agile,
            lectureFile: 'Agile_XP_video.txt',
            lecture: lecture544Agile,
            lectureVideoFile: 'Agile_XP_video.mp4',
            lectureVideo: lectureVideo('Agile_XP/Agile_XP_video.mp4'),
            bookFile: 'Agile_XP.pdf',
            bookUrl: slides544Agile,
            slidesFile: 'Agile_XP.pdf',
            slidesUrl: slides544Agile,
          },
          {
            id: '544-scrum',
            label: 'Scrum',
            subtitle: 'The Scrum process',
            file: 'Scrum.json',
            data: deck544Scrum,
            lectureFile: 'Scrum_video.txt',
            lecture: lecture544Scrum,
            lectureVideoFile: 'Scrum_video.mp4',
            lectureVideo: lectureVideo('Scrum/Scrum_video.mp4'),
            bookFile: 'Scrum.pdf',
            bookUrl: slides544Scrum,
            slidesFile: 'Scrum.pdf',
            slidesUrl: slides544Scrum,
          },
        ],
      },
    ],
  },
  ...APPLIED_COURSES.map(hydrateApplied),
];
