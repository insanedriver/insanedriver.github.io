const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const png=fs.readFileSync(path.join(root,'assets/images/favicon.png'));
function snapshot(caption='On stage with Insane Driver') {
 return {version:1,username:'insanedriverid',updatedAt:'2026-09-14T00:00:00.000Z',posts:[{id:'2',permalink:'https://www.instagram.com/p/Fixture2/',timestamp:'2026-09-02T00:00:00.000Z',caption,image:'/assets/instagram/2.png',alt:caption.slice(0,300)},{id:'1',permalink:'https://www.instagram.com/p/Fixture1/',timestamp:'2026-09-01T00:00:00.000Z',caption:'Acoustic session',image:'/assets/instagram/1.png',alt:'Acoustic session'}]};
}
function render(feed) {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'photos-render-'));
 try {
  for(const relative of ['_data/instagram.js','scripts/sync-instagram.cjs','_includes/photos/instagram.liquid']) {
   const target=path.join(dir,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,relative),target);
  }
  fs.writeFileSync(path.join(dir,'index.html'),"{% include 'photos/instagram' %}");
  if(feed!==undefined) {
   fs.mkdirSync(path.join(dir,'assets/instagram'),{recursive:true});
   fs.writeFileSync(path.join(dir,'assets/instagram/feed.json'),JSON.stringify(feed));
   for(const id of ['1','2'])fs.writeFileSync(path.join(dir,'assets/instagram',id+'.png'),png);
  }
  fs.writeFileSync(path.join(dir,'.eleventy.js'),'module.exports = require('+JSON.stringify(path.join(root,'.eleventy.js'))+');');
  // Real Eleventy loader, Liquid escaping and HTML transform, in an isolated tree.
  execFileSync(process.execPath,[path.join(root,'node_modules/@11ty/eleventy/cmd.js'),'--config=.eleventy.js','--output=out'],{cwd:dir,stdio:'pipe'});
  return fs.readFileSync(path.join(dir,'out/index.html'),'utf8');
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
}
module.exports={snapshot,render,png};
