# Question Bank Review Rules

**Document Path:** `docs/project-knowledge/02-review-rules.md`

---

# Question Bank Review Rules

## Purpose

This document defines every review rule that evolved during the review of the Microsoft Excel and Microsoft Word question banks.

These rules form the foundation of the automated validation engine of the future **Question Bank Quality Assurance Platform**.

Each rule includes:

- Rule Name
- Purpose
- Severity
- Detection Approach
- Example
- Suggested Remediation
- Exceptions

---

# Rule 1 – Correct Answer Validation

## Purpose

Verify that the identified correct answer is actually correct.

## Severity

**High**

## Detection

- Human
- AI

## Example

Correct answer marked as

```
Ctrl + P
```

instead of

```
Ctrl + V
```

## Suggested Remediation

Correct the answer key.

Update explanation if required.

## Exceptions

None.

---

# Rule 2 – Correct Answer Position Validation

## Purpose

Ensure answer text matches answer position.

## Severity

High

## Detection

Deterministic

## Example

Answer

```
Ctrl + V
```

Position

```
3
```

but Ctrl + V is actually option 2.

## Suggested Remediation

Synchronize answer text and answer position.

## Exceptions

None.

---

# Rule 3 – Spreadsheet Consistency Validation

## Purpose

Detect spreadsheet formula or data errors.

## Severity

High

## Detection

Deterministic

## Example

Correct Answer

```
#VALUE!
```

Correct Answer Position

```
2
```

## Suggested Remediation

Repair spreadsheet formulas.

## Exceptions

None.

---

# Rule 4 – Single Correct Answer Rule

## Purpose

Ensure only one answer can reasonably be defended.

## Severity

High

## Detection

AI + Human

## Example

Question

> Which option formats text?

Multiple answers may be acceptable.

## Suggested Remediation

Rewrite the question.

## Exceptions

None.

---

# Rule 5 – Ambiguity Detection

## Purpose

Identify wording that allows multiple interpretations.

## Severity

High

## Detection

AI + Human

## Example

```
Which command manages formatting?
```

Several commands could qualify.

## Suggested Remediation

Clarify the intent.

## Exceptions

None.

---

# Rule 6 – Reviewer Neutrality

## Purpose

Reviewer should identify issues rather than rewrite author content.

## Severity

Medium

## Detection

Human

## Example

Prefer

> The question can be clarified...

instead of

rewriting the question completely.

## Suggested Remediation

Describe issues rather than replacing content.

## Exceptions

Minor grammar corrections.

---

# Rule 7 – Minimal Editing Rule

## Purpose

Avoid unnecessary edits.

## Severity

Medium

## Detection

Human

## Example

Question is already technically correct.

Correction should be

```
NIL
```

## Suggested Remediation

Leave unchanged.

## Exceptions

None.

---

# Rule 8 – Technical Correctness

## Purpose

Verify factual correctness.

## Severity

High

## Detection

AI + Human

## Example

Mail Merge creates personalized letters.

## Suggested Remediation

Correct factual errors.

## Exceptions

None.

---

# Rule 9 – Option Relevance

## Purpose

Verify distractors belong to the same domain.

## Severity

Medium

## Detection

AI

## Example

Good

```
INDEX
MATCH
OFFSET
VLOOKUP
```

Poor

```
INDEX
PivotTable
Chart
Freeze Panes
```

## Suggested Remediation

Replace unrelated distractors.

## Exceptions

None.

---

# Rule 10 – Distractor Plausibility

## Purpose

Ensure incorrect answers are believable.

## Severity

Medium

## Detection

AI

## Example

```
SLN
DB
DDB
VDB
```

Excellent distractors.

## Suggested Remediation

Improve distractor quality.

## Exceptions

None.

---

# Rule 11 – Duplicate Concept Detection

## Purpose

Avoid excessive repetition.

## Severity

Medium

## Detection

AI

## Example

Three questions testing Freeze Panes.

## Suggested Remediation

Replace duplicates.

## Exceptions

Intentional reinforcement.

---

# Rule 12 – Concept Family Classification

## Purpose

Identify related concepts.

## Severity

Low

## Detection

AI

## Example

Financial Functions

- PMT
- IRR
- NPER

## Suggested Remediation

Improve topic balance.

## Exceptions

None.

---

# Rule 13 – Knowledge Dependency Validation

## Purpose

Recognize prerequisite relationships.

## Severity

Low

## Detection

AI

## Example

Heading Styles

↓

Table of Contents

## Suggested Remediation

Improve learning sequence.

## Exceptions

None.

---

# Rule 14 – Scenario Quality

## Purpose

Evaluate workplace realism.

## Severity

Medium

## Detection

AI

## Example

Excellent

HR department prepares appointment letters.

Weak

User clicks a button.

## Suggested Remediation

Use realistic business scenarios.

## Exceptions

Definition questions.

---

# Rule 15 – Practicality Score

## Purpose

Measure workplace usefulness.

## Severity

Low

## Detection

AI

## Example

Track Changes

★★★★★

## Suggested Remediation

Prefer practical skills.

## Exceptions

Certification objectives.

---

# Rule 16 – Bloom's Taxonomy Classification

## Purpose

Estimate cognitive level.

## Severity

Low

## Detection

AI

## Example

Remember

Understand

Apply

Analyze

## Suggested Remediation

Balance cognitive levels.

## Exceptions

None.

---

# Rule 17 – Version Independence

## Purpose

Identify version-dependent questions.

## Severity

Medium

## Detection

AI + Human

## Example

Ribbon layout questions.

## Suggested Remediation

Prefer stable concepts.

## Exceptions

Version-specific exams.

---

# Rule 18 – Official Terminology Validation

## Purpose

Prefer Microsoft terminology.

## Severity

Medium

## Detection

AI

## Example

Use

Styles

instead of obscure terminology.

## Suggested Remediation

Use official names.

## Exceptions

Conceptual discussions.

---

# Rule 19 – Feature vs Capability Validation

## Purpose

Ensure wording matches answer type.

## Severity

Low

## Detection

AI

## Example

Question asks

```
Which feature...
```

Expected answer

Ribbon command.

Question asks

```
Which capability...
```

Expected answer

Behavior.

## Suggested Remediation

Align wording.

## Exceptions

None.

---

# Rule 20 – Explanation Completeness

## Purpose

Ensure explanations follow standard format.

## Severity

Medium

## Detection

Deterministic

## Required Sections

- Explanation
- Justification
- Official Reference
- Search Keywords

## Suggested Remediation

Add missing sections.

## Exceptions

None.

---

# Rule 21 – Wrong Option Justification

## Purpose

Explain why distractors are incorrect.

## Severity

Medium

## Detection

AI

## Example

Ctrl + P

opens Print dialog.

## Suggested Remediation

Explain every distractor.

## Exceptions

Very simple beginner questions.

---

# Rule 22 – Reference Validation

## Purpose

Ensure references are authoritative.

## Severity

Medium

## Detection

AI

## Preferred

Microsoft Support

Microsoft Learn

## Avoid

Blogs

Wikipedia

## Suggested Remediation

Replace unofficial sources.

## Exceptions

None.

---

# Rule 23 – Stable Reference Rule

## Purpose

Avoid unstable URLs.

## Severity

Low

## Detection

Deterministic

## Example

Store

Documentation Portal

Search Keywords

instead of article URLs.

## Suggested Remediation

Replace direct URLs.

## Exceptions

Permanent DOI-based references.

---

# Rule 24 – Reviewer Remark Standardization

## Purpose

Maintain consistency.

## Severity

Low

## Detection

Deterministic

## Example

Preferred

```
Question is technically correct. No corrections required.
```

## Suggested Remediation

Normalize remarks.

## Exceptions

Complex review observations.

---

# Rule 25 – Reviewer Observation Rule

## Purpose

Record observations without forcing corrections.

## Severity

Low

## Detection

Human

## Example

Question overlaps another concept.

## Suggested Remediation

Mention in reviewer remarks.

## Exceptions

None.

---

# Rule 26 – Coverage Analysis

## Purpose

Measure topic distribution.

## Severity

Low

## Detection

AI

## Example

Power Query

5 questions

Functions

60 questions

## Suggested Remediation

Improve coverage.

## Exceptions

Blueprint-driven exams.

---

# Rule 27 – Assessment Blueprint Validation

## Purpose

Compare against syllabus.

## Severity

Medium

## Detection

AI

## Example

Expected

Charts

15%

Actual

3%

## Suggested Remediation

Create additional questions.

## Exceptions

None.

---

# Rule 28 – Learning Outcome Mapping

## Purpose

Map questions to course objectives.

## Severity

Low

## Detection

AI

## Example

LO-Excel-PivotTables

## Suggested Remediation

Assign learning outcomes.

## Exceptions

None.

---

# Rule 29 – Business Context Detection

## Purpose

Recognize workplace scenarios.

## Severity

Low

## Detection

AI

## Example

Finance

HR

Legal

Operations

## Suggested Remediation

Diversify contexts.

## Exceptions

Pure theory questions.

---

# Rule 30 – Accessibility & Compliance Classification

## Purpose

Identify compliance-related questions.

## Severity

Low

## Detection

AI

## Categories

Accessibility

Privacy

Security

Collaboration

## Suggested Remediation

Classify correctly.

## Exceptions

None.

---

# Rule 31 – Overall Question Quality Score

## Purpose

Generate an overall quality rating.

## Severity

Informational

## Detection

AI

## Inputs

- Technical correctness
- Ambiguity
- Distractors
- Practicality
- Scenario quality
- Explanation
- References

## Suggested Remediation

Improve weakest dimensions.

## Exceptions

None.

---

# Rule 32 – Human Override

## Purpose

Ensure AI never becomes the final authority.

## Severity

Critical

## Detection

Human

## Example

AI suggests a correction.

Reviewer rejects it.

Reviewer decision prevails.

## Suggested Remediation

Always allow reviewer approval.

## Exceptions

None.

---

# Rule 33 – Audit Trail Preservation

## Purpose

Maintain complete review history for traceability and accountability.

## Severity

High

## Detection

Deterministic

## Example

Track:

- Original question
- Suggested correction
- Reviewer decision
- Approval date
- Reviewer identity
- Final version

## Suggested Remediation

Never overwrite review history. Maintain versioned records.

## Exceptions

None.

---

# Conclusion

These review rules collectively define the quality assurance framework for assessment content. While some rules can be enforced through deterministic validation, many require AI-assisted analysis or human expertise. The future Question Bank Quality Assurance Platform should implement these rules as modular validators, allowing organizations to enable, disable, or customize them according to their assessment policies while preserving a complete audit trail.