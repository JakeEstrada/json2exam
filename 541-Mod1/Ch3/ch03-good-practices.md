# Chapter 3 — Good Practices for Requirements Engineering

**Main idea:** How do we actually perform requirements engineering correctly?

Takes the four activities from Ch. 1 and explains how to do them.

## The process is not linear

You do **not** just go Elicitation → Analysis → Specification → Validation and never go back.

The process is:

- Iterative
- Incremental
- Interleaved

You might analyze something, realize info is missing, go back to elicitation, rewrite the spec, and validate again.

## Elicitation

Discovering what people actually need.

- Define the requirements development process
- Create a vision and scope document
- Identify user classes
- Identify product champions
- Use focus groups
- Identify use cases
- Identify system events and responses
- Hold workshops
- Observe users
- Examine old problem reports
- Reuse applicable previous requirements

**Product champion vs focus group:**

- Product champion represents a user class over a longer period
- Focus group is usually temporary, gives input on functionality and quality expectations

## Analysis

Organizing and evaluating what elicitation produced.

- Create context diagrams
- Build prototypes
- Prioritize requirements
- Model requirements
- Identify system interfaces
- Identify requirements affecting other subsystems

Prototypes let users react to something tangible. Technical prototypes test whether a hard idea is feasible.

Models expose:

- Missing requirements
- Conflicts
- Inconsistencies
- Incomplete information

## Specification

Documenting the requirements clearly.

- Use consistent and reviewable documentation
- Use an SRS template
- Record the source of requirements
- Give requirements unique IDs
- Record business rules
- Specify quality attributes

Unique IDs matter for traceability and change management.

## Validation

Asks: "Did we document the *right* requirements?"

- Formal inspections
- Informal reviews
- Defining test cases
- Reviewing expected behavior with customers
- Defining acceptance criteria

## Requirements Management

Controlling changes after requirements are established.

- Define a change-control process
- Create a Change Control Board
- Perform impact analysis
- Maintain baselines and versions
- Maintain change history
- Track change status
- Measure requirements volatility
- Use requirements management tools
- Maintain a traceability matrix

**Change states:** Proposed → Approved → Implemented → Verified

**Traceability matrix:** Requirement → Design → Code → Test

Keeps requirements from being forgotten and stops developers from adding unauthorized features.
