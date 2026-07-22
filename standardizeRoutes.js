const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'server', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Regex to match the authMiddleware import block
  // e.g. const { protect, authorize } = require('../middleware/authMiddleware');
  const importRegex = /const\s+\{[^}]+\}\s*=\s*require\(['"]\.\.\/middleware\/authMiddleware['"]\);/g;

  const standardizedImport = `const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');`;

  let updated = false;

  if (importRegex.test(content)) {
    content = content.replace(importRegex, standardizedImport);
    updated = true;
  }

  // Replace authorize with restrictTo
  if (content.includes('authorize(')) {
    content = content.replace(/authorize\(/g, 'restrictTo(');
    updated = true;
  }

  // Handle any other legacy imports that might have been authorize directly
  if (content.includes('const authorize =')) {
      // not expected based on grep, but just in case
  }

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
console.log('Done standardizing routes.');
