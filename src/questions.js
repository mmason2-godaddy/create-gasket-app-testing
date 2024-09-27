const OS_APP_TYPES = [
  { title: 'App Router', value: 'app-router' },
  { title: 'App Router w/Proxy', value: 'app-router-proxy' },
  { title: 'App Router w/TypeScript', value: 'app-router-ts' },
  { title: 'App Router w/TypeScript w/Proxy', value: 'app-router-ts-proxy' },
  { title: 'Page Router', value: 'page-router' },
  { title: 'Page Router w/Proxy', value: 'page-router-proxy' },
  { title: 'Page Router w/TypeScript', value: 'page-router-ts' },
  { title: 'Page Router w/TypeScript w/Proxy', value: 'page-router-ts-proxy' },
  { title: 'Page Router w/Custom Server using Express', value: 'page-router-express' },
  // { title: 'Page Router w/Custom Server using Fastify', value: 'page-router-fastify' },
  { title: 'Page Router w/Custom Server using Express & TypeScript', value: 'page-router-express-ts' },
  // { title: 'Page Router w/Custom Server using Fastify & TypeScript', value: 'page-router-fastify-ts' },
  { title: 'API Express', value: 'express' },
  { title: 'API Fastify', value: 'fastify' },
  { title: 'API Express & TypeScript', value: 'express-ts' },
  { title: 'API Fastify & TypeScript', value: 'fastify-ts' }
];

const INTERNAL_APP_TYPES = [
  { title: 'Webapp: App Router', value: 'webapp-app-router' },
  { title: 'Webapp: App Router w/TypeScript', value: 'webapp-app-router-ts' },
  { title: 'Webapp: Page Router', value: 'webapp-page-router' },
  { title: 'Webapp: Page Router w/TypeScript', value: 'webapp-page-router-ts' },
  { title: 'Webapp: Page Router w/Custom Server using Express', value: 'webapp-page-router-express' },
  { title: 'Webapp: Page Router w/Custom Server using Express & TypeScript', value: 'webapp-page-router-express-ts' },
  { title: 'Internal: API w/Express', value: 'internal-express' },
  { title: 'Internal: API w/Express & TypeScript', value: 'internal-express-ts' },
  { title: 'Internal: HCS w/Express', value: 'hcs-express' },
  { title: 'Run all open source apps', value: 'all-os' },
  { title: 'Run all internal apps', value: 'all-internal' }
];

const localPackage = {
  type: 'confirm',
  name: 'useLocalPackage',
  message: 'Would you like to use local packages?',
  initial: true,
};

export default [
  !process.env.USE_LOCAL ? localPackage : {},
  {
    type: 'select',
    name: 'appType',
    message: 'What type of app would you like to create?',
    choices: [
      ...OS_APP_TYPES,
      ...(
        (
          process.env.USE_LOCAL &&
          process.env.INTERNAL_PRESET_WEBAPP &&
          process.env.INTERNAL_PRESET_API &&
          process.env.INTERNAL_PRESET_HCS
        ) ||
        process.env.INTERNAL_REGISTRY
      ) ? INTERNAL_APP_TYPES : [],
      { title: 'Run all', value: 'all' }
    ],
  }
];
