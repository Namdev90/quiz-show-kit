#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const Compiler=require('../src/compiler.js'),{runtime,root}=require('./runtime.cjs');
const args=process.argv.slice(2);let configFile=path.join(root,'quiz.config.json'),output=path.join(root,'dist/Quiz_Offline.html');
for(let i=0;i<args.length;i++){if(args[i]==='--help'){console.log('node scripts/build.cjs [--config quiz.config.json] [--output dist/Quiz_Offline.html]');process.exit(0);}if(['--config','--output'].includes(args[i])&&args[i+1]){const value=path.resolve(args[++i]);if(args[i-1]==='--config')configFile=value;else output=value;}else throw Error('Unknown or incomplete argument: '+args[i]);}
try{const input=fs.readFileSync(configFile,'utf8');const raw=JSON.parse(input);Compiler.validate(raw);const built=Compiler.build(raw,runtime(raw,configFile));fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,built.html,'utf8');console.log(JSON.stringify({file:output,bytes:Buffer.byteLength(built.html),sha256:crypto.createHash('sha256').update(built.html).digest('hex'),mainQuestions:built.config.questions.filter(q=>q.status==='main').length,totalCards:built.config.questions.length,profileId:built.config.profileId},null,2));}catch(error){console.error('Build failed: '+error.message);process.exitCode=1;}
