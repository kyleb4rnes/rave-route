# Development Workflow

## Guiding rule

> Build one understandable feature at a time.

## Branch strategy

- `main` is the stable integration branch.
- Use a short-lived branch for each stage or focused change.
- Name feature branches `feature/<short-topic>`, for example `feature/home-shell`.
- Use `fix/<short-topic>` for focused corrections and `docs/<short-topic>` for documentation-only work when useful.
- Merge only after the stage runs, tests pass, changed files are reviewed, and the implementation is understood.

Pull requests are encouraged even when working alone because they provide a useful review boundary and decision history.

## Commit conventions

Keep commits focused and use an imperative Conventional Commit-style subject:

- `feat:` for user-facing capability
- `fix:` for a correction
- `test:` for test work
- `docs:` for documentation
- `chore:` for tooling or maintenance
- `experiment:` for a time-boxed comparison

Example: `feat: add mobile application shell`

## Naming conventions

- Use kebab-case for folders and filenames: `festival-details.page.ts`.
- Follow Angular filename suffixes such as `.component.ts`, `.page.ts`, `.service.ts`, and `.spec.ts` when they describe the file accurately.
- Use PascalCase for classes, interfaces, and types: `FestivalRepository`.
- Use camelCase for variables, functions, properties, and signal values: `nextFestival`.
- Use SCREAMING_SNAKE_CASE only for genuine fixed constants.
- Use descriptive names; avoid unexplained abbreviations.
- Prefix Rave Route CSS custom properties with `--rr-`.
- Name tests after observable behaviour rather than implementation details.

These conventions can evolve when a real need appears. Do not add new layers or patterns only for theoretical future use.

## Angular conventions

- Prefer standalone components.
- Use signal-based `input()` and `output()` APIs for component communication when the installed Angular version supports them.
- Add an `output()` only for a real child-to-parent event; do not create placeholder events.
- Keep presentation components focused on rendering inputs and emitting user actions. Keep domain and state logic outside them.

## Stage workflow

For each stage:

1. Read its objective, tasks, exclusions, learning topics, and completion criteria.
2. Create a short-lived branch.
3. Review the proposed files and concepts before implementation.
4. Implement only that stage.
5. Run the application and automated tests.
6. Test the stage manually.
7. Read every changed file and explain the runtime flow.
8. Make a small manual change where useful for learning.
9. Commit with the stage's suggested message or a clearer equivalent.
10. Merge only when the change is understood.

## Definition of stage completion

A stage is complete when its documented completion criteria are met, the change is fully implemented, the developer understands the important code and runtime flow, the project remains runnable, verification results are known, and no future-stage functionality has been pulled forward.
