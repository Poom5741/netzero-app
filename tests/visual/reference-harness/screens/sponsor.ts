import type { ScreenDefinition } from "./admin";

export const SPONSOR_SCREENS: ScreenDefinition[] = [
  {
    name: "sponsor-login",
    url: "http://localhost:3000/sponsor/login",
    description: "Sponsor login page",
    artifactId: "a350f295-58c9-44bd-9b11-b1f3c64738da",
    states: ["default", "error"],
    fixtureMapping: "sponsor-user",
  },
  {
    name: "sponsor-dashboard",
    url: "http://localhost:3000/sponsor",
    description: "Sponsor dashboard overview",
    artifactId: "7ccc65fc-cc06-41a3-8112-7407b6d435bb",
    states: ["default", "loading", "empty"],
    fixtureMapping: "sponsor-user-with-data",
  },
  {
    name: "sponsor-areas",
    url: "http://localhost:3000/sponsor/areas",
    description: "Sponsor managed areas",
    artifactId: "7ccc65fc-cc06-41a3-8112-7407b6d435bb",
    states: ["default", "empty"],
    fixtureMapping: "sponsor-areas",
  },
  {
    name: "sponsor-reports",
    url: "http://localhost:3000/sponsor/reports",
    description: "Sponsor reports and analytics",
    artifactId: "7ccc65fc-cc06-41a3-8112-7407b6d435bb",
    states: ["default", "loading"],
    fixtureMapping: "sponsor-reports",
  },
];
