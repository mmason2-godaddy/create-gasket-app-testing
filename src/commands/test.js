import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export async function runTest(appType) {
  console.log('Running test for', appType);
  return new Promise((resolve, reject) => {
    let errors = [];
    let stderr = '';

    const cmd = spawn('npm', ['run', 'test'], {
      cwd: `__apps__/${appType}`
    });

    cmd.stdout.on('data', function (data) {
      const dataStr = data.toString();
      if (dataStr.includes('Found lockfile missing swc dependencies, patching')) return;
      if (dataStr.includes('console.error')) return;
      if (dataStr.includes('Failed to fetch registry info for @next/swc-linux-arm64-musl')) return;
      console.log(dataStr);
    });

    cmd.stderr.on('data', async function (data) {
      stderr += data.toString();
      console.log(data.toString());
      if (!stderr.includes('FAIL test/')) return;
      errors.push(stderr);
    });

    cmd.on('exit', async function (code) {
      console.log('child process exited with code ' + code.toString());
      const report = require('../../report.test.json');
      if (errors.length) {
        report[appType] = {
          errors
        };
      } else {
        report[appType] = {
          success: true
        };
      }

      await writeFile('./report.test.json', JSON.stringify(report, null, 2), 'utf8');
      resolve();
    });
  });
}
