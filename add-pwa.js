const fs = require('fs');
const path = require('path');

const dir = process.cwd();

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        processDirectory(fullPath);
      }
    } else if (fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const manifestLink = '\n  <link rel="manifest" href="/manifest.json">\n  <meta name="theme-color" content="#c60000">';
      const swScript = `\n  <script>\n    if ('serviceWorker' in navigator) {\n      window.addEventListener('load', () => {\n        navigator.serviceWorker.register('/sw.js').then(reg => console.log('SW registered')).catch(err => console.log('SW registration failed', err));\n      });\n    }\n  </script>\n</body>`;

      let changed = false;

      if (!content.includes('rel="manifest"') && content.includes('</head>')) {
        content = content.replace('</head>', `${manifestLink}\n</head>`);
        changed = true;
      }

      if (!content.includes('serviceWorker.register') && content.includes('</body>')) {
        content = content.replace('</body>', `${swScript}`);
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(dir);
