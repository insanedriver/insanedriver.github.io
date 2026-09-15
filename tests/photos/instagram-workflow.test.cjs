const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {execFileSync,spawnSync}=require('node:child_process');
const yaml=require('js-yaml');
const {snapshot,png}=require('./instagram-fixture.cjs');
const {restore}=require('../../scripts/restore-instagram.cjs');
const {readSnapshot,synchronize}=require('../../scripts/sync-instagram.cjs');
const root=path.resolve(__dirname,'../..');
function git(cwd,...args){return execFileSync('git',args,{cwd,encoding:'utf8',stdio:'pipe'}).trim();}
function repo(t,feed=snapshot()) {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'photos-restore-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const remote=path.join(dir,'remote');fs.mkdirSync(remote);git(remote,'init','-b','release');git(remote,'config','user.name','Fixture');git(remote,'config','user.email','fixture@example.test');
 fs.writeFileSync(path.join(remote,'never-execute.cjs'),"throw Error('release code executed')");
 if(feed) {fs.mkdirSync(path.join(remote,'assets/instagram'),{recursive:true});fs.writeFileSync(path.join(remote,'assets/instagram/feed.json'),JSON.stringify(feed));for(const id of ['1','2'])fs.writeFileSync(path.join(remote,'assets/instagram',id+'.png'),png);}
 git(remote,'add','.');git(remote,'commit','-m','fixture');
 function checkout(name) {const cwd=path.join(dir,name);fs.mkdirSync(cwd);git(cwd,'init','-b','master');git(cwd,'remote','add','origin',remote);return cwd;}
 return {dir,remote,checkout};
}
test('PHOTO-26/27: push, six-hour schedule and manual dispatch use one pipeline',()=>{
 const workflow=yaml.load(fs.readFileSync('.github/workflows/main.yml','utf8'));
 assert.deepEqual(workflow.on.push.branches,['master']);assert.deepEqual(workflow.on.schedule,[{cron:'17 */6 * * *'}]);assert.ok('workflow_dispatch' in workflow.on);
 const jobs=Object.values(workflow.jobs);assert.equal(jobs.length,1);
 const steps=jobs[0].steps;
 const commands=steps.map(s=>s.run||'');
 assert.equal(commands.filter(s=>s==='node scripts/sync-instagram.cjs').length,1);
 assert.ok(commands.indexOf('node scripts/restore-instagram.cjs')<commands.indexOf('node scripts/sync-instagram.cjs'));
 assert.ok(commands.indexOf('node scripts/sync-instagram.cjs')<commands.indexOf('npm run build'));
 assert.ok(steps.findIndex(s=>s.run==='npm run build')<steps.findIndex(s=>s.uses?.startsWith('JamesIves/')));
 assert.equal(steps.find(s=>s.run==='node scripts/restore-instagram.cjs')['continue-on-error'],undefined);
});
test('PHOTO-31/32: entire production pipeline is serialized and token exists only in sync step',()=>{
 const workflow=yaml.load(fs.readFileSync('.github/workflows/main.yml','utf8'));const job=workflow.jobs['build-and-deploy'];
 assert.equal(workflow.concurrency.group,'pages-production');assert.equal(workflow.concurrency['cancel-in-progress'],false);
 assert.match(job.if,/github.ref == 'refs\/heads\/master'/);
 const steps=job.steps;assert.equal(steps.find(s=>s.uses?.startsWith('actions/checkout@')).with.ref,'master');
 assert.equal(workflow.env,undefined);assert.equal(job.env,undefined);
 assert.equal(steps.filter(s=>JSON.stringify(s).includes('INSTAGRAM_ACCESS_TOKEN')).length,1);
 const sync=steps.find(s=>s.run==='node scripts/sync-instagram.cjs');assert.equal(sync.env.INSTAGRAM_ACCESS_TOKEN,'${{ secrets.INSTAGRAM_ACCESS_TOKEN }}');
 assert.equal(steps.find(s=>s.uses?.startsWith('actions/setup-node@')).with['node-version'],'24');assert.ok(steps.some(s=>s.run==='npm ci'));
});
test('PHOTO-28/29: complete restore works in successive clean checkouts without release code',t=>{
 const r=repo(t);
 for(const name of ['first','second']) {const cwd=r.checkout(name);const result=restore({cwd});assert.equal(result.status,'restored');assert.deepEqual(readSnapshot(path.join(cwd,'assets/instagram')),snapshot());assert.deepEqual(fs.readFileSync(path.join(cwd,'assets/instagram/2.png')),png);assert.equal(fs.existsSync(path.join(cwd,'never-execute.cjs')),false);}
});
test('PHOTO-30: proven absence of branch or manifest permits bootstrap',t=>{
 const r=repo(t,null);assert.equal(restore({cwd:r.checkout('no-manifest')}).status,'bootstrap');
 git(r.remote,'branch','-m','master');assert.equal(restore({cwd:r.checkout('no-release')}).status,'bootstrap');
});
test('PHOTO-29: failed recovery exits nonzero before a publication step can run',t=>{
 const r=repo(t),cwd=r.checkout('broken');git(cwd,'remote','set-url','origin',path.join(r.dir,'missing'));
 const result=spawnSync(process.execPath,[path.join(root,'scripts/restore-instagram.cjs')],{cwd,encoding:'utf8'});
 assert.equal(result.status,1);assert.match(result.stderr,/publication stopped/);assert.equal(fs.existsSync(path.join(cwd,'assets/instagram')),false);
});
test('PHOTO-29: restored image bytes survive subsequent API failure and build rendering',async t=>{
 const r=repo(t),cwd=r.checkout('retained');restore({cwd});const dir=path.join(cwd,'assets/instagram');const before=fs.readFileSync(path.join(dir,'feed.json'));
 const result=await synchronize({snapshotDir:dir,config:{token:'fixture',userId:'123',version:'v25.0'},fetchImpl:async()=>new Response('unauthorized',{status:401})});
 assert.equal(result.status,'retained');assert.deepEqual(fs.readFileSync(path.join(dir,'feed.json')),before);assert.deepEqual(fs.readFileSync(path.join(dir,'2.png')),png);
 const {render}=require('./instagram-fixture.cjs');assert.match(render(readSnapshot(dir)),/\/assets\/instagram\/2.png/);
});
test('PHOTO-31: corrupted manifest and unexpected executable files fail restoration',t=>{
 const r=repo(t,{...snapshot(),version:9});assert.throws(()=>restore({cwd:r.checkout('bad-manifest')}),/restore failed/);
 fs.writeFileSync(path.join(r.remote,'assets/instagram/feed.json'),JSON.stringify(snapshot()));fs.writeFileSync(path.join(r.remote,'assets/instagram/execute.js'),'throw Error()');git(r.remote,'add','.');git(r.remote,'commit','-m','unexpected file');
 assert.throws(()=>restore({cwd:r.checkout('bad-file')}),/restore failed/);
});
