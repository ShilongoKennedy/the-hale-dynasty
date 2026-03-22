const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to a good desktop size
  await page.setViewport({width: 1200, height: 900});

  // Screenshot Era I
  await page.goto('file://' + __dirname + '/era-I.html', {waitUntil: 'networkidle0'});
  await page.screenshot({path: 'era_I_screenshot.png'});

  // Screenshot Era IX
  await page.goto('file://' + __dirname + '/era-IX.html', {waitUntil: 'networkidle0'});
  await page.screenshot({path: 'era_IX_screenshot.png'});

  // Screenshot Era X
  await page.goto('file://' + __dirname + '/era-X.html', {waitUntil: 'networkidle0'});
  await page.screenshot({path: 'era_X_screenshot.png'});

  await browser.close();
})();
