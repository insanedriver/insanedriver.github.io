const {test,expect}=require('./browser.cjs');
const {snapshot,render,png}=require('./instagram-fixture.cjs');
test('PHOTO-21/23: empty section links directly to the band profile',async({page})=>{
 await page.goto('/photos/');
 await expect(page.locator('.photos-instagram a').first()).toHaveAttribute('href','https://www.instagram.com/insanedriverid/');
 await expect(page.locator('.photos-instagram')).toContainText('@insanedriverid');
});
test('PHOTO-22/25/14: static photo cards work without login or API at all four widths',async({page})=>{
 const html=render(snapshot('<script>window.captionExecuted=true</script>'));
 const requests=[];page.on('request',request=>requests.push(request.url()));
 await page.route('**/assets/instagram/*.png',route=>route.fulfill({contentType:'image/png',body:png}));
 await page.goto('/photos/');
 await page.locator('.photos-instagram').evaluate((el,markup)=>{el.outerHTML=markup;},html);
 const cards=page.locator('.photos-instagram-card');
 await expect(cards).toHaveCount(2);
 await expect(cards.first()).toHaveAttribute('href','https://www.instagram.com/p/Fixture2/');
 await cards.first().scrollIntoViewIfNeeded();
 await expect.poll(() => cards.first().locator('img').evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
 await cards.first().locator('img').evaluate(img=>img.decode());
 expect(await page.evaluate(()=>window.captionExecuted)).toBeUndefined();
 for(const width of [320,390,768,1440]) {
  await page.setViewportSize({width,height:900});
  await cards.first().scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(cards.first()).toBeVisible();
 }
 expect(requests.filter(url=>url.includes('graph.instagram.com'))).toEqual([]);
});
