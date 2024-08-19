const path = require('path');
const { mkdir, access, writeFile } = require('fs').promises;

function getConfigDirectory(appType) {
  return appType.includes('router') ? 'nextjs' : 'api';
}

function getConfigFile(appType) {
  const dir = getConfigDirectory(appType);
  const configPath = path.join(__dirname, '..', dir, `${appType}.json`);
  const config = require(configPath);
  const globalConfig = require('../global.json');
  return JSON.stringify({ ...globalConfig, ...config });
}

function getPresetFlag(useLocalPackage) {
  return useLocalPackage ? '--preset-path' : '--presets';
}

function getPreset(appType, useLocalPackage) {
  const isNextJs = appType.includes('router');

  if (useLocalPackage) {
    if (
      !process.env.OS_PRESET_NEXTJS ||
      !process.env.OS_PRESET_API
    ) {
      throw new Error('You must set the OS_PRESET_NEXTJS and OS_PRESET_API environment variables to use local packages');
    }

    return isNextJs ?
      `${process.env.OS_PRESET_NEXTJS}` :
      `${process.env.OS_PRESET_API}`;
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

async function createReportFile(filename) {
  try {
    await access(filename);
  } catch (e) {
    if (e.code === 'ENOENT') {
      await writeFile(filename, JSON.stringify({}), 'utf8');
    }
  }
}

async function createReportFiles() {
  await createReportFile('report.create.json');
  await createReportFile('report.build.json');
  await createReportFile('report.files.json');
  await createReportFile('report.render.json');
  await createReportFile('report.test.json');
  await createReportFile('report.start.json');
  await createReportFile('report.local.json');
  await createReportFile('report.preview.json');
  await createReportFile('report.lint.json');
}

function printReport(reportFileName) {
  const report = require(`../${reportFileName}`);
  if (!Object.keys(report).length) return;
  const formatted = Object.entries(report).reduce((acc, [key, value]) => {
    acc[key] = {
      status: value.success ? '🟢' : '🔴',
    };
    return acc;
  }, {});

  console.log(reportFileName.split('.')[1].toUpperCase());
  console.log('----------------');
  console.table(formatted);

}

function printReports() {
  printReport('report.create.json');
  printReport('report.build.json');
  printReport('report.files.json');
  printReport('report.render.json');
  printReport('report.test.json');
  printReport('report.local.json');
}

module.exports = {
  getConfigDirectory,
  getConfigFile,
  getPresetFlag,
  getPreset,
  createAppsDir,
  createReportFiles,
  printReports
};
