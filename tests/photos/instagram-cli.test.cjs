const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {snapshot,png}=require('./instagram-fixture.cjs');
const script=path.resolve(__dirname,'../../scripts/sync-instagram.cjs');
const token='fixture-cli-secret-never-publish';

for(const scenario of [
 {status:'success',count:2,seed:false,fail:false},
 {status:'retained',count:2,seed:true,fail:true},
 {status:'no_selection',count:0,seed:false,fail:true}
]) test(`PHOTO-31/33: CLI reports ${scenario.status} in stdout and Actions summary without secrets`,t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'photos-cli-'));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const feed=snapshot();
 if(scenario.seed) {
  const target=path.join(dir,'assets/instagram');fs.mkdirSync(target,{recursive:true});
  fs.writeFileSync(path.join(target,'feed.json'),JSON.stringify(feed));
  for(const post of feed.posts)fs.writeFileSync(path.join(target,post.id+'.png'),png);
 }
 const records=feed.posts.map(post=>({id:post.id,media_type:'IMAGE',timestamp:post.timestamp,permalink:post.permalink,caption:post.caption,media_url:`https://scontent.cdninstagram.com/${post.id}.png?sig=fixture-private`}));
 fs.writeFileSync(path.join(dir,'response.json'),JSON.stringify(records));
 fs.writeFileSync(path.join(dir,'image.png'),png);
 const preload=path.join(dir,'offline.cjs');
 fs.writeFileSync(preload,`const fs=require('node:fs');
globalThis.fetch=async url=>{
 if(process.env.FIXTURE_FAIL==='1')throw Error(process.env.INSTAGRAM_ACCESS_TOKEN);
 if(new URL(url).hostname==='graph.instagram.com')return Response.json({data:JSON.parse(fs.readFileSync('response.json','utf8'))});
 return new Response(fs.readFileSync('image.png'),{headers:{'content-type':'image/png'}});
};
`);
 const summary=path.join(dir,'summary.md');
 fs.writeFileSync(summary,'Previous step summary\n');
 const result=spawnSync(process.execPath,['--require',preload,script],{
  cwd:dir,encoding:'utf8',timeout:10000,
  env:{INSTAGRAM_ACCESS_TOKEN:token,INSTAGRAM_USER_ID:'123',INSTAGRAM_API_VERSION:'v25.0',GITHUB_STEP_SUMMARY:summary,FIXTURE_FAIL:scenario.fail?'1':'0'}
 });
 assert.equal(result.error,undefined);assert.equal(result.status,0);assert.equal(result.stderr,'');
 const expected=`Instagram: ${scenario.status}; ${scenario.count} posts${scenario.fail?'; request':''}.\n`;
 assert.equal(result.stdout,expected);
 const written=fs.readFileSync(summary,'utf8');
 assert.equal(written,'Previous step summary\n'+expected);
 for(const output of [result.stdout,result.stderr,written]) {
  assert.equal(output.includes(token),false);
  assert.equal(output.includes('sig=fixture-private'),false);
 }
});
