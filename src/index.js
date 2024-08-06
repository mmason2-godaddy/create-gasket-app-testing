#!/usr/bin/env node
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const { writeFile } = require('fs').promises;
const { spawn } = require('child_process');
const prompts = require('prompts');
const questions = require('./questions');
const {
  getConfigFile,
  getPresetFlag,
  getPreset,
  createAppsDir,
  createReportFiles,
  printReports,
} = require('./utils');


async function runCreate(useLocalPackage, appType) {
  return new Promise((resolve, reject) => {
    let errors = [];
    let stderr = '';

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
      stderr += data.toString();
      console.error(data.toString());
      if (!stderr.includes('error')) return;
      errors.push(stderr);
    });

    cmd.on('exit', async function (code) {
      console.log('child process exited with code ' + code.toString());
      const report = require('../report.create.json');
      if (errors.length) {
        report[appType] = {
          errors
        };
      } else {
        report[appType] = {
          success: true
        };
      }

      await writeFile('./report.create.json', JSON.stringify(report, null, 2), 'utf8');
      resolve();
    });
  });
}

async function runBuild(appType) {
  return new Promise((resolve, reject) => {
    let errors = [];
    let stderr = '';

    const cmd = spawn('npm', ['run', 'build'], {
      cwd: `__apps__/${appType}`
    });

    cmd.stdout.on('data', function (data) {
      // TS errors
      if (data.toString().includes('error')) {
        errors.push(data.toString());
        return;
      }
      console.log(data.toString());
    });

    cmd.stderr.on('data', async function (data) {
      stderr += data.toString();
      if (!stderr.includes('error')) return;
      errors.push(stderr);
    });

    cmd.on('exit', async function (code) {
      console.log('child process exited with code ' + code.toString());
      const report = require('../report.build.json');
      if (errors.length) {
        report[appType] = {
          errors
        };
      } else {
        report[appType] = {
          success: true
        };
      }

      await writeFile('./report.build.json', JSON.stringify(report, null, 2), 'utf8');
      resolve();
    });
  });
}

async function runLocal(appType) {} // TODO

async function runStart(appType) {} // TODO

async function runPreview(appType) {} // TODO

async function runLint(appType) {} // TODO

async function runTest(appType) {} // TODO

async function runCustomCommands() {} // TODO

(async () => {
  await createAppsDir();
  await createReportFiles();
  const appTypes = questions[1].choices.map(choice => choice.value).filter(type => type !== 'all');
  const buildOnly = process.argv[2] === 'build_only';
  const printOnly = process.argv[2] === 'print_reports';

  if (printOnly) {
    printReports();
    return;
  }

  if (buildOnly) {
    for (const type of appTypes) {
      await runBuild(type);
    }

    return
  }

  const { useLocalPackage, appType } = await prompts(questions);
  if (!appType) return; // exit if no appType selected

  if (appType === 'all') {
    for (const type of appTypes) {
      await runCreate(useLocalPackage, type);
      if (process.env.BUILD_APPS) await runBuild(type);
    }
  } else {
    await runCreate(useLocalPackage, appType);
    if (process.env.BUILD_APPS) await runBuild(appType);
  }
})();
