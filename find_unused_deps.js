const fs = require('fs');
const { execSync } = require('child_process');

function checkDeps(dir) {
  console.log(`\n--- Checking ${dir} dependencies ---`);
  const pkgPath = `./${dir}/package.json`;
  if (!fs.existsSync(pkgPath)) return;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = Object.keys(pkg.dependencies || {});
  
  const unused = [];
  for (const dep of deps) {
    try {
      // Find all files in src folder (or server folder) containing the dependency name
      // We look for basic patterns: import ... from 'dep' or require('dep')
      const targetDir = dir === 'client' ? './client/src' : './server';
      execSync(`grep -rnE "(import|require).*['\\\"]${dep}['\\\"]" ${targetDir} || grep -rnE "from ['\\\"]${dep}['\\\"]" ${targetDir}`);
    } catch (e) {
      // grep exits with 1 if no matches found
      unused.push(dep);
    }
  }
  
  if (unused.length > 0) {
    console.log('Unused dependencies:', unused);
  } else {
    console.log('No unused dependencies found.');
  }
}

checkDeps('client');
checkDeps('server');
