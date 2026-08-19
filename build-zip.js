import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const DIST_DIR = path.resolve('dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');
const OUTPUT_ZIP = path.join(DIST_DIR, 'game.zip');
const MAX_BYTES = 13312; // 13 KiB limit for JS13k

if (!fs.existsSync(DIST_DIR) || !fs.existsSync(INDEX_HTML)) {
  console.error('Dist directory or index.html does not exist! Run vite build first.');
  process.exit(1);
}

// 1. Inline JS bundle into single index.html file to ensure file:// and offline double-click playback works
let htmlContent = fs.readFileSync(INDEX_HTML, 'utf-8');

if (fs.existsSync(ASSETS_DIR)) {
  const assetFiles = fs.readdirSync(ASSETS_DIR);
  const jsFile = assetFiles.find((f) => f.endsWith('.js'));

  if (jsFile) {
    const jsPath = path.join(ASSETS_DIR, jsFile);
    const jsCode = fs.readFileSync(jsPath, 'utf-8');

    // Replace module script tag with inlined plain script tag (runs on file:// protocol without CORS errors!)
    htmlContent = htmlContent.replace(
      /<script\s+type="module"[^>]*src="[^"]*"[^>]*><\/script>/gi,
      `<script>${jsCode}</script>`
    );

    // Save single-file inlined index.html
    fs.writeFileSync(INDEX_HTML, htmlContent, 'utf-8');
    console.log(`✨ Successfully inlined ${jsFile} into single-file dist/index.html`);
  }
}

// 2. Archive index.html into game.zip
const output = fs.createWriteStream(OUTPUT_ZIP);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

output.on('close', () => {
  const bytes = archive.pointer();
  const kb = (bytes / 1024).toFixed(2);
  const percentage = ((bytes / MAX_BYTES) * 100).toFixed(1);
  const remaining = MAX_BYTES - bytes;

  console.log('\n==================================================');
  console.log(`📦 JS13k Zip Package Generated: game.zip`);
  console.log(`📄 Contains Single File : index.html`);
  console.log(`📏 Total Zip Size       : ${bytes} Bytes (${kb} KiB)`);
  console.log(`🎯 Size Limit           : ${MAX_BYTES} Bytes (13.00 KiB)`);
  console.log(`📊 Budget Used          : ${percentage}%`);
  console.log(`💡 Remaining            : ${remaining} Bytes (${(remaining / 1024).toFixed(2)} KiB)`);

  if (bytes <= MAX_BYTES) {
    console.log(`✅ SUCCESS: Zip is within the 13KB limit & works instantly on file:// protocol!`);
  } else {
    console.log(`❌ WARNING: Zip exceeds 13KB limit by ${bytes - MAX_BYTES} bytes!`);
  }
  console.log('==================================================\n');
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.file(INDEX_HTML, { name: 'index.html' });
archive.finalize();
