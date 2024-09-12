#!/usr/bin/env node
import 'dotenv/config';
import prompts from 'prompts';
import questions from './questions.js';
import {
  runCreate,
  runBuild,
  runTest
} from './commands/index.js';
import {
  writeEnvFile,
  createRegistryFile,
  createAppsDir,
  createReportFiles,
  printReports,
} from './utils.js';

async function runStart(appType) { } // TODO

async function runPreview(appType) { } // TODO

async function runLint(appType) { } // TODO

async function runCustomCommands() { } // TODO

async function setup() {
  await createAppsDir();
  await createReportFiles();
  await writeEnvFile();
}

async function handleArgs() {
  const appTypes = questions[1].choices
    .map(choice => choice.value).filter(type =>
      type !== 'all' &&
      type !== 'all-os' &&
      type !== 'all-internal'
    );
  const buildOnly = process.argv[2] === 'build_only';
  const printOnly = process.argv[2] === 'print_reports';
  const testOnly = process.argv[2] === 'test_only';

  if (
    !buildOnly &&
    !printOnly &&
    !testOnly
  ) return false;

  if (printOnly) printReports();

  for (const type of appTypes) {
    if (buildOnly) await runBuild(type);
    if (testOnly) await runTest(type);
  }

  return true;
}

async function main() {
  await setup();
  if (await handleArgs()) return;

  const appTypes = questions[1].choices
    .map(choice => choice.value)
    .filter(type =>
      type !== 'all' &&
      type !== 'all-os' &&
      type !== 'all-internal'
    );
  const { useLocalPackage = true, appType } = await prompts(questions);
  if (!appType) return; // exit if no appType selected
  await createRegistryFile(appType);

  if (appType === 'all') {
    for (const type of appTypes) {
      await runCreate(useLocalPackage, type);
      if (process.env.RUN_BUILD) await runBuild(type);
      if (process.env.RUN_TEST) await runTest(type);
    }
  } else if (appType === 'all-os') {
    const osAppTypes = appTypes
      .filter(type =>
        !type.includes('internal') &&
        !type.includes('webapp') &&
        !type.includes('hcs')
      );
    for (const type of osAppTypes) {
      await runCreate(useLocalPackage, type);
      if (process.env.RUN_BUILD) await runBuild(type);
      if (process.env.RUN_TEST) await runTest(type);
    }

  } else if (appType === 'all-internal') {
    const internalAppTypes = appTypes
      .filter(type =>
        type.includes('internal') ||
        type.includes('webapp') ||
        type.includes('hcs')
      );
    for (const type of internalAppTypes) {
      await runCreate(useLocalPackage, type);
      if (process.env.RUN_BUILD) await runBuild(type);
      if (process.env.RUN_TEST) await runTest(type);
    }
  } else {
    await runCreate(useLocalPackage, appType);
    if (process.env.RUN_BUILD) await runBuild(appType);
    if (process.env.RUN_TEST) await runTest(appType);
  }
};

main();
