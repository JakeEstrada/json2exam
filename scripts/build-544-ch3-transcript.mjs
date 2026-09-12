import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cues = [
  [0, 'Today we are on software process assessment in the software maturity framework.'],
  [40, 'Process assessment helps software organizations improve themselves by identifying their critical problems and establishing improvement priorities.'],
  [90, 'The basic assessment objectives are to learn how the organization works, to identify its major problems, and to enroll its opinion leaders in the change process.'],
  [160, 'A software process assessment is not an audit but a review of a software organization to advise its management and professionals on how they can improve their operation.'],
  [230, 'It is conducted by a team of software professionals who typically have assessment experience or training.'],
  [290, 'Assessment is typically conducted in three phases: preparation, assessment, and recommendations.'],
  [350, 'In preparation, senior management becomes committed to the process, agrees to participate personally, and commits to take action on the resulting recommendations or explain its reasons for not doing so.'],
  [430, 'Phase one concludes with a brief one- or two-day training program for the assessment team.'],
  [490, 'Phase two is the on-site assessment period. Assessment activity typically takes several days, although it can take two or more weeks, depending on the size of the organization.'],
  [570, 'Phase two concludes with a preliminary report of the findings to local management.'],
  [630, 'In phase three the findings and action recommendations are presented to the local managers. A local action team is then assembled to plan and implement the recommendations.'],
  [720, 'The five assessment principles are the need for a process model, the requirement for confidentiality, senior management involvement, respect for the views of the people being assessed, and an action orientation.'],
  [820, 'An assessment implies a standard. The organization\'s process is reviewed in comparison with some vision of how such processes should be performed.'],
  [900, 'The assessment\'s purpose must be to support the organization\'s improvement program and not to report its problems to higher management.'],
  [970, 'If people learn that they cannot speak in confidence, the assessment group will find it increasingly difficult to conduct assessments that uncover the real issues. Confidentiality is required at all organizational levels.'],
  [1060, 'The senior manager sets the organization\'s priorities. The site manager must be personally involved in the assessment and its follow-up action plans. If not, the work will not be given sufficient priority.'],
  [1160, 'Keep an open mind and a level head. If the team members\' actions clearly demonstrate their desire for active collaboration with the on-site professionals, people generally will respond positively.'],
  [1260, 'The assessment must be directed toward improvement. An action orientation keeps the questions focused on current problems and the need to solve them.'],
  [1340, 'Management must either focus on taking action or not do an assessment.'],
  [1400, 'The first step in any assessment is to identify the organization to be assessed and the team to do it. This requires the site manager\'s commitment and sufficient skilled resources.'],
  [1490, 'The assessment team leader is selected first. The members should all be experienced software developers, and one or more should have experience in each phase of the software process.'],
  [1580, 'Four to six professionals typically form an adequate team, although more can be used if desired.'],
  [1640, 'Each assessment team member should have at least eight to ten years professional software experience, be well respected, deal with people informally, be a team player, and have attended assessment training with this team.'],
  [1760, 'No assessment team member should be currently serving in an audit or review capacity for the projects being assessed, be a line manager over those projects or people being interviewed, or be working directly on those projects or their direct support.'],
  [1880, 'While it is possible for organizations to assess themselves, few organizations can afford a staff of assessment experts.'],
  [1950, 'It is desirable to have a written set of assessment ground rules. For an external assessment, the site manager and the assessment team leader should sign a written agreement covering these ground rules.'],
  [2050, 'As the assessment team is formed, the members must agree to participate fully during the training period, on-site review, and wrap-up meetings.'],
  [2130, 'The on-site period starts with a presentation to the site manager and staff. The assessment ground rules, principles, and overall schedule are discussed.'],
  [2210, 'An overview meeting is then held with all the site participants, including the project managers and the professionals to be interviewed.'],
  [2290, 'A typical SEI-assisted assessment schedule is about four days. Day one is the overview, briefing, questionnaire, and project discussions.'],
  [2370, 'Day two is functional area interviews and preliminary findings. Day three is project discussions and finding formulation.'],
  [2450, 'Day four is the findings dry run, findings review, findings presentation, senior management meeting, and assessment postmortem.'],
  [2530, 'The assessment should focus on what the projects actually do, how they do it, the problems encountered, and the results obtained.'],
  [2610, 'Meetings are held with small groups of selected professionals. Six to eight representatives are identified for meetings of 90 to 120 minutes each.'],
  [2700, 'Typical specialty areas are quality assurance and release, software integration and test, coding and unit test, and requirements and design.'],
  [2780, 'Each representative should be a recognized opinion leader, actually working on projects rather than on a staff, a technical professional and not a manager, and aware of confidentiality arrangements.'],
  [2880, 'In conducting assessments it is hard to obtain really accurate information. Questions are often misunderstood. Respondents may have different understandings of some common terms.'],
  [2970, 'Respondents may not be broadly aware of the work in their own organization. Occasionally people are unwilling to risk the truth.'],
  [3050, 'At the assessment conclusion the team prepares a report on its initial findings. Prior to reviewing this material with the site manager, the team should review it with the project managers.'],
  [3140, 'That review should identify any overlooked problems or any misstated or overemphasized topics.'],
  [3200, 'The findings should be limited to the top 10 to 12 items that are major or key for most of the projects reviewed, key for advancing to the next maturity level, supported by evidence, addressable by an action recommendation, and specific.'],
  [3320, 'Each finding states what the team observed, the consequences or implications for the organization, and specific examples without identifying people or projects.'],
  [3410, 'The final assessment team action is the presentation of a written final report and recommendations to the site manager and staff.'],
  [3490, 'The recommendations should highlight the three or four items of highest priority. The total number of items requiring attention should be limited to around ten.'],
  [3580, 'The action plans are next prepared by the local site organization, generally under the guidance of the team member named for this purpose.'],
  [3660, 'Organizations should generally conduct a follow-up assessment one to two years after the initial action plans have been developed and approved.'],
  [3740, 'This is important to assess the progress that has been made, to provide a visible future milestone, and to establish new priorities for continued improvement.'],
  [3820, 'The greatest assessment risk is that no significant improvement actions will be taken. Without proper management focus a few superficial efforts may be made, but soon everything will revert to business as usual.'],
  [3920, 'A catalyst is needed to maintain the improvement priority, such as goals and management reviews. Long-term goals are first established, and then sub-goals are defined for intervening two- or three-month periods.'],
  [4020, 'A senior management quarterly review then maintains high-level checkpoint visibility.'],
  [4070, 'Schedule conflicts that require the site manager to miss the opening or closing meeting have happened in about one-third of the assessments. Use a substitute executive who can speak for the site manager and arrange a later private meeting.'],
  [4140, 'Inadequate support often happens because the assessment commitment is made at too low a management level. Lack of follow-through is reduced by an aggressive manager, a capable process improvement staff, and a clearly stated improvement goal. Staffing is generally the most serious implementation problem.'],
];

function stamp(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return '[' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + ']';
}

const out = ['cpsc544_03_v_ProcessAssessment.mp4', ''].concat(
  cues.map(([t, text]) => stamp(t) + ' ' + text),
  ['']
).join('\n');

const dest = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../544-Mod-1/Ch3/cpsc544_03_v_ProcessAssessment.txt'
);
writeFileSync(dest, out);
console.log('wrote', dest, 'cues', cues.length);
