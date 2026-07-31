# Reviewer Remarks & Reporting Standards

**Document Path:** `docs/project-knowledge/03-review-reporting-standards.md`

---

# Reviewer Remarks & Reporting Standards

## Purpose

This document captures the complete evolution of the reviewer remarks, explanation format, and reporting standards developed during the review of the Microsoft Excel and Microsoft Word question banks.

Initially, reviewer remarks were informal and inconsistent. Over time, they evolved into a structured reporting framework designed to support:

- Authors
- Reviewers
- Subject Matter Experts (SMEs)
- Clients
- Auditors
- Future AI-assisted review tools

The objective was to ensure that every review comment is:

- Objective
- Actionable
- Consistent
- Auditable
- Defensible

---

# Design Philosophy

The review report should answer five questions:

1. **Is the question technically correct?**
2. **If not, what is wrong?**
3. **How serious is the issue?**
4. **How should the author fix it?**
5. **Why was this recommendation made?**

The reviewer should **never rewrite content unnecessarily**. Instead, the report should help the author improve the question while preserving ownership of the original content.

---

# Evolution of Reviewer Remarks

## Phase 1 – Free-form Comments

Initially, remarks varied widely.

Examples:

- Looks good.
- Fine.
- Correct.
- OK.
- No changes.
- Needs improvement.

### Problems

- Inconsistent language
- Difficult to search
- Difficult to generate reports
- Different reviewers expressed the same observation differently

---

## Phase 2 – Standardized Remarks

The remarks evolved into standardized sentences.

Examples:

> Question is technically correct. No corrections required.

> Question can be clarified to avoid ambiguity.

> Question may become version dependent.

> Question contains multiple potentially correct answers.

Advantages:

- Consistent reports
- Easier reviewer training
- Easier automation
- Better client confidence

---

## Phase 3 – Observation vs Correction

A major realization during the review process was that **not every observation requires a correction**.

Example:

Question is technically correct.

However,

it overlaps another question conceptually.

This should not trigger a correction.

Instead,

record an observation.

This distinction greatly reduced unnecessary edits.

---

# Final Remark Categories

---

# Category 1 – No Action Required

## Purpose

Question is technically correct.

## Typical Remark

> Question is technically correct. No corrections required.

## Risk Level

None

## Action

None.

---

# Category 2 – Minor Improvement

## Purpose

Question is acceptable but can be improved.

Examples

- Better wording
- Minor grammar
- Clearer sentence

## Typical Remark

> Question can be clarified for improved readability.

## Risk Level

Low

## Action

Optional improvement.

---

# Category 3 – Ambiguity

## Purpose

Multiple interpretations are possible.

## Typical Remark

> Question may allow more than one interpretation.

## Risk Level

High

## Action

Clarify wording.

---

# Category 4 – Multiple Correct Answers

## Purpose

More than one option may be defensible.

## Typical Remark

> Question may contain more than one technically acceptable answer.

## Risk Level

Critical

## Action

Rewrite question or options.

---

# Category 5 – Incorrect Answer

## Purpose

Answer key is incorrect.

## Typical Remark

> Correct answer should be revised.

## Risk Level

Critical

## Action

Correct answer key.

---

# Category 6 – Weak Distractors

## Purpose

Incorrect options are too obvious.

## Typical Remark

> Distractors may be improved to increase assessment quality.

## Risk Level

Medium

## Action

Replace distractors.

---

# Category 7 – Duplicate Concept

## Purpose

Concept already tested elsewhere.

## Typical Remark

> Concept overlaps with another question in the bank.

## Risk Level

Low

## Action

Review overall coverage.

---

# Category 8 – Version Dependency

## Purpose

Question depends on a particular software version.

## Typical Remark

> Question may become version dependent.

## Risk Level

Medium

## Action

Prefer stable concepts.

---

# Category 9 – Terminology

## Purpose

Terminology differs from official Microsoft terminology.

## Typical Remark

> Consider using official Microsoft terminology.

## Risk Level

Low

## Action

Optional wording update.

---

# Category 10 – Reference Improvement

## Purpose

Reference quality can be improved.

## Typical Remark

> Consider replacing the reference with an official Microsoft source.

## Risk Level

Medium

## Action

Update reference.

---

# Category 11 – Explanation Improvement

## Purpose

Explanation is incomplete.

## Typical Remark

> Explanation may be expanded for clarity.

## Risk Level

Medium

## Action

Improve explanation.

---

# Category 12 – Spreadsheet Data Issue

## Purpose

Workbook data inconsistency.

Example

```
Correct Answer

#VALUE!
```

## Typical Remark

> Spreadsheet contains inconsistent answer data.

## Risk Level

High

## Action

Repair spreadsheet.

---

# Category 13 – Review Observation

## Purpose

Record useful observations without requesting changes.

Examples

- Excellent business scenario.
- Strong practical question.
- Good distractors.
- Good workplace relevance.

## Risk Level

Informational

## Action

None.

---

# Risk Levels

---

## Critical

Question cannot be released.

Examples

- Wrong answer
- Multiple correct answers

Requires immediate correction.

---

## High

Likely candidate objection.

Examples

- Ambiguous wording
- Spreadsheet inconsistency
- Serious factual issue

Correction strongly recommended.

---

## Medium

Assessment quality affected.

Examples

- Weak distractors
- Poor explanation
- Version dependency
- Weak references

Should be improved before publication.

---

## Low

Minor quality improvement.

Examples

- Better wording
- Better terminology
- Duplicate concepts
- Cosmetic improvements

Optional.

---

## Informational

Observation only.

No correction required.

Examples

- Excellent scenario
- Good business context
- Practical workplace question

---

# Reference Column Evolution

---

## Initial State

References varied significantly.

Examples

- Website URLs
- Book names
- Blogs
- Microsoft links
- No reference

Problems

- Inconsistent quality
- Difficult verification
- Broken links over time

---

## First Improvement

Only official sources.

Preferred

- Microsoft Support
- Microsoft Learn

Avoid

- Blogs
- Forums
- Wikipedia

Reason

Official documentation is more reliable and defensible.

---

## Second Improvement

Avoid direct Microsoft article URLs.

Reason

Article URLs frequently change.

Printed books remain in use for many years.

Broken URLs reduce usefulness.

---

## Final Standard

Every explanation should contain:

```text
Explanation

Justification

Official Reference

Source

Documentation Portal

Search Keywords

Note
```

---

## Final Reference Structure

```text
Official Reference

Source:
Microsoft Support Documentation

Documentation Portal:
https://support.microsoft.com

Search Keywords:
Word Mail Merge

Note:

Microsoft Support article URLs may change over time.
If the required article is unavailable,
search using the keywords above.
```

Advantages

- Stable
- Printable
- Future-proof
- Easy to verify
- Easier maintenance

---

# Reviewer Comment Principles

Every remark should satisfy five principles.

## 1. Objective

Avoid opinions.

Poor

```
I don't like this question.
```

Better

```
Question may allow multiple interpretations.
```

---

## 2. Actionable

The author should know what to do.

Poor

```
Needs improvement.
```

Better

```
Question can be clarified to remove ambiguity.
```

---

## 3. Neutral

Reviewer should not become the author.

Poor

```
Replace this with...
```

Better

```
Question may be clarified by...
```

---

## 4. Evidence Based

Every recommendation should be technically justified.

Example

Version dependency.

Official terminology.

Microsoft documentation.

---

## 5. Consistent

Different reviewers should produce nearly identical remarks for the same issue.

---

# Final Review Report Structure

Each reviewed question should produce a consistent report.

| Section | Purpose |
|---------|---------|
| Correct Answer | Validate answer |
| Correct Answer Position | Validate option position |
| Question Body Corrections | Suggested improvements or NIL |
| Option Corrections | Suggested improvements or NIL |
| Option Review | Relevance and multiple-answer validation |
| Explanation | Standard explanation with justification |
| Official Reference | Microsoft documentation details |
| Reviewer Remarks | Final reviewer observation |

---

# Final Output Format

For each question, the report should contain:

```text
Question Number

Question

Correct Answer

Correct Answer Position

Question Body Corrections

Option Corrections

Option Review

Explanation

Official Reference

Reviewer Remarks
```

If no corrections are required:

```text
Question Body Corrections

NIL

Option Corrections

NIL

Reviewer Remarks

Question is technically correct.
No corrections required.
```

This standardization ensures consistency across the entire question bank.

---

# Reporting Workflow

```text
Question
        │
        ▼
Technical Validation
        │
        ▼
Option Validation
        │
        ▼
Explanation Validation
        │
        ▼
Reference Validation
        │
        ▼
Reviewer Remarks
        │
        ▼
Risk Classification
        │
        ▼
Approval / Rework
```

---

# Reporting Metrics

The future application should generate summary reports including:

- Total Questions Reviewed
- Questions Approved
- Questions Requiring Correction
- Critical Issues
- High-Risk Issues
- Medium-Risk Issues
- Low-Risk Suggestions
- Informational Observations
- Duplicate Concepts
- Version-Dependent Questions
- Weak Distractor Count
- Explanation Completeness
- Reference Completeness
- Reviewer Productivity
- Approval Percentage

---

# Audit Requirements

Every review should be traceable.

The application should retain:

- Original question
- Review date
- Reviewer
- Suggested corrections
- Reviewer remarks
- Risk classification
- Approval decision
- Revision history
- Final published version

Nothing should be permanently overwritten.

---

# Conclusion

The reporting methodology evolved from informal reviewer comments into a structured, audit-ready reporting standard. Each refinement addressed a practical need: improving consistency, reducing ambiguity, supporting long-term maintenance, and enabling future automation.

The resulting framework is designed not only to guide human reviewers but also to serve as the reporting model for the future **Question Bank Quality Assurance Platform**, ensuring that every review is objective, actionable, consistent, and fully traceable.