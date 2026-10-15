#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),baselineCommit='b1efe0e15a7b5dadcea3bb49500e58828e07383b';
const startupFiles=['prompts/START.md','AGENTS.md'];
const baselineFiles=[...startupFiles,'README.md','docs/TEACHER_PROMPT.md','docs/CONFIGURATION.md','package.json','docs/library/README.md'];
function measure(files,read){const entries=files.map(file=>{const text=read(file);return {file,bytes:Buffer.byteLength(text,'utf8'),words:text.trim().split(/\s+/u).length};});return {files:entries,bytes:entries.reduce((n,x)=>n+x.bytes,0),words:entries.reduce((n,x)=>n+x.words,0)};}
const current=measure(startupFiles,file=>fs.readFileSync(path.join(root,file),'utf8'));
let baseline=null;try{baseline=measure(baselineFiles,file=>execFileSync('git',['show',baselineCommit+':'+file],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}));}catch(_){}
console.log(JSON.stringify({scope:'Required startup text only; detailed modules are deferred, not deleted.',units:'UTF-8 bytes and whitespace-separated words; not tokens or billing',baselineCommit,baseline,current,byteReductionPercent:baseline?Number(((1-current.bytes/baseline.bytes)*100).toFixed(1)):null,limitations:['Actual total tokens depend on the model, tokenizer, tools, task, later modules and retries.','A shallow clone may lack the baseline commit; current measurements still work.','This does not change assistant settings, install a skill or guarantee a cost reduction.']},null,2));
