import {readFileSync,writeFileSync} from 'node:fs';
const elements=readFileSync(new URL('../src/elements.js',import.meta.url),'utf8');
const chemistry=readFileSync(new URL('../src/chemistry.js',import.meta.url),'utf8');
writeFileSync(new URL('../docs/chemistry.js',import.meta.url),`(function(){const elementsModule={exports:{}};(function(module){${elements}\n})(elementsModule);const chemistryModule={exports:{}};(function(module,require){${chemistry}\n})(chemistryModule,()=>elementsModule.exports);window.Chemistry=chemistryModule.exports;})();\n`);
