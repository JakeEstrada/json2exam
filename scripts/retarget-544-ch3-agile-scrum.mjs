import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { matchingLectureIndexes, parseLecture, normLecture } from '../src/lib/lecture.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const DECKS = [
  {
    json: '544-Mod-1/Ch3/processAssessment.json',
    txt: '544-Mod-1/Ch3/cpsc544_03_v_ProcessAssessment.txt',
  },
  {
    json: '544-Mod-1/Agile_XP/agile_xp_quiz.json',
    txt: '544-Mod-1/Agile_XP/Agile_XP_video.txt',
  },
  {
    json: '544-Mod-1/Scrum/Scrum.json',
    txt: '544-Mod-1/Scrum/Scrum_video.txt',
  },
];

const STOP = new Set(`
  about after also because been being chapter class course does done each from have into
  just like more most only other over some such than that the their them then they this
  those through used using very where which while with would your what when who how why
  software process organization organizations project projects assessment assessments
`.trim().split(/\s+/));

const RULES = [
  // Ch3
  { test: /main purpose of a software process assessment/i, prefer: ['not only we assess the current status of process but also we like to find'] },
  { test: /basic objectives of a software process assessment/i, prefer: ['basic assessment objectives are to learn how the organization works'] },
  { test: /primarily an audit used to report problems/i, prefer: ['the most important thing we have to produce as a result of assessment is the findings'] },
  { test: /three typical phases of an assessment/i, prefer: ['in the assessment we have usually three phases'] },
  { test: /especially important during the preparation phase/i, prefer: ['senior management commitment is very important to succeed'] },
  { test: /preparation phase typically concludes/i, prefer: ['it\'s a good idea to have assessment team training'] },
  { test: /what happens during the assessment phase/i, prefer: ['once you go into the assessment phase, then we have to go there and perform assessment'] },
  { test: /major activity of the recommendations phase/i, prefer: ['build the action item list'] },
  { test: /among the five assessment principles/i, prefer: ['five assessment principles here'] },
  { test: /why does an assessment need a process model/i, prefer: ['we need a model, right? so for example, we may use the cmmi'] },
  { test: /main reason strict confidentiality is necessary/i, prefer: ['requirement for confidentiality, if you do not do'] },
  { test: /confidentiality is required only for lower-level/i, prefer: ['computationality is required at all organizational levels'] },
  { test: /non-attribution rule mean/i, prefer: ['we do not associate certain information with the specific person or specific project'] },
  { test: /why is senior management involvement important/i, prefer: ['senior managers have power to'] },
  { test: /site manager is not personally involved/i, prefer: ['without having that, it\'s very hard to succeed'] },
  { test: /resentment or lack of cooperation/i, prefer: ['attitude of respect for abuse of people'] },
  { test: /main idea behind an action orientation/i, prefer: ['action orientation means if you will not do the action afterward'] },
  { test: /no intention of taking improvement action/i, prefer: ['if you do not do action you don\'t need to do assessment'] },
  { test: /first step in the assessment process/i, prefer: ['first thing for the assessment we have to do is to find out assessment team'] },
  { test: /who is selected first when forming/i, prefer: ['assessment team leader should be selected'] },
  { test: /how large is a typical adequate assessment team/i, prefer: ['you may have one, two, three, four members'] },
  { test: /professional software experience is suggested/i, prefer: ['have at least eight to ten years of professional software experience'] },
  { test: /characteristics are desirable in an assessment team member/i, prefer: ['able to deal with people in informal and non-threatening manner'] },
  { test: /should not serve as an assessment team member/i, prefer: ['team manager who are under assessment cannot serve'] },
  { test: /engineer working directly on a project being assessed/i, prefer: ['if you are an engineer to produce the product in that project you cannot'] },
  { test: /potential problem with self-assessment/i, prefer: ['few organizations can afford the stable assessment experts'] },
  { test: /comparing internal and external assessors/i, prefer: ['but we have to consider cost and confidentiality'] },
  { test: /who should sign a written agreement/i, prefer: ['formal contract agreement'] },
  { test: /commit to participating through which activities/i, prefer: ['commitment from the team members to serve entirely'] },
  { test: /happens at the beginning of the on-site period/i, prefer: ['in the first day, we usually perform a briefing'] },
  { test: /day one, day two, day three, day four/i, prefer: ['don\'t misunderstand the unit only four days'] },
  { test: /difference between discovery mode and verification mode/i, prefer: ['discovery mode is the assessment team discovers all the evidences'] },
  { test: /organizations often prefer verification mode/i, prefer: ['mostly people like to go with the verification mode'] },
  { test: /document and evidence review generally happen before interviews/i, prefer: ['before we have a functional interview, we have to complete all the checking'] },
  { test: /what should assessment conduct focus on/i, prefer: ['we find something from there, okay? some good things, bad things'] },
  { test: /how many functional-area representatives/i, prefer: ['interviewees are from all different various areas'] },
  { test: /examples of functional areas that may be represented/i, prefer: ['quality assurance people who can talk about the support functions'] },
  { test: /kind of person should normally serve as a functional-area/i, prefer: ['some of them should be good engineers'] },
  { test: /probing questions often necessary/i, prefer: ['even though they are using the one terminology, they interpret it different ways'] },
  { test: /before initial findings are finalized/i, prefer: ['presentation of preliminary findings to the managers and to the engineers'] },
  { test: /findings should generally be limited to about how many/i, prefer: ['present the most important 10 findings'] },
  { test: /characteristics should a strong finding have/i, prefer: ['you will focus on the most important findings'] },
  { test: /three elements are included in the typical format/i, prefer: ['table 3.5 shows a typical outline of finding presentation'] },
  { test: /how many recommendations should receive the highest emphasis/i, prefer: ['you\'d better emphasize on the three or four'] },
  { test: /improvement items requiring attention be limited to around ten/i, prefer: ['you have to talk less than 10 findings'] },
  { test: /section belongs in a typical final assessment report/i, prefer: ['table 3.6 shows typical final report outline'] },
  { test: /who normally prepares the action plans/i, prefer: ['organization should do to develop action plans'] },
  { test: /when should an organization generally conduct a follow-up/i, prefer: ['after one to two years from this'] },
  { test: /reasons for conducting a reassessment/i, prefer: ['follow-up assessment to assess whether we properly improved'] },
  { test: /greatest assessment risk/i, prefer: ['the greatest assessment risk is that we don\'t do any actions'] },
  { test: /implementation approach helps maintain improvement priority/i, prefer: ['senior management quarterly review session'] },
  { test: /key implementation risks identified/i, prefer: ['schedule conflicts or inadequate support or lack of follow-through'] },
  { test: /site manager cannot attend an important opening or closing/i, prefer: ['senior manager should appear'] },
  { test: /common reason for inadequate assessment support/i, prefer: ['inadequate support or lack of follow-through'] },
  { test: /important determinants of successful follow-through/i, prefer: ['senior manager should show exhibit his willingness'] },
  { test: /most serious implementation problem after an assessment/i, prefer: ['we have to consider staffing to succeed'] },
  { test: /staffing pattern is suggested for improvement work/i, prefer: ['one or two active full-time members'] },
  { test: /main result an assessment must produce even if a formal rating/i, prefer: ['the most important thing we have to produce as a result of assessment is the findings'] },
  { test: /stated goal of process assessment with respect to 'passing'/i, prefer: ['the goal is not to pass'] },
  { test: /when might a certified external appraiser be necessary/i, prefer: ['you have to hire the certified appraiser'] },
  { test: /remote interview can be part of an assessment/i, prefer: ['online remote interview'] },
  { test: /sensible way to implement major improvements/i, prefer: ['select one or two projects to, as a pilot'] },

  // Agile / XP
  { test: /what best describes iterative development/i, prefer: ['each iteration is a kind of self-contained mini project'] },
  { test: /goal at the end of an iteration/i, prefer: ['at the end of each iteration, probably, we can build subtle release'] },
  { test: /iteration release must always be delivered to the external/i, prefer: ['this release could be internal release or external release'] },
  { test: /main idea of risk-driven iterative development/i, prefer: ['tackle those list issues first'] },
  { test: /main idea of client-driven iterative development/i, prefer: ['the client-driven approach is let client involve'] },
  { test: /which statements describe timeboxing/i, prefer: ['to have a time-boxed iteration. so it\'s a fixed period'] },
  { test: /what does evolutionary development imply/i, prefer: ['we don\'t know or do not need to know entire 100% of requirements'] },
  { test: /key emphasis of adaptive development/i, prefer: ['adaptive approach is emphasizing on feedback and adaptation'] },
  { test: /evolutionary requirements analysis means that no requirements/i, prefer: ['we don\'t need to have any requirements, that there is wrong'] },
  { test: /architecturally influential factors/i, prefer: ['they are called architecturally influential factors'] },
  { test: /highly important functional and nonfunctional requirements be recognized early/i, prefer: ['you have to spend more money to fix it later'] },
  { test: /what is adaptive planning/i, prefer: ['adaptive planning rather than predictive planning'] },
  { test: /what is incremental delivery/i, prefer: ['in the incremental delivery we repeatedly deliver the system in production'] },
  { test: /evolutionary delivery different from ordinary incremental/i, prefer: ['we get the feedback from the current release to guide next'] },
  { test: /valued more than processes and tools/i, prefer: ['individuals and interactions over processes and tools'] },
  { test: /valued more than comprehensive documentation/i, prefer: ['working software over comprehensive documentation'] },
  { test: /valued more than contract negotiation/i, prefer: ['customer collaboration over contract negotiation'] },
  { test: /valued more than following a plan/i, prefer: ['responding to change over following plan'] },
  { test: /have no value/i, prefer: ['that does not mean we will not use method and tools'] },
  { test: /primary measure of progress/i, prefer: ['working software is a primary measure of progress'] },
  { test: /sustainable development mean in the agile principles/i, prefer: ['maintain a constant pace indefinitely'] },
  { test: /agile principle of simplicity mean/i, prefer: ['find out what is the essential to do, to produce, to go'] },
  { test: /best architectures, requirements, and designs emerge/i, prefer: ['emerge from the self-organizing teams'] },
  { test: /listed as agile development methods/i, prefer: ['scrum or xp or evo, chrystal'] },
  { test: /four foundational values of extreme programming/i, prefer: ['xp emphasize on this communication and simplicity'] },
  { test: /which of the following are xp core practices/i, prefer: ['continuous integration, sustainable pace and whole team together'] },
  { test: /recommended xp iteration length/i, prefer: ['it expects one to three weeks time box'] },
  { test: /xp is described as relatively low on which scale/i, prefer: ['xp is in the area where we expect less documentation'] },
  { test: /xp's original known applicability/i, prefer: ['xp covers here this much of styles'] },
  { test: /aimed primarily at relatively small-team projects/i, prefer: ['small or medium size project, with medium criticality'] },
  { test: /explicitly associated with xp's programmer-focused methods/i, prefer: ['it provides explicit methods for programmers'] },
  { test: /major xp lifecycle phases/i, prefer: ['sample life cycle of xp exploration phase'] },
  { test: /architectural spike intended to do/i, prefer: ['purpose of exploration is to have enough'] },
  { test: /a spike is described as/i, prefer: ['going through the entire steps, even though it is a very small problem'] },
  { test: /what is a system metaphor in xp/i, prefer: ['some metaphors can tell you what is the basic idea'] },
  { test: /in the release planning game/i, prefer: ['in the release planning game, the customers and developers complete the story cards'] },
  { test: /in the iteration planning game, who chooses/i, prefer: ['in the iteration planning game, customers pick the stories'] },
  { test: /after customers choose stories for an xp iteration/i, prefer: ['once you have a story chosen in each iteration, then you start building lists of tasks'] },
  { test: /how does xp view overtime/i, prefer: ['go home at 5 p.m.'] },
  { test: /what is pair programming/i, prefer: ['you have two people together working with the coding'] },
  { test: /pairing an experienced engineer with a novice/i, prefer: ['pure programming is also good for training'] },
  { test: /collective or team code ownership/i, prefer: ['always responsibility is given to the whole teams'] },
  { test: /continuous integration mean in xp/i, prefer: ['it suggests to have a continuous integration'] },
  { test: /story cards used to record/i, prefer: ['a story card is a kind of paper index card'] },
  { test: /xp stories are the same thing as detailed use cases/i, prefer: ['xpp reports feature driven approach rather than the use case driven'] },
  { test: /promise to talk/i, prefer: ['they view the card as a kind of promise to talk'] },
  { test: /whole team together' help make possible/i, prefer: ['you\'d better do it in the common project room'] },
  { test: /during creation of the xp task list/i, prefer: ['you start building lists of tasks'] },
  { test: /typical recommended size of an xp task/i, prefer: ['within one, two days\' wage'] },
  { test: /how are tasks assigned in xp/i, prefer: ['volunteering is the suggested recommended rather than assigning jobs'] },
  { test: /how much up-front design thinking/i, prefer: ['just 10 to 20 minutes of design'] },
  { test: /xp is completely anti-documentation/i, prefer: ['that does not mean you don\'t need to document in xp practice'] },
  { test: /compensates for xp's minimal documentation/i, prefer: ['you better have an on-site customer'] },
  { test: /simple xp progress or quality metrics/i, prefer: ['number of completed tasks and stories, and the success rate of a test'] },
  { test: /why does xp use visible wall graphs/i, prefer: ['you better use a visual work graph so everybody can see'] },
  { test: /who is responsible for regularly collecting task and story/i, prefer: ['task and the story progress metrics could be collected by tracker'] },
  { test: /what does ieh stand for/i, prefer: ['ideal engineering hours which which means an uninterrupted, dedicated, focused time'] },
  { test: /for larger story estimates/i, prefer: ['one day, two day, or two weeks, three weeks'] },
  { test: /significant xp-influenced projects/i, prefer: ['small size project, c3 payroll system'] },
  { test: /what adoption strategy does xp recommend/i, prefer: ['pick up the worst project or problem and then apply xp until solved'] },
  { test: /beck recommends starting with/i, prefer: ['whole team together in the common project loan'] },
  { test: /early roots of xp through their collaboration at tektronix/i, prefer: ['cunningham started to talk about practices'] },
  { test: /beck and cunningham help develop during their tektronix/i, prefer: ['idea of crc card'] },
  { test: /many xp practices coalesce under kent beck/i, prefer: ['beck joined the chrysler c3 project'] },

  // Scrum
  { test: /scrum primarily emphasize compared with methods that prescribe/i, prefer: ['emphasizes a set of opposing management values and practices'] },
  { test: /scrum strongly promotes self-directed/i, prefer: ['practices of scrum, self-directed and the self-organizing team'] },
  { test: /practices emphasized by scrum/i, prefer: ['you collect data every day and share this data'] },
  { test: /usual iteration length recommended in the scrum/i, prefer: ['usually 30 calendar day iterations'] },
  { test: /what is a scrum iteration called/i, prefer: ['iteration is called as sprint in the scrum'] },
  { test: /once work has been selected for a sprint, management should normally avoid/i, prefer: ['no extra additional work to an iteration once chosen'] },
  { test: /why does scrum discourage adding new work during an active sprint/i, prefer: ['scurm team has to be able to focus on the stated goals'] },
  { test: /who may reprioritize the product backlog/i, prefer: ['stakeholders meet to refine and re-prioritize the product backlog'] },
  { test: /scrum's position on documentation and ceremony/i, prefer: ['you\'d better go with as a leader ceremony as part'] },
  { test: /who should decide how much ceremony/i, prefer: ['they recommend the whole team, a manager, okay, will decide'] },
  { test: /which four major phases are shown in the scrum lifecycle/i, prefer: ['staging and developmental release'] },
  { test: /important purpose of scrum pre-game planning/i, prefer: ['the planning is to establish vision'] },
  { test: /what is the product backlog\?/i, prefer: ['you put all the system features you have to build for the system into this product backlog'] },
  { test: /who owns and prioritizes the product backlog/i, prefer: ['one product owner is a designated product owner'] },
  { test: /what is the release backlog/i, prefer: ['identification of the release backlog and the subset of a product backlog'] },
  { test: /what is the sprint backlog\?/i, prefer: ['the spring backload has all the tasks for this iteration'] },
  { test: /task size does the lecture recommend for items in the sprint backlog/i, prefer: ['within the four to 16 hours of range of work'] },
  { test: /sprint backlog estimates are allowed to change/i, prefer: ['somebody overestimated the task hours remaining in the sprint backlog'] },
  { test: /most important pieces of information tracked in the sprint backlog/i, prefer: ['this shows hours of work remaining'] },
  { test: /what does the backlog graph primarily display/i, prefer: ['use a graph to draw this as chart to see easily how much work you have left'] },
  { test: /backlog graph is considered especially important/i, prefer: ['total hours remaining over each day'] },
  { test: /three questions are traditionally answered/i, prefer: ['what have you done since the last school'] },
  { test: /additional scrum questions does the lecture attribute to larman/i, prefer: ['any missed task you find, but this is not new requirements'] },
  { test: /adding a missed implementation task to the sprint backlog is different/i, prefer: ['this is not new requirements itself'] },
  { test: /how long does a typical daily scrum take/i, prefer: ['every 15 to 20 minutes for 7 to 10 people'] },
  { test: /why is the daily scrum ideally held while standing/i, prefer: ['stand-up circle to encourage the brevity'] },
  { test: /issue requires a long technical discussion during the daily scrum/i, prefer: ['secondary meeting can be'] },
  { test: /scrum master's primary relationship to the development team/i, prefer: ['scrum master is the servant of the developers, not master'] },
  { test: /responsibilities of the scrum master/i, prefer: ['get the resource and reserve all the issues for the team'] },
  { test: /scrum master 'firewall' practice mean/i, prefer: ['you should work as a firework here'] },
  { test: /decisions needed from the scrum master should ideally/i, prefer: ['ideally decided immediately or within one hour'] },
  { test: /blocks gone in one day/i, prefer: ['blocks reported at the scrum meetings are ideally removed before the next meeting'] },
  { test: /chickens-and-pigs analogy/i, prefer: ['chicken can create eggs without sacrificing much'] },
  { test: /during the daily scrum, who is normally permitted to speak/i, prefer: ['we don\'t recommend the chickens involved in this unless some extreme cases'] },
  { test: /ceo is normally free to interrupt the daily scrum/i, prefer: ['they cannot just interfere'] },
  { test: /maximum team size does the lecture generally recommend/i, prefer: ['one scrum team has seven or less members'] },
  { test: /how does scrum scale when a project requires many more people/i, prefer: ['if you have more than one scrum team, and then the presenters from each scrum team'] },
  { test: /what is a scrum of scrums/i, prefer: ['presenters from each scrum team will meet together'] },
  { test: /what work environment does scrum prefer/i, prefer: ['scrum also recommend to work in the common project room'] },
  { test: /purpose of the sprint review/i, prefer: ['there is a demo of the product'] },
  { test: /how long may the sprint review last/i, prefer: ['review meeting, maximum of four hours'] },
  { test: /stakeholders should immediately make binding commitments/i, prefer: ['no commitments made during that meeting'] },
  { test: /powerpoint presentations during the sprint review/i, prefer: ['powerpoint slides, the presentations are forbidden'] },
  { test: /scrum practice of a daily build/i, prefer: ['and the daily build is recommended'] },
  { test: /scrum can be combined with practices from other development/i, prefer: ['it is easily combined with or complementary to other methods'] },
  { test: /difference between scrum and xp is specifically mentioned/i, prefer: ['scrom\'s 30-day time-box situation length is not completely consistent with xp'] },
  { test: /empirical rather than a defined process/i, prefer: ['emphasis on empirical rather than a defined path'] },
  { test: /scrum value is demonstrated by making the product backlog/i, prefer: ['openly accessible product backlog makes visible the work'] },
  { test: /scrum value of respect emphasize/i, prefer: ['individual members on team are respected for their different strengths'] },
  { test: /behavior reflects the scrum value of courage/i, prefer: ['management has the courage to plan, guide, adaptively'] },
  { test: /where did the name scrum originate/i, prefer: ['scrum is like a scrum in the rugby game'] },
  { test: /1986 article is identified as an important historical root/i, prefer: ['one of the article of harvard business review'] },
  { test: /people are strongly associated with the creation and formalization/i, prefer: ['ken swabble worked with this guy sutherland'] },
];

function tokens(s) {
  return normLecture(s)
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function ngrams(words, n) {
  const out = [];
  for (let i = 0; i <= words.length - n; i += 1) out.push(words.slice(i, n + i).join(' '));
  return out;
}

function joinCues(cues, i, j) {
  return cues.slice(i, j + 1).map((c) => c.text).join(' ').replace(/\s+/g, ' ').trim();
}

function preferFor(question) {
  const out = [];
  RULES.forEach((r) => {
    if (r.test.test(question)) out.push(...r.prefer);
  });
  return out;
}

function windowHasPrefer(text, prefers) {
  const n = normLecture(text);
  return prefers.some((p) => n.includes(normLecture(p)));
}

function buildIdf(cues) {
  const df = new Map();
  cues.forEach((c) => {
    new Set(tokens(c.text)).forEach((w) => df.set(w, (df.get(w) || 0) + 1));
  });
  return (w) => {
    const n = df.get(w) || 0;
    if (!n) return 0;
    return Math.log((cues.length + 1) / n);
  };
}

function scoreWindow(text, queryWords, queryGrams, prefers, idf, answerWords) {
  const have = new Set(tokens(text));
  const norm = normLecture(text);
  let score = 0;
  queryWords.forEach((w) => {
    if (have.has(w)) score += idf(w);
  });
  answerWords.forEach((w) => {
    if (have.has(w)) score += idf(w) * 1.6;
  });
  queryGrams.forEach((g) => {
    if (norm.includes(g)) score += 4 + g.split(' ').length;
  });
  if (windowHasPrefer(text, prefers)) score += 80;
  return score;
}

function preferWindow(cues, prefers) {
  for (let p = 0; p < prefers.length; p += 1) {
    const np = normLecture(prefers[p]);
    let best = null;
    for (let i = 0; i < cues.length; i += 1) {
      for (let width = 2; width <= 6; width += 1) {
        const j = i + width - 1;
        if (j >= cues.length) break;
        const text = joinCues(cues, i, j);
        if (!normLecture(text).includes(np)) continue;
        const cand = { i, j, width };
        if (!best || cand.i > best.i || (cand.i === best.i && cand.width < best.width)) {
          best = cand;
        }
      }
    }
    if (best) return best;
  }
  return null;
}

function bestQuote(cues, question, explanation, answers) {
  const prefers = preferFor(question);
  const query = [question, explanation, ...(answers || [])].join(' ');
  const queryWords = [...new Set(tokens(query))];
  const answerWords = [...new Set(tokens((answers || []).join(' ')))];
  const qw = tokens(query);
  const queryGrams = []
    .concat(ngrams(qw, 4), ngrams(qw, 3), ngrams(qw, 2))
    .filter((g) => g.split(' ').some((w) => w.length > 3));
  const idf = buildIdf(cues);

  const hay = normLecture(cues.map((c) => c.text).join(' '));
  const livePrefers = prefers.filter((p) => hay.includes(normLecture(p)));
  const forced = livePrefers.length ? preferWindow(cues, livePrefers) : null;

  let best = forced || { score: -1, i: 0, j: 1 };
  if (!forced) {
    for (let i = 0; i < cues.length; i += 1) {
      for (let width = 2; width <= 6; width += 1) {
        const j = Math.min(cues.length - 1, i + width - 1);
        const text = joinCues(cues, i, j);
        const score = scoreWindow(text, queryWords, queryGrams, livePrefers, idf, answerWords);
        if (score > best.score || (score === best.score && width < (best.j - best.i + 1))) {
          best = { score, i, j };
        }
      }
    }
  }

  let quote = joinCues(cues, best.i, best.j);
  if (quote.length < 24 && best.j + 1 < cues.length) {
    quote = joinCues(cues, best.i, Math.min(cues.length - 1, best.i + 2));
  }
  if (!matchingLectureIndexes(cues, quote).length && cues.length) {
    quote = joinCues(cues, 0, Math.min(3, cues.length - 1));
  }
  return quote;
}

function answerTexts(q) {
  const letters = 'abcdefghij';
  const raw = q.answer;
  const opts = q.options || [];
  const idxs = [];
  const push = (v) => {
    if (typeof v === 'string' && /^[a-j]$/i.test(v.trim())) idxs.push(letters.indexOf(v.trim().toLowerCase()));
    else if (typeof v === 'number') idxs.push(v);
    else {
      const i = opts.indexOf(v);
      if (i >= 0) idxs.push(i);
    }
  };
  if (Array.isArray(raw)) raw.forEach(push);
  else if (typeof raw === 'boolean') return [String(raw)];
  else push(raw);
  return idxs.filter((i) => i >= 0).map((i) => opts[i] || '');
}

function computeQuotes(spec) {
  const deck = JSON.parse(readFileSync(path.join(root, spec.json), 'utf8'));
  const cues = parseLecture(readFileSync(path.join(root, spec.txt), 'utf8')).cues;
  const quotes = deck.questions.map((q) => ({
    question: q.question,
    before: (q.reference && q.reference.lecture) || '',
    lecture: bestQuote(cues, q.question || '', q.explanation || '', answerTexts(q)),
  }));
  return { cues, quotes };
}

const computed = DECKS.map((spec) => ({ spec, ...computeQuotes(spec) }));
const counts = [];
const examples = [];

computed.forEach(({ spec, cues, quotes }) => {
  const jsonPath = path.join(root, spec.json);
  const deck = JSON.parse(readFileSync(jsonPath, 'utf8'));
  let changed = 0;
  let unmatched = 0;
  let short = 0;
  deck.questions.forEach((q, i) => {
    const lecture = quotes[i].lecture;
    const before = (q.reference && q.reference.lecture) || '';
    if (normLecture(before) !== normLecture(lecture)) {
      changed += 1;
      if (examples.filter((e) => e.file === spec.json).length < 8) {
        examples.push({
          file: spec.json,
          question: (q.question || '').slice(0, 90),
          before: before.slice(0, 140),
          after: lecture.slice(0, 140),
        });
      }
    }
    if (!matchingLectureIndexes(cues, lecture).length) unmatched += 1;
    if (!lecture || lecture.length < 24) short += 1;
    q.reference = Object.assign({}, q.reference, { lecture });
  });
  writeFileSync(jsonPath, JSON.stringify(deck, null, 2) + '\n');
  counts.push({
    file: spec.json,
    questions: deck.questions.length,
    changed,
    unmatched,
    short,
  });
});

console.log(JSON.stringify({ counts, examples }, null, 2));
