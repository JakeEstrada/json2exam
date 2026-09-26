#!/usr/bin/env node
/**
 * Generates Electronics chapter decks 2–10 (notes + quiz.json).
 * Run from repo root: node scripts/gen-electronics-chapters.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'applied-classroom/Electronics/pcb-design-guide';
const HITCH = "The Hitchhiker's Guide to PCB Design";
const HS = 'High-Speed PCB Design Guide';

const chapters = [
  {
    slug: 'chapter-2-dfm',
    label: 'Chapter 2',
    title: 'DFM, Not Just Another Acronym',
    pages: [12, 15],
    notes: `# Chapter 2 — DFM, Not Just Another Acronym

Read Hitchhiker PDF pages **12–15**. Overlap: Sierra *High-Speed PCB Design Guide* on manufacturable design decisions.

## Story takeaways

Ian’s defaults made 1 mil traces. The fab CAM held the job (trace/space, annular ring). A board that passes fab DFM can still fail **DFA** at assembly — the fabricator builds a component; assembly is out of fab scope.

## Hard-learned lessons (PDF p. 14–15)

- Understand every layout tool setting; do not trust defaults
- Learn applicable PCB/manufacturing standards
- Establish manufacturing contacts; use free DFM checks before fab/assembly
- Successful PCB design is not done in a vacuum

## SpaceX angle

Sourcing managers who talk DFM with engineering must know fab capability ≠ assembly readiness.
`,
    questions: [
      q('Why did Etch-O-Matronic put Ian’s job on hold for trace width/spacing?',
        ['The CAM department rejected automated defaults that made 1 mil traces incompatible with process capability.',
         'The credit card was declined before any CAM review started on the Gerber package.',
         'Otto deleted the design rules file during orientation and the fab refused unsigned jobs.',
         'Old Bob required every board to use only silk-screen artwork with no copper at all.'],
        0, HITCH, 12, 'TRACE WIDTH AND SPACING INCOMPATABLE WITH OUR PROCESSING CAPABILITY'),
      q('Old Bob’s point about “software allowed 1 mil traces” is best summarized as:',
        ['If the layout tool permits a geometry, the fab process can always etch and plate it reliably.',
         'Tool permission is not process capability — choose trace width for performance and DFM.',
         'One mil traces are mandatory for every avionics board regardless of the fab process.',
         'Defaults are always safer than talking to a manufacturing engineer about capability.'],
        1, HITCH, 12, 'just because his layout software allowed him to create one mil traces doesn’t mean he should have'),
      q('A bare board passed fab DFM but assembly put the job on hold. What did Old Bob explain?',
        ['Fab DFM and assembly DFA are identical, so the hold must be a shipping error only.',
         'The finished bare PCB is a component; assembly quality is outside the fabricator’s scope.',
         'The fab must reflow every connector before the board leaves the etch line.',
         'Assembly holds only happen when the BOM lists cake from the cafeteria menu.'],
        1, HITCH, 13, 'It is the fabricator’s job to create a quality component'),
      q('Which lesson does Ian’s checklist emphasize about CAD defaults?',
        ['Trust default software settings because automation equals manufacturability.',
         'Do not trust default software settings — understand how to optimize them.',
         'Disable all design-rule checks so CAM never sends disposition emails.',
         'Set every trace to one mil so the fab can always fatten them later.'],
        1, HITCH, 14, 'Do not trust default software settings to design your PCB'),
      q('Before sending files for fabrication and assembly, the chapter urges you to:',
        ['Skip supplier contact until after the first scrap lot arrives.',
         'Establish manufacturing contacts/mentors and use free DFM checks.',
         'Publish Gerbers publicly so random fabs can bid without NDAs.',
         'Remove all tolerances so CAM has maximum creative freedom.'],
        1, HITCH, 14, 'take advantage of free DFM checks before the design is sent'),
      q('DFx mode in Old Bob’s story is meant to walk which questions?',
        ['Only “How much did the Quickie-Cheapo fab charge per square inch?”',
         'Who, What, When, Where, Why, and How across the manufacturing flow.',
         'Only the cafeteria menu options available during an all-nighter.',
         'Which star rating to click when choosing the next fab vendor.'],
        1, HITCH, 14, 'Who, What, When, Where, Why, and How'),
      q('From a manufacturing perspective (High-Speed guide), impractical early design decisions:',
        ['Are wiped out automatically by any fab’s free online DFM button.',
         'Get baked into prototypes, stay through the lifecycle, and raise defect/cost risk.',
         'Only matter for hobby boards and never for production avionics.',
         'Are fixed by increasing the public star rating of the chosen fab.'],
        1, HS, 2, 'impractical design decisions made at the initial design stage will eventually get baked into the prototype'),
      tf('True or false: Communication with all stakeholders is called out as a critical PCB designer responsibility in Chapter 2.',
        true, HITCH, 14, 'Communication with all stakeholders is critical'),
      q('Which SpaceX-relevant takeaway matches this chapter?',
        ['Piece price alone proves a fab can support rate production without process review.',
         'Technical buyers must challenge “tool defaults” and verify fab/assembly process capability.',
         'Drawings and stack-ups are optional once the layout auto-router finishes.',
         'Sole-source is fine if the Gerber package opened without a CRC error.'],
        1, HITCH, 15, 'successful PCB design is not done in a vacuum',
        'Provide guidance to engineering on recommended suppliers, design for manufacturability'),
    ],
  },
  {
    slug: 'chapter-3-stakeholders',
    label: 'Chapter 3',
    title: 'Introducing PCB Project Stakeholders',
    pages: [16, 25],
    notes: `# Chapter 3 — PCB Project Stakeholders

Hitchhiker PDF pages **16–25**. Map who influences fab, assembly, test, and schedule before layout starts.

## Consider before layout

- Examine constraints at the start
- Parts list drives availability, size, shape, performance
- Know intended PCB size/shape; materials come in sheet stock
- Plan testability (bed-of-nails, functional, etc.)
- Meet customer needs by meeting stakeholder needs during the project
`,
    questions: [
      q('When should you examine design constraints, according to Chapter 3?',
        ['Only after the first fab disposition email arrives.',
         'At the start of the project, before ever starting the layout.',
         'After silk-screen fonts are locked for marketing photos.',
         'Never — constraints slow automation and Old Bob–speed delivery.'],
        1, HITCH, 25, 'Examine all the constraints at the start of a design project before'),
      q('What does the parts list influence beyond part numbers?',
        ['Only the color of the soldermask legend ink.',
         'Availability, size, shape, and performance of the design.',
         'Whether ITAR text appears on the purchase order footer.',
         'The cafeteria star rating used to pick EMS suppliers.'],
        1, HITCH, 25, 'what goes into a parts list will influence'),
      q('Why contact a fab supplier about size/shape before layout?',
        ['Raw materials are stocked in sheet form; confirm the outline fits available material.',
         'Fabs only cut boards from liquid copper poured at the dock.',
         'Sheet stock is irrelevant once defaults route at one mil.',
         'Outline size is chosen randomly after Gerbers are emailed.'],
        0, HITCH, 25, 'Raw materials for PCB fabrication are stocked in sheet form'),
      q('Testability planning in this chapter includes asking about:',
        ['Whether bed-of-nails or functional test (etc.) will be used on the assemblies.',
         'Only whether the fab offers overnight cake delivery with the panels.',
         'Whether star ratings exceed 4.2 on Quickie-Cheapo directories.',
         'Whether Otto can perform ICT using only the HR body scanner.'],
        0, HITCH, 25, 'How the assemblies will be tested. Bed-of-nails or functional test'),
      q('“All customer needs will be met in the end if…”',
        ['You pick the cheapest fab on star ratings every time.',
         'All stakeholder needs are met before and during the project.',
         'You disable DFM checks to protect schedule optimism.',
         'You sole-source every bare board without visiting the facility.'],
        1, HITCH, 25, 'if all stakeholder needs are met before and during the project'),
      q('Placement of a single design can influence:',
        ['Only the PDF page count of the assembly drawing notes.',
         'Thousands of parts and operations downstream in manufacturing.',
         'Nothing once the schematic symbol library is approved.',
         'Only the color of the shipping box used by the EMS.'],
        1, HITCH, 25, 'how a single design placement influences thousands of parts'),
      tf('True or false: Chapter 3 says scrutinize your process because things will go wrong — a process makes it easier to locate and fix problems.',
        true, HITCH, 25, 'Scrutinize your process. Things will go wrong'),
      q('SpaceX sourcing collaboration maps most closely to which Chapter 3 idea?',
        ['Ignore internal stakeholders; only the fab star rating matters.',
         'Work across disciplines so supplier capability and design constraints stay aligned.',
         'Let engineering place POs with no commercial or process input.',
         'Treat the BOM as optional until after NPI scrap is accepted.'],
        1, HITCH, 25, 'Communication with all stakeholders is critical',
        'Develop and maintain strong relationships with suppliers and with internal stakeholders'),
    ],
  },
  {
    slug: 'chapter-4-schematic',
    label: 'Chapter 4',
    title: 'Capturing the Schematic',
    pages: [26, 34],
    notes: `# Chapter 4 — Capturing the Schematic

Hitchhiker PDF pages **26–34**. High-Speed overlap: annotate controlled-impedance requirements on the schematic.

## Checklist themes

- Sound schematic library from manufacturer data sheets
- IEEE reference designators; consistent pin-1 orientation
- Double-check symbols; design-rule checks in the capture tool
- Stakeholders who must read the schematic
`,
    questions: [
      q('Chapter 4’s guidance on building the schematic library is to:',
        ['Copy random symbols from forums without checking manufacturer data sheets.',
         'Create/modify parts yourself using appropriate manufacturers’ data sheets.',
         'Leave unknown pins unlabeled so layout can invent connections later.',
         'Use only numeric pin names even when anode/cathode clarity matters.'],
        1, HITCH, 34, 'create and modify new parts yourself using appropriate manufacturers’ data sheets'),
      q('For bi-directional discretes, consistent symbol orientation means:',
        ['Pin one to the left (horizontal) or pin one at the top (vertical), with origin at pin one.',
         'Pin one randomly placed so auto-router explores more solutions.',
         'Always hide pin one so assemblers discover polarity on the line.',
         'Mirror every symbol nightly to keep CAM departments alert.'],
        0, HITCH, 34, 'with pin one to the left, or vertically with pin one at the top'),
      q('For diodes and similar uni-directional parts, the chapter suggests:',
        ['Never mark anode/cathode; numbers alone prevent reverse install.',
         'Add clear functional designations (e.g., A / K or C) so the part is not installed backwards.',
         'Omit polarity marks because wave solder fixes orientation automatically.',
         'Use identical symbols for every diode package regardless of function.'],
        1, HITCH, 34, 'pins designated “A” for anode and “K” or “C” for cathode'),
      q('Reference designations should follow:',
        ['Whatever nickname the project manager used in Slack.',
         'IEEE standards for standard reference designations.',
         'Random letters so competitors cannot reverse-engineer the BOM.',
         'Only emoji labels when the schematic must look friendly.'],
        1, HITCH, 34, 'Employ standard reference designations specified in the'),
      q('High-Speed guide overlap — controlled impedance on the schematic:',
        ['Never mark impedance; the fab will guess from soldermask color.',
         'Engineers should specify controlled-impedance signals (and special layout guidelines) in the schematics.',
         'Impedance notes belong only in cafeteria menus, not design data.',
         'Controlled impedance is illegal to annotate before layout completes.'],
        1, HS, 31, 'the engineer should specify the controlled impedance signals'),
      q('Before release, schematic hygiene includes:',
        ['Skipping symbol checks if the logo layer looks pretty.',
         'Checking and double-checking schematic symbols for accuracy.',
         'Deleting unused power pins from every IC to shrink the PDF.',
         'Turning off the capture tool’s design check routines permanently.'],
        1, HITCH, 34, 'Check and double-check schematic symbols for accuracy'),
      tf('True or false: Chapter 4 says to fully understand and use the schematic capture tool’s design check routines.',
        true, HITCH, 34, 'make good use of, the schematic capture tool’s design check routines'),
      q('Cost thinking on alternate components should include:',
        ['Only the distributor list price of the alternate part.',
         'Comprehensive processing costs of switching, not just base price.',
         'Only the color of the reel packaging used by the distributor.',
         'Ignoring assembly process impact when the piece price drops.'],
        1, HITCH, 34, 'comprehensive processing costs of switching'),
    ],
  },
  {
    slug: 'chapter-5-layout-placement',
    label: 'Chapter 5',
    title: 'PCB Layout: Setup and Placement',
    pages: [35, 46],
    notes: `# Chapter 5 — Layout Setup and Placement

Hitchhiker PDF pages **35–46**. High-Speed overlap: do not place components/vias between differential pairs.

## Placement tips

- Layout once; manufacturing may run millions of times → Design for Excellence
- Color-code nets; group by function; place fixed parts then lock them
- Smooth placement for DFx (routing, test, automation, heat)
`,
    questions: [
      q('Why does Chapter 5 stress Design for Excellence on placement?',
        ['Layout is performed once while manufacturing may run millions of times.',
         'Placement never affects routing, test, or assembly automation.',
         'DFx only applies to silk-screen fonts and company logos.',
         'Locking parts is optional until after the fab scrap report.'],
        0, HITCH, 45, 'PCB layout is only performed once, and the manufacturing process'),
      q('After mechanically fixed components are located, you should:',
        ['Leave them unlocked so auto-place can shuffle them overnight.',
         'Lock them into place before moving functional groups.',
         'Delete them from the database to simplify DRC.',
         'Move them only after every signal is fully routed.'],
        1, HITCH, 45, 'Once fixed components are located, lock them into place'),
      q('Color-coding nets in the layout is recommended based on:',
        ['The project manager’s favorite sports team colors only.',
         'Node count and net function to make collaboration easier.',
         'Random hues regenerated every time the file is saved.',
         'Soldermask color availability at the cheapest fab.'],
        1, HITCH, 45, 'Color code nets in the layout based on their node count'),
      q('High-Speed guide — components or vias between differential pairs:',
        ['Are encouraged to shorten the pair length at any cost.',
         'Should not be placed between pairs; they create impedance discontinuity.',
         'Are required by IPC whenever pairs change layers.',
         'Only matter for power nets, never for high-speed pairs.'],
        1, HS, 33, 'components or vias should not be placed between differential pairs'),
      q('Smooth out placement for DFx aiming at:',
        ['Only maximizing unconnected air wires on purpose.',
         'Better routing, future test points, automated placement, and heat considerations.',
         'Hiding all reference designators under large BGAs forever.',
         'Packing parts so no probe or nozzle can ever reach a pad.'],
        1, HITCH, 45, 'Aim for similar'),
      tf('True or false: Chapter 5 says group components off-board primarily by their functional relationships before placing groups.',
        true, HITCH, 45, 'Group components together off-board'),
      q('SpaceX NPI readiness connects to placement because:',
        ['Placement density never affects assembly yield or test access.',
         'Supplier process capability must match how parts are grouped and accessed for build/test.',
         'Auto-place defaults guarantee rate production without EMS review.',
         'Only schematic capture quality matters for launch-vehicle electronics.'],
        1, HITCH, 45, 'Smooth out the placement in consideration for DFx',
        'Ensure suppliers are prepared to support prototype, ramp, and rate'),
    ],
  },
  {
    slug: 'chapter-6-dft',
    label: 'Chapter 6',
    title: 'DFT for In-Circuit Test and JTAG',
    pages: [47, 53],
    notes: `# Chapter 6 — DFT for ICT and JTAG

Hitchhiker PDF pages **47–53**.

## Core ideas

- In-circuit test capability must be designed in at layout
- Prefer planning test points at placement, not after dense routing
- JTAG changes coverage needs; without JTAG, often ≥1 test point per net
- DFT for ICT has cost — decide deliberately with the team
`,
    questions: [
      q('When must in-circuit testing capability be designed into the PCB?',
        ['Only after the first field failure is returned from a customer.',
         'At the layout stage (DFT), not as an afterthought.',
         'Only in the purchasing PO notes, never in copper.',
         'After silk-screen is approved by marketing.'],
        1, HITCH, 47, 'must be designed into the PCB at the layout stage'),
      q('For dense designs, when is it far easier to place test points?',
        ['After every route is finished and copper is poured.',
         'At placement time, prior to routing.',
         'Only during ICT fixture debug on the production floor.',
         'Never — ICT fixtures invent pads without copper.'],
        1, HITCH, 47, 'at the time placement, prior to routing'),
      q('Without JTAG, test engineers commonly require:',
        ['Zero test points to protect signal integrity always.',
         'At least one test point per net for full testing coverage goals.',
         'Test points only on the company logo net.',
         'That all nets remain completely inaccessible by probe.'],
        1, HITCH, 47, 'at least one test point per net'),
      q('Why can adding DFT for ICT get expensive?',
        ['There are many fixture/process parts and software costs tied to coverage choices.',
         'Test points are free and never affect schedule or BOM cost.',
         'ICT fixtures are always included with Quickie-Cheapo fab quotes.',
         'JTAG eliminates every cost related to manufacturing test.'],
        0, HITCH, 47, 'DFT for ICT can get expensive'),
      q('Chapter 3/6 alignment — recognize the need for testability means:',
        ['Ignoring how assemblies will be tested until after release.',
         'Planning bed-of-nails/functional (etc.) approaches with stakeholders early.',
         'Assuming VR goggles replace ICT fixtures entirely.',
         'Testing only the cafeteria POS terminal connected to the lab.'],
        1, HITCH, 25, 'Recognize the need for testability'),
      tf('True or false: Thinking about DFT only at PCB documentation time is probably too late.',
        true, HITCH, 113, 'too late to begin thinking about it at the PCB documentation stage'),
      q('For a sourcing interview, DFT literacy helps you:',
        ['Claim test is free so piece price can ignore fixture and coverage tradeoffs.',
         'Discuss how layout decisions change ICT/JTAG cost, yield learning, and NPI risk.',
         'Delete test requirements from every RFQ to win on schedule alone.',
         'Treat EMS test capability as unrelated to the bare-board supplier choice.'],
        1, HITCH, 47, 'Incorporation of simple DFT for'),
    ],
  },
  {
    slug: 'chapter-7-stackup',
    label: 'Chapter 7',
    title: 'The PCB Design Stackup',
    pages: [54, 62],
    notes: `# Chapter 7 — The PCB Design Stackup

Hitchhiker PDF pages **54–62**. High-Speed overlap: stack-up for controlled impedance, materials, reference planes.

## Hitch themes

- Stack-up = composition and layering order of laminated materials
- Affects electrical performance and manufacturability/cost
- Know cost adders; validate impedance widths against the stack-up

## High-Speed overlap

- Controlled dielectric vs controlled impedance
- Typical impedance tolerance ~±10% (tighter possible with capable fabs)
`,
    questions: [
      q('In Chapter 7, “stack-up” refers to:',
        ['Only the cardboard box used to ship bare boards.',
         'The composition and layering order of materials used in PCB lamination.',
         'The order of emails sent to CAM during a disposition loop.',
         'The sequence of cafeteria cake flavors during an all-nighter.'],
        1, HITCH, 54, 'composition and layering order of the materials used in lamination'),
      q('A sound stack-up strategy matters because layer positions affect:',
        ['Only the PDF thumbnail color in the file browser.',
         'Electrical performance and manufacturing/cost realities of the board.',
         'Nothing if the schematic used IEEE reference designators.',
         'Only the silk-screen font licensed by marketing.'],
        1, HITCH, 54, 'will not only affect the PCB’s electrical performance'),
      q('When documenting impedance in the stack-up detail, designers should:',
        ['Invent dielectric constants so fabs cannot change anything.',
         'Validate impedance line widths in the stack-up and let suppliers adjust process variables carefully.',
         'Omit reference planes so impedance becomes a surprise at ICT.',
         'Set every layer to one mil dielectric by software default.'],
        1, HITCH, 54, 'validate the values in the stack-up'),
      q('High-Speed guide — a typical tolerance on final impedance is about:',
        ['±50%, which is always acceptable for USB and DDR alike.',
         '±10% typical (some fabs advertise tighter, e.g. ±5%).',
         'Exactly 0% because copper never varies in production.',
         '±100%, so controlled impedance notes are decorative only.'],
        1, HS, 30, 'A typical tolerance on the final impedance is +/- 10%'),
      q('Controlled dielectric stack-up (High-Speed) focuses manufacturing on:',
        ['Ignoring materials entirely and only checking silk-screen.',
         'Building the specified dielectric construction when impedance traces are not the control method.',
         'Deleting all ground planes to save laminate cost.',
         'Using only air as the dielectric between every copper layer.'],
        1, HS, 30, 'The designer provides the controlled dielectric stack-up'),
      q('Adding ground/power planes when moving beyond two layers is described as:',
        ['Free in every fab quote with no cost impact ever.',
         'A common multi-layer choice that increases cost versus a simple two-layer board.',
         'Illegal under ITAR for all commercial products.',
         'Only useful for making the board thicker for shipping weight.'],
        1, HITCH, 54, 'average cost of adding a layer'),
      tf('True or false: Knowing stack-up “cost adders” helps designers estimate price impact before release.',
        true, HITCH, 54, 'Knowing certain “cost adders” related to PCB stack-up'),
      q('SpaceX avionics sourcing angle on stack-up:',
        ['Buyers never need to read stack-ups if piece price looks low.',
         'Reading stack-ups/fab notes is required literacy for guiding suppliers and DFM trades.',
         'Stack-up is only a mechanical drawing title block field.',
         'Any stack-up works if the online fab rating is above four stars.'],
        1, HITCH, 54, 'Selecting a sound PCB stack-up strategy is important',
        'strong ability to read drawings, fab notes, stack-ups, and BOMs'),
    ],
  },
  {
    slug: 'chapter-8-routing-planes',
    label: 'Chapter 8',
    title: 'Routing and Planes',
    pages: [63, 78],
    notes: `# Chapter 8 — Routing and Planes

Hitchhiker PDF pages **63–78**. High-Speed overlap: impedance continuity, crosstalk, reference planes, via stubs.

## Routing order tip

Via fanout first → power routing → remaining signals → SI checks. Avoid crossing splits in adjacent planes.
`,
    questions: [
      q('Recommended routing order on multi-layer designs includes:',
        ['Silk-screen fonts first, then ignore power pins entirely.',
         'Via fanout first, power second, then remaining signal routing.',
         'Random nets in alphabetical order only.',
         'Differential pairs last after deleting all ground vias.'],
        1, HITCH, 78, 'via fanout first, routing of power second'),
      q('Solid power planes are called out as useful for:',
        ['EMI shielding and heat sinking in addition to power distribution.',
         'Only increasing the board’s postage weight class.',
         'Replacing the need for any bypass capacitors forever.',
         'Preventing CAM from ever reading Excellon drill files.'],
        0, HITCH, 78, 'EMI shielding and heat sinking'),
      q('After routing, Chapter 8 says to:',
        ['Ship immediately without reviewing circuitous paths or SI.',
         'Review routes, mitigate signals crossing adjacent plane splits, and perform SI checks.',
         'Delete all ground pours so DRC finishes faster.',
         'Convert every signal to one mil width for consistency.'],
        1, HITCH, 78, 'signal lines crossing splits from an adjacent power plane'),
      q('Power trace width guidance references:',
        ['Twitter polls among interns on preferred mil widths.',
         'Copper thickness and proven current-carrying calculations such as in IPC-2221.',
         'Always 1 mil regardless of current.',
         'Whatever default the auto-router used on Friday night.'],
        1, HITCH, 78, 'calculations in IPC-2221'),
      q('High-Speed — to reduce impedance discontinuity effects from vias:',
        ['Always maximize via stub length for filtering.',
         'Minimize discontinuity effects (e.g., smaller microvias / HDI approaches where appropriate).',
         'Place vias between differential pairs whenever possible.',
         'Remove all reference planes under high-speed nets.'],
        1, HS, 16, 'Minimizing the effects of discontinuities caused by vias'),
      q('High-Speed — high-speed signals generally require:',
        ['No return path if the trace looks short on the screen.',
         'A continuous reference plane for the return path.',
         'A split plane under every differential pair by default.',
         'Floating copper islands with no DC connection.'],
        1, HS, 36, 'continuous reference plane for a return path'),
      tf('True or false: Chapter 8 recommends performing via fanout manually on multi-layer designs rather than trusting it entirely to later chaos.',
        true, HITCH, 78, 'perform a via fanout operation manually'),
      q('Crosstalk (High-Speed) increases when:',
        ['Rise times get faster and aggressor/victim coupling is strong.',
         'All traces are spaced infinitely far on a single-layer board of infinite size.',
         'You disable every clock in the design.',
         'Soldermask is glossy rather than matte.'],
        0, HS, 19, 'faster rise time signals create more crosstalk'),
    ],
  },
  {
    slug: 'chapter-9-fab-data',
    label: 'Chapter 9',
    title: 'Fabrication Data & Documentation',
    pages: [79, 93],
    notes: `# Chapter 9 — Fabrication Data & Documentation

Hitchhiker PDF pages **79–93**.

## Package expectations

- Textual fab specs + process notes + stack-up/drill chart details
- Gerbers, Excellon drills (finished hole sizes), fab drawing
- Meaningful tolerances; origin hole; naming with part/rev/function
- Prefer intelligent formats (ODB++ / IPC-2581) when IP rules allow
`,
    questions: [
      q('CAD data for fabrication should be accompanied by:',
        ['Only a verbal description left on the fab’s voicemail.',
         'Textual fabrication specifications and clear process notes.',
         'A selfie of the monitor showing the auto-router progress bar.',
         'Nothing — Gerbers alone never need notes or tolerances.'],
        1, HITCH, 93, 'CAD data must be accompanied by textual fabrication specifications'),
      q('Drill files in the manufacturing package should be:',
        ['Hand-drawn sketches without hole sizes.',
         'Industry-standard Excellon drill files reflecting finished hole sizes.',
         'Optional if the board uses only slots and no holes.',
         'Named randomly so competitors cannot find them.'],
        1, HITCH, 93, 'Excellon drill files which reflect finished hole sizes'),
      q('Board outline thickness tolerance guidance in the notes includes:',
        ['±10% for boards ≥0.039 in and a wider ±15% range for thinner boards (work with mechanical stakeholders).',
         'Zero tolerance on thickness for every consumer toy PCB.',
         'No thickness tolerance because laminate never varies.',
         '±90% so any core in inventory can be used blindly.'],
        0, HITCH, 93, 'PCB thickness tolerance of +/-10%'),
      q('Holes ≤0.200 in are generally designated to be ____; larger are ____.',
        ['routed; drilled', 'drilled; routed', 'ignored; plated only', 'laser-only; never machined'],
        1, HITCH, 93, 'Designate holes </= .200 to be drilled'),
      q('Intelligent data formats mentioned when IP rules allow include:',
        ['Only JPEG screenshots of the layout canvas.',
         'IPC-2581, ODB++, or ASCII, ideally with source design database when permitted.',
         'Only Morse code netlists etched on the panel rails.',
         'Encrypted MP3s of the auto-router log file.'],
        1, HITCH, 93, 'IPC-2581, ODB++, or ASCII'),
      q('File naming guidance for manufacturing outputs:',
        ['Use part number, revision, and file function in a tangible convention.',
         'Name every file final_final2_reallyfinal.gbr.',
         'Omit revision so fabs always build the newest mystery version.',
         'Use spaces and emoji only so FOSS tools refuse to open them.'],
        0, HITCH, 93, 'part number, revision, and file function'),
      tf('True or false: Include a complete fabrication drawing in the manufacturing data package.',
        true, HITCH, 93, 'Include a complete fabrication drawing'),
      q('If intentional shorts exist, documentation should:',
        ['Hide them and hope CAM never asks.',
         'Show X,Y locations and net names in a table so the supplier’s question is answered early.',
         'Delete the nets entirely from the fab drawing.',
         'Only mention them in a private Slack DM after award.'],
        1, HITCH, 93, 'If intentional shorts exist in the design'),
    ],
  },
  {
    slug: 'chapter-10-assembly',
    label: 'Chapter 10',
    title: 'Assembly Data & Documentation',
    pages: [94, 113],
    notes: `# Chapter 10 — Assembly Data & Process Overview

Hitchhiker PDF pages **94–113**.

## Deliver a complete assembly package

- BOM (electronics + mechanical + PCB + coatings/hardware as applicable)
- Neutral database (ODB++ / IPC-2581), XY placement, paste stencil, test point file if DFT
- Pull BOM from the source schematic before release
- Panelization clearances; bias TH parts for wave access; communicate with EMS
- IPC-A-610 for acceptance criteria
`,
    questions: [
      q('A complete assembly data package should include:',
        ['Only the bare-board Gerbers with no BOM or placement file.',
         'BOM, neutral database, XY placement, paste stencil artwork, and test-point file when DFT applies.',
         'Only a photo of the stuffed prototype on a lab bench.',
         'Only the schematic PDF without reference designators.'],
        1, HITCH, 113, 'BOM, neutral database file, XY placement file, solder paste stencil'),
      q('Before release, BOM information should be pulled from:',
        ['A spreadsheet someone edited from memory last year.',
         'The source schematic.',
         'The fab’s online star-rating page.',
         'Random distributor cart screenshots.'],
        1, HITCH, 113, 'pull BOM information from the source schematic'),
      q('The XY placement file must specify for each part:',
        ['Only the supplier’s DUNS number.',
         'Reference designator, side, X/Y location, and orientation angle.',
         'Only the color of the tape used on the reel.',
         'Nothing if the EMS can guess from the silkscreen art.'],
        1, HITCH, 113, 'reference designator side of placement, X,Y location, and angle'),
      q('Panelization tip — leave about ≥0.020 in clearance from board edge to copper to allow:',
        ['Better Wi-Fi antenna gain exclusively.',
         'Singulation via v-score or tab-route without damaging copper.',
         'Thicker soldermask dams under every BGA.',
         'Skipping stencil design entirely.'],
        1, HITCH, 113, 'clearance between the PCB edge and any copper'),
      q('Thru-hole components are often biased to the top side so that:',
        ['Wave solder can more easily access component pins.',
         'The board fails ICT on purpose for training.',
         'Bottom-side nozzles never have to move again.',
         'Silkscreen white ink cures faster in sunlight.'],
        0, HITCH, 113, 'wave solder operation will have easy access to component pins'),
      q('Stencil artwork guidance in the chapter:',
        ['Provide 1:1 openings and let the stencil supplier coordinate compensation with the assembly ME.',
         'Always oversize apertures 300% without talking to EMS.',
         'Omit paste layers because operators will hand-solder BGAs.',
         'Draw paste openings freehand on the fab drawing only.'],
        0, HITCH, 113, 'Provide 1:1 ratio openings on stencil artwork'),
      q('Acceptance criteria leverage called out for PCBA:',
        ['IPC-A-610 as a comprehensive conformance guideline.',
         'Only the fab’s Twitter poll results.',
         'Whatever the night-shift operator prefers that evening.',
         'No written criteria — “looks fine” is enough for flight hardware.'],
        0, HITCH, 113, 'Leverage the power of IPC-A-610'),
      tf('True or false: The assembly drawing is described more as an inspection document than a how-to document.',
        true, HITCH, 113, 'less of a how-to document and more of an inspection document'),
      q('SpaceX ramp/rate preparation maps to this chapter when you:',
        ['Ship incomplete BOMs and hope EMS invents missing hardware lines.',
         'Deliver complete assembly data and keep EMS communication tight through prototype → rate.',
         'Skip XY data because “the pick-and-place will learn.”',
         'Treat panelization and stencil as optional until after launch.'],
        1, HITCH, 113, 'communicate often with the assembly supplier stakeholder',
        'Ensure suppliers are prepared to support prototype, ramp, and rate'),
    ],
  },
];

function q(question, options, answerIndex, book, page, excerpt, lecture) {
  const letters = ['a', 'b', 'c', 'd'];
  const ref = { book, page, excerpt };
  if (lecture) ref.lecture = lecture;
  return {
    question,
    type: 'multiple',
    level: page <= 50 ? 1 : 2,
    options,
    answer: letters[answerIndex],
    explanation: excerpt,
    reference: ref,
  };
}

function tf(question, answer, book, page, excerpt) {
  return {
    question,
    type: 'boolean',
    level: 1,
    answer,
    explanation: excerpt,
    reference: { book, page, excerpt },
  };
}

function balanceLengths(options, answerIndex) {
  const max = Math.max(...options.map((o) => o.length));
  return options.map((opt, i) => {
    if (i === answerIndex) return opt;
    if (opt.length >= max - 8) return opt;
    const pad = ' for real production programs';
    let out = opt.replace(/\.$/, '');
    while (out.length < max - 4) out += pad;
    return out.endsWith('.') ? out : out + '.';
  });
}

for (const ch of chapters) {
  const dir = join(ROOT, ch.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'notes.md'), ch.notes);
  const questions = ch.questions.map((item) => {
    if (item.type !== 'multiple') return item;
    const idx = item.answer.charCodeAt(0) - 97;
    return Object.assign({}, item, { options: balanceLengths(item.options, idx) });
  });
  const quiz = {
    title: 'Electronics — ' + ch.label + ': ' + ch.title,
    questions,
  };
  writeFileSync(join(dir, 'quiz.json'), JSON.stringify(quiz, null, 2) + '\n');
  console.log('wrote', ch.slug, questions.length);
}
