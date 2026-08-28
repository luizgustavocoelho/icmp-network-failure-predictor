# Contributing Guide

This document defines the collaboration and version-control practices used in the ICMP Network Failure Predictor project.

The goal is to keep development organized, traceable and easy to review throughout the project.

---

## Main Branch

The `main` branch must contain stable and reviewed versions of the project.

Direct development in `main` should be avoided whenever possible.

New features, fixes and documentation updates should be developed in dedicated branches.

---

## Branch Naming

Use short and descriptive branch names.

Recommended formats:

### Features

- `feature/icmp-monitoring`
- `feature/mobile-dashboard`
- `feature/prediction-api`
- `feature/database-schema`

### Fixes

- `fix/packet-loss-calculation`
- `fix/mobile-navigation`
- `fix/database-connection`

### Documentation

- `docs/requirements`
- `docs/accessibility`
- `docs/network-simulation`

### Tests

- `test/network-classification`
- `test/api-endpoints`

---

## Commit Convention

Commits should be small, descriptive and related to a specific change.

Use the following format:

`type: short description`

Recommended commit types:

- `feat` — new functionality
- `fix` — bug correction
- `docs` — documentation
- `test` — tests
- `refactor` — code improvement without changing behavior
- `chore` — project configuration or maintenance

Examples:

- `chore: initialize project structure`
- `docs: define functional requirements`
- `docs: add accessibility guidelines`
- `feat: implement ICMP monitoring`
- `feat: persist network measurements`
- `feat: add PostgreSQL database connection`
- `feat: create network status classifier`
- `feat: expose prediction API endpoint`
- `feat: create mobile dashboard`
- `fix: handle unreachable network host`
- `test: add network classification scenarios`
- `docs: document Packet Tracer simulation`

---

## Commit Guidelines

Avoid commits such as:

- `update`
- `changes`
- `teste`
- `arrumei`
- `final`
- `final2`
- `agora vai`

A commit message should explain what changed.

Prefer:

`feat: add host registration endpoint`

instead of:

`update backend`

---

## Development Workflow

For each task:

1. Select an issue or project task.
2. Create a branch for the task.
3. Implement the required change.
4. Test the implementation.
5. Update documentation when necessary.
6. Commit the changes.
7. Push the branch to GitHub.
8. Review the changes before merging into `main`.

---

## Pull Requests

When multiple team members are contributing code, changes should preferably reach `main` through a Pull Request.

Before merging:

- verify that the functionality works
- verify that related requirements were respected
- run available tests
- check for unnecessary files
- review the changed code
- update documentation when necessary

A Pull Request should clearly describe:

- what was implemented
- why the change was necessary
- which requirement or issue it addresses
- how the functionality was tested

---

## Issues

GitHub Issues should be used to represent development tasks, bugs and documentation work.

Example:

**Title:** Implement periodic ICMP monitoring

**Requirement:** FR02

**Description:**  
Create the monitoring process responsible for sending ICMP Echo Requests to registered hosts.

**Acceptance Criteria:**

- ICMP request is executed
- response status is captured
- latency is measured when available
- failed requests are handled
- measurement timestamp is recorded

---

## Requirements Traceability

When possible, issues and Pull Requests should reference the related project requirement.

Examples:

- `FR02 — Perform ICMP measurements`
- `FR03 — Record network measurements`
- `FR04 — Classify network condition`
- `FR09 — Recommend activities`

This allows the team to trace:

Requirement → Issue → Implementation → Test → Completed Feature

---

## Code Organization

Each project area has its own directory.

### `apps/mobile/`

React Native + Expo mobile application.

### `services/api/`

Python backend, monitoring services and REST API.

### `database/`

Database schema, migrations and SQL files.

### `network/packet-tracer/`

Cisco Packet Tracer simulation and related documentation.

### `docs/`

Project documentation.

### `assets/`

Screenshots, diagrams and visual resources used in documentation.

---

## Secrets and Credentials

Passwords, API keys, database credentials and other sensitive information must never be committed to GitHub.

Local configuration should use environment variables.

Use a local file named:

`.env`

The `.env` file must remain ignored by Git.

When environment configuration becomes necessary, the repository should contain an example file:

`.env.example`

Example variables:

- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_NAME=network_predictor`
- `DB_USER=postgres`
- `DB_PASSWORD=your_password`

Never place real passwords inside `.env.example`.

---

## Generated and Temporary Files

Do not commit:

- virtual environments
- `node_modules`
- IDE configuration
- temporary files
- logs
- local credentials
- cache files
- generated build directories

The project's `.gitignore` is responsible for excluding these files.

---

## Documentation

Relevant technical decisions should be documented.

Examples include:

- requirements
- architecture
- accessibility
- database structure
- API behavior
- testing strategy
- network simulation
- project terminology

Documentation should evolve together with the implementation.

---

## Definition of Done

A task can be considered complete when:

- the implementation works
- related requirements are satisfied
- relevant tests were performed
- documentation was updated when necessary
- no sensitive information was committed
- code was reviewed before integration into `main`

---

## Team Principle

The repository should allow another developer to understand:

- what the system does
- why a feature exists
- how it was implemented
- how it can be tested
- how it relates to the project requirements

Organization and traceability are part of the project quality.