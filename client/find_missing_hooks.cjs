const fs = require('fs');
const path = require('path');

const hooks = ['useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'useReducer', 'useContext', 'useLayoutEffect', 'useImperativeHandle'];

let filesFixed = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Simple string-based extraction of imports
  const reactImportMatch = content.match(/import\s+(?:React(?:,\s*)?)?(?:\{([^}]+)\})?\s+from\s+['"]react['"];?/);
  
  let importedHooks = [];
  if (reactImportMatch && reactImportMatch[1]) {
    importedHooks = reactImportMatch[1].split(',').map(s => s.trim()).filter(Boolean);
  }

  // Find used hooks
  const usedHooks = hooks.filter(hook => {
    // Only search after imports to avoid matching the import statements themselves
    let searchArea = content;
    if (reactImportMatch) {
        searchArea = content.substring(content.indexOf(reactImportMatch[0]) + reactImportMatch[0].length);
    }
    const regex = new RegExp(`\\b${hook}\\b`);
    return regex.test(searchArea);
  });

  if (usedHooks.length === 0 && importedHooks.length === 0) return;

  // Let's filter out unused hooks from importedHooks and add used ones
  let newImportedSet = new Set(importedHooks);
  let changed = false;

  // Remove unused
  hooks.forEach(h => {
      if (newImportedSet.has(h) && !usedHooks.includes(h)) {
          newImportedSet.delete(h);
          changed = true;
      }
  });

  // Add used
  usedHooks.forEach(h => {
      if (!newImportedSet.has(h)) {
          newImportedSet.add(h);
          changed = true;
      }
  });

  if (!changed) return;

  // Replace
  if (reactImportMatch) {
      const hasDefaultReact = content.includes('import React') || reactImportMatch[0].includes('import React');
      const newImportStr = `import ${hasDefaultReact ? 'React, ' : ''}{ ${Array.from(newImportedSet).join(', ')} } from 'react';`;
      content = content.replace(reactImportMatch[0], newImportStr);
  } else if (newImportedSet.size > 0) {
      const newImportStr = `import { ${Array.from(newImportedSet).join(', ')} } from 'react';\n`;
      content = newImportStr + content;
  }

  if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      filesFixed++;
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      processFile(filePath);
    }
  });
}

console.log('Starting hooks audit...');
walk('./src');
console.log(`Done. Fixed ${filesFixed} files.`);
