#!/usr/bin/env node
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const { writeFile } = require('fs').promises;
const { spawn, execSync, exec } = require('child_process');
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
      console.log(data.toString());
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

// TODO - needs a little work
// Only handles next server
// Custom server is another node process :/
async function runLocal(appType) {
  return new Promise((resolve, reject) => {
    let errors = [];
    let stderr = '';
    let port = '';

    function killProcess(port) {
      setTimeout(() => {
        const lsof = execSync(`lsof -Fp -sTCP:LISTEN -i:${port}`).toString();
        const pid = lsof.split('\n')[0].replace('p', '');
        process.kill(pid);
        resolve();
      }, 500);
    }

    const cmd = spawn('npm', ['run', 'local'], {
      cwd: `__apps__/${appType}`
    });

    cmd.stdout.on('data', async function (data) {
      const std = data.toString();
      console.log(std);
      if (std.includes('- Local:        http://localhost:')) {
        const host = std.match(/http:\/\/localhost:[0-9].+/)[0];
        port = host.split(':')[2];
        console.log('host', host);
        await fetch(host);
      }

      if (std.includes('GET / 200 in')) {
        killProcess(port);
      }
    });

    cmd.stderr.on('data', function (data) {
      stderr += data.toString();
      console.error(data.toString());
      if (!stderr.includes('error')) return;
      errors.push(stderr);
      // killProcess(port);
    });

    cmd.on('exit', async function (code) {
      console.log('child process exited with code ' + code.toString());
      const report = require('../report.local.json');
      if (errors.length) {
        report[appType] = {
          errors
        };
      } else {
        report[appType] = {
          success: true
        };
      }

      await writeFile('./report.local.json', JSON.stringify(report, null, 2), 'utf8');
      resolve();
    });
  });
} // TODO

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
      if (process.env.RUN_LOCAL) await runLocal(type);
    }
  } else {
    await runCreate(useLocalPackage, appType);
    if (process.env.BUILD_APPS) await runBuild(appType);
    if (process.env.RUN_LOCAL) await runLocal(appType);
  }
})();
