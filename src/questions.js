module.exports = [
  {
    type: 'confirm',
    name: 'useLocalPackage',
    message: 'Would you like to use local packages?',
    initial: true
  },
  {
    type: 'select',
    name: 'appType',
    message: 'What type of app would you like to create?',
    choices: [
      { title: 'App Router', value: 'app-router' },
      { title: 'App Router w/Proxy', value: 'app-router-proxy' },
      { title: 'App Router w/TypeScript', value: 'app-router-ts' },
      { title: 'App Router w/TypeScript w/Proxy', value: 'app-router-ts-proxy' },
      { title: 'Page Router', value: 'page-router' },
      { title: 'Page Router w/Proxy', value: 'page-router-proxy' },
      { title: 'Page Router w/TypeScript', value: 'page-router-ts' },
      { title: 'Page Router w/TypeScript w/Proxy', value: 'page-router-ts-proxy' },
      { title: 'Page Router w/Custom Server using Express', value: 'page-router-express' },
      { title: 'Page Router w/Custom Server using Fastify', value: 'page-router-fastify' },
      { title: 'Page Router w/Custom Server using Express & TypeScript', value: 'page-router-express-ts' },
      { title: 'Page Router w/Custom Server using Fastify & TypeScript', value: 'page-router-fastify-ts' },
      { title: 'API Express', value: 'express' },
      { title: 'API Fastify', value: 'fastify' },
      { title: 'API Express & TypeScript', value: 'express-ts' },
      { title: 'API Fastify & TypeScript', value: 'fastify-ts' },
      { title: 'Run all', value: 'all' }
    ]
  }
];
