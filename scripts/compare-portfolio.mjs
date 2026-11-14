import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve(process.env.COMPARISON_OUTPUT || 'test-results/visual-comparison');
const localUrl = process.env.LOCAL_URL || 'http://localhost:3001';
const referenceUrl = 'https://mdopeace.github.io/';
const browser = await chromium.launch({ headless: true });
const sections = { navigation: '.site-nav', hero: 'header', story: '#story', work: '#work', experience: '#experience', now: '#now', contact: '#contact' };
const variants = process.env.QUICK_COMPARE ? [['desktop','light',1280,900]] : [['desktop','light',1280,900],['desktop','dark',1280,900],['mobile','light',390,844],['mobile','dark',390,844]];
const metrics = {};
const gallery = [];
await mkdir(output, { recursive: true });
try {
  for (const [device, theme, width, height] of variants) {
    const context = await browser.newContext({ viewport: {width,height}, colorScheme:theme, reducedMotion:'reduce' });
    await context.addInitScript(theme => localStorage.setItem('portfolio-theme',theme), theme);
    for (const [label, url] of [['reference',referenceUrl],['local',localUrl]]) {
      const page = await context.newPage();
      await page.goto(url, { waitUntil:'networkidle',timeout:45000 });
      await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
      await page.locator('img').evaluateAll(images => images.forEach(image => {image.loading='eager';}));
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.race([Promise.all([...document.images].map(image=>image.decode().catch(()=>{}))), new Promise(resolve=>setTimeout(resolve,10000))]);
      });
      const key = `${device}-${theme}-${label}`;
      metrics[key] = await page.evaluate(() => ({ width:innerWidth, scrollWidth:document.documentElement.scrollWidth, sections:Object.fromEntries(['header','#story','#work','#experience','#now','#contact'].map(selector=>{
        const element=document.querySelector(selector), s=getComputedStyle(element);
        return [selector,{width:element.getBoundingClientRect().width,height:element.getBoundingClientRect().height,padding:s.padding,gap:s.gap,background:s.backgroundColor,shadow:s.boxShadow}];
      })), headings:[...document.querySelectorAll('h1,h2,h3')].map(e=>{const s=getComputedStyle(e);return {text:e.textContent,size:s.fontSize,lineHeight:s.lineHeight,weight:s.fontWeight,tracking:s.letterSpacing};}), failedImages:[...document.images].filter(e=>!e.naturalWidth).map(e=>e.src) }));
      for (const [section,selector] of Object.entries(sections)) {
        const filename = `${device}-${theme}-${label}-${section}.png`;
        await page.locator('.site-nav').evaluate((element, hidden) => { element.style.visibility = hidden ? 'hidden' : ''; }, section !== 'navigation');
        await page.locator(selector).screenshot({path:path.join(output,filename),animations:'disabled'});
      }
      await page.close();
    }
    for(const section of Object.keys(sections)) gallery.push(`<section><h2>${device} · ${theme} · ${section}</h2><div class="pair"><figure><figcaption>Live reference</figcaption><img src="${device}-${theme}-reference-${section}.png" /></figure><figure><figcaption>Local component library</figcaption><img src="${device}-${theme}-local-${section}.png" /></figure></div></section>`);
    await context.close();
  }
  await writeFile(path.join(output,'metrics.json'),JSON.stringify(metrics,null,2));
  await writeFile(path.join(output,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><title>Portfolio visual comparison</title><style>body{background:#eeeae0;color:#25231f;font:16px system-ui;margin:24px}h1{font-size:28px}section{border-top:2px solid;margin-top:32px;padding-top:16px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}figure{margin:0;min-width:0}figcaption{font-weight:700;margin-bottom:12px}img{display:block;width:100%;height:auto} @media(max-width:700px){body{margin:12px}.pair{gap:8px}}</style><h1>Live reference / local component library</h1><p>Matched viewport sizes and themes. Animations are disabled for reproducible captures. The light/dark Switch and visible dark shadows are intentional retained changes.</p>${gallery.join('')}</html>`);
  console.log(`Comparison saved to ${output}/index.html`);
  for (const [key, value] of Object.entries(metrics)) console.log(`${key}: overflow=${value.scrollWidth-value.width}px, missing images=${value.failedImages.length}`);
} finally { await browser.close(); }
