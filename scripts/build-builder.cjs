const fs=require('node:fs'),path=require('node:path');
const {runtime,root}=require('./runtime.cjs');
const config=JSON.parse(fs.readFileSync(path.join(root,'quiz.config.json'),'utf8'));
const kit=runtime(config);
for(const a of Object.values(config.assets||{}))if(a.file){a.data=kit.assetFiles[a.file];delete a.file;}
kit.assetFiles={};
const safe=x=>JSON.stringify(x).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const read=file=>fs.readFileSync(path.join(root,'src',file),'utf8');
const components={__BUILDER_CSS__:read('builder.css'),__DEFAULT_CONFIG__:safe(config),__BUILDER_RUNTIME__:safe(kit),__PROFILE_SCRIPT__:read('profile.js'),__COMPILER_SCRIPT__:read('compiler.js'),__BUILDER_MODEL__:read('builder-model.js'),__BUILDER_UI__:read('builder-ui.js')};
let html=read('builder-template.html');
for(const [marker,value]of Object.entries(components)){if(html.split(marker).length!==2)throw Error(marker+' must appear exactly once in the builder template');html=html.replace(marker,()=>marker.endsWith('_SCRIPT__')||marker==='__BUILDER_MODEL__'||marker==='__BUILDER_UI__'?value.replace(/<\/script/gi,'<\\/script'):value);}
fs.writeFileSync(path.join(root,'index.html'),html);
fs.mkdirSync(path.join(root,'docs/examples/biovista'),{recursive:true});
fs.writeFileSync(path.join(root,'docs/index.html'),html);
fs.copyFileSync(path.join(root,'examples/biovista/BioVista_Quiz_Offline.html'),path.join(root,'docs/examples/biovista/BioVista_Quiz_Offline.html'));
console.log('Built the offline classroom builder and matching Pages copy.');
