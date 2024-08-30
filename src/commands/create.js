import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import { createRequire } from 'module';
import {
  getConfigFile,
  getPresetFlag,
  getPreset
} from '../utils.js';
const require = createRequire(import.meta.url);

export async function runCreate(useLocalPackage, appType) {
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
      cwd: '__apps__',
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
      const report = require('../../report.create.json');
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
