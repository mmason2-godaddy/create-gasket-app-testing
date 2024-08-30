import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export async function runBuild(appType) {
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
      const report = require('../../report.build.json');
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
