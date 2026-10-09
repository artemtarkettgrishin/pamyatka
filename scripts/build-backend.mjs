import {readFileSync,writeFileSync} from 'node:fs';
const shared=readFileSync('shared/catalog.js','utf8').replace(/^export /gm,'');
writeFileSync('public/google-apps-script.js',['server/Backend.template.gs','server/Workbook.gs','server/Legacy.gs'].map(p=>readFileSync(p,'utf8')).join('\n')+'\n'+shared);
