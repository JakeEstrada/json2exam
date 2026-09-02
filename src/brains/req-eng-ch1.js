// Canned AskGPT brain for the Chapter 1 set in 541-Ch1.json.
// No API: replies.ts-style regexes + per-option notes keyed by option text, not letters.

const DEF = {
  businessRequirement: {
    text: 'A high-level objective explaining why the organization wants the product',
    term: 'a business requirement',
    note: 'It is the organizational why: the objective the company is trying to reach by having the product built.',
  },
  userRequirement: {
    text: 'A goal or task a defined class of users must be able to accomplish with the system',
    term: 'a user requirement',
    note: 'It names what a user class needs to accomplish, not the software behavior that supports it.',
  },
  functional: {
    text: 'A statement of the behavior the system performs under a specific condition',
    term: 'a functional requirement',
    note: 'It states what the system does, under what condition, in terms a developer can build against.',
  },
  nonfunctional: {
    text: 'A statement of a property or characteristic the system is required to respect',
    term: 'a nonfunctional requirement',
    note: 'It describes a property or restriction rather than a behavior the system carries out.',
  },
  qualityAttribute: {
    text: 'A nonfunctional requirement describing a service characteristic such as speed',
    term: 'a quality attribute',
    note: 'It is one kind of nonfunctional requirement: performance, security, usability, availability, and the like.',
  },
  constraint: {
    text: 'A restriction on the design or implementation choices open to the developer',
    term: 'a constraint',
    note: 'It narrows the set of design or implementation choices the developer is allowed to make.',
  },
  businessRule: {
    text: 'A policy, guideline, standard, or regulation that constrains the business',
    term: 'a business rule',
    note: 'It comes from how the business operates or from law. It often leads to software requirements but is not itself one.',
  },
  feature: {
    text: 'A set of logically related capabilities that together deliver value to a user',
    term: 'a feature',
    note: 'It groups related capabilities and is normally described by several functional requirements.',
  },
  systemRequirement: {
    text: 'A top-level requirement for a product built from several interacting subsystems',
    term: 'a system requirement',
    note: 'It applies to a whole product made of interacting parts, which may include hardware as well as software.',
  },
  externalInterface: {
    text: 'A description of a connection between the system and an outside device or program',
    term: 'an external interface requirement',
    note: 'It covers connections to users, other software systems, and hardware devices.',
  },
};

function notDef(actual) {
  return 'No. That’s ' + DEF[actual].term + '.';
}

function yesDef(wanted) {
  return 'Yes. That’s ' + DEF[wanted].term + '.';
}

function defOptions(wanted, extras) {
  const opts = {};
  Object.keys(DEF).forEach((key) => {
    opts[DEF[key].text] = key === wanted ? yesDef(wanted) : notDef(key, wanted);
  });
  if (extras) Object.keys(extras).forEach((k) => { opts[k] = extras[k]; });
  return opts;
}

function typeNote(correct, whyYes, whyNo) {
  const opts = {};
  Object.keys(whyNo).forEach((label) => { opts[label] = whyNo[label]; });
  opts[correct] = whyYes;
  return opts;
}

const cards = {
  'What is a business requirement?': {
    about: yesDef('businessRequirement'),
    options: defOptions('businessRequirement'),
  },
  'What is a business rule?': {
    about: yesDef('businessRule'),
    options: defOptions('businessRule'),
  },
  'What is a constraint?': {
    about: yesDef('constraint'),
    options: defOptions('constraint'),
  },
  'What is an external interface requirement?': {
    about: yesDef('externalInterface'),
    options: defOptions('externalInterface'),
  },
  'What is a feature?': {
    about: yesDef('feature'),
    options: defOptions('feature'),
  },
  'What is a functional requirement?': {
    about: yesDef('functional'),
    options: defOptions('functional'),
  },
  'What is a nonfunctional requirement?': {
    about: yesDef('nonfunctional'),
    options: defOptions('nonfunctional'),
  },
  'What is a quality attribute?': {
    about: yesDef('qualityAttribute'),
    options: defOptions('qualityAttribute'),
  },
  'What is a system requirement?': {
    about: yesDef('systemRequirement'),
    options: defOptions('systemRequirement'),
  },
  'What is a user requirement?': {
    about: yesDef('userRequirement'),
    options: defOptions('userRequirement'),
  },

  'Discord wants to raise weekly engagement by making it easier for communities to stay active. What type of requirement is this?': {
    about: 'Business requirement: why Discord wants the work.',
    options: typeNote('Business requirement',
      'Yes. A growth objective for the organization is a business requirement.',
      {
        'Business rule': 'No. A business rule is policy or law, not a growth goal.',
        'Feature': 'No. A feature is a bundle of capabilities, not why Discord wants the work.',
        'User requirement': 'No. A user requirement is a task a user class must accomplish. This sentence is Discord’s objective, not a user’s job.',
        'Nonfunctional requirement': 'No. Nonfunctional requirements describe properties like speed or security, not why the company wants the product.',
        'Quality attribute': 'No. A quality attribute is a service characteristic (performance, usability). This is a business goal.',
      }),
  },

  'Instagram accounts must belong to someone at least thirteen years old, per company policy and law. What is that policy?': {
    about: 'Business rule: the 13+ policy, not the software that enforces it.',
    options: typeNote('Business rule',
      'Yes. Company policy plus law is a business rule. Instagram then writes functional requirements to enforce it.',
      {
        'Constraint': 'No. A constraint limits design choices (use this hardware, this language). The age policy is a rule of the business, not an implementation limit.',
        'Business requirement': 'No. A business requirement is why the organization wants the product, not a standing policy.',
        'Nonfunctional requirement': 'No. The policy itself is not a software quality. Software NFRs might be written later to enforce it.',
        'Functional requirement': 'No. “Instagram shall reject sign-ups under 13” would be the functional requirement. This item is the policy behind that.',
        'System requirement': 'No. A system requirement covers a product made of several subsystems, not a legal age policy.',
      }),
  },

  'The Netflix app must run on smart TVs that shipped in 2018 with limited memory. What is the MOST specific classification?': {
    about: 'Constraint: you have to run on those old TVs.',
    options: typeNote('Constraint',
      'Yes. You must run on those TVs. That takes choices off the table for the developer.',
      {
        'User requirement': 'No. Users do not “need to run on 2018 TVs.” That is an implementation restriction.',
        'System requirement': 'No. A system requirement is a top-level need for a multi-part product, not “use this old hardware.”',
        'Functional requirement': 'No. This does not name a behavior under a condition. It names a platform you are stuck with.',
        'Nonfunctional requirement': 'Close, but not the most specific. Constraints are a kind of nonfunctional requirement. “Must run on 2018 TVs” is the constraint.',
        'Feature': 'No. A feature is a bundle of capabilities that deliver user value, not a hardware limit.',
      }),
  },

  'Instagram lets outside applications publish posts through its Graph API. What does that connection represent?': {
    about: 'External interface: a connection to outside software.',
    options: typeNote('External interface requirement',
      'Yes. Outside apps talking to Instagram over an API is an external interface.',
      {
        'Constraint': 'No. A constraint would say you must use a given technology. This names a connection, not a restriction.',
        'Feature': 'No. “Publishing” might live under a feature, but the Graph API itself is the external connection.',
        'System requirement': 'No. A system requirement is a top-level need for a product of subsystems, not one API connection.',
        'Quality attribute': 'No. Quality attributes are service characteristics like speed or security, not a named interface.',
        'Nonfunctional requirement': 'External interface requirements are a kind of nonfunctional requirement, but the specific classification here is the interface itself.',
      }),
  },

  "Discord's Server Moderation covers banning, kicking, muting, and role permissions. What is Server Moderation best classified as?": {
    about: 'Feature: a named bundle of related capabilities.',
    options: typeNote('Feature',
      'Yes. Ban, kick, mute, and roles are related capabilities under one feature name.',
      {
        'Business requirement': 'No. A business requirement would be why Discord wants moderation (safety, trust), not the capability bundle.',
        'Functional requirement': 'No. One functional requirement would be “when a moderator with permission deletes a message, Discord shall remove it.” The name “Server Moderation” is the feature that groups those.',
        'Nonfunctional requirement': 'No. This is a cluster of behaviors, not a quality like latency or availability.',
        'System requirement': 'No. That would cover the whole Discord product of clients plus backend, not one capability group.',
        'External interface requirement': 'No. Nothing here names a connection to an outside system.',
      }),
  },

  'When a user submits a prompt, ChatGPT shall stream the reply back token by token. What type of requirement is this?': {
    about: 'Functional: condition plus what the system does.',
    options: typeNote('Functional requirement',
      'Yes. Condition plus observable system behavior is a functional requirement.',
      {
        'User requirement': 'No. A user requirement would be “a user needs to read the answer as it is produced,” without saying how. Token-by-token streaming is the software behavior.',
        'External interface requirement': 'No. This is ChatGPT’s own response behavior, not a connection to an outside device or program.',
        'Business requirement': 'No. There is no organizational objective here (growth, cost, compliance).',
        'Nonfunctional requirement': 'No. Streaming might support a quality (perceived speed), but this sentence specifies the behavior itself.',
        'Feature': 'No. A feature would be a named bundle such as “Conversations.” This is one behavior inside that.',
      }),
  },

  'Google Search should return a results page within half a second at peak traffic. What is the MOST specific classification?': {
    about: 'Quality attribute: how fast it has to be.',
    options: typeNote('Quality attribute',
      'Yes. Half a second at peak traffic is a performance quality attribute.',
      {
        'Nonfunctional requirement': 'True but not the most specific. Quality attributes are the NFR subtype for service characteristics like this.',
        'Functional requirement': 'No. This does not say what the page contains. It says how fast it must appear.',
        'Feature': 'No. Search is a feature. This sentence is a performance target on that feature.',
        'External interface requirement': 'No. Nothing here names an outside system or device.',
        'User requirement': 'No. A user requirement would be a task (“find a page”). This is a timing property.',
      }),
  },

  'A first-time Netflix viewer must be able to find and start a show without being shown how. Which quality attribute is this?': {
    about: 'Usability: a new user can do it without being shown how.',
    options: typeNote('Usability',
      'Yes. Usability covers how easily a new user can learn the product and finish a task correctly.',
      {
        'Interoperability': 'No. Interoperability is about working with other systems, not first-use learning.',
        'Efficiency': 'No. Efficiency is about resource use (CPU, bandwidth), not whether a newcomer can find a show.',
        'Maintainability': 'No. Maintainability is about changing the software later.',
        'Availability': 'No. Availability is whether the service is up.',
        'Reliability': 'No. Reliability is about continuing to work correctly over time, not first-time learnability.',
      }),
  },

  'A Google Maps user needs to find out whether a nearby pharmacy is open right now. What type of requirement is this?': {
    about: 'User requirement: a task the user needs to do.',
    options: typeNote('User requirement',
      'Yes. “A user needs to find out…” is the user-requirement pattern.',
      {
        'Functional requirement': 'No. A functional requirement would specify system behavior, e.g. “when the user taps a place, Maps shall show current hours.”',
        'Business rule': 'No. There is no policy or law here.',
        'Business requirement': 'No. This is not Google’s corporate objective. It is a user task.',
        'System requirement': 'No. This is not a top-level need for a multi-subsystem product.',
        'Nonfunctional requirement': 'No. It is a task, not a quality like speed or security.',
      }),
  },

  'Instagram shall reject a sign-up whose entered birth date puts the person under thirteen. What is this statement?': {
    about: 'Functional: the software enforcing the 13+ rule.',
    options: typeNote('Functional requirement',
      'Yes. “Shall reject a sign-up when…” is system behavior under a condition.',
      {
        'Constraint': 'No. A constraint would limit how you build it. This is what the software does.',
        'Business rule': 'No. “Accounts must belong to someone at least 13” is the rule. This is the software enforcing it.',
        'Feature': 'No. Sign-up might sit under a feature. This particular shall-statement is one functional requirement.',
        'Quality attribute': 'No. This is a behavior, not a service characteristic.',
        'Business requirement': 'No. This is not why Instagram exists. It is a check the system performs.',
      }),
  },

  'Discord runs as desktop, mobile, and web clients plus backend services, databases, and voice infrastructure. A top-level requirement covering that whole arrangement is called what?': {
    about: 'System requirement: the whole multi-part product.',
    options: typeNote('System requirement',
      'Yes. Clients, backend, databases, and voice together are the system.',
      {
        'Functional requirement': 'No. A functional requirement is one behavior, not a requirement spanning the whole arrangement.',
        'Business requirement': 'No. That would be why Discord Inc. wants the product.',
        'Feature': 'No. A feature is a capability bundle, not the whole multi-part product.',
        'Quality attribute': 'No. Nothing here names a service characteristic.',
        'Business rule': 'No. There is no policy in this sentence.',
      }),
  },

  "Discord's permission model says only a role holding Manage Messages may delete another member's post. What is that model?": {
    about: 'Business rule: who is allowed to delete whose posts.',
    options: typeNote('Business rule',
      'Yes. Who is allowed to delete whose posts is a rule of the product’s operation, not yet a shall-statement about software.',
      {
        'External interface requirement': 'No. This is not a connection to an outside system.',
        'Business requirement': 'No. It is not Discord’s organizational objective.',
        'Nonfunctional requirement': 'No. The model itself is a rule. Security NFRs might later constrain how it is enforced.',
        'Constraint': 'No. A constraint limits design choices. This is a policy about who may do what.',
        'Functional requirement': 'No. “Discord shall refuse a delete unless the role has Manage Messages” would be the functional requirement.',
      }),
  },

  'Which of these are functional requirements for Discord? Select all that apply.': {
    about: 'Functional = system behavior. Not a goal, quality, or platform limit.',
    options: {
      'Discord shall serve one hundred thousand concurrent users without slowdown':
        'No. Concurrent users without slowdown is a performance quality attribute, not a behavior.',
      'Discord shall remove a message when a moderator with permission deletes it':
        'Yes. Condition plus system behavior: a functional requirement.',
      'Discord wants to raise the number of servers a typical user stays active in':
        'No. “Wants to raise…” is a business requirement, not a shall-behavior.',
      'Discord shall deliver a text message to every member who can view the channel':
        'Yes. Delivering a message is observable system behavior.',
      'Discord shall notify a member when someone mentions them inside a channel':
        'Yes. Notify-when-mentioned is a functional requirement.',
      'Discord shall run on smart TV browsers built before the 2019 model year':
        'No. Required old browsers is a constraint on implementation, not a function.',
    },
  },

  'Which of these are nonfunctional requirements for Netflix? Select all that apply.': {
    about: 'Quality attributes are characteristics. Adding to My List is behavior.',
    options: {
      "Netflix must keep a profile's viewing history readable only to that account":
        'Yes. Confidentiality of viewing history is a security quality — nonfunctional.',
      'Netflix must stay available during the evening peak in every served region':
        'Yes. Availability is nonfunctional.',
      'Netflix must begin playback within two seconds of a viewer pressing play':
        'Yes. Start-up time is a performance quality attribute.',
      'Netflix shall let a subscriber add a title to the My List collection':
        'No. That is a behavior the system performs: functional.',
      'Netflix must keep playing when a client briefly loses its network connection':
        'Yes. Continuing under a fault is robustness / reliability — nonfunctional.',
      'Netflix shall show the ten most relevant results for a search query':
        'No. Showing search results is functional behavior. “Most relevant” might later get a quality target, but this is still a shall-do.',
    },
  },

  'Which of these are stated at the level of a user requirement? Select all that apply.': {
    about: 'User requirements are user goals. API / client / server lines are not.',
    options: {
      'A shopper needs to find the seller behind a product tagged in a photo':
        'Yes. “A shopper needs to…” is a user goal, with no implementation.',
      'A viewer needs to keep a story private to the people they already follow':
        'Yes. A viewer’s goal about privacy, not a protocol or database row.',
      'The API shall return 403 when the caller lacks the manage_posts permission':
        'No. That is developer-level system behavior (an HTTP status). Not a user requirement.',
      'The client shall page the feed in batches of twenty using a cursor token':
        'No. Batch size and cursor tokens are implementation. A user requirement would be “a viewer needs to keep scrolling the feed.”',
      'The server shall write a StoryView row for each unique viewer of a story':
        'No. A database row is internal behavior, not a user requirement.',
      'A creator needs to know which of their posts drew the most saves this week':
        'Yes. A creator’s information goal, implementation left open.',
    },
  },

  'Which of these would be external interfaces for Spotify? Select all that apply.': {
    about: 'External interface = outside the system. An internal module is not.',
    options: {
      'The recommendation engine inside the Spotify backend':
        'No. That engine is inside the system. External means across the boundary.',
      'A car head unit connecting over Android Auto or CarPlay':
        'Yes. The head unit is hardware/software outside Spotify that it must talk to.',
      'A Bluetooth speaker the phone hands the audio stream to':
        'Yes. A speaker is an external device.',
      'The policy that free accounts must hear ads each hour':
        'No. That is a business rule, not an interface.',
      'A smart TV app casting playback from the phone client':
        'Yes. Casting to a TV app is an external connection.',
      'A third-party app pulling playlists through the Web API':
        'Yes. A third-party app over the Web API is a classic external software interface.',
    },
  },

  'A feature and a functional requirement mean the same thing.': {
    about: 'False. A feature is usually several functional requirements, not one.',
    options: {
      'True': 'No. They sit at different levels. Server Moderation is a feature; “shall remove a message when…” is one functional requirement under it.',
      'False': 'Yes. A feature is the bundle. Functional requirements are the individual behaviors.',
    },
  },

  'A business rule can exist even if no software ever enforces it.': {
    about: 'True. A business rule can exist with no software at all.',
    options: {
      'False': 'No. Overtime law, a 13+ age policy, or “managers may edit payroll” can all exist on paper with no product behind them.',
      'True': 'Yes. The rule belongs to the business. Software is optional.',
    },
  },

  'Every quality attribute is a nonfunctional requirement.': {
    about: 'True. Every quality attribute is a nonfunctional requirement.',
    options: {
      'False': 'No. Performance, security, usability, availability are all NFRs. The subtype name is quality attribute.',
      'True': 'Yes. Quality attribute ⊂ nonfunctional requirement.',
    },
  },

  'Every nonfunctional requirement is a quality attribute.': {
    about: 'False. Constraints and interfaces are NFRs too, but not quality attributes.',
    options: {
      'False': 'Yes. “Must run on 2018 TVs” is a constraint. The Graph API is an external interface. Neither is a quality attribute.',
      'True': 'No. Nonfunctional is the broader bucket. Quality attributes are only the service characteristics.',
    },
  },

  '"A moderator needs to remove a disruptive member" and "Discord shall show moderators a Ban Member action" sit at the same level.': {
    about: 'False. One is a user goal. The other is system behavior.',
    options: {
      'False': 'Yes. User requirement vs functional requirement. Same topic, different level.',
      'True': 'No. One says what the moderator needs to accomplish. The other names a button the software shall show.',
    },
  },

  'A constraint reduces the number of implementation choices open to the developer.': {
    about: 'True. A constraint takes design choices off the table.',
    options: {
      'True': 'Yes. Existing hardware, a required language, a mandated cloud — each takes options off the table.',
      'False': 'No. If it does not reduce design or implementation choices, it is not a constraint.',
    },
  },

  'A subscriber tells Netflix: "I don\'t care how it works, I just want it to pick up where I stopped, on whatever screen I grab next." Which statement is the USER requirement?': {
    about: 'User requirement: what the user needs, not how you build it.',
    options: {
      'Netflix shall raise average weekly viewing hours per subscriber by ten percent':
        'No. That is a business requirement (organizational metric), not a user task.',
      'Sync playback position over the device presence channel already open per client':
        'No. That names a specific channel. Implementation, not a user requirement.',
      'A viewer needs to resume a title on any device from the point where they stopped':
        'Yes. User class + goal, no technology. That is the user requirement.',
      'Write the last playback position to the profile record after every heartbeat':
        'No. Database writes and heartbeats are internal design.',
      'Add a GET /titles/:id/progress endpoint that returns the saved timestamp value':
        'No. An HTTP endpoint is developer-level behavior.',
      'Store playback progress keyed by profile and title in the existing datastore':
        'No. Storage keys are implementation.',
    },
  },

  'For that same request, which statement is the best FUNCTIONAL requirement?': {
    about: 'Functional: what the system does, no tech or business goal.',
    options: {
      'Subscribers want a smoother experience when they switch between their devices':
        'No. Wishy-washy desire, not a shall-behavior.',
      'Netflix shall resume playback at the last position saved for that profile':
        'Yes. Observable behavior, no brand of database, no “need to.”',
      'Cassandra fits this well because the writes are cheap and the reads are keyed':
        'No. That is a technology argument, not a requirement.',
      'Cross-device continuity is the most requested improvement from subscribers':
        'No. That is background / business context.',
      'A viewer needs to keep watching without hunting for where they left off':
        'No. That is still a user requirement (“needs to”).',
      'Playback progress ought to live somewhere durable rather than on the client':
        'No. Design advice, not a functional shall.',
    },
  },

  'Which sequence runs from the highest-level reason for a product down to detailed software behavior?': {
    about: 'Business → user → functional.',
    options: {
      'Business requirement, then functional requirement, then user requirement':
        'No. You do not jump to software behavior before saying what users must accomplish.',
      'Functional requirement, then user requirement, then business requirement':
        'No. That is upside down: details first, purpose last.',
      'User requirement, then functional requirement, then business requirement':
        'No. The organizational why sits above user goals.',
      'User requirement, then business requirement, then functional requirement':
        'No. Business why comes first, then user goals.',
      'Business requirement, then user requirement, then functional requirement':
        'Yes. Why the business wants it, then user goals, then system behavior.',
      'Business rule, then business requirement, then external interface requirement':
        'No. A business rule is not the top of that ladder, and an interface is not “detailed software behavior” in general.',
    },
  },

  'One business requirement can give rise to several user requirements.': {
    about: 'True. One business goal usually becomes many user and functional reqs.',
    options: {
      'True': 'Yes. “Raise engagement” can spawn many user tasks (moderation, notifications, discovery) and still more functional shalls.',
      'False': 'No. The mapping is one-to-many as you go down the levels.',
    },
  },

  'Nonfunctional requirements are optional and can be dropped when the schedule slips.': {
    about: 'False. Nonfunctional requirements are still requirements.',
    options: {
      'False': 'Yes. If you drop “available during evening peak,” you shipped a different product than the one specified.',
      'True': 'No. Schedule pressure does not turn a requirement into a nice-to-have. You can renegotiate scope, but that is a change to the requirements.',
    },
  },
};

export const reqEngCh1 = {
  id: 'req-eng-ch1',
  name: 'AskGPT',
  stems: Object.keys(cards),
  cards,
  greeting: 'Ask about this question after you check.',
  empty: 'Ask about a letter or a term.',
  locked: 'Check your answer first.',
  fallback: 'Try a letter on this card, or a term like user requirement.',
  concepts: [
    { test: /business\s+req/i, reply: 'A business requirement is why the organization wants the product.' },
    { test: /business\s+rule/i, reply: 'A business rule is policy, law, or a standard. It can exist with no software.' },
    { test: /user\s+req/i, reply: 'A user requirement is a goal a user class must accomplish, without saying how.' },
    { test: /functional\s+req/i, reply: 'A functional requirement is what the system does under a given condition.' },
    { test: /non[- ]?functional/i, reply: 'A nonfunctional requirement is a property or restriction, not a behavior.' },
    { test: /quality\s+attr/i, reply: 'A quality attribute is an NFR about speed, security, usability, and the like.' },
    { test: /\bconstraint/i, reply: 'A constraint limits the design or implementation choices you can make.' },
    { test: /\bfeature\b/i, reply: 'A feature is a bundle of related capabilities that deliver value together.' },
    { test: /system\s+req/i, reply: 'A system requirement covers a product made of several interacting parts.' },
    { test: /external\s+interface/i, reply: 'An external interface is a connection to something outside the system.' },
    { test: /usabilit/i, reply: 'Usability is how easily someone can learn the product and finish a task.' },
  ],
};
