#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),P=require('../src/presets.js'),{loadAsset}=require('./runtime.cjs');
const args=process.argv.slice(2),options={};
for(let i=0;i<args.length;i++){const arg=args[i];if(arg==='--help'){console.log('node scripts/preset.cjs --config INPUT --key "QSK1 preset=friendly theme=classroom [setup=teacher|competition]" [--settings FILE] [--output CONFIG] [--save-settings FILE] [--local-tts]');process.exit(0);}if(arg==='--local-tts'){options.localTTS=true;continue;}if(!['--config','--key','--settings','--output','--save-settings'].includes(arg)||!args[i+1])throw Error('Unknown or incomplete argument: '+arg);options[arg.slice(2)]=args[++i];}
if(!options.config)throw Error('--config is required; preserve the supplied event and its questions.');
const raw=JSON.parse(fs.readFileSync(options.config,'utf8')),saved=options.settings?JSON.parse(fs.readFileSync(options.settings,'utf8')):undefined;
const config=P.apply(raw,options.key,saved);
function write(file,value){fs.mkdirSync(path.dirname(path.resolve(file)),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');}
if(options.output){
 // The output may live elsewhere; embed from the original bounded asset directory.
 const portable=JSON.parse(JSON.stringify(config));
 for(const asset of Object.values(portable.assets||{}))if(asset.file&&!asset.data){asset.data=loadAsset(path.dirname(path.resolve(options.config)),asset.file);delete asset.file;}
 require('../src/compiler.js').validate(portable);write(options.output,portable);
}
// Explicit authoring setup wins; a preset/theme-only key retains the imported setup.
const setup=P.decode(options.key??saved?.key??'QSK1').setup??(saved?.key===undefined?undefined:P.decode(saved.key).setup);
if(options['save-settings'])write(options['save-settings'],P.exportSettings(config,{setup}));
console.log(JSON.stringify(P.choices(config,{localTTS:!!options.localTTS}),null,2));
