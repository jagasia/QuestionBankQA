# ADR-007: ImportJob

Status: Proposed

Date: 2026-07-30

Decision Makers: Product Owner, Architecture

Supersedes: None

Superseded By: None

## Purpose

An ImportJob represents the complete state and lifecycle of a single workbook import.

It acts as the authoritative record of an import execution, capturing its progress, decisions, results, and audit information.

The orchestration of the import process is performed by application services rather than the ImportJob itself.

## Responsibilities

An ImportJob is responsible for:

- Identifying a single import execution.
- Recording the importing user.
- Recording the uploaded workbook.
- Tracking workflow status.
- Recording timestamps.
- Recording the TemplateProfileVersion used during the import.
- Recording import metrics including:
    - Questions imported
    - Questions skipped
    - Warnings
    - Errors
    - Duration
- Recording warnings and errors.
- Acting as the audit record for the entire import.

## Lifecycle

The lifecycle of an ImportJob is:

Created
    ↓
Parsing
    ↓
Template Detection
    ↓
Awaiting User Approval
    ↓
Importing
    ↓
Completed

If an unrecoverable error occurs:

Failed

## Status

The ImportJob status values are:

- Created
- Parsing
- DetectingTemplate
- AwaitingUserApproval
- ImportingQuestions
- Completed
- Failed

Status transitions must always move forward.

Completed and Failed are terminal states.

## Relationships

```mermaid
flowchart TD
    User --> ImportJob
    ImportJob --> Uploaded Workbook Metadata
    ImportJob --> TemplateProfileVersion
    ImportJob --> CanonicalQuestion
```

## Outcomes

Every ImportJob ends in exactly one terminal state:

- Completed
- Failed

Future terminal states (such as Cancelled) require a new architecture decision.

## Audit Information

An ImportJob records:

- createdAt
- startedAt
- completedAt
- createdBy

These values provide complete traceability for every import.

## Out of Scope

This ADR intentionally excludes:

- Excel parsing implementation.
- AI prompt generation.
- LLM interaction.
- Firestore persistence.
- Repository implementation.
- UI workflow.
- Background job execution.

## Design Principles

- One workbook upload creates exactly one ImportJob.
- An ImportJob is never reused.
- ImportJobs are immutable after completion except for audit enrichment.
- Historical ImportJobs must remain available for reporting and troubleshooting.

## Status

Status: Proposed

This ADR is subject to architectural review before implementation.
