// Generate reusable web icon variants from the approved launcher icon.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'resources', 'icon.png');
const publicRoot = path.join(root, 'public');
const iconRoot = path.join(publicRoot, 'icons', 'themes');
const themesSource = fs.readFileSync(path.join(root, 'src/app/core/settings/theme-colours.ts'), 'utf8');
const themes = [...themesSource.matchAll(/^  (\w+): \{([\s\S]*?)^  \},/gm)].map(([, name, body]) => ({
  name,
  primary: body.match(/\bprimary: '(#[a-fA-F0-9]{6})'/)[1],
}));
const sizes = [64, 72, 96, 128, 144, 152, 180, 192, 384, 512];

function hexToRgb(hex) {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

async function recolour(sourceBuffer, targetHex) {
  const target = hexToRgb(targetHex);
  const { data, info } = await sharp(sourceBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  // Preserve the current icon's highlights and shadows while replacing its red palette.
  for (let index = 0; index < data.length; index += info.channels) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    if (red > green * 1.18 && red > blue * 1.18) {
      const luminance = Math.min(1, (red * 0.7 + green * 0.2 + blue * 0.1) / 255);
      data[index] = Math.round(target[0] * luminance);
      data[index + 1] = Math.round(target[1] * luminance);
      data[index + 2] = Math.round(target[2] * luminance);
    }
  }

  return sharp(data, { raw: info }).png().toBuffer();
}

function manifest(theme, primary) {
  return `${JSON.stringify({
    name: 'Rave Route',
    short_name: 'Rave Route',
    description: 'Plan your festival route, lineup and budget with Rave Route.',
    theme_color: primary,
    background_color: primary,
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/home',
    icons: [72, 96, 128, 144, 152, 192, 384, 512].map((size) => ({
      src: `icons/themes/${theme}/icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: 'maskable any',
    })),
  }, null, 2)}\n`;
}

(async () => {
  const sourceBuffer = await fs.promises.readFile(source);
  for (const { name, primary } of themes) {
    const output = path.join(iconRoot, name);
    await fs.promises.mkdir(output, { recursive: true });
    const variant = await recolour(sourceBuffer, primary);
    for (const size of sizes) {
      await sharp(variant).resize(size, size).png().toFile(path.join(output, `icon-${size}x${size}.png`));
    }
    const manifestContent = manifest(name, primary);
    await fs.promises.writeFile(path.join(publicRoot, `manifest-${name}.webmanifest`), manifestContent);
    if (name === 'red') {
      await fs.promises.writeFile(path.join(publicRoot, 'manifest.webmanifest'), manifestContent);
    }
  }
  console.log(`Generated ${themes.length} theme icon sets (${sizes.length} sizes each).`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
