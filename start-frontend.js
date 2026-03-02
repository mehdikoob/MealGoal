const path = require('path');
const cracoPath = path.join(__dirname, 'frontend', 'node_modules', '@craco', 'craco', 'dist', 'bin', 'craco.js');
process.chdir(path.join(__dirname, 'frontend'));
process.argv.push('start');
require(cracoPath);
