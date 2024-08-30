import { spawn, execSync } from 'child_process';
import { writeFile } from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Complext ask
// Numberous node processes are spawned and killed in this function
// Handling them all is proving to be a futile task
export async function runLocal(appType) {
  return new Promise((resolve, reject) => {
    let errors = [];
    let stderr = '';
    let port = '';

    function killProcess(port) {
      setTimeout(() => {
        const lsof = execSync(`lsof -Fp -sTCP:LISTEN -i:${port}`).toString();
        const pid = lsof.split('\n')[0].replace('p', '');
        console.log('Server PID:', pid);
        process.kill(pid);

        if (
          appType.includes('express') ||
          appType.includes('fastify') ||
          appType.includes('proxy')
        ) {
          const ps = execSync(`ps -e | grep node`).toString();
          const output = ps.match(/.+nodemon.+/g);
          const secondPid = output[0].split(' ')[0];
          console.log('Nodemon PID:', secondPid);
          process.kill(secondPid);
        }

        if (appType.includes('proxy')) {
          const proxy = execSync(`lsof -Fp -sTCP:LISTEN -i:80`).toString();
          const pid = proxy.split('\n')[0].replace('p', '');
          console.log('Proxy Server PID:', pid);
          process.kill(pid);
        }

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
        const host = std.match(/http:\/\/localhost:[0-9]+/)[0];
        port = host.split(':')[2];
        console.log('host', host);
        await fetch(host);
      } else if (std.includes('Server started at http://localhost:')) {
        const host = std.match(/http:\/\/localhost:[0-9]+/)[0];
        port = host.split(':')[2];
        console.log('host', host);
        await fetch(host);

        if (
          appType === 'express' ||
          appType === 'fastify' ||
          appType === 'express-ts' ||
          appType === 'fastify-ts'
        ) killProcess(port);
      } else if (std.includes('Proxy server started: http://localhost:')) {
        const host = std.match(/http:\/\/localhost:[0-9]+/)[0];
        port = host.split(':')[2];
        console.log('host', host);

        setTimeout(async () => {
          await fetch(host);
        }, 1000);
      } else if (std.includes('GET / 200 in')) {
        killProcess(port);
      }
    });

    cmd.stderr.on('data', function (data) {
      stderr += data.toString();
      console.error(data.toString());
      if (!stderr.includes('error')) return;
      errors.push(stderr);
      killProcess(port);
    });

    cmd.on('exit', async function (code) {
      console.log('child process exited with code ' + code.toString());
      const report = require('../../report.local.json');
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
}
