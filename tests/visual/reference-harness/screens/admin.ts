export interface ScreenDefinition {
  name: string;
  url: string;
  description: string;
  artifactId: string;
  states: string[];
  fixtureMapping?: string;
}

export const ADMIN_SCREENS: ScreenDefinition[] = [
  {
    name: "admin-login",
    url: "http://localhost:3000/admin/login",
    description: "Admin login page",
    artifactId: "9482f706-3071-47ef-a10d-293ec76b9810",
    states: ["default", "error"],
    fixtureMapping: "admin-user",
  },
  {
    name: "admin-dashboard",
    url: "http://localhost:3000/admin",
    description: "Admin dashboard overview",
    artifactId: "1e8c88ce-9966-4c5f-8ec4-ac0bc4ce90d2",
    states: ["default", "loading", "empty"],
    fixtureMapping: "admin-user-with-data",
  },
  {
    name: "admin-farmers",
    url: "http://localhost:3000/admin/farmers",
    description: "Farmers management list",
    artifactId: "80e8634d-4689-4d3e-96ed-6ce38f681e25",
    states: ["default", "filtered", "empty"],
    fixtureMapping: "farmers-list",
  },
  {
    name: "admin-sponsors",
    url: "http://localhost:3000/admin/sponsors",
    description: "Sponsors management list",
    artifactId: "8c07477b-0027-4c54-88fe-c86bba24472b",
    states: ["default", "empty"],
    fixtureMapping: "sponsors-list",
  },
  {
    name: "admin-applications",
    url: "http://localhost:3000/admin/applications",
    description: "Applications review queue",
    artifactId: "f24453af-9d15-48ee-beda-8e32cfc14985",
    states: ["default", "pending", "approved", "rejected"],
    fixtureMapping: "applications-queue",
  },
  {
    name: "admin-reports",
    url: "http://localhost:3000/admin/reports",
    description: "Reports and analytics",
    artifactId: "8c07477b-0027-4c54-88fe-c86bba24472b",
    states: ["default", "loading"],
    fixtureMapping: "reports-data",
  },
  {
    name: "admin-settings",
    url: "http://localhost:3000/admin/settings",
    description: "System settings",
    artifactId: "20301eef-f947-40de-b124-763f338e3c60",
    states: ["default", "roles", "accounts", "constants", "notifications", "general"],
    fixtureMapping: "admin-user",
  },
  {
    name: "admin-review",
    url: "http://localhost:3000/admin/applications",
    description: "Review and evidence queue",
    artifactId: "1e8c88ce-9966-4c5f-8ec4-ac0bc4ce90d2",
    states: ["default", "loading", "empty"],
    fixtureMapping: "admin-user-with-data",
  },
  {
    name: "admin-import",
    url: "http://localhost:3000/admin/import",
    description: "Import data and files",
    artifactId: "f24453af-9d15-48ee-beda-8e32cfc14985",
    states: ["pick", "review"],
    fixtureMapping: "admin-user",
  },
  {
    name: "admin-map",
    url: "http://localhost:3000/admin/map",
    description: "Map and plot visualization",
    artifactId: "f24453af-9d15-48ee-beda-8e32cfc14985",
    states: ["default", "selected"],
    fixtureMapping: "farmers-list",
  },
  {
    name: "admin-chat",
    url: "http://localhost:3000/admin/chat",
    description: "Staff chat and communication",
    artifactId: "f24453af-9d15-48ee-beda-8e32cfc14985",
    states: ["bot-answering", "staff-taking-over"],
    fixtureMapping: "admin-user",
  },
  {
    name: "admin-charts",
    url: "http://localhost:3000/admin/charts",
    description: "Charts and data visualization",
    artifactId: "80e8634d-4689-4d3e-96ed-6ce38f681e25",
    states: ["default", "loading", "empty"],
    fixtureMapping: "admin-user-with-data",
  },
];
