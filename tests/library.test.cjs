const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const {root,runtime,loadAsset}=require('../scripts/runtime.cjs'),Compiler=require('../src/compiler.js');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/catalog.json'),'utf8'));
test('Catalog assets and notices are contained, intact and explicitly scoped for reuse',()=>{
 assert.equal(catalog.schemaVersion,1);assert.equal(catalog.pathBase,'repository-root');const ids=new Set();
 function local(file){assert.equal(typeof file,'string');const absolute=path.resolve(root,file),relative=path.relative(root,absolute);assert.ok(relative&&!relative.startsWith('..')&&!path.isAbsolute(relative));assert.ok(fs.statSync(absolute).isFile());return absolute;}
 for(const a of catalog.assets){assert.ok(!ids.has(a.id));ids.add(a.id);const bytes=fs.readFileSync(local(a.path));assert.equal(bytes.length,a.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);local(a.license.noticePath);assert.ok(['reusable','example-only','permission-required'].includes(a.reuse.scope));assert.ok(a.tags.length&&a.alt&&(a.provenance.sourceUrl||a.provenance.metadataSource));if(a.provenance.metadataSource)local(a.provenance.metadataSource.split('#')[0]);if(a.id.startsWith('lucide-')){assert.equal(a.reuse.scope,'reusable');assert.match(a.provenance.sourceCommit,/^[a-f0-9]{40}$/);}}
});
test('Reusable icons embed through the existing compiler with their complete notices',()=>{
 const c=JSON.parse(fs.readFileSync(path.join(root,'quiz.config.json'),'utf8'));
 const icons=catalog.assets.filter(a=>a.id.startsWith('lucide-'));assert.equal(icons.length,8);
 c.assets={};c.branding={};for(const q of c.questions)delete q.visual;for(const a of icons)c.assets[a.id]={data:loadAsset(root,a.path),licenseText:fs.readFileSync(path.join(root,a.license.noticePath),'utf8')};
 const built=Compiler.build(c,runtime(c));const data=JSON.parse(built.html.match(/<script id="asset-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
 for(const a of icons){assert.equal(data[a.id].data,c.assets[a.id].data);assert.equal(data[a.id].licenseText,c.assets[a.id].licenseText);}
 assert.doesNotMatch(built.html,/<script\b[^>]*\bsrc=/i);
});
test('Startup stays bounded and prompt measurements report text units, never token savings',()=>{
 const report=JSON.parse(cp.execFileSync(process.execPath,[path.join(root,'scripts/measure-prompts.cjs')],{encoding:'utf8'}));
 assert.deepEqual(report.current.files.map(f=>f.file),['prompts/START.md','AGENTS.md']);assert.ok(report.current.bytes<=6500,'Startup exceeds the 6.5 KB loading budget');assert.match(report.units,/not tokens or billing/);
 if(report.baseline)assert.ok(report.current.bytes<report.baseline.bytes);
});
