const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {buildProvenance}=require('../scripts/build-provenance.cjs');
const {runtime}=require('../scripts/runtime.cjs');

function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'qsk-provenance-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const files={
  'package.json':JSON.stringify({name:'quiz-show-kit',version:'1.1.0'}),
  'package-lock.json':JSON.stringify({lockfileVersion:3,packages:{}}),
  'scripts/runtime.cjs':'runtime source',
  'scripts/build-provenance.cjs':'provenance source',
  'src/compiler.js':'compiler source',
  'src/engine.js':'engine source',
  'src/theme/style.css':'theme source',
  'src/quiz-template.html':'template source',
  'src/shared-assets.json':'{"asset":"embedded media"}',
  'vendor/manifest.json':JSON.stringify([{file:'vendor/example.min.js',licenseFiles:['vendor/example.LICENSE']}]),
  'vendor/example.min.js':'vendor source',
  'vendor/example.LICENSE':'MIT license text'
 };
 for(const [name,contents]of Object.entries(files))write(root,name,contents);
 return {root,files};
}
function write(root,name,contents){const file=path.join(root,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,contents);}

test('Runtime provenance is stable across rebuilds, locations, Git changes and generated outputs',t=>{
 const a=fixture(t),b=fixture(t),expected=buildProvenance(a.root);
 assert.match(expected.sourceDigest,/^[0-9a-f]{64}$/);
 assert.deepEqual(Object.keys(expected).sort(),['sourceDigest','sourceDigestAlgorithm','sourceDigestScope','version']);
 assert.equal(expected.sourceDigestAlgorithm,'sha256');assert.equal(expected.sourceDigestScope,'runtime-source-v1');
 assert.equal(expected.version,'1.1.0');
 assert.deepEqual(buildProvenance(a.root),expected);assert.deepEqual(buildProvenance(b.root),expected);
 for(const name of ['.git/HEAD','.git/index','README.md','docs/index.html','examples/biovista/BioVista_Quiz_Offline.html','dist/Quiz_Offline.html','.github/workflows/release.yml']){
  write(a.root,name,'generated or repository metadata changed');
  assert.deepEqual(buildProvenance(a.root),expected,name+' must not change runtime identity');
 }
});

test('Every runtime, compiler, media, dependency and license input changes the source digest',t=>{
 const {root,files}=fixture(t),expected=buildProvenance(root).sourceDigest;
 for(const [name,contents]of Object.entries(files)){
  const changed=name==='package.json'?JSON.stringify({name:'quiz-show-kit',version:'1.2.0'}):name==='vendor/manifest.json'?JSON.stringify([{file:'vendor/example.min.js',licenseFiles:['vendor/example.LICENSE'],version:'2'}]):contents+'\n';
  write(root,name,changed);assert.notEqual(buildProvenance(root).sourceDigest,expected,name+' must affect runtime identity');
  write(root,name,contents);assert.equal(buildProvenance(root).sourceDigest,expected);
 }
 write(root,'src/new-module.js','new module');assert.notEqual(buildProvenance(root).sourceDigest,expected);
 fs.rmSync(path.join(root,'src/new-module.js'));assert.equal(buildProvenance(root).sourceDigest,expected);
 fs.rmSync(path.join(root,'package-lock.json'));assert.notEqual(buildProvenance(root).sourceDigest,expected);
});

test('Provenance refuses vendor paths outside the project',t=>{
 const {root}=fixture(t);
 write(root,'vendor/manifest.json',JSON.stringify([{file:'../private-file',licenseFiles:[]}]));
 assert.throws(()=>buildProvenance(root),/relative project file/);
});

test('Actual runtime embeds the current source digest and package version without Git state',()=>{
 const built=runtime({}),prefix=built.scripts.ui.match(/^window\.QSK_BUILD=(.+);\n/);
 assert.ok(prefix);const info=JSON.parse(prefix[1]);
 assert.deepEqual(info,buildProvenance());
 assert.equal(info.version,require('../package.json').version);
 assert.ok(!('baseCommit'in info));assert.ok(!('localChanges'in info));
});
