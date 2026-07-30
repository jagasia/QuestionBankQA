# Coding Standards

Status: DESIGN FROZEN

Version: 1.0

Applies To:

- Domain Model
- Domain Services
- Application Services

## Purpose

This document defines the mandatory coding conventions used throughout the QuestionBankQA project.

The goal is to maintain a consistent, readable, maintainable, and predictable codebase.

These standards should be followed by all developers and AI coding assistants.

## General Principles

- Prefer readability over cleverness.
- Keep classes small and focused.
- Follow the Single Responsibility Principle.
- Follow Domain-Driven Design.
- Avoid premature abstraction.
- Prefer composition over inheritance.
- Keep business rules inside the domain.
- Infrastructure concerns must remain outside the domain.

## Domain Entity Standards

Every entity:

- must expose immutable state
- must use readonly properties
- must never expose mutable collections
- must defensively copy mutable objects
- must freeze internal collections
- must freeze itself after construction

## Constructor Standard

Every entity constructor shall:

1. Accept a single Props interface.

Example:

EntityProps

↓

constructor(props: EntityProps)

2. Validate all input before assigning fields.
3. Assign all readonly fields.
4. Freeze collections.
5. Freeze the object.

## Validation Standard

Validation should:

- occur only inside private validation methods
- produce descriptive error messages
- validate null
- validate undefined
- validate empty strings
- validate numeric ranges
- validate required collections

## Collections

Collections must:

- use readonly arrays
- return defensive copies
- never expose internal arrays directly

## Dates

Dates must always be defensively copied.

Never expose mutable Date objects directly.

## Public API

Public methods should:

- have a single responsibility
- be deterministic
- avoid side effects whenever possible
- use expressive names

## Naming

Use:

EntityProps

for constructor parameters.

Use:

validate()

for entity validation.

Use:

hasX()

for boolean existence checks.

Use:

isX()

for boolean state checks.

Use:

getX()

for value-returning helper methods.

## Equality

Domain entities should avoid exposing internal fields solely for comparison.

Instead, provide expressive helper methods.

Examples:

- hasFingerprint(...)
- isVersion(...)
- isMappedTo(...)
- belongsTo(...)

These methods improve readability and prevent business logic from spreading throughout the application.

## Exceptions

Throw descriptive Error messages that explain:

- which entity failed validation
- which field is invalid
- why it is invalid

Error messages should help developers diagnose problems quickly.

## Documentation

Every public class should contain:

- class documentation
- constructor documentation
- public method documentation

Avoid documenting obvious implementation details.

Document intent instead.

## Prohibited

Domain entities must never contain:

- Firestore logic
- REST logic
- HTTP calls
- AI prompt generation
- Repository logic
- UI logic
- JSON serialization logic

## Examples

### Good Immutable Entity

```typescript
interface QuestionTemplateProps {
  id: string;
  createdBy: string;
  createdAt: Date;
  tags: readonly string[];
}

export class QuestionTemplate {
  public readonly id: string;
  public readonly createdBy: string;
  private readonly createdAtValue: Date;
  private readonly tagsValue: readonly string[];

  constructor(props: QuestionTemplateProps) {
    this.validate(props);

    this.id = props.id;
    this.createdBy = props.createdBy;
    this.createdAtValue = new Date(props.createdAt.getTime());
    this.tagsValue = [...props.tags];

    Object.freeze(this.tagsValue);
    Object.freeze(this);
  }

  public get createdAt(): Date {
    return new Date(this.createdAtValue.getTime());
  }

  public getTags(): readonly string[] {
    return [...this.tagsValue];
  }

  private validate(props: QuestionTemplateProps): void {
    this.validateNonEmptyString(props.id, "id");
    this.validateNonEmptyString(props.createdBy, "createdBy");

    if (!(props.createdAt instanceof Date) || Number.isNaN(props.createdAt.getTime())) {
      throw new Error("Invalid QuestionTemplate: createdAt must be a valid Date.");
    }

    if (props.tags === null || props.tags === undefined || props.tags.length === 0) {
      throw new Error("Invalid QuestionTemplate: tags must contain at least one value.");
    }
  }

  private validateNonEmptyString(value: unknown, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new Error(`Invalid QuestionTemplate: ${fieldName} cannot be null or undefined.`);
    }

    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`Invalid QuestionTemplate: ${fieldName} cannot be empty.`);
    }
  }
}
```

### Props Interface

```typescript
export interface EntityProps {
  id: string;
  createdAt: Date;
  items: readonly string[];
}
```

### Defensive Copying

```typescript
this.items = [...props.items];
this.createdAtValue = new Date(props.createdAt.getTime());

public getItems(): readonly string[] {
  return [...this.items];
}

public get createdAt(): Date {
  return new Date(this.createdAtValue.getTime());
}
```

### Validation

```typescript
private validate(props: EntityProps): void {
  this.validateNonEmptyString(props.id, "id");

  if (!(props.createdAt instanceof Date) || Number.isNaN(props.createdAt.getTime())) {
    throw new Error("Invalid Entity: createdAt must be a valid Date.");
  }

  if (props.items === null || props.items === undefined || props.items.length === 0) {
    throw new Error("Invalid Entity: items must be provided.");
  }
}
```

## Status

Status: DESIGN FROZEN

Future changes require architectural review.
