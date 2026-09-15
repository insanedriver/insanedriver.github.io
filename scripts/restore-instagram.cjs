const fs=require('node:fs');
const path=require('node:path');
const {execFileSync,spawnSync}=require('node:child_process');
const {readSnapshot}=require('./sync-instagram.cjs');
function restore({cwd=process.cwd()}={}) {
  const destination=path.join(cwd,'assets/instagram');
  let staging;
  const options={cwd,stdio:'pipe',timeout:120000,maxBuffer:16*1024*1024};
  const git=(...args)=>execFileSync('git',args,options);
  try {
    const lookup=spawnSync('git',['ls-remote','--exit-code','origin','refs/heads/release'],options);
    if(lookup.status===2) return {status:'bootstrap',count:0};
    if(lookup.status!==0) throw Error();
    git('fetch','--no-tags','--depth=1','origin','+refs/heads/release:refs/instagram-restore/release');
    const ref='refs/instagram-restore/release';
    const entries=git('ls-tree','-r','-z',ref,'--','assets/instagram').toString().split('\0').filter(Boolean);
    if(!entries.length) return {status:'bootstrap',count:0};
    if(entries.length>13) throw Error();
    const files=entries.map(entry=>{
      const match=/^100644 blob [a-f0-9]+\tassets\/instagram\/(feed\.json|\d{1,40}\.(?:png|jpg|webp))$/.exec(entry);
      if(!match) throw Error();
      return match[1];
    });
    if(!files.includes('feed.json')) throw Error();
    fs.mkdirSync(path.dirname(destination),{recursive:true});
    staging=fs.mkdtempSync(destination+'-staging-');
    for(const name of files) fs.writeFileSync(path.join(staging,name),git('show',ref+':assets/instagram/'+name));
    const feed=readSnapshot(staging);
    if(!feed || files.length!==feed.posts.length+1) throw Error();
    // Production starts from a clean source checkout; never merge into stale output.
    if(fs.existsSync(destination)) throw Error();
    fs.renameSync(staging,destination);staging=null;
    return {status:'restored',count:feed.posts.length};
  } catch { throw new Error('Instagram restore failed; publication stopped.'); }
  finally { if(staging) fs.rmSync(staging,{recursive:true,force:true}); }
}
module.exports={restore};
if(require.main===module) {
  try {const result=restore();console.log('Instagram restore: '+result.status+'; '+result.count+' posts.');}
  catch {console.error('Instagram restore failed; publication stopped.');process.exitCode=1;}
}
