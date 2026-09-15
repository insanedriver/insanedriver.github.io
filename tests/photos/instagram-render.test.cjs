const {test}=require('node:test');
const assert=require('node:assert/strict');
const {snapshot,render}=require('./instagram-fixture.cjs');
test('PHOTO-18/20/21: real build renders ordered local covers and original permalinks',()=>{
 const html=render(snapshot());
 assert.equal((html.match(/class="photos-instagram-card"/g)||[]).length,2);
 assert.ok(html.indexOf('Fixture2')<html.indexOf('Fixture1'));
 assert.match(html,/src="\/assets\/instagram\/2.png"/);assert.match(html,/href="https:\/\/www.instagram.com\/p\/Fixture2\/"/);
 assert.match(html,/>On stage with Insane Driver</);assert.match(html,/datetime="2026-09-02T00:00:00.000Z"/);
});
test('PHOTO-23: empty and absent selections render actual profile link',()=>{
 for(const feed of [undefined,{...snapshot(),posts:[]}]) {
  const html=render(feed);assert.match(html,/href="https:\/\/www.instagram.com\/insanedriverid\/"/);assert.doesNotMatch(html,/class="photos-instagram-card"/);
 }
});
test('PHOTO-25: caption and attribute markup are escaped in generated HTML',()=>{
 const html=render(snapshot('<img src=x onerror="alert(1)"> & "hello"'));
 assert.match(html,/&lt;img src=x onerror=/);assert.doesNotMatch(html,/<img src=x/);assert.doesNotMatch(html,/alt="<img/);assert.match(html,/&amp;/);
});
test('PHOTO-23/31: malformed or unsafe snapshot becomes empty instead of public content',()=>{
 for(const feed of [{...snapshot(),version:9}, {...snapshot(),posts:[{...snapshot().posts[0],image:'/etc/passwd'}]}, {...snapshot(),access_token:'secret'}]) {
  const html=render(feed);assert.doesNotMatch(html,/class="photos-instagram-card"/);assert.match(html,/insanedriverid/);assert.doesNotMatch(html,/secret|\/etc\/passwd/);
 }
});
