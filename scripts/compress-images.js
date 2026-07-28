const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const DIRS = [
  path.join(__dirname, '../images/towari'),
  path.join(__dirname, '../images/products'),
  path.join(__dirname, '../images/uploads'),
];

let totalBefore = 0, totalAfter = 0;

async function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const filePath = path.join(dir, file);
    const statBefore = fs.statSync(filePath).size;
    totalBefore += statBefore;

    const tmpPath = filePath + '.tmp';
    try {
      if (ext === '.png') {
        await sharp(filePath)
          .png({ compressionLevel: 9, quality: 85 })
          .toFile(tmpPath);
      } else {
        await sharp(filePath)
          .jpeg({ quality: 80, progressive: true, mozjpeg: true })
          .toFile(tmpPath);
      }

      const statAfter = fs.statSync(tmpPath).size;

      if (statAfter < statBefore) {
        fs.renameSync(tmpPath, filePath);
        totalAfter += statAfter;
        const saved = Math.round((statBefore - statAfter) / 1024);
        console.log(`✅ ${file}: ${Math.round(statBefore/1024)}KB → ${Math.round(statAfter/1024)}KB (−${saved}KB)`);
      } else {
        fs.unlinkSync(tmpPath);
        totalAfter += statBefore;
        console.log(`⏭  ${file}: вже оптимальний`);
      }
    } catch (e) {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      totalAfter += statBefore;
      console.log(`⚠️  ${file}: помилка — ${e.message}`);
    }
  }
}

async function processAll() {
  for (const dir of DIRS) {
    console.log(`\n📁 ${path.basename(dir)}`);
    await processDir(dir);
  }

  const savedMB = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(2);
  const savedPct = Math.round((totalBefore - totalAfter) / totalBefore * 100);
  console.log(`\n📦 Всього: ${(totalBefore/1024/1024).toFixed(1)}MB → ${(totalAfter/1024/1024).toFixed(1)}MB (зекономлено ${savedMB}MB, ${savedPct}%)`);
}

processAll();
