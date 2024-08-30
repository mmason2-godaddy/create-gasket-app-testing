export default async function validateFiles(appType) {
  const cwd = '__apps__';
  const dir = getConfigDirectory(appType);
  const { files } = require(path.join(__dirname, '..', dir, `${appType}.json`));
  if (!files) return;
  const promises = files.map(file => access(`${cwd}/${appType}/${file}`));
  console.log('Checking for files:', files);
  try {
    await Promise.all(promises);
  } catch (e) {
    console.error('One or more files are missing:', e);
  }
}
