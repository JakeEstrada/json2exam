import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { matchingLectureIndexes, parseLecture, normLecture } from '../src/lib/lecture.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const DECKS = [
  {
    json: '544-Mod-1/Ch1/SWmaturity.json',
    txt: '544-Mod-1/Ch1/cpsc544_01_v_SWmaturity.txt',
  },
  {
    json: '544-Mod-1/Ch2/processChange.json',
    txt: '544-Mod-1/Ch2/cpsc544_02_v_ProcessChange(2).txt',
  },
  {
    json: '544-Mod-1/Ch4/cpsc544_04_initial_process_quiz.json',
    txt: '544-Mod-1/Ch4/cpsc544_04_v_InitialProcess.txt',
  },
  {
    json: '544-Mod-1/Ch5/cpsc544_ch5_managing_software_organizations_quiz.json',
    txt: '544-Mod-1/Ch5/cpsc544_05_v_ManagingSWorg.txt',
  },
];

const STOP = new Set(`
  about after also because been being chapter class course does done each from have into
  just like more most only other over some such than that the their them then they this
  those through used using very where which while with would your what when who how why
  software process organization organizations project projects level levels
`.trim().split(/\s+/));

const RULES = [
  // Ch1
  { test: /what is a software process\?/i, prefer: ['the process is the set of tools, methods'] },
  { test: /three basic things|what is produced or done/i, prefer: ['what we produce, who produce'] },
  { test: /what is a software engineering practice/i, prefer: ['what is a practice?', 'a practice is a broad array'] },
  { test: /considered a work product/i, prefer: ['work product is anything you produce'] },
  { test: /truly effective software process/i, prefer: ['truly effective', 'if your process is predictable'] },
  { test: /predictable and effective/i, prefer: ['schedule commitment meet the reasonable consistency'] },
  { test: /two simultaneous objectives/i, prefer: ['objective of software process management'] },
  { test: /stable or under statistical control/i, prefer: ['static process control'] },
  { test: /repeating the work in roughly the same way/i, prefer: ['if you are adopting this static process control'] },
  { test: /basic principle behind statistical/i, prefer: ['you need to measure, collect data', 'static process control'] },
  { test: /statements about process measurement/i, prefer: ['factors to consider in measuring'] },
  { test: /measurements that have no predefined use/i, prefer: ['why it is collected', 'assess personal'] },
  { test: /first step in the six-step/i, prefer: ['first, understand the current status'] },
  { test: /sequence correctly represents the general software process improvement/i, prefer: ['develop a vision of the design process', 'improvement actions'] },
  { test: /correct order of the five cmm/i, prefer: ['five maturity levels', 'initial, repeatable, defined'] },
  { test: /cmmi maturity-level terminology/i, prefer: ['repeatable to the managed', 'computatively managed'] },
  { test: /first major goal for an organization at initial/i, prefer: ['estimate your project and plan your project'] },
  { test: /primarily characterizes the repeatable process/i, prefer: ['it is called the repeatable process', 'repeatedly produce very similar'] },
  { test: /major characteristic of the defined process/i, prefer: ['defined level organization is expected to define', 'standardized set of process'] },
  { test: /begin comprehensive process measurement/i, prefer: ['when you are at level 3', 'process database'] },
  { test: /central idea of the optimizing process/i, prefer: ['in the optimizing level', 'what is bad in your process'] },
  { test: /why were maturity levels chosen/i, prefer: ['this maturity level suggests your interim improvement goals'] },
  { test: /commonly associated with an initial level 1/i, prefer: ['typical characteristic of this initial level organization is chaotic'] },
  { test: /best ways to determine whether an organization is truly at the initial/i, prefer: ['with that type of crisis'] },
  { test: /abandons them and immediately falls back/i, prefer: ['with that type of crisis then you are in this level'] },
  { test: /basic controls can help an initial organization/i, prefer: ['project management skills', 'four listed here'] },
  { test: /fundamental role of a project management system/i, prefer: ['certain way to manage the project', 'estimate project, make'] },
  { test: /senior management oversight/i, prefer: ['what about the management oversight'] },
  { test: /main responsibility of a software quality assurance/i, prefer: ['quality assurance called the qa', 'conformance to your standardized'] },
  { test: /independent reporting line/i, prefer: ['report to your high enough higher manager'] },
  { test: /how large might an effective quality assurance/i, prefer: ['quality assurance called the qa', 'trays to find conformance'] },
  { test: /why is software change control considered fundamental/i, prefer: ['how can you handle this change', 'requirements will be changing'] },
  { test: /if requirements, design, and code changes are not controlled/i, prefer: ['how can you handle this change', 'design should be changed'] },
  { test: /advance from the repeatable process toward the defined/i, prefer: ['from level two to level three, define the process level'] },
  { test: /primary purpose of a software engineering process group/i, prefer: ['they are called the process group'] },
  { test: /full-time assignments for process improvement/i, prefer: ['establish a group of team', 'take care of this process work'] },
  { test: /process architecture describe/i, prefer: ['to have a process architecture which'] },
  { test: /defined for tasks within a software development process architecture/i, prefer: ['phases, steps, tasks'] },
  { test: /engineering methods and technologies/i, prefer: ['inspection and testing as a method', 'software engineering method and technology'] },
  { test: /advance from the defined process toward the managed/i, prefer: ['establish process database', 'when you are at level 3'] },
  { test: /greatest practical problems associated with the managed/i, prefer: ['gathering data is not easy and it takes cost'] },
  { test: /two requirements are emphasized for advancing from the managed/i, prefer: ['automate this data collection', 'prevent them from occurring'] },
  { test: /important shift occurs when an organization moves from the managed/i, prefer: ['use this data to improve our process', 'not only quality of product'] },
  { test: /weakest elements of the process/i, prefer: ['what is bad in your process', 'how to fix the problem'] },
  { test: /optimizing process help the people/i, prefer: ['communicate in concise, quantitative', 'where help is needed'] },
  { test: /capability maturity model originally/i, prefer: ['originally was born to access the providers'] },
  { test: /exceptionally skilled engineer/i, prefer: ['not a specific person', 'process dominates'] },
  { test: /describes a repeatable software process/i, prefer: ['engineers are moving', 'repeatedly you produce'] },
  { test: /functional requirement rather than a quality/i, prefer: ['what is the functional requirements then'] },
  { test: /takes one hour to display/i, prefer: ['take one hour to print', 'will take one hour'] },

  // Ch2
  { test: /not being a cure-all/i, prefer: ['better people clearly do better work', 'good products is based on the good support your designs'] },
  { test: /recruiting better people can lead into a blind alley/i, prefer: ['better people clearly do better work', 'already have a best team'] },
  { test: /make better use of the people it already has/i, prefer: ['proper leadership and support', 'without training people properly'] },
  { test: /designers understand the application domain/i, prefer: ['consider the domain knowledge'] },
  { test: /relationship between design and process/i, prefer: ['good products is based on the good', 'including design methods'] },
  { test: /not one of the six basic principles/i, prefer: ['major changes to the software process must start at the top'] },
  { test: /major software process changes start at the top/i, prefer: ['must start at the top', 'support from your high-level manager'] },
  { test: /everyone ultimately be involved/i, prefer: ['everyone must be involved', 'cooperation of the people'] },
  { test: /knowledge of both the desired goal and the current process/i, prefer: ['know exactly the current position', 'effective change is built on knowledge'] },
  { test: /primary purpose of a software process assessment/i, prefer: ['assessment is a learning process', 'status of my current process'] },
  { test: /priorities especially important/i, prefer: ['which one is the most important', 'cannot touch everything at once'] },
  { test: /should generally be treated as/i, prefer: ['process change is a kind of a continuing', 'continuously perform it'] },
  { test: /associated with the principle that change is continuous/i, prefer: ['process change is a kind of a continuing', 'you have to continuously perform it'] },
  { test: /require periodic reinforcement/i, prefer: ['periodic reinforcement', 'continuous reinforcement'] },
  { test: /correct order of the four stages/i, prefer: ['installation stage and practice stage'] },
  { test: /learn to perform the new method as instructed/i, prefer: ['practice stage', 'four stages to adopt'] },
  { test: /without much conscious intellectual effort|become so ingrained/i, prefer: ['naturalist stage', 'very comfortable'] },
  { test: /which resources does software process improvement require/i, prefer: ['requires investment', 'dedicated people', 'time and management and investment'] },
  { test: /unplanned process improvement is wishful/i, prefer: ["whatever you do, you don't have a good plan", 'process change need a time as key'] },
  { test: /automating a poorly defined process/i, prefer: ['until cleared effort process application', 'clear definition of the process'] },
  { test: /before investing heavily in automation/i, prefer: ['automation should be certainly be used', 'clear definition of the process'] },
  { test: /improvements generally be made in small steps/i, prefer: ['improvement should be made in small steps'] },
  { test: /widely deployed immediately after it is designed/i, prefer: ['improvement should be made in small steps'] },
  { test: /strongly emphasize training|training is expensive/i, prefer: ['without training people properly', 'training is a good investment'] },
  { test: /common misconception/i, prefer: ['must start with form requirements', 'common misconceptions'] },
  { test: /complete requirements cannot realistically/i, prefer: ['cannot wait forever to get 100%', 'incremental'] },
  { test: /requirements problem is discovered/i, prefer: ['cannot wait forever to get 100%', 'requirements from the customers'] },
  { test: /passes all of its current tests|if software passes a test|statement about testing/i, prefer: ['if it passes, it must be okay', 'if it passes test, it must be okay'] },
  { test: /amount of testing performed/i, prefer: ['if that system is highly critical to the human life'] },
  { test: /software quality cannot be measured/i, prefer: ['software quality cannot be measured'] },
  { test: /useful when evaluating software quality/i, prefer: ['set of metrics', 'software quality cannot be measured'] },
  { test: /highest-priority problems in many low-maturity/i, prefer: ['not only technical problems', 'quality problems of most software'] },
  { test: /misconception 'we need better people'/i, prefer: ['we need better people', 'utilize your people'] },
  { test: /true underlying cause is often/i, prefer: ['not only technical problems', 'we need better people'] },
  { test: /traditional management techniques should not be used/i, prefer: ['we can use many good techniques, management techniques'] },
  { test: /management practices are still useful/i, prefer: ['detailed planning', 'periodic technical reviews', 'without having plan'] },
  { test: /three phases of an effective process change/i, prefer: ['unfreezing and moving and refreezing'] },
  { test: /unfreezing' primarily involve/i, prefer: ['unfreezing and moving and refreezing', 'find out what\'s wrong here'] },
  { test: /role of a process change champion/i, prefer: ['who are called like champions', 'initiate the process change'] },
  { test: /senior management sponsor/i, prefer: ['sponsoring your process change', 'support from your high-level manager'] },
  { test: /role of change agents/i, prefer: ['there should be some change agents'] },
  { test: /three key elements of effective process change/i, prefer: ['three key elements of effective change'] },
  { test: /who should participate in planning a process change/i, prefer: ['everybody should understand', 'good planning for the process change'] },
  { test: /maintain momentum and support|early demonstration of success/i, prefer: ['early demonstration of success', 'periodic progress report'] },
  { test: /main objective of 'refreezing'/i, prefer: ['you have to refreeze it', 'refreezing'] },
  { test: /techniques for refreezing/i, prefer: ['education and training program', 'monitor and support the performance'] },

  // Ch4
  { test: /five software process maturity levels presented/i, prefer: ['one is initial, okay, and two is repeatable'] },
  { test: /word best characterizes a level 1/i, prefer: ['what could be a chaotic project', "don't have any good prediction"] },
  { test: /needed actions for moving beyond the initial/i, prefer: ['planning and estimation in the organization', 'four things, mainly'] },
  { test: /completely standardized and formally defined/i, prefer: ['informal and adult process methods', 'not very standardized'] },
  { test: /characteristic is associated with level 2/i, prefer: ['same quality you built last time', 'reasonable control'] },
  { test: /move from repeatable toward defined/i, prefer: ['good to standardize all your procedures'] },
  { test: /why is level 3 called the defined/i, prefer: ["that's why it is define the process", 'we define the standard procedures'] },
  { test: /begin establishing process measurements and quantitative/i, prefer: ['you start systematically using measurement', 'good time to to use a measurement here'] },
  { test: /reasonable statistical control over product quality/i, prefer: ['level four, manage the level', 'using a quantitative approach'] },
  { test: /focus of level 5/i, prefer: ['you are expected to control your process itself'] },
  { test: /most software organizations operate in the initial/i, prefer: ['most of the organizations start from this initial level'] },
  { test: /drives professionals in an initial process organization from crisis/i, prefer: ['variation of their work is very high', 'process is easily broken'] },
  { test: /difficult to identify from the outside/i, prefer: ['from outside, whenever they look at this organization'] },
  { test: /usually reveals an initial process organization over time/i, prefer: ['time goes by, people can easily find out', 'they do not meet the deadline'] },
  { test: /delivers on schedule, the lecture says this is often due/i, prefer: ['it is just an accident rather than it is expected'] },
  { test: /technically sound work and still appear to the customer/i, prefer: ['good technical shape', 'lack of a documented planning'] },
  { test: /central management problem in the chaotic project/i, prefer: ['inadequate', 'project is seriously late', 'lack of a documented'] },
  { test: /without a plan, which problems arise/i, prefer: ['no idea how big the project really is'] },
  { test: /typical sign of a chaotic project/i, prefer: ['project is seriously late'] },
  { test: /seemingly small additional functions/i, prefer: ['simple looking function', 'small amount of additional function'] },
  { test: /most common reason for chaotic behavior/i, prefer: ['why social organizations are chaotic', 'gas rather than a plant'] },
  { test: /under extreme pressure, software managers/i, prefer: ['gas rather than a plant'] },
  { test: /believing in magic/i, prefer: ['they believe strongly magic'] },
  { test: /silver bullet/i, prefer: ['they believe strongly magic', 'new technology always'] },
  { test: /escalating cycle of software scale/i, prefer: ['skl cycle', '10,000 lines of code'] },
  { test: /never fall back to the initial/i, prefer: ['you throw it out, process', 'high level or virtual level'] },
  { test: /most insidious and difficult software management/i, prefer: ['commitment or before you build the plan'] },
  { test: /commitment before a work plan exists/i, prefer: ['i made the wrong commitment', 'without having this good plan'] },
  { test: /depending heavily on a technical 'guru'/i, prefer: ['technical ritual to solve all the problems', 'he left your company'] },
  { test: /guru who succeeded on a small project/i, prefer: ['small size of the project, you did well', 'he can solve everything'] },
  { test: /problems of scale fundamental/i, prefer: ['problems of scale', 'as the size increases'] },
  { test: /knowledge becomes more widely distributed/i, prefer: ['common notations are needed for precise communication'] },
  { test: /control is needed over requirements, design, code, and test/i, prefer: ['manage the changes', 'similar way to manage these changes'] },
  { test: /prototypes or multiple releases useful|reasons given for using prototypes/i, prefer: ['prototypes and multiple releases are needed'] },
  { test: /complication appears when multiple releases/i, prefer: ['multiple releases, new complication arises'] },
  { test: /software process entropy/i, prefer: ['this slide talks about the soft path entropy', 'entropy explains the level of disorder'] },
  { test: /three forces are identified as tending to disrupt/i, prefer: ['entropy explains the level of disorder'] },
  { test: /way out of the chaos trap/i, prefer: ['worked their way out of the chaos', 'outlines of general solutions'] },
  { test: /systematic project management include/i, prefer: ['estimated, planned', 'planning and estimation'] },
  { test: /update their plans as they learn more/i, prefer: ['refine the plan as knowledge', 'learning process'] },
  { test: /basic principles for controlling chaos/i, prefer: ['principles for controlling chaos'] },
  { test: /gap between what the team knows and what the task requires/i, prefer: ['fix it before proceeding'] },
  { test: /recommended starting point for stabilizing/i, prefer: ['planning and estimation', 'minimum activities'] },

  // Ch5
  { test: /main focus of chapter 5/i, prefer: ['three topics here in this chapter'] },
  { test: /emphasized early in the repeatable process/i, prefer: ['basic control mechanisms', 'four basic control'] },
  { test: /three major topics are identified for chapter 5/i, prefer: ['three topics here in this chapter'] },
  { test: /primary role of a management system/i, prefer: ['role of management system is to ensure the projects are successfully completed'] },
  { test: /define what 'success' and 'completion' mean/i, prefer: ['define what is the success and what is the completion'] },
  { test: /completion criterion must always be the production deployment/i, prefer: ['diploma date as a completion', 'validation as a'] },
  { test: /keep a small number of people associated/i, prefer: ['keep a minimum number of people who can maintain'] },
  { test: /completion criteria for individual development phases/i, prefer: ['depends on the organization, they have their own rules'] },
  { test: /evidence that a phase is complete/i, prefer: ['formal review or inspection, peer reviews'] },
  { test: /each software project should have a plan based/i, prefer: ['hierarchy of commitments'] },
  { test: /what is a commitment in the context/i, prefer: ['agreement by one person to do something for another'] },
  { test: /management system help resolve/i, prefer: ['natural conflicts between the project and between line'] },
  { test: /purpose of an oversight and review system/i, prefer: ['oversight and the review system audits'] },
  { test: /monitored and controlled even if it has no plan/i, prefer: ['without having plan, we don\'t know how to monitor'] },
  { test: /plan still be useful even if it is not perfect/i, prefer: ['at least a certain plan to start with'] },
  { test: /foundation of software project management/i, prefer: ['foundation for software project management is the commitment discipline'] },
  { test: /mechanisms support commitment discipline/i, prefer: ['supported by plans and estimates, reviews'] },
  { test: /who actually meets commitments/i, prefer: ['they met by the committed people'] },
  { test: /commitment normally includes which two ideas/i, prefer: ['planned completion date and some consideration'] },
  { test: /mutual commitments especially important/i, prefer: ['produce output and who will use this as input'] },
  { test: /elements of an effective commitment/i, prefer: ['elements of an effective commitment'] },
  { test: /clear before the committed date that the commitment cannot/i, prefer: ['advance notice is given and the new commitment'] },
  { test: /commitments be openly and publicly stated/i, prefer: ['openly and publicly stated'] },
  { test: /key idea behind the commitment hierarchy/i, prefer: ['hierarchy of commitments', 'your team make a commitment'] },
  { test: /how far must it reach/i, prefer: ['must be reached to the top'] },
  { test: /personally make commitments for future software delivery/i, prefer: ['personally made by the organization\'s senior executive'] },
  { test: /before a major software delivery commitment is made/i, prefer: ['formal review and the concurrence process'] },
  { test: /required to establish a sound commitment process/i, prefer: ['planning be done before any commitment is made'] },
  { test: /not one of the four general management-system objectives/i, prefer: ['generally four components', 'technical and the business strategy'] },
  { test: /long-term goal that a technical and business strategy/i, prefer: ['growth rate and the market position'] },
  { test: /purpose of an annual operating plan/i, prefer: ['annual operating plans'] },
  { test: /essential first step in producing operating plans/i, prefer: ['specify the resources', 'annual operating plans'] },
  { test: /reviews and a contention system/i, prefer: ['reviews and the contention system'] },
  { test: /separate organizational plans handled/i, prefer: ['consolidated', 'different parts of organization'] },
  { test: /main purpose of the contention process/i, prefer: ['open expression of differences'] },
  { test: /principle underlies the contention system/i, prefer: ['best decisions are based on full understanding'] },
  { test: /major decision still has dissent/i, prefer: ['all dissenting parties are present'] },
  { test: /disagreeing parties are absent/i, prefer: ['decision can be deferred'] },
  { test: /purpose of the quarterly review/i, prefer: ['quarterly review typically include'] },
  { test: /topics would typically belong in a quarterly review/i, prefer: ['project performance against the plan'] },
  { test: /status columns are tracked/i, prefer: ['project schedule checkpoint'] },
  { test: /sample project schedule checkpoint/i, prefer: ['project schedule checkpoint'] },
  { test: /assess project progress over time/i, prefer: ['assess project progress periodically'] },
  { test: /mil-std-498|software development and documentation/i, prefer: ['next slide shows some standards you can use'] },
  { test: /iso\/iec 12207|software life cycle processes/i, prefer: ['next slide shows some standards you can use'] },
  { test: /iso\/iec 15504|called spice/i, prefer: ['next slide shows some standards you can use'] },
  { test: /iso\/iec 15288|system life cycle processes/i, prefer: ['next slide shows some standards you can use'] },
  { test: /iso 9000 series/i, prefer: ['next slide shows some standards you can use'] },
  { test: /most important management review system/i, prefer: ['most important management review system is conducted by project management'] },
  { test: /other management systems can still be fully effective/i, prefer: ['if project management is not aware'] },
  { test: /broader management system still necessary/i, prefer: ['resolve conflict between projects and between line'] },
  { test: /best summarizes the lecture's key message/i, prefer: ['project management is described in terms of commitment'] },
];

function tokens(s) {
  return normLecture(s)
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function ngrams(words, n) {
  const out = [];
  for (let i = 0; i <= words.length - n; i += 1) out.push(words.slice(i, i + n).join(' '));
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
        const end = Math.min(cues.length - 1, Math.max(j, i + 3));
        const cand = { i, j: end, width };
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

const examples = [];
const counts = [];

DECKS.forEach((spec) => {
  const jsonPath = path.join(root, spec.json);
  const deck = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const cues = parseLecture(readFileSync(path.join(root, spec.txt), 'utf8')).cues;
  let changed = 0;
  let unmatched = 0;
  deck.questions.forEach((q) => {
    const before = (q.reference && q.reference.lecture) || '';
    const lecture = bestQuote(cues, q.question || '', q.explanation || '', answerTexts(q));
    if (normLecture(before) !== normLecture(lecture)) {
      changed += 1;
      if (examples.filter((e) => e.file === spec.json).length < 8) {
        examples.push({
          file: spec.json,
          question: (q.question || '').slice(0, 90),
          before: before.slice(0, 110),
          after: lecture.slice(0, 110),
        });
      }
    }
    if (!matchingLectureIndexes(cues, lecture).length) unmatched += 1;
    q.reference = Object.assign({}, q.reference, { lecture });
  });
  let short = 0;
  deck.questions.forEach((q) => {
    const lecture = q.reference && q.reference.lecture;
    if (!lecture || lecture.length < 24) short += 1;
  });
  writeFileSync(jsonPath, JSON.stringify(deck, null, 2) + '\n');
  counts.push({ file: spec.json, questions: deck.questions.length, changed, unmatched, short });
});

console.log(JSON.stringify({ counts, examples }, null, 2));

const review = DECKS.map((spec) => {
  const deck = JSON.parse(readFileSync(path.join(root, spec.json), 'utf8'));
  return {
    file: spec.json,
    quotes: deck.questions.map((q, i) => ({
      n: i + 1,
      q: (q.question || '').slice(0, 88),
      lecture: (q.reference && q.reference.lecture) || '',
    })),
  };
});
writeFileSync(path.join(root, 'scripts/544-quote-review.json'), JSON.stringify(review, null, 2) + '\n');
