const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'server', 'routes');
const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.js')) {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    if (content.includes('req.user._id')) {
      content = content.replace(/req\.user\._id/g, 'req.user.userId');
      fs.writeFileSync(path.join(dir, file), content);
      console.log('Fixed', file);
    }
  }
});
