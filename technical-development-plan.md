# Rave Route — Technical Development Plan

## Purpose

This plan breaks Rave Route into small, understandable development stages.

The goal is to use AI to accelerate development without allowing it to generate a large codebase that becomes difficult to understand.

Each stage should:

- Have one clear objective.
- Introduce only a small number of new concepts.
- Leave the application in a working state.
- Include a manual review of the generated code.
- End with a Git commit.
- Avoid starting the next stage until the current stage is understood.

The guiding development rule is:

> Build one understandable feature at a time.

---

# Development approach

Use:

- Angular
- Ionic Angular
- Capacitor
- TypeScript
- SCSS
- Angular signals
- Signal-based component inputs and outputs where appropriate
- Typed reactive forms
- Jest
- Local device storage for the MVP

Do not introduce a backend, authentication or cloud hosting during the first MVP.

---

# Rules for using AI

For every stage, ask AI to:

1. Explain the intended change before writing code.
2. List the files that will be created or changed.
3. Implement only the requested stage.
4. Avoid adding future functionality.
5. Explain every important file after implementation.
6. Highlight unfamiliar Angular or Ionic concepts.
7. Add tests where appropriate.
8. Provide commands to run and verify the work.
9. Stop after the stage is complete.

Do not ask AI to:

- Build the whole MVP at once.
- Generate architecture for features not yet needed.
- Add abstractions without explaining their purpose.
- Install unnecessary dependencies.
- Refactor working code unless there is a clear reason.
- Add a backend prematurely.

After every stage:

- Run the application.
- Read every changed file.
- Explain the code back in your own words.
- Test the feature manually.
- Run the tests.
- Commit the changes.

---

# Stage 0 — Project preparation

## Objective

Create a clean workspace and define how the project will be managed.

## Tasks

- Create a Git repository.
- Add a README.
- Add an MVP specification.
- Add the design philosophy.
- Add this technical plan.
- Decide on naming conventions.
- Create a simple branch strategy.

Recommended branches:

- `main`
- Short-lived feature branches such as `feature/home-shell`

## Learn

- Basic Git workflow
- Commit history
- Feature branches
- Pull requests, even when working alone

## Completion criteria

- Repository exists.
- Planning documents are committed.
- The project scope is written down.
- No application code exists yet.

## Suggested commit

`docs: add rave route product and technical plans`

---

# Stage 1 — Blank Angular and Ionic application

## Objective

Create the blank application and confirm it runs.

## Tasks

- Create a new Ionic Angular project.
- Use Angular standalone components.
- Enable Angular routing.
- Add SCSS.
- Run the app locally.
- Remove unnecessary starter content.
- Confirm the blank application loads.

Do not add branding or festival functionality yet.

## Learn

Understand:

- `package.json`
- Angular workspace configuration
- The application entry point
- Root component
- Routing configuration
- Ionic application shell
- Development server commands

## Questions to answer before moving on

- What starts the Angular application?
- What does the root component do?
- Where are routes registered?
- What does Ionic add on top of Angular?
- What happens when `npm start` or `ionic serve` runs?

## Completion criteria

- The application starts without errors.
- A blank page or simple placeholder is visible.
- You understand the main generated files.
- The initial test suite passes.

## Suggested commit

`chore: initialise ionic angular application`

---

# Stage 2 — Mobile application shell

## Objective

Create the basic visual structure of the application.

## Tasks

Build:

- Safe mobile page layout
- App header area
- Main content area
- Basic responsive spacing
- Placeholder home page
- App-wide typography

Do not add real festival cards yet.

Display temporary text such as:

> Rave Route  
> Your next adventure starts here.

## Learn

Understand:

- Ionic page structure
- `ion-app`
- `ion-content`
- Mobile safe areas
- Component styles
- Global styles versus component styles
- Responsive units

## Completion criteria

- The home page looks correct on mobile dimensions.
- Content does not touch screen edges.
- The layout scrolls correctly.
- No festival functionality exists yet.

## Suggested commit

`feat: add mobile application shell`

---

# Stage 3 — Theme and brand foundation

## Objective

Introduce the first Rave Route visual identity.

## Tasks

Add:

- Warm red primary colour
- Orange accent
- Cream background
- Dark text colour
- Shared spacing values
- Shared border radius values
- Shared shadow values
- Basic button styles
- Placeholder RR logo

Use CSS variables so themes can be changed later.

Example categories:

```scss
--rr-primary
--rr-accent
--rr-background
--rr-surface
--rr-text
--rr-text-muted
--rr-radius-card
--rr-spacing-page
```

Do not scatter raw colour values across components.

## Learn

Understand:

- CSS custom properties
- Ionic theme variables
- Global design tokens
- Why reusable values improve maintainability

## Completion criteria

- The app has a consistent warm red theme.
- Theme values are defined centrally.
- The home page uses the shared design tokens.
- The logo area is visible.

## Suggested commit

`feat: add rave route theme and branding foundation`

---

# Stage 4 — Static home page UI

## Objective

Create the complete home page layout using fake data.

## Tasks

Create:

- Rave Route logo at the top
- Emphasised upcoming festival card
- Collapsed future festival cards
- Add Festival button
- Empty state design

Use temporary hard-coded festival data.

The upcoming festival card should show:

- Picture placeholder
- Title
- Location
- Date
- Countdown placeholder
- Transport status

Collapsed cards should initially show:

- Festival title
- Chevron icon

Do not create a data service or storage yet.

## Learn

Understand:

- Angular components
- Component inputs
- Template binding
- Conditional rendering
- Reusable UI components
- Ionic cards and buttons

## Suggested components

- `HomePage`
- `UpcomingFestivalCard`
- `CollapsedFestivalCard`
- `EmptyFestivalState`
- `RaveRouteLogo`

## Completion criteria

- Home page matches the intended layout.
- Components use hard-coded inputs.
- The emphasised card and collapsed cards are visually distinct.
- The page works at mobile screen sizes.

## Suggested commit

`feat: build static festival home page`

---

# Stage 5 — Festival domain model

## Objective

Define what a festival is in the application.

## Tasks

Create the Festival interface.

```typescript
export interface Festival {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  location: string;
  transportArranged: boolean;
  createdAt: string;
  updatedAt: string;
}
```

Create plain TypeScript utilities for:

- Sorting festivals by start date
- Identifying the next festival
- Separating upcoming and past festivals
- Calculating days remaining

Do not connect these utilities to the UI yet.

## Learn

Understand:

- TypeScript interfaces
- Pure functions
- Date handling
- Why business logic should be separated from UI components

## Tests

Add unit tests for:

- Festival sorting
- Next festival selection
- Countdown calculation
- Past festival filtering

## Completion criteria

- The Festival model exists.
- Business rules are represented by pure functions.
- Tests cover the main date scenarios.
- UI is still using fake data.

## Suggested commit

`feat: add festival domain model and date utilities`

---

# Stage 6 — Festival state

## Objective

Replace hard-coded page data with application state.

## Tasks

Create a festival store or state service using Angular signals.

It should provide:

- All festivals
- Next festival
- Later upcoming festivals
- Past festivals

Initially seed the state with temporary example data.

Do not persist the data yet.

## Learn

Understand:

- Angular signals
- Writable signals
- Computed signals
- Read-only state
- How the home page reacts when state changes

## Completion criteria

- Home page no longer owns hard-coded festival data.
- Festival cards are driven by signal state.
- Changing the sample state updates the UI automatically.
- Domain logic remains outside the components.

## Suggested commit

`feat: add signal-based festival state`

---

# Stage 7 — Add Festival form UI

## Objective

Build the form without saving data yet.

## Tasks

Create a typed reactive form containing:

- Title
- Start date
- End date
- Picture placeholder or URL
- Location
- Transport arranged toggle

Add:

- Required validation
- End date validation
- Save button
- Cancel button
- Validation messages

Build the form as a reusable component.

Do not connect it to storage yet.

## Learn

Understand:

- Typed reactive forms
- Form controls
- Form groups
- Validation
- Submit handling
- Ionic form components
- Date inputs

## Completion criteria

- Form renders correctly.
- Invalid submissions are blocked.
- Valid submissions produce a Festival-shaped form value.
- No data is saved yet.

## Suggested commit

`feat: add festival form component`

---

# Stage 8 — Test Add Festival interactions

## Objective

Test the two possible festival creation experiences.

## Variant A

Show the form inline beneath the festival list.

## Variant B

Open the form in an Ionic modal.

## Tasks

- Implement both variants.
- Add a temporary configuration value to switch between them.
- Test both on a mobile-sized screen.
- Test keyboard behaviour.
- Test scrolling.
- Record which experience feels better.

The modal is likely to be the stronger option, but the decision should be based on testing.

## Learn

Understand:

- Ionic modals
- Parent-child communication
- Component outputs
- Conditional rendering
- Mobile keyboard behaviour

## Completion criteria

- Both experiences work.
- The chosen experience is documented.
- The unused variant is removed or retained only as a documented experiment.
- The form still does not need permanent storage.

## Suggested commits

`experiment: compare inline and modal festival forms`

Followed by:

`feat: adopt modal festival creation flow`

---

# Stage 9 — Create Festival functionality

## Objective

Allow the user to create a festival during the current session.

## Tasks

Connect the form to the festival state.

When a valid festival is submitted:

- Generate an ID.
- Add created and updated timestamps.
- Add the festival to state.
- Close the modal or form.
- Update the home page.
- Sort festivals automatically.
- Display the new next festival where appropriate.

## Learn

Understand:

- State mutation
- Immutable array updates
- Creating IDs
- Form submission flow
- Updating computed signals

## Tests

Test:

- Adding a festival
- Home state updating
- Correct festival ordering
- Modal closing after success

## Completion criteria

- A festival can be created.
- The home page updates immediately.
- Data disappears when the app refreshes; this is expected at this stage.

## Suggested commit

`feat: allow festivals to be created in memory`

---

# Stage 10 — Local persistence

## Objective

Keep festival data after the app closes or refreshes.

## Tasks

Create a repository interface:

```typescript
export interface FestivalRepository {
  getAll(): Promise<Festival[]>;
  create(festival: Festival): Promise<void>;
  update(festival: Festival): Promise<void>;
  delete(id: string): Promise<void>;
}
```

Create a local storage implementation.

The festival state should use the repository rather than directly reading and writing storage.

Add:

- Initial loading state
- Storage error handling
- Empty state when no festivals exist

## Learn

Understand:

- Repository pattern
- Dependency injection
- Async operations
- Separation between state and storage
- Why the UI should not know how data is persisted

## Completion criteria

- Festivals remain after refresh or restart.
- The state loads festivals on application startup.
- Components do not access storage directly.
- Storage errors do not crash the app.

## Suggested commit

`feat: persist festivals using local storage`

---

# Stage 11 — Expand collapsed festival cards

## Objective

Allow users to inspect later festivals without leaving the home page.

## Tasks

Collapsed cards show:

- Festival title
- Optional short date
- Chevron

When expanded, show:

- Location
- Dates
- Countdown
- Transport status
- View details action

Only one card should be expanded at a time.

## Learn

Understand:

- Local component state
- Selected IDs
- Expand and collapse animations
- Accessible disclosure patterns

## Completion criteria

- Cards expand and collapse.
- Only one is expanded at a time.
- Keyboard and screen-reader states are represented correctly.
- The next festival remains emphasised.

## Suggested commit

`feat: add expandable future festival cards`

---

# Stage 12 — Festival details page

## Objective

Allow a festival to be viewed in full.

## Tasks

Create a route such as:

```text
/festivals/:festivalId
```

Display:

- Festival picture
- Title
- Location
- Start and end dates
- Countdown
- Transport status
- Edit button
- Delete button

Handle invalid festival IDs gracefully.

## Learn

Understand:

- Route parameters
- Page navigation
- Reading state based on an ID
- Not-found states

## Completion criteria

- Tapping a festival opens its details.
- Refreshing the details route still works.
- Missing festivals show an appropriate message.

## Suggested commit

`feat: add festival details page`

---

# Stage 13 — Edit Festival

## Objective

Allow existing festivals to be updated.

## Tasks

Reuse the Festival form.

When editing:

- Populate existing values.
- Save changes through the repository.
- Update `updatedAt`.
- Return to the details page or home page.
- Allow cancellation without saving.

## Learn

Understand:

- Reusing create forms for editing
- Form patching
- Route-based editing
- Update operations

## Tests

Test:

- Existing values populate correctly.
- Saved edits update state and storage.
- Cancelling leaves data unchanged.

## Completion criteria

- Festivals can be edited.
- Changes survive application restart.
- The same form is used for create and edit.

## Suggested commit

`feat: allow festivals to be edited`

---

# Stage 14 — Delete Festival

## Objective

Allow users to remove a festival safely.

## Tasks

- Add delete action.
- Display a confirmation alert.
- Delete from repository and state.
- Return to home page.
- Recalculate the next festival.

## Learn

Understand:

- Confirmation dialogs
- Delete operations
- Navigation after deletion
- Updating derived state

## Completion criteria

- Deletion requires confirmation.
- Cancel does nothing.
- Confirm removes the festival permanently.
- Home page updates correctly.

## Suggested commit

`feat: allow festivals to be deleted`

---

# Stage 15 — Festival images

## Objective

Allow users to add festival imagery.

Begin with the simplest implementation.

## First implementation

Support:

- Image URL
- Default placeholder when no image exists

## Second implementation

Add device image selection through Capacitor.

Do not start with complex image upload or cloud storage.

## Learn

Understand:

- File or camera selection
- Device permissions
- Image previews
- Local file references
- Platform-specific behaviour

## Completion criteria

- A festival can display a custom image.
- Missing images use a polished default.
- Image selection works on a physical device.

## Suggested commit

`feat: add festival image selection`

---

# Stage 16 — Mobile packaging

## Objective

Run Rave Route as an installable mobile application.

## Tasks

- Configure Capacitor.
- Add Android platform.
- Add iOS platform when appropriate.
- Open the project in Android Studio or Xcode.
- Run on an emulator.
- Run on a physical device.
- Check safe areas and status bars.
- Add temporary app icon and splash screen.

## Learn

Understand:

- Web build versus native project
- Capacitor sync
- Native platform folders
- Device debugging
- Platform configuration

## Completion criteria

- Rave Route runs as an installed application.
- Data persists on the device.
- Main flows work on physical hardware.

## Suggested commit

`feat: configure native mobile platforms`

---

# Stage 17 — Accessibility and usability

## Objective

Make the MVP comfortable and inclusive to use.

## Tasks

Review:

- Touch target sizes
- Text contrast
- Form labels
- Error messages
- Screen-reader labels
- Keyboard behaviour
- Reduced-motion preferences
- Loading states
- Empty states
- Confirmation messages

## Completion criteria

- Core flows can be completed clearly.
- Buttons and controls are comfortably sized.
- Form validation is understandable.
- The design does not rely on colour alone.

## Suggested commit

`fix: improve accessibility and mobile usability`

---

# Stage 18 — MVP testing and polish

## Objective

Prepare the application for real use.

## Tasks

Add or complete tests for:

- Festival date utilities
- Festival state
- Create flow
- Edit flow
- Delete flow
- Form validation
- Repository behaviour
- Home page display states

Manually test:

- No festivals
- One festival
- Multiple festivals
- Past festivals
- Same-day festival
- Invalid dates
- Long titles
- Missing images
- Application restart

## Completion criteria

- Main user journeys work reliably.
- Tests pass.
- No major console errors exist.
- The application works on a physical phone.
- README setup instructions are accurate.

## Suggested commit

`test: complete rave route mvp coverage`

---

# Stage 19 — MVP release

## Objective

Create the first complete version of Rave Route.

## Tasks

- Update README.
- Add screenshots.
- Document architecture.
- Record known limitations.
- Create a release checklist.
- Tag the Git repository.
- Produce an Android test build.
- Produce an iOS test build when available.

## Completion criteria

A user can:

1. Open Rave Route.
2. View the logo and home page.
3. Add a festival.
4. Add an image.
5. See the next festival emphasised.
6. See later festivals as collapsed cards.
7. Expand a future festival.
8. View festival details.
9. Edit a festival.
10. Delete a festival.
11. Close and reopen the app without losing data.

## Suggested release tag

`v0.1.0-mvp`

---

# Feature sequence summary

Build in this order:

1. Project setup
2. Blank application
3. Mobile shell
4. Theme and branding
5. Static home UI
6. Festival model
7. Festival signal state
8. Festival form
9. Inline versus modal experiment
10. Create festival
11. Local persistence
12. Expandable cards
13. Festival details
14. Edit festival
15. Delete festival
16. Festival images
17. Capacitor mobile build
18. Accessibility
19. Testing and release

---

# AI prompt template for each stage

Use this template rather than asking AI to build multiple stages at once:

## Context

I am building Rave Route, an Ionic Angular mobile festival planner.

I am deliberately building the application in small stages so I can understand every part of the code.

## Current stage

[Paste one stage from this plan.]

## Instructions

Before changing code:

1. Explain what this stage introduces.
2. Inspect the current project structure.
3. List the files you expect to create or modify.
4. Explain any new Angular, Ionic or TypeScript concepts.

Then implement only this stage.

Do not add functionality from later stages.

After implementation:

1. Summarise each changed file.
2. Explain the runtime flow.
3. Show me how to run and test it.
4. Point out the most important code for me to read.
5. Give me five questions that test whether I understand the changes.
6. Stop and wait before moving to another stage.

Prefer simple and explicit code over clever abstractions.

Do not install a dependency automatically. If one appears necessary, explain why it is needed and ask for approval before installing it.

---

# Personal understanding checklist

Before accepting an AI-generated change, make sure you can answer:

- What problem does this code solve?
- Which component or service owns the behaviour?
- Where does the data come from?
- Where does the data go?
- What causes the UI to update?
- What happens when the operation fails?
- How is the behaviour tested?
- Could I make a small change without asking AI?
- Could I explain the flow to another developer?

If you cannot answer these questions, stop and review the stage before continuing.

---

# Recommended working rhythm

For each stage:

1. Read the stage.
2. Create a feature branch.
3. Ask AI for an explanation and implementation.
4. Review the proposed file changes.
5. Run the code.
6. Read every changed file.
7. Ask questions about unfamiliar code.
8. Make one small manual change yourself.
9. Run tests.
10. Commit.
11. Merge only when you understand the stage.

This keeps AI useful without allowing it to become the only entity that understands the application.
