const fs = require('fs');
const path = require('path');

const getAllFiles = (dirPath, arrayOfFiles) => {
  const absolutePath = path.resolve(__dirname, dirPath);
  if (!fs.existsSync(absolutePath)) return arrayOfFiles || [];
  const files = fs.readdirSync(absolutePath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    if (fs.statSync(path.join(absolutePath, file)).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(path.join(absolutePath, file));
    }
  });

  return arrayOfFiles;
};

const allClientFiles = getAllFiles('client/src');
const allServerFiles = getAllFiles('server');
const allCodeFiles = allClientFiles.concat(allServerFiles);

const unusedFiles = [];

// A simple way to check if a file name (without extension) appears in any other code file
const checkUnused = (type, dir, ext) => {
  const absolutePath = path.resolve(__dirname, dir);
  if (!fs.existsSync(absolutePath)) return;
  const files = getAllFiles(dir).filter(f => f.endsWith(ext));
  
  files.forEach(file => {
    const filename = path.basename(file, ext);
    if (filename === 'index' || filename === 'App' || filename === 'main') return; // ignore entry points
    
    // Check if the file is empty or only contains comments/disabled messages
    const fileContent = fs.readFileSync(file, 'utf8').trim();
    if (fileContent === '' || fileContent.includes('completely disabled and removed')) {
      unusedFiles.push(`Unused/Empty ${type}: ${file}`);
      return;
    }

    let isUsed = false;
    // Check all files
    for (let i = 0; i < allCodeFiles.length; i++) {
      const codeFile = allCodeFiles[i];
      if (codeFile !== file && codeFile.match(/\.(js|jsx|ts|tsx)$/)) {
        const content = fs.readFileSync(codeFile, 'utf8');
        if (content.includes(filename)) {
          isUsed = true;
          break;
        }
      }
    }
    
    if (!isUsed) {
      unusedFiles.push(`Unused ${type}: ${file}`);
    }
  });
};

checkUnused('Component', 'client/src/components', '.jsx');
checkUnused('Page', 'client/src/pages', '.jsx');
checkUnused('Model', 'server/models', '.js');
checkUnused('Controller', 'server/controllers', '.js');
checkUnused('Route', 'server/routes', '.js');
checkUnused('Service', 'server/services', '.js');

console.log(JSON.stringify(unusedFiles, null, 2));
