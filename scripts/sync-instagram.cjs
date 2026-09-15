const fs = require('node:fs');
const path = require('node:path');
const {randomUUID} = require('node:crypto');
const LIMITS = {pages:100, records:5000, totalMs:300000, requestMs:15000, imageBytes:15*1024*1024, jsonBytes:4*1024*1024};
const ID = /^\d{1,40}$/;
function fail() { throw new Error('invalid_data'); }
function date(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT/.test(value) || !Number.isFinite(Date.parse(value))) fail();
  return new Date(value).toISOString();
}
function permalink(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !['instagram.com','www.instagram.com'].includes(url.hostname) || url.username || url.password || url.port || !/^\/(p|reel)\/[A-Za-z0-9_-]+\/$/.test(url.pathname)) fail();
  url.search = ''; url.hash = ''; return url.href;
}
function mediaURL(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !['cdninstagram.com','fbcdn.net','instagram.com'].some(host => url.hostname === host || url.hostname.endsWith('.'+host))) fail();
  return url.href;
}
function normalizePosts(records) {
  const eligible = [];
  for (const record of records) {
    if (!record || !ID.test(record.id) || typeof record.id !== 'string') fail();
    const timestamp = date(record.timestamp);
    const link = permalink(record.permalink);
    if (record.media_type === 'VIDEO' || record.media_product_type === 'REELS') continue;
    let image = record;
    if (record.media_type === 'CAROUSEL_ALBUM') {
      image = record.children?.data?.[0];
      if (!image) fail();
      if (image.media_type === 'VIDEO') continue;
    }
    if (image.media_type !== 'IMAGE') fail();
    if (record.caption !== undefined && typeof record.caption !== 'string') fail();
    eligible.push({id:record.id, timestamp, permalink:link, caption:(record.caption || '').slice(0,10000), media_url:mediaURL(image.media_url)});
  }
  eligible.sort((a,b) => Date.parse(b.timestamp)-Date.parse(a.timestamp) || (a.id<b.id ? -1 : a.id>b.id ? 1 : 0));
  const unique = new Map();
  for (const item of eligible) if (!unique.has(item.id)) unique.set(item.id,item);
  return [...unique.values()].slice(0,12);
}
function imageType(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'png';
  if (bytes.length >= 4 && bytes[0]===255 && bytes[1]===216 && bytes[2]===255) return 'jpg';
  if (bytes.length >= 12 && bytes.toString('ascii',0,4)==='RIFF' && bytes.toString('ascii',8,12)==='WEBP') return 'webp';
  fail();
}
function regularFile(filename,maxBytes) {
  const stat=fs.lstatSync(filename);
  if (!stat.isFile() || stat.size>maxBytes) fail();
  return fs.readFileSync(filename);
}
function readSnapshot(dir) {
  try {
    if (!fs.lstatSync(dir).isDirectory() || fs.lstatSync(dir).isSymbolicLink()) return null;
    const feed=JSON.parse(regularFile(path.join(dir,'feed.json'),256*1024));
    if (Object.keys(feed).sort().join(',') !== 'posts,updatedAt,username,version' || feed.version!==1 || feed.username!=='insanedriverid' || !Array.isArray(feed.posts) || feed.posts.length>12) fail();
    date(feed.updatedAt);
    let previous=null;
    const seen=new Set();
    for (const p of feed.posts) {
      if (Object.keys(p).sort().join(',') !== 'alt,caption,id,image,permalink,timestamp' || typeof p.id!=='string' || !ID.test(p.id) || seen.has(p.id)) fail();
      seen.add(p.id);
      if (permalink(p.permalink)!==p.permalink || date(p.timestamp)!==p.timestamp || typeof p.caption!=='string' || p.caption.length>10000 || typeof p.alt!=='string' || !p.alt || p.alt.length>300) fail();
      if (previous && (Date.parse(previous.timestamp)<Date.parse(p.timestamp) || (previous.timestamp===p.timestamp && previous.id>p.id))) fail();
      previous=p;
      if (!new RegExp('^/assets/instagram/'+p.id+'\\.(jpg|png|webp)$').test(p.image)) fail();
      const bytes=regularFile(path.join(dir,path.basename(p.image)),LIMITS.imageBytes);
      if ('.'+imageType(bytes)!==path.extname(p.image)) fail();
    }
    return feed;
  } catch { return null; }
}
async function synchronize({fetchImpl=globalThis.fetch, snapshotDir=path.resolve('assets/instagram'), config={}, limits={}}={}) {
  const bounds={...LIMITS,...limits};
  const previous=readSnapshot(snapshotDir);
  const fallback=reason=>({status:previous ? 'retained':'no_selection', count:previous?.posts.length || 0, reason});
  if (!config.token || !ID.test(config.userId || '') || !/^v\d+\.\d+$/.test(config.version || '')) return fallback('configuration');
  const started=Date.now();
  let staging;
  let reason='request';
  async function request(url, authenticated, maxBytes, redirects=0) {
    const remaining=bounds.totalMs-(Date.now()-started);
    if (remaining<=0) throw Error('limit');
    const controller=new AbortController();
    let timer;
    try {
      return await Promise.race([
        (async()=>{
          const response=await fetchImpl(url,{headers:authenticated ? {Authorization:'Bearer '+config.token} : {},redirect:'manual',signal:controller.signal});
          if (response.status>=300 && response.status<400) {
            if (authenticated || redirects>=3) fail();
            const next=mediaURL(new URL(response.headers.get('location'),url).href);
            await response.body?.cancel();
            return request(next,false,maxBytes,redirects+1);
          }
          if (!response.ok) throw Error('http');
          if (Number(response.headers.get('content-length'))>maxBytes) throw Error('limit');
          const chunks=[];let length=0;
          if (!response.body) fail();
          for await (const chunk of response.body) {
            length+=chunk.length;if(length>maxBytes) { controller.abort(); throw Error('limit'); }
            chunks.push(Buffer.from(chunk));
          }
          return {bytes:Buffer.concat(chunks),type:response.headers.get('content-type')?.split(';')[0]};
        })(),
        new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('timeout'));},Math.min(bounds.requestMs,remaining));})
      ]);
    } finally { clearTimeout(timer); }
  }
  async function graph(endpoint,fields,params={}) {
    const url=new URL('https://graph.instagram.com/'+config.version+'/'+endpoint);
    url.search=new URLSearchParams({fields,...params});
    const response=await request(url,true,bounds.jsonBytes);
    const body=JSON.parse(response.bytes);
    if (body.error || !Array.isArray(body.data)) fail();
    return body;
  }
  try {
    const records=[];const cursors=new Set();let after;
    for (let page=0;;page++) {
      if(page>=bounds.pages) throw Error('limit');
      const body=await graph(config.userId+'/media','id,media_type,media_url,permalink,timestamp,caption',{limit:'100',...(after ? {after}: {})});
      records.push(...body.data);
      if(records.length>bounds.records) throw Error('limit');
      if(!body.paging?.next) break;
      after=body.paging?.cursors?.after;
      if(typeof after!=='string' || !after || after.length>4096 || cursors.has(after)) fail();
      cursors.add(after);
    }
    for (const record of records) {
      if (!record || typeof record.id!=='string' || !ID.test(record.id)) fail();
      if(record.media_type==='CAROUSEL_ALBUM') record.children=await graph(record.id+'/children','id,media_type,media_url',{limit:'1'});
    }
    const selected=normalizePosts(records);
    fs.mkdirSync(path.dirname(snapshotDir),{recursive:true});
    staging=fs.mkdtempSync(snapshotDir+'-staging-');
    const posts=[];
    for(const item of selected) {
      const response=await request(item.media_url,false,bounds.imageBytes);
      const ext=imageType(response.bytes);
      if(response.type!=={png:'image/png',jpg:'image/jpeg',webp:'image/webp'}[ext]) fail();
      const filename=item.id+'.'+ext;
      fs.writeFileSync(path.join(staging,filename),response.bytes);
      const caption=item.caption.split(config.token).join('[redacted]');
      posts.push({id:item.id,permalink:item.permalink,timestamp:item.timestamp,caption,image:'/assets/instagram/'+filename,alt:caption.slice(0,300)||'Instagram photo by @insanedriverid'});
    }
    const feed={version:1,username:'insanedriverid',updatedAt:new Date().toISOString(),posts};
    fs.writeFileSync(path.join(staging,'feed.json'),JSON.stringify(feed,null,2)+'\n');
    if(!readSnapshot(staging)) fail();
    const backup=snapshotDir+'-previous-'+randomUUID();
    const existed=fs.existsSync(snapshotDir);
    if(existed) fs.renameSync(snapshotDir,backup);
    try { fs.renameSync(staging,snapshotDir);staging=null; }
    catch(error) { if(existed) fs.renameSync(backup,snapshotDir);throw error; }
    if(existed) fs.rmSync(backup,{recursive:true,force:true});
    return {status:'success',count:posts.length};
  } catch(error) {
    if (['limit','timeout','http','invalid_data'].includes(error.message)) reason=error.message;
    return fallback(reason);
  } finally { if(staging) fs.rmSync(staging,{recursive:true,force:true}); }
}
module.exports={normalizePosts,synchronize,readSnapshot};
if (require.main===module) {
  synchronize({config:{token:process.env.INSTAGRAM_ACCESS_TOKEN,userId:process.env.INSTAGRAM_USER_ID,version:process.env.INSTAGRAM_API_VERSION}}).then(result=>{
    const summary='Instagram: '+result.status+'; '+result.count+' posts'+(result.reason ? '; '+result.reason:'')+'.\n';
    console.log(summary.trim());
    if(process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);
  }).catch(()=>{console.error('Instagram: synchronization failed.');process.exitCode=1;});
}
