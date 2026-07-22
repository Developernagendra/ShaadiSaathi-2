const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = getAllFiles(srcDir);

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Fix 1: w-[800px] backgrounds/blur elements to be safe on mobile
  // Example: w-[800px] -> w-72 md:w-[800px] or w-full max-w-[800px]
  // Usually these are absolute backgrounds
  const blurRegex = /w-\[([0-9]{3,})px\](.*?bg-.*?(blur|gradient|rounded-full))/g;
  if (blurRegex.test(content)) {
    content = content.replace(/w-\[([0-9]{3,})px\](.*?bg-.*?(blur|gradient|rounded-full))/g, (match, width, rest) => {
      // If it already has md:w-[...] or max-w, skip
      if (content.includes(`md:w-[${width}px]`)) return match;
      // Change to w-72 md:w-[widthpx]
      return `w-72 md:w-[${width}px]${rest}`;
    });
    changed = true;
  }

  // Fix 2: min-w-[XXXpx] that causes overflows
  const minWidthRegex = /min-w-\[([0-9]{3,})px\]/g;
  if (minWidthRegex.test(content)) {
    content = content.replace(/min-w-\[([0-9]{3,})px\]/g, (match, width) => {
      if (parseInt(width) > 300) {
        // e.g. min-w-[400px] -> w-full sm:min-w-[400px]
        if (!content.includes(`sm:min-w-[${width}px]`)) {
           return `w-full sm:min-w-[${width}px]`;
        }
      }
      return match;
    });
    changed = true;
  }

  // Fix 3: Tables overflow
  if (content.includes('<table') && !content.includes('overflow-x-auto') && !filePath.includes('DashboardLayout')) {
    // If table isn't wrapped in overflow-x-auto
    // Just inject the class 'w-full overflow-x-auto block md:table' into the table itself, or better, wrap it.
    // It's safer to just add 'block overflow-x-auto' to the table class string.
    content = content.replace(/<table([^>]*)className="([^"]*)"/g, (match, p1, classes) => {
      if (!classes.includes('block') && !classes.includes('overflow-x-auto')) {
        return `<table${p1}className="${classes} block overflow-x-auto w-full whitespace-nowrap md:whitespace-normal md:table"`;
      }
      return match;
    });
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
});
console.log('Responsiveness fixes complete.');
