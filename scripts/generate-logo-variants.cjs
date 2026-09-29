// Rebuild the standalone SVG collection from the app's current colour presets.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'resources', 'logos');
const themes = fs.readFileSync(path.join(root, 'src/app/core/settings/theme-colours.ts'), 'utf8');
const appearances = fs.readFileSync(path.join(root, 'src/app/core/settings/appearance-modes.ts'), 'utf8');
const presets = [...themes.matchAll(/^  (\w+): \{([\s\S]*?)^  \},/gm)];
const value = (body, key) => {
  const match = body.match(new RegExp(`\\b${key}: '(#[a-fA-F0-9]{6})'`));
  if (!match) throw new Error(`Missing colour: ${key}`);
  return match[1];
};
const modes = [...appearances.matchAll(/^  (\w+): \{/gm)].map(([, name]) => name);
const ink = '#ffffff';
const accent = '#2a2d32';

// Hand-drawn cubic curves preserve the original slanted RR and sweeping road.
// Counters and the separation between the letters are genuinely transparent.
const rear = 'M134 135H389C456 135 495 174 495 231C495 247 489 262 483 272H428L399 323C381 341 358 354 334 362L377 420L326 526L229 361L166 526H50L181 218H279L248 305H287C345 305 379 283 379 240C379 218 365 208 339 208H203Z';
const front = 'M432 278H567C619 278 650 301 650 342C650 390 612 420 543 430C595 498 636 569 720 600C634 589 578 577 547 559C519 542 509 497 488 460C479 445 470 438 461 435L419 536H328L432 333H504L481 390H514C549 390 569 379 569 350C569 336 560 329 544 329H403Z';
const road = 'M463 429C513 427 536 447 557 474C610 542 650 578 710 596C635 586 581 574 551 555C526 539 516 502 496 469C483 447 474 439 461 435Z';
const dashes = 'M503 446H513C521 455 528 465 535 476H526C518 465 511 455 503 446ZM541 499H552C563 515 574 529 586 540H573C561 527 550 513 541 499Z';
function svg(label, ink, accent) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="760" height="760" viewBox="0 0 760 760" fill="none" role="img" aria-labelledby="logo-title logo-description">
  <title id="logo-title">Rave Route — ${label}</title>
  <desc id="logo-description">Two overlapping italic R letters with a curved road extending from the front letter. Transparent background.</desc>
  <path id="rear-r" fill="${ink}" d="${rear}"/>
  <path id="front-r" fill="${ink}" d="${front}"/>
  <path id="road" fill="${accent}" d="${road}"/>
  <path id="road-markings" fill="${ink}" d="${dashes}"/>
</svg>
`;
}
fs.mkdirSync(output, { recursive: true });
const variants = [{ name: 'rave-route-logo-cleaned', label: 'Cleaned master', background: value(presets.find(([, theme]) => theme === 'red')[2], 'primary') }];
for (const [, theme, body] of presets) {
  for (const mode of modes) {
    variants.push({ name: `rave-route-logo-${theme}-${mode}`, label: `${theme} / ${mode}`, background: value(body, 'primary') });
  }
}
for (const variant of variants) fs.writeFileSync(path.join(output, `${variant.name}.svg`), svg(variant.label, ink, accent));
const cards = variants.map(v => `<article style="background:${v.background};color:${ink}"><img src="${v.name}.svg" alt="${v.label}"><h2>${v.label}</h2><a href="${v.name}.svg" download>Download SVG</a></article>`).join('\n');
fs.writeFileSync(path.join(output, 'preview.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Rave Route logo collection</title><style>body{margin:0;padding:32px;background:#e8ebef;color:#242830;font:16px system-ui}h1{margin:0 0 8px}p{margin:0 0 28px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}article{border-radius:16px;padding:20px;text-align:center}img{display:block;width:100%;max-height:300px}h2{font-size:16px;text-transform:capitalize}a{color:inherit;font-size:14px}</style><h1>Rave Route</h1><p>Cleaned original and all five themes in light and dark. Every SVG has a transparent background.</p><main>${cards}</main></html>`);
fs.writeFileSync(path.join(output, 'README.md'), `# Rave Route SVG collection\n\nAll 11 logos use white (#ffffff) RR lettering and lane markings with a charcoal (#2a2d32) road, designed for the app's coloured headers and launch screen. Theme colour comes from the surface behind the transparent logo.\n\n- rave-route-logo-cleaned.svg: cleaned master.\n- rave-route-logo-{red,blue,green,purple,pink}-{light,dark}.svg: matching filenames for the app's reactive theme selection. All use the same white and charcoal treatment in both appearances.\n\nThe original rough source was removed. All files are standalone, transparent, font-independent SVGs with the same square viewBox and four editable paths. Preview backgrounds show the actual theme primary colours and are not part of the SVGs.\n\nRegenerate from the repository root with: node scripts/generate-logo-variants.cjs\nAdd --preview to also render logo-collection.png using sharp.\n`);
console.log(`Generated ${variants.length} SVG files in ${output}`);

if (process.argv.includes('--preview')) {
  const sharp = require('sharp');
  (async () => {
    const tiles = await Promise.all(variants.map(async (variant, index) => {
      const file = path.join(output, `${variant.name}.svg`);
      const { data } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      if (data[3] !== 0) throw new Error(`Opaque background: ${file}`);
      const logo = await sharp(file).resize(300, 300).png().toBuffer();
      const label = Buffer.from(`<svg width="320" height="40"><text x="160" y="25" text-anchor="middle" font-family="Arial" font-size="17" fill="white">${variant.label}</text></svg>`);
      const tile = await sharp({ create: { width: 320, height: 350, channels: 4, background: variant.background } })
        .composite([{ input: logo, left: 10, top: 0 }, { input: label, left: 0, top: 300 }]).png().toBuffer();
      return { input: tile, left: (index % 3) * 320, top: Math.floor(index / 3) * 350 };
    }));
    const preview = await sharp({ create: { width: 960, height: Math.ceil(variants.length / 3) * 350, channels: 4, background: '#e8ebef' } })
      .composite(tiles).png().toBuffer();
    fs.writeFileSync(path.join(output, 'logo-collection.png'), preview);
    console.log(`Rendered and verified transparency for all ${variants.length} SVGs.`);
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
