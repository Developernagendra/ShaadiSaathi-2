const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.js')) {
        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

function findUnused(dir) {
  console.log(`\n--- Checking unused files in server/${dir} ---`);
  const files = getAllFiles(`./server/${dir}`, []);
  const unused = [];

  for (const file of files) {
    const basename = path.basename(file, path.extname(file));
    if (basename === 'index' || basename === 'app' || basename === 'server') continue;

    try {
      const cmd = `grep -rnE "(require|import).*['\\\"](.*\\/)?${basename}['\\\"]" ./server`;
      const output = execSync(cmd, { stdio: 'pipe' }).toString();
      const lines = output.split('\n').filter(l => l.trim() !== '');
      const externalRefs = lines.filter(l => !l.includes(file.replace(__dirname + '/', '')));
      
      if (externalRefs.length === 0) {
        unused.push(file.replace(__dirname + '/', ''));
      }
    } catch (e) {
      unused.push(file.replace(__dirname + '/', ''));
    }
  }

  console.log('Unused Files:');
  console.log(unused.join('\n') || 'None');
}

findUnused('models');
findUnused('controllers');
findUnused('routes');
