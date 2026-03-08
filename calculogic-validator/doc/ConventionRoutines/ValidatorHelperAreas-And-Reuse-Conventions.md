# Validator Helper Areas and Reuse Conventions

## 1) Purpose

This document is the canonical routing and convention guide for validator helper ownership and reuse.

Use it to decide:

- where helper logic belongs,
- when to reuse an existing helper area,
- when to add a helper to an existing area, and
- when a new semantic helper area is warranted.

The goal is to preserve clear ownership boundaries and avoid generic catch-all helper drift.

## 2) Current helper areas (current-state only)

Current validator helper areas are:

- suite-core CLI helper area: `calculogic-validator/src/core/cli/`
- naming-owned CLI helper area: `calculogic-validator/naming/src/cli/`
- naming-owned health helper area: `calculogic-validator/naming/src/health/`

Do not infer additional helper areas from this document beyond those that currently exist.

## 3) Ownership rules

Ownership follows semantic owner boundaries:

- suite-wide, cross-slice concerns belong in `calculogic-validator/src/core/<area>/`
- slice-owned shared concerns belong in `calculogic-validator/<slice>/src/<area>/`

Ownership is determined by concern and boundary, not by file count or temporary convenience.

## 4) Reuse-first rule

Before adding a new helper file, contributors should check for reuse in this order:

1. existing suite-core semantic areas (for cross-slice concerns), then
2. the relevant slice-owned semantic area (for slice-owned concerns)

If concern and owner already match an existing semantic area, extend that area rather than creating a new folder.

## 5) New-helper decision rule

Use this decision rule:

- add to an existing semantic area when concern + owner already match,
- create a new semantic helper area only when the concern is real, clearly owned, and likely to grow,
- do not create a new folder only because two files seem vaguely similar.

A new area should represent a stable semantic boundary, not a temporary grouping shortcut.

## 6) Anti-patterns

Avoid the following:

- generic `shared/` helper folders when a semantic owner already exists,
- moving slice-specific behavior into suite-core only because multiple files reference it,
- broad helper frameworks introduced before concrete ownership and growth are proven.

## 7) Small current examples

Current mapping examples:

- report output, usage flow, and target parsing helpers -> `calculogic-validator/src/core/cli/`
- naming CLI parsing, usage, runner/report building helpers -> `calculogic-validator/naming/src/cli/`
- naming health assertions and naming health host wrapper -> `calculogic-validator/naming/src/health/`

These examples illustrate current ownership and reuse conventions only.
