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
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

function findUnused(dir) {
  console.log(`\n--- Checking unused files in ${dir} ---`);
  const files = getAllFiles(`./client/src/${dir}`, []);
  const unused = [];

  for (const file of files) {
    // Get basename without extension
    const basename = path.basename(file, path.extname(file));
    if (basename === 'index' || basename === 'App' || basename === 'main') continue;

    try {
      // Look for the exact filename being imported, or the basename
      // Using grep across client/src
      const cmd = `grep -rnE "(import|from).*['\\\"](.*\\/)?${basename}['\\\"]" ./client/src`;
      const output = execSync(cmd, { stdio: 'pipe' }).toString();
      
      // If output only contains self reference or no valid import, mark unused
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

findUnused('components');
findUnused('pages');
