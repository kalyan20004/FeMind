const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.venv') && !file.includes('.git') && !file.includes('dist')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.match(/\.(js|jsx|html|md|py|json)$/)) {
        results.push(file);
      }
    }
  });
  return results;
}

const dirs = ['.', 'C:/Users/HP/.gemini/antigravity/brain/0bfa2ab5-6a4c-4001-82ac-24e5b751dc1c'];

dirs.forEach(d => {
  try {
    const files = walk(d);
    files.forEach(f => {
      let content = fs.readFileSync(f, 'utf8');
      if (content.includes('FeMind')) {
        content = content.replace(/FeMind/g, 'FeMind');
        fs.writeFileSync(f, content);
        console.log('Replaced in ' + f);
      }
    });
  } catch (e) {
    console.log("Error walking", d, e.message);
  }
});
