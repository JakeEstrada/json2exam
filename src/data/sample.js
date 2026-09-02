export const SAMPLE = {
  title: 'Requirements Engineering sampler',
  questions: [
    {
      question: 'What is a business requirement?',
      options: [
        'A restriction on the design or implementation choices open to the developer',
        'A high-level objective explaining why the organization wants the product',
        'A policy, guideline, standard, or regulation that constrains the business',
        'A nonfunctional requirement describing a service characteristic such as speed',
      ],
      answer: 'b',
      explanation: 'A business requirement states the objective the organization is trying to reach by having the product built.',
    },
    {
      question: 'A feature and a functional requirement mean the same thing.',
      type: 'boolean',
      answer: false,
      explanation: 'A feature bundles related capabilities and is usually described by several functional requirements.',
    },
    {
      question: 'Which of these are functional requirements for Discord? Select all that apply.',
      type: 'multi',
      options: [
        'Discord shall serve one hundred thousand concurrent users without slowdown',
        'Discord shall remove a message when a moderator with permission deletes it',
        'Discord wants to raise the number of servers a typical user stays active in',
        'Discord shall notify a member when someone mentions them inside a channel',
      ],
      answer: ['b', 'd'],
      explanation: 'Those two name behavior the software performs. The others are a quality attribute and a business requirement.',
    },
    {
      question: 'What is a constraint?',
      options: [
        'A high-level objective explaining why the organization wants the product',
        'A restriction on the design or implementation choices open to the developer',
        'A policy, guideline, standard, or regulation that constrains the business',
        'A goal a defined class of users must be able to accomplish with the system',
      ],
      answer: 'b',
      explanation: 'A constraint narrows the set of design or implementation choices the developer is allowed to make.',
    },
    {
      question: 'A business rule can exist even if no software ever enforces it.',
      type: 'boolean',
      answer: true,
      explanation: 'Business rules come from policy, regulation, or standards. Software requirements may be written to enforce them.',
    },
    {
      question: 'Which of these are nonfunctional requirements for Netflix? Select all that apply.',
      type: 'multi',
      options: [
        "Netflix must keep a profile's viewing history readable only to that account",
        'Netflix shall let a subscriber add a title to the My List collection',
        'Netflix must begin playback within two seconds of a viewer pressing play',
        'Netflix shall show the ten most relevant results for a search query',
      ],
      answer: ['a', 'c'],
      explanation: 'Security and performance describe characteristics of the service. The other two describe behavior.',
    },
    {
      question: 'What is a feature?',
      options: [
        'A policy, guideline, standard, or regulation that constrains the business',
        'A statement of the behavior the system performs under a specific condition',
        'A set of logically related capabilities that together deliver value to a user',
        'A description of a connection between the system and an outside device or program',
      ],
      answer: 'c',
      explanation: 'A feature groups related capabilities and is normally described by several functional requirements.',
    },
    {
      question: 'Every nonfunctional requirement is a quality attribute.',
      type: 'boolean',
      answer: false,
      explanation: 'Constraints and external interface requirements are also nonfunctional but are not quality attributes.',
    },
    {
      question: 'What is an external interface requirement?',
      options: [
        'A statement of the behavior the system performs under a specific condition',
        'A policy, guideline, standard, or regulation that constrains the business',
        'A restriction on the design or implementation choices open to the developer',
        'A description of a connection between the system and an outside device or program',
      ],
      answer: 'd',
      explanation: 'External interface requirements cover connections to users, other software systems, and hardware devices.',
    },
  ],
};

export const SAMPLE_SNIPPET = JSON.stringify(
  {
    title: SAMPLE.title,
    questions: SAMPLE.questions.slice(0, 3),
  },
  null,
  2
);
