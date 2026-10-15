#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const template=fs.readFileSync(path.join(root,'src/launcher-template.html'),'utf8');
const marker='__EXAMPLE_PATH__';
if(template.split(marker).length!==2)throw Error(marker+' must appear exactly once in the launcher template');
for(const file of ['index.html','docs/index.html'])fs.writeFileSync(path.join(root,file),template.replace(marker,'examples/biovista/BioVista_Quiz_Offline.html'));
fs.mkdirSync(path.join(root,'docs/examples/biovista'),{recursive:true});
fs.copyFileSync(path.join(root,'examples/biovista/BioVista_Quiz_Offline.html'),path.join(root,'docs/examples/biovista/BioVista_Quiz_Offline.html'));
console.log('Built the prompt launcher and matching Pages copy. The BioVista example is unchanged.');
