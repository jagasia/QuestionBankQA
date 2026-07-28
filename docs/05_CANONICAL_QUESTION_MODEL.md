# Canonical Question Model (CQM)

This document defines the Canonical Question Model (CQM) for QuestionBankQA. It is the authoritative internal representation for all question-related operations and serves as the shared contract between import, review, validation, AI assistance, and export workflows.

The model is intentionally independent of any specific spreadsheet layout, import format, export template, or storage implementation.

---

## 1. Purpose of the Canonical Question Model

The Canonical Question Model exists to ensure that QuestionBankQA operates on a single, stable understanding of a question regardless of where the data originated.

Its purpose is to:
- Provide a single internal representation of a question across the platform.
- Decouple business logic from source file formats such as Excel, CSV, or QTI.
- Preserve the original source context while enabling structured review and export.
- Support AI-assisted review without replacing human judgment.
- Allow future import/export formats to be added without redesigning the core system.

In short, the CQM is the system’s canonical source of truth for question content, review state, metadata, and lineage.

---

## 2. Design Principles

The Canonical Question Model must follow the project’s “Canonical First” philosophy.

### 2.1 Canonical First
All business logic, validation, review workflows, and AI analysis must operate on the CQM rather than raw source rows or file-specific structures.

### 2.2 Extensibility
The model must be flexible enough to support future question types, metadata needs, and client-specific requirements without forcing a schema rewrite.

### 2.3 Preservation over Loss
Any data that cannot be mapped to a standard field must be retained in a structured preservation mechanism rather than discarded.

### 2.4 Explainability
Every AI-generated recommendation or inferred value must retain enough context to explain why it was produced.

### 2.5 Human Approval
The model must support a clear separation between AI-generated suggestions and human-approved values.

### 2.6 Round-Trip Fidelity
The model must preserve enough context to allow reviewed content to be mapped back to the original source format with minimal distortion.

---

## 3. Core Entities

The following entities form the conceptual model that future implementation should respect.

### 3.1 Canonical Question
The primary business object. A canonical question represents one reviewable item and contains the normalized content needed for QA review and export.

It should include:
- a stable question identity
- the question stem
- answer choices or response options
- the correct answer representation
- explanatory content where applicable
- review and lifecycle metadata
- source lineage and preservation data

### 3.2 Question Version
A versioned snapshot of a canonical question over time. Each significant change to a question should create a new version, preserving history for audit, rollback, and comparison.

### 3.3 Review Event
A recorded review action or observation related to a question. This may include review comments, status changes, approvals, rejections, AI suggestions, and human overrides.

### 3.4 Source Evidence
A record of where the question originated and how it entered the system. This includes import source, original row or document references, and preserved raw values where relevant.

### 3.5 Metadata Container
A structured container for extensible metadata. This supports client-specific fields, unknown source columns, AI-generated annotations, and future custom classification systems.

### 3.6 Mapping Context
A configuration artifact describing how the canonical question was derived from an external format. This is not part of the question content itself, but it is essential to preserve import/export fidelity and template reuse.

---

## 4. Question Lifecycle

The canonical question should follow a lifecycle that reflects the intended workflow of QuestionBankQA.

### 4.1 Imported
A question enters the system from an external source file. At this stage, the system creates the canonical representation and preserves raw source evidence.

### 4.2 In Review
The question is available for human or AI-assisted inspection. Validation issues, content concerns, and metadata suggestions may be attached.

### 4.3 Reviewed
The question has received review attention and may have updates, annotations, or corrections applied.

### 4.4 Approved
The question has passed human review and is accepted for downstream use.

### 4.5 Rejected or Needs Revision
The question may be flagged for correction or excluded from final use. The model must preserve the reasoning and review trail.

### 4.6 Exported
The question has been mapped back to an external format and is considered part of a generated delivery package.

This lifecycle should be modeled as an explicit state progression, not as an implied or inferred condition.

---

## 5. Mandatory Fields

The following fields should be considered foundational for every canonical question.

- Question identifier
- Source lineage reference
- Question text or stem
- Answer options or response structure
- Correct answer representation
- Review status
- Current version identifier
- Created timestamp
- Last updated timestamp
- Review ownership or assignee (where applicable)
- Preservation container for raw or unmapped source data

These fields ensure that the question is identifiable, reviewable, auditable, and exportable.

---

## 6. Optional Fields

The CQM should support optional fields that may be present depending on type, client, or workflow.

Examples include:
- explanations or rationales
- difficulty level
- taxonomy or learning objective tags
- distractor rationales
- language metadata
- source formatting hints
- client-specific labels
- review comments
- attachment references
- custom quality flags

Optional fields must remain extensible and should not be hardcoded into the core workflow.

---

## 7. AI-Generated Metadata

AI-generated values should be treated as derived insights rather than authoritative truth.

Examples include:
- likely validation issues
- probable missing or malformed options
- suggested corrections
- confidence scores
- reasoning summaries
- suggested tags or classifications

Each AI-generated element should be stored with:
- the generating model or rule source
- a confidence score
- a rationale or explanation
- a timestamp
- an indication of whether it has been accepted, rejected, or overridden by a human reviewer

This ensures the system remains explainable and auditable.

---

## 8. Human-Reviewed Metadata

Human-reviewed values represent the accepted state of the question after expert inspection.

Examples include:
- approved answer key
- corrected stem text
- reviewer comments
- quality judgment
- final tags or classifications
- final review decision

Human-reviewed values should be treated as authoritative for downstream operations unless explicitly superseded by a newer review cycle.

---

## 9. Preservation of Original Source Data

A core requirement of the model is that original source content is never discarded.

The CQM should preserve:
- raw source values as originally imported
- source row or document references
- unmapped or unknown fields
- formatting-adjacent data that might be relevant for export
- original client labels or headers where they are meaningful

This is essential for maintaining fidelity and respecting Rule 2 of the project constitution.

---

## 10. Support for Custom Client-Specific Fields

QuestionBankQA must support client-specific extensions without breaking the core model.

This should be achieved through a flexible metadata container or extension mechanism that allows:
- additional custom fields
- non-standard classifications
- client-defined labels or tracking properties
- future domain-specific attributes

The core model should remain stable while clients add context in a structured, extensible way.

---

## 11. Versioning Strategy

The Canonical Question Model must be versioned to preserve history and guard against breaking older mapping templates and review workflows.

Recommended versioning principles:
- Every material change to a question should generate a new version.
- Version history should be retained for audit and review comparison.
- The model should include a version identifier for both the question and its schema evolution.
- Import/export mappings and templates should be versioned separately so that older templates remain compatible when the canonical model evolves.

Versioning should ensure that updates do not invalidate historical review data or prior mappings.

---

## 12. Review Status Model

The review state of a question should be explicit and machine-readable.

A recommended status model includes:
- Imported
- In Review
- Reviewed
- Approved
- Needs Revision
- Rejected
- Exported

Additional sub-status values may be introduced if needed, but they should remain compatible with the core lifecycle model.

This status should be distinct from the question content itself and should be treated as part of the review lifecycle rather than the domain data.

---

## 13. Import and Export Mapping Concepts

The CQM is the internal center of the architecture, while import/export adapters translate between external formats and the canonical representation.

### 13.1 Import Mapping
Importers should map external fields to canonical fields dynamically. They should not assume fixed headers or rigid layouts.

### 13.2 Export Mapping
Exporters should map canonical values back into client-specific layouts while preserving original structure where possible.

### 13.3 Preservation Mapping
Any field not recognized by the canonical model should be retained in a preservation container and reintroduced during export.

This ensures that the system can support a broad variety of client templates and future format changes without altering the core business logic.

---

## 14. Illustrative Example of a Canonical Question

The following is illustrative only and not intended as code or a database schema.

Example canonical question:
- Question ID: Q-1042
- Stem: "Which of the following best describes the role of a compiler?"
- Options:
  - A. Converts source code into machine code
  - B. Executes instructions directly
  - C. Stores data permanently
  - D. Manages network traffic
- Correct answer: A
- Review status: Approved
- Source lineage: Imported from Client X workbook, sheet 2, row 18
- AI suggestions: One possible distractor was flagged as overly similar to the correct answer
- Human review note: Distractor B revised for clarity
- Preservation data: Original workbook column values not mapped to canonical fields retained for export
- Custom metadata: Client-specific taxonomy tag retained in extension fields

This example shows how a single question can retain both normalized canonical content and rich contextual metadata.

---

## 15. Architectural Guidance for Future Implementation

The following principles should guide future implementation work:
- Treat the CQM as the single internal contract for all workflows.
- Keep import and export adapters thin and translation-oriented.
- Avoid hardcoding external column names or format assumptions into core logic.
- Preserve unknown source data in a structured way.
- Keep AI suggestions separate from human-approved values.
- Maintain explicit versioning and review history.
- Make metadata extensible for future client requirements.

This model should remain stable even as new file types, review workflows, or AI features are introduced.
