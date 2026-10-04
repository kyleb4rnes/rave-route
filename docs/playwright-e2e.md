# Browser user-flow tests

Rave Route uses Playwright to cover its main browser journeys. The suite starts the Angular app automatically and uses a clean browser profile for every test.

Run the full suite with:

```powershell
npm run e2e
```

For an interactive debugging session, use `npm run e2e:ui`. Test reports and failure artefacts are ignored by Git.

The tests cover Home, catalogue Browse and Add, Custom festival, Festival Details, Edit, Budget, Line-up, Settings, and Help. Festival-specific routes are populated with a controlled local festival record, keeping the journeys independent of a network connection or changing catalogue data.
