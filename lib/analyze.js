const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const mm = require('music-metadata');
const path = require('path');
const os = require('os');
const fs = require('fs');

function runFfprobeDuration(filePath) {
  return mm.parseFile(filePath).then(meta => {
    const d = meta.format.duration;
    if (!d) throw new Error('Unable to determine duration');
    return d;
  });
}

function analyzeSegmentMeanVolume(input, startSec, durationSec) {
  return new Promise((resolve, reject) => {
    const args = [
      '-ss', String(startSec),
      '-t', String(durationSec),
      '-i', input,
      '-af', 'volumedetect',
      '-f', 'null',
      '-'
    ];

    const p = spawn(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    p.stderr.on('data', b => stderr += b.toString());
    p.on('error', reject);
    p.on('close', code => {
      const m = stderr.match(/mean_volume:\s*(-?[0-9]+\.?[0-9]*)/);
      if (m) {
        resolve(parseFloat(m[1]));
      } else {
        // If volumedetect wasn't present or failed, fallback to -inf
        resolve(-999);
      }
    });
  });
}

async function findBestPreview(inputPath, windowSec = 30, stepSec = 10) {
  const duration = await runFfprobeDuration(inputPath);
  const maxStart = Math.max(0, Math.floor(duration - windowSec));
  let best = { start: 0, score: -Infinity };

  for (let s = 0; s <= maxStart; s += stepSec) {
    // eslint-disable-next-line no-await-in-loop
    const score = await analyzeSegmentMeanVolume(inputPath, s, windowSec);
    if (score > best.score) best = { start: s, score };
  }

  // Create preview file
  const outDir = os.tmpdir();
  const outName = `preview_${Date.now()}.mp3`;
  const outPath = path.join(outDir, outName);

  await new Promise((resolve, reject) => {
    const args = [
      '-ss', String(best.start),
      '-t', String(windowSec),
      '-i', inputPath,
      '-c:a', 'libmp3lame',
      '-b:a', '192k',
      outPath
    ];
    const p = spawn(ffmpegPath, args, { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('error', reject);
    p.on('close', code => {
      if (code === 0 && fs.existsSync(outPath)) resolve();
      else reject(new Error('Failed to create preview'));
    });
  });

  return outPath;
}

module.exports = { findBestPreview };
