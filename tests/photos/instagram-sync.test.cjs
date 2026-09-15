const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {normalizePosts,synchronize,readSnapshot}=require('../../scripts/sync-instagram.cjs');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWWQAAAAASUVORK5CYII=','base64');
const config={token:'fixture-secret-do-not-publish',userId:'123',version:'v25.0'};
const post=(id,extra={})=>({id:String(id),media_type:'IMAGE',media_url:`https://scontent.cdninstagram.com/${id}.png`,permalink:`https://www.instagram.com/p/Post${id}/`,timestamp:'2026-09-01T12:00:00Z',caption:`Photo ${id}`,...extra});
function sandbox(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'photos-sync-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return path.join(dir,'instagram');}
const api=records=>async url=>new URL(url).hostname==='graph.instagram.com'?Response.json({data:records}):new Response(png,{headers:{'content-type':'image/png'}});
const files=dir=>Object.fromEntries(fs.readdirSync(dir).sort().map(name=>[name,fs.readFileSync(path.join(dir,name)).toString('base64')]));
async function seed(dir){await synchronize({snapshotDir:dir,config,fetchImpl:api([post(99)])});return files(dir);}
test('PHOTO-18: select newest twelve regardless of API order',()=>{
 const selected=normalizePosts(Array.from({length:15},(_,i)=>post(i+1,{timestamp:`2026-09-${String(i+1).padStart(2,'0')}T00:00:00Z`})));
 assert.deepEqual(selected.map(p=>p.id),['15','14','13','12','11','10','9','8','7','6','5','4']);
});
test('PHOTO-18/24: deterministic textual ID tie-break and deduplication',()=>{
 assert.deepEqual(normalizePosts([post(2),post(10),post(2)]).map(p=>p.id),['10','2']);
});
test('PHOTO-19/20: omit videos and video-cover albums; use first image only',()=>{
 const a=post(2,{media_type:'CAROUSEL_ALBUM',children:{data:[{media_type:'VIDEO'},{media_type:'IMAGE',media_url:post(90).media_url}]}});
 const b=post(3,{media_type:'CAROUSEL_ALBUM',children:{data:[{media_type:'IMAGE',media_url:post(80).media_url},{media_type:'IMAGE',media_url:post(81).media_url}]}});
 const selected=normalizePosts([post(1,{media_type:'VIDEO'}),a,b]);
 assert.deepEqual(selected.map(p=>[p.id,p.media_url]),[['3',post(80).media_url]]);
 assert.throws(()=>normalizePosts([post(4,{media_type:'CAROUSEL_ALBUM'})]));
});
test('PHOTO-23/34: successful empty collection clears old selection and assets',async t=>{
 const dir=sandbox(t);await seed(dir);
 const result=await synchronize({snapshotDir:dir,config,fetchImpl:api([])});
 assert.equal(result.status,'success');assert.deepEqual(readSnapshot(dir).posts,[]);assert.deepEqual(fs.readdirSync(dir),['feed.json']);
});
test('PHOTO-30: no configuration means no network and no fake posts',async t=>{
 const dir=sandbox(t);const result=await synchronize({snapshotDir:dir,config:{},fetchImpl:()=>{throw Error('network forbidden');}});
 assert.deepEqual(result,{status:'no_selection',count:0,reason:'configuration'});assert.equal(fs.existsSync(dir),false);
});
test('PHOTO-28/31: complete snapshot contains only public metadata and local image',async t=>{
 const dir=sandbox(t);const calls=[];
 const result=await synchronize({snapshotDir:dir,config,fetchImpl:async(url,options)=>{calls.push([String(url),options]);return api([post(1)])(url);}});
 assert.equal(result.status,'success');const feed=readSnapshot(dir);
 assert.equal(feed.version,1);assert.equal(feed.username,'insanedriverid');assert.ok(Number.isFinite(Date.parse(feed.updatedAt)));
 assert.deepEqual(feed.posts,[{id:'1',permalink:post(1).permalink,timestamp:'2026-09-01T12:00:00.000Z',caption:'Photo 1',image:'/assets/instagram/1.png',alt:'Photo 1'}]);
 assert.deepEqual(fs.readFileSync(path.join(dir,'1.png')),png);
 assert.equal(calls[0][1].headers.Authorization,`Bearer ${config.token}`);assert.equal(calls[1][1].headers.Authorization,undefined);
 assert.equal(calls[0][0].includes(config.token),false);
});
test('PHOTO-28/34: successful replacement removes missing posts and old files',async t=>{
 const dir=sandbox(t);await seed(dir);await synchronize({snapshotDir:dir,config,fetchImpl:api([post(3)])});
 assert.deepEqual(readSnapshot(dir).posts.map(p=>p.id),['3']);assert.deepEqual(fs.readdirSync(dir).sort(),['3.png','feed.json']);
});
for(const status of [401,429]) test(`PHOTO-29: HTTP ${status} retains previous bytes`,async t=>{
 const dir=sandbox(t),before=await seed(dir);
 const result=await synchronize({snapshotDir:dir,config,fetchImpl:async()=>new Response(config.token,{status})});
 assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);assert.equal(JSON.stringify(result).includes(config.token),false);
});
test('PHOTO-29: request timeout retains previous snapshot',async t=>{
 const dir=sandbox(t),before=await seed(dir);
 const result=await synchronize({snapshotDir:dir,config,limits:{requestMs:20},fetchImpl:()=>new Promise(()=>{})});
 assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);
});
test('PHOTO-29: partial image download leaves old manifest and images intact',async t=>{
 const dir=sandbox(t),before=await seed(dir);
 const result=await synchronize({snapshotDir:dir,config,fetchImpl:async url=>String(url).endsWith('2.png')?new Response('bad',{status:503}):api([post(1),post(2)])(url)});
 assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);
});
test('PHOTO-29: cyclic cursor is failure and external next URL is never followed',async t=>{
 const dir=sandbox(t),before=await seed(dir),calls=[];
 const result=await synchronize({snapshotDir:dir,config,fetchImpl:async url=>{calls.push(String(url));return Response.json({data:[post(1)],paging:{cursors:{after:'same'},next:'https://evil.example/secret'}});}});
 assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);assert.ok(calls.every(url=>new URL(url).hostname==='graph.instagram.com'));assert.equal(calls.length,2);
});
for(const limits of [{pages:1},{records:1}]) test(`PHOTO-29: collection limit ${JSON.stringify(limits)} preserves snapshot`,async t=>{
 const dir=sandbox(t),before=await seed(dir);
 const result=await synchronize({snapshotDir:dir,config,limits,fetchImpl:async()=>Response.json({data:[post(1),post(2)],paging:{cursors:{after:'next'},next:'https://graph.instagram.com/next'}})});
 assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);
});
test('PHOTO-31: reject unsafe URLs, IDs, timestamps and disguised media',async t=>{
 for(const extra of [{id:'../bad'},{timestamp:'invalid'},{permalink:'https://evil.example/p/X/'},{media_url:'https://fbcdn.net.evil.example/a.png'},{media_url:'http://scontent.cdninstagram.com/a.png'},{media_url:'https://user:pass@scontent.cdninstagram.com/a.png'}]) assert.throws(()=>normalizePosts([post(1,extra)]));
 const dir=sandbox(t),before=await seed(dir);
 const result=await synchronize({snapshotDir:dir,config,fetchImpl:async url=>new URL(url).hostname==='graph.instagram.com'?Response.json({data:[post(1)]}):new Response('<svg/>',{headers:{'content-type':'image/png'}})});
 assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);
});
test('PHOTO-29/31: reject external media redirects without leaking bearer credentials',async t=>{
 const dir=sandbox(t),before=await seed(dir),calls=[];
 const result=await synchronize({snapshotDir:dir,config,fetchImpl:async(url,options)=>{calls.push([String(url),options.headers]);return new URL(url).hostname==='graph.instagram.com'?Response.json({data:[post(1)]}):new Response(null,{status:302,headers:{location:'https://evil.example/image'}});}});
 assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);assert.equal(calls.length,2);assert.equal(calls[1][1].Authorization,undefined);
});
test('PHOTO-31: captions and summaries cannot echo token or authenticated source URLs',async t=>{
 const dir=sandbox(t);const result=await synchronize({snapshotDir:dir,config,fetchImpl:api([post(1,{caption:`test ${config.token}`,media_url:post(1).media_url+'?sig=private'})])});
 const output=fs.readFileSync(path.join(dir,'feed.json'),'utf8')+JSON.stringify(result);
 assert.equal(output.includes(config.token),false);assert.equal(output.includes('sig=private'),false);assert.equal(output.includes('cdninstagram.com'),false);
});
test('PHOTO-20: adapter resolves first album child on fixed endpoint',async t=>{
 const dir=sandbox(t),calls=[];
 const result=await synchronize({snapshotDir:dir,config,fetchImpl:async url=>{url=new URL(url);calls.push(url);if(url.pathname.endsWith('/media'))return Response.json({data:[post(7,{media_type:'CAROUSEL_ALBUM'})]});if(url.pathname.endsWith('/children'))return Response.json({data:[{id:'8',media_type:'IMAGE',media_url:post(8).media_url}]});return new Response(png,{headers:{'content-type':'image/png'}});}});
 assert.equal(result.status,'success');assert.equal(readSnapshot(dir).posts[0].id,'7');assert.equal(calls[1].pathname,'/v25.0/7/children');assert.equal(calls[1].searchParams.get('limit'),'1');assert.equal(calls[2].pathname,'/8.png');
});
test('PHOTO-29: oversized download preserves prior snapshot',async t=>{
 const dir=sandbox(t),before=await seed(dir);const result=await synchronize({snapshotDir:dir,config,limits:{imageBytes:10},fetchImpl:api([post(1)])});
 assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);
});
test('PHOTO-30: first request failure returns empty state without broken snapshot',async t=>{
 const dir=sandbox(t);const result=await synchronize({snapshotDir:dir,config,fetchImpl:async()=>{throw Error(config.token);}});
 assert.equal(result.status,'no_selection');assert.equal(fs.existsSync(dir),false);assert.equal(JSON.stringify(result).includes(config.token),false);
});
module.exports={png,post};

test('PHOTO-24: repeated post keeps newest consistent record',()=>{
 const selected=normalizePosts([post(1,{timestamp:'2026-08-01T00:00:00Z'}),post(2),post(1,{timestamp:'2026-09-10T00:00:00Z'})]);
 assert.deepEqual(selected.map(p=>[p.id,p.timestamp]),[['1','2026-09-10T00:00:00.000Z'],['2','2026-09-01T12:00:00.000Z']]);
});
test('PHOTO-29: absent credentials retain existing public snapshot',async t=>{
 const dir=sandbox(t),before=await seed(dir);let calls=0;
 const result=await synchronize({snapshotDir:dir,config:{},fetchImpl:async()=>{calls++;}});
 assert.equal(result.status,'retained');assert.equal(calls,0);assert.deepEqual(files(dir),before);
});
test('PHOTO-29: total collection deadline preserves previous selection',async t=>{
 const dir=sandbox(t),before=await seed(dir);
 const result=await synchronize({snapshotDir:dir,config,limits:{totalMs:0},fetchImpl:api([post(1)])});
 assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);
});
