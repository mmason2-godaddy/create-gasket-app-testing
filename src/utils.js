import path from 'path';
import { mkdir, access, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function isInternal(appType) {
  return appType.includes('webapp') ||
    appType.includes('internal') ||
    appType.includes('hcs');
}

export function getConfigDirectory(appType) {
  const parentDir = isInternal(appType) ? 'internal' : 'open-source';
  return appType.includes('router') ? `${parentDir}/nextjs` : `${parentDir}/api`;
}

export function getConfigFile(appType) {
  const dir = getConfigDirectory(appType);
  const configPath = path.join(__dirname, '..', dir, `${appType}.json`);
  const config = require(configPath);
  const globalConfig = require('../global.json');
  return JSON.stringify({ ...globalConfig, ...config });
}

export function getPresetFlag(useLocalPackage) {
  return useLocalPackage ? '--preset-path' : '--presets';
}

function getInternalPreset(appType, useLocalPackage) {
  const isNextJs = appType.includes('webapp');
  const isApi = appType.includes('internal');
  const isHcs = appType.includes('hcs');

  if (isNextJs) return process.env.INTERNAL_PRESET_WEBAPP;
  if (isApi) return process.env.INTERNAL_PRESET_API;
  if (isHcs) return process.env.INTERNAL_PRESET_HCS;
  throw new Error('Internal remote presets are not yet supported.');
}

export async function createRegistryFile(appType) {
  if (isInternal(appType)) {
    try {
      await access('./.npmrc');
    } catch {
      await writeFile('./.npmrc', `registry=${process.env.INTERNAL_REGISTRY}`, 'utf8');
    }
  }
}

export function getPreset(appType, useLocalPackage) {
  if (isInternal(appType)) {
    return getInternalPreset(appType, useLocalPackage);
  }

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

export async function createAppsDir() {
  try {
    await mkdir('__apps__');
  } catch (e) {
    if (e.code !== 'EEXIST') {
      // silent
    }
  }
}

export async function createReportFile(filename) {
  try {
    await access(filename);
  } catch (e) {
    if (e.code === 'ENOENT') {
      await writeFile(filename, JSON.stringify({}), 'utf8');
    }
  }
}

export async function createReportFiles() {
  await createReportFile('report.create.json');
  await createReportFile('report.build.json');
  await createReportFile('report.test.json');
  // await createReportFile('report.files.json');
  // await createReportFile('report.render.json');
  // await createReportFile('report.start.json');
  // await createReportFile('report.local.json');
  // await createReportFile('report.preview.json');
  // await createReportFile('report.lint.json');
}

export function printReport(reportFileName) {
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

export function printReports() {
  printReport('report.create.json');
  printReport('report.build.json');
  printReport('report.test.json');
  // printReport('report.files.json');
  // printReport('report.render.json');
  // printReport('report.local.json');

  const apps = fs.readdirSync('__apps__');
  console.log(`Total apps: ${apps.length}`);
}

export async function writeEnvFile() {
  try {
    await access('.env');
  } catch (e) {
    if (e.code === 'ENOENT') {
      const contents = `
# OS_PRESET_NEXTJS=/<local-path-to>/packages/gasket-preset-nextjs
# OS_PRESET_API=/<local-path-to>/packages/gasket-preset-api
# Run build after create
# RUN_BUILD=1
# Skip local package prompt and default to local packages
# USE_LOCAL=1

# INTERNAL_PRESET_WEBAPP=/<local-path-to>/packages/gasket-preset-webapp
# INTERNAL_PRESET_API=/<local-path-to>/packages/gasket-preset-api
# INTERNAL_PRESET_HCS=/<local-path-to>packages/gasket-preset-hcs
# INTERNAL_REGISTRY=https://some-registry.com`;
      await writeFile('.env', contents, 'utf8');
    }
  }
}
