#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
require('./build-example.cjs').buildExample();
const template=fs.readFileSync(path.join(root,'src/launcher-template.html'),'utf8');
const marker='__EXAMPLE_PATH__';
if(template.split(marker).length!==2)throw Error(marker+' must appear exactly once in the launcher template');
for(const file of ['index.html','docs/index.html'])fs.writeFileSync(path.join(root,file),template.replace(marker,'examples/biovista/BioVista_Quiz_Offline.html'));
fs.mkdirSync(path.join(root,'docs/examples/biovista'),{recursive:true});
fs.copyFileSync(path.join(root,'examples/biovista/BioVista_Quiz_Offline.html'),path.join(root,'docs/examples/biovista/BioVista_Quiz_Offline.html'));
for(const file of ['BioVista_Question_Bank.docx','BioVista_Question_Bank.meta.json','BioVista_Showcase.qsk-settings.json','BioVista_Quality_Review.json','BioVista_Quality_Review.html'])if(fs.existsSync(path.join(root,'examples/biovista',file)))fs.copyFileSync(path.join(root,'examples/biovista',file),path.join(root,'docs/examples/biovista',file));
console.log('Built the prompt launcher and current BioVista showcase with its matching Pages copy. The historical BioVista archive is unchanged.');
