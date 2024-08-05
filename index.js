#!/usr/bin/env node
const dotenv = require('dotenv');
dotenv.config();
const { mkdir, access } = require('fs').promises;
const { spawn } = require('child_process');
const prompts = require('prompts');

const questions = [
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

function getConfigDirectory(appType) {
  return appType.includes('router') ? 'nextjs' : 'api';
}

function getConfigFile(appType) {
  const dir = getConfigDirectory(appType);
  const configPath = `./${dir}/${appType}.json`;
  const config = require(configPath);
  const globalConfig = require('./global.json');
  return JSON.stringify({ ...globalConfig, ...config });
}

function getPresetFlag(useLocalPackage) {
  return useLocalPackage ? '--preset-path' : '--presets';
}

function getPreset(appType, useLocalPackage) {
  const isNextJs = appType.includes('router');

  if (useLocalPackage) {
    if (
      !process.env.NEXTJS_PRESET_PATH ||
      !process.env.API_PRESET_PATH
    ) {
      throw new Error('You must set the NEXTJS_PRESET_PATH and API_PRESET_PATH environment variables to use local packages');
    }

    return isNextJs ?
      `${process.env.NEXTJS_PRESET_PATH}` :
      `${process.env.API_PRESET_PATH}`;
  }

  return isNextJs ?
    `@gasket/preset-nextjs@next` :
    `@gasket/preset-api@next`;
}

async function createAppsDir() {
  try {
    await mkdir('__apps__');
  } catch (e) {
    if (e.code !== 'EEXIST') {
      // silent
    }
  }
}

async function validateFiles(appType) {
  const cwd = '__apps__';
  const dir = getConfigDirectory(appType);
  const { files } = require(`./${dir}/${appType}.json`);
  if (!files) return;
  const promises = files.map(file => access(`${cwd}/${appType}/${file}`));
  console.log('Checking for files:', files);
  try {
    await Promise.all(promises);
  } catch (e) {
    console.error('One or more files are missing:', e);
  }
}

async function runCreate(useLocalPackage, appType) {
  return new Promise((resolve, reject) => {
    const cmd = spawn('create-gasket-app', [
      appType,
      '--config',
      getConfigFile(appType),
      getPresetFlag(useLocalPackage),
      getPreset(appType, useLocalPackage)
    ], {
      cwd: '__apps__'
    });

    cmd.stdout.on('data', function (data) {
      console.log(data.toString());
    });

    cmd.stderr.on('data', function (data) {
      console.log(data.toString());
    });

    cmd.on('exit', function (code) {
      console.log('child process exited with code ' + code.toString());
      resolve();
    });
  });
}

async function buildApp(appType) {
  return new Promise((resolve, reject) => {
    const cmd = spawn('npm', ['run', 'build'], {
      cwd: `__apps__/${appType}`
    });

    cmd.stdout.on('data', function (data) {
      console.log(data.toString());
    });

    cmd.stderr.on('data', function (data) {
      console.log(data.toString());
    });

    cmd.on('exit', function (code) {
      console.log('child process exited with code ' + code.toString());
      resolve();
    });
  });
}

(async () => {
  await createAppsDir();
  const { useLocalPackage, appType } = await prompts(questions);

  if (appType === 'all') {
    const appTypes = questions[1].choices.map(choice => choice.value).filter(type => type !== 'all');

    for (const type of appTypes) {
      await runCreate(useLocalPackage, type);
    }

    return;
  }

  await runCreate(useLocalPackage, appType);
  if (process.env.BUILD_APPS) await buildApp(appType);
  await validateFiles(appType);
})();
