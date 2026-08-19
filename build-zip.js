import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const DIST_DIR = path.resolve('dist');
const OUTPUT_ZIP = path.resolve('dist', 'game.zip');
const MAX_BYTES = 13312; // 13 KiB limit for JS13k

if (!fs.existsSync(DIST_DIR)) {
  console.error('Dist directory does not exist! Run vite build first.');
  process.exit(1);
}

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
  console.log(`📏 Total Zip Size : ${bytes} Bytes (${kb} KiB)`);
  console.log(`🎯 Size Limit     : ${MAX_BYTES} Bytes (13.00 KiB)`);
  console.log(`📊 Budget Used    : ${percentage}%`);
  console.log(`💡 Remaining      : ${remaining} Bytes (${(remaining / 1024).toFixed(2)} KiB)`);

  if (bytes <= MAX_BYTES) {
    console.log(`✅ SUCCESS: Zip is within the 13KB limit!`);
  } else {
    console.log(`❌ WARNING: Zip exceeds 13KB limit by ${bytes - MAX_BYTES} bytes!`);
  }
  console.log('==================================================\n');
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add all files from dist except game.zip itself
const files = fs.readdirSync(DIST_DIR);
files.forEach((file) => {
  if (file !== 'game.zip') {
    const filePath = path.join(DIST_DIR, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      archive.directory(filePath, file);
    } else {
      archive.file(filePath, { name: file });
    }
  }
});

archive.finalize();
