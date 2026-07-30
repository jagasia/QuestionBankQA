# ADR-003: Mapping Engine

## Status

Accepted

---

## Context

The application imports question banks from many organizations.

Each organization may use different Excel templates.

Column names, ordering, and additional metadata can vary.

The application requires a consistent internal representation while preserving the customer's original format.

---

## Problem Statement

How should the system translate between arbitrary customer schemas and the application's canonical schema while maintaining transparency and user control?

---

## Decision

The application adopts a Mapping Engine.

The Mapping Engine translates between external schemas (Excel, CSV, etc.) and the Canonical Question Model.

AI proposes mappings.

Users review and approve mappings before any import or export proceeds.

Approved mappings are stored as Template Profiles and reused in future operations.

---

## Guiding Principles

Principle 1
Canonical Model

The application owns exactly one internal representation of a question.

External formats never become part of the domain model.

Principle 2
AI Suggests

AI proposes mappings.

AI never performs the final mapping.

Principle 3
User Approves

Every mapping can be reviewed.

Every mapping can be edited.

Every mapping can be approved.

Principle 4
Reuse

Previously approved mappings are suggested automatically.

The user still has the opportunity to review them.

Principle 5
Transparency

The application never silently assumes schema mappings.

Mappings are always visible before execution.

Principle 6
Preserve Data

Unknown columns are preserved.

They are never discarded automatically.

Principle 7
Shared Workflow

Import and Export use the same Mapping Review workflow.

Only the source and destination differ.

Domain Model

Then we'll describe the core objects:

Organization

↓

Question Bank

↓

Import Job

↓

Template Profile

↓

Column Mapping

↓

Canonical Question
Future Evolution

We'll explicitly note that the design is intended to support:

Excel
CSV
Google Sheets
Future connectors

without changing the Mapping Engine.

Benefits

We'll conclude with the expected benefits:

Consistent internal data model
Transparent AI-assisted mapping
Reusable template profiles
Easier onboarding of new organizations
Reduced manual work over time
Auditability of imports and exports