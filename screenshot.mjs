import { chromium } from 'playwright';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:5173';
const label = process.argv[3] || '';

const dir = './temporary screenshots';
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const existing = readdirSync(dir);
const nums = existing
  .map(f => f.match(/^screenshot-(\d+)/))
  .filter(Boolean)
  .map(m => parseInt(m[1]));
const next = nums.length ? Math.max(...nums) + 1 : 1;

const filename = label
  ? `screenshot-${next}-${label}.png`
  : `screenshot-${next}.png`;
const filepath = path.join(dir, filename);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.fonts.ready);
await page.screenshot({ path: filepath, fullPage: true });
await browser.close();

console.log(`Saved: ${filepath}`);
