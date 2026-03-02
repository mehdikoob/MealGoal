const path = require('path');
const vitePath = path.join(__dirname, 'frontend', 'node_modules', 'vite', 'bin', 'vite.js');
process.chdir(path.join(__dirname, 'frontend'));
require(vitePath);
