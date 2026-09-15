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
    name: 'admin-login',
    url: 'http://localhost:3000/admin/login',
    description: 'Admin login page',
    artifactId: '9482f706-3071-47ef-a10d-293ec76b9810',
    states: ['default', 'error'],
    fixtureMapping: 'admin-user',
  },
  {
    name: 'admin-dashboard',
    url: 'http://localhost:3000/admin',
    description: 'Admin dashboard overview',
    artifactId: '1e8c88ce-9966-4c5f-8ec4-ac0bc4ce90d2',
    states: ['default', 'loading', 'empty'],
    fixtureMapping: 'admin-user-with-data',
  },
  {
    name: 'admin-farmers',
    url: 'http://localhost:3000/admin/farmers',
    description: 'Farmers management list',
    artifactId: '8c07477b-472b',
    states: ['default', 'filtered', 'empty'],
    fixtureMapping: 'farmers-list',
  },
  {
    name: 'admin-sponsors',
    url: 'http://localhost:3000/admin/sponsors',
    description: 'Sponsors management list',
    artifactId: '8c07477b-472b',
    states: ['default', 'empty'],
    fixtureMapping: 'sponsors-list',
  },
  {
    name: 'admin-applications',
    url: 'http://localhost:3000/admin/applications',
    description: 'Applications review queue',
    artifactId: 'f24453af-4985',
    states: ['default', 'pending', 'approved', 'rejected'],
    fixtureMapping: 'applications-queue',
  },
  {
    name: 'admin-reports',
    url: 'http://localhost:3000/admin/reports',
    description: 'Reports and analytics',
    artifactId: '8c07477b-472b',
    states: ['default', 'loading'],
    fixtureMapping: 'reports-data',
  },
  {
    name: 'admin-settings',
    url: 'http://localhost:3000/admin/settings',
    description: 'System settings',
    artifactId: '20301eef-3c60',
    states: ['default', 'roles', 'accounts', 'constants', 'notifications', 'general'],
    fixtureMapping: 'admin-user',
  },
];
