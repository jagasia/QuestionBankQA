# Project Knowledge Guide

Purpose

This file explains what each project-knowledge document contains, which ones are authoritative, the recommended reading order, and how to update the set when new business rules are introduced.

## Documents in this folder

### 01-review-methodology.md

What it contains:
- The evolution of the review methodology from simple proofreading to audit-defensible assessment QA.
- Core review philosophy such as challenger mindset, reviewer neutrality, and minimal editing.
- Standardization milestones for remarks, explanations, references, and option quality checks.

Primary use:
- Historical and conceptual foundation for why the rules exist.

### 02-review-rules.md

What it contains:
- Formal validation rules with purpose, severity, detection approach, examples, remediation, and exceptions.
- Candidate rule definitions for deterministic, human, and AI-assisted checks.

Primary use:
- Normative rule source for validation logic and QA behavior.

### 03-remark-system.md

What it contains:
- Reporting and reviewer-remark standards.
- Categories of findings, expected wording style, and distinction between observation and correction.

Primary use:
- Normative source for review output language and reporting consistency.

### 04-product-vision.md

What it contains:
- Product purpose, target users, goals, and high-level workflow.
- Strategic framing of QuestionBankQA as a quality platform, not a spreadsheet editor.

Primary use:
- Directional context for product scope and prioritization.

### 05-design-history.md

What it contains:
- Major architecture and product design decisions.
- Alternatives considered and rationale for final choices.

Primary use:
- Normative design principles for technical implementation, unless superseded.

## Authoritative status

Authority hierarchy for implementation decisions:

1. 02-review-rules.md
- Authoritative for validation behavior, severity expectations, and remediation semantics.

2. 03-remark-system.md
- Authoritative for reviewer output format and reporting language.

3. 05-design-history.md
- Authoritative for architecture and design principles, unless explicitly superseded.

4. 01-review-methodology.md
- Foundational context and rationale; use when interpreting or extending rules.

5. 04-product-vision.md
- Strategic guide for product direction and roadmap-level decisions.

Conflict resolution policy:
- If methodology or vision conflicts with a concrete rule, follow 02-review-rules.md.
- If reporting language conflicts with other docs, follow 03-remark-system.md.
- If implementation approach conflicts with these rules, reconcile via an explicit design-history update in 05-design-history.md.

## Recommended reading order for developers

1. 04-product-vision.md
- Understand why the product exists and who it serves.

2. 01-review-methodology.md
- Understand how review philosophy evolved and what quality bar is expected.

3. 02-review-rules.md
- Learn exact validation rules and severity model.

4. 03-remark-system.md
- Learn how findings must be reported and categorized.

5. 05-design-history.md
- Learn architectural constraints and approved technical direction.

Minimum required before coding validation or review features:
- 02-review-rules.md
- 03-remark-system.md
- 05-design-history.md

## How to update these docs when new business rules are introduced

Use this update sequence every time a new business rule is added or changed.

1. Add or update the formal rule in 02-review-rules.md
- Include: Rule Name, Purpose, Severity, Detection, Example, Remediation, Exceptions.
- Keep wording testable and implementation-friendly.

2. Update reporting standards in 03-remark-system.md
- Add or revise the expected reviewer remark category and sentence patterns.
- Clarify whether the new rule creates an observation or a correction requirement.

3. Update methodology context in 01-review-methodology.md
- Add a short evolution note that explains why this rule was introduced.
- Capture reviewer pain point or audit risk that triggered the rule.

4. Align strategic narrative in 04-product-vision.md when needed
- Update only if the new rule changes product scope, target users, or workflow.

5. Record technical/architectural impact in 05-design-history.md
- Add a decision entry if the new rule affects system design, data model, or workflow architecture.
- Include alternatives and rationale.

6. Add traceability metadata to each changed section
- Change ID
- Effective date
- Owner
- Reason for change
- Backward compatibility notes

7. Verify cross-document consistency before merge
- Terminology matches across all five files.
- Severity terms are consistent.
- No contradiction between rule behavior and remark policy.

8. Implement code changes only after docs are aligned
- Treat document updates as the contract for subsequent implementation.

## Maintenance note

Some document headers currently reference alternate historical filenames in their internal "Document Path" lines. Keep the actual filenames in this folder as the source of truth, and update internal header references when files are edited next.
