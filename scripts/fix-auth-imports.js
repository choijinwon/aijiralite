// Script to add authOptions import to all API routes
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const apiFiles = glob.sync('pages/api/**/*.js', { ignore: ['**/auth/**'] });

apiFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip if already has authOptions
  if (content.includes('authOptions') || !content.includes('authenticate')) {
    return;
  }
  
  // Check if it uses authenticate
  if (content.includes('await authenticate(req)') || content.includes('authenticate(req)')) {
    // Calculate relative path to auth file
    const depth = file.split('/').length - 3; // pages/api/... = 3 levels
    const relativePath = '../'.repeat(depth) + 'auth/[...nextauth]';
    
    // Add import if not exists
    if (!content.includes("from '../auth/[...nextauth]'") && !content.includes("from '../../auth/[...nextauth]'")) {
      // Find the last import statement
      const importMatch = content.match(/(import[^;]+;[\s]*)+/);
      if (importMatch) {
        const lastImport = importMatch[0];
        const newImport = `import { authOptions } from '${relativePath}';\n`;
        content = content.replace(lastImport, lastImport + newImport);
      }
    }
    
    // Update authenticate calls
    content = content.replace(/await authenticate\(req\)/g, 'await authenticate(req, authOptions)');
    content = content.replace(/authenticate\(req\)/g, 'authenticate(req, authOptions)');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});

console.log('Done!');

