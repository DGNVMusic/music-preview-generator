const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { randomUUID } = require('crypto');

// Helpen: Calculate RMS of a buffer
const calculateRMS = (buffer) => {
    let sum = 0;
    // 16-bit PCM is 2 bytes per sample. Loop by 2.
    for (let i = 0; i < buffer.length; i += 2) {
        const sample = buffer.readInt16LE(i);
        sum += sample * sample;
    }
    return Math.sqrt(sum / (buffer.length / 2));
};

const findLoudestSegment = (filePath, segmentDuration = 30) => {
    return new Promise((resolve, reject) => {
        const pcmData = [];

        // 1. Stream file as raw PCM (8000Hz mono is enough for volume analysis)
        const command = ffmpeg(filePath)
            .format('s16le')
            .audioChannels(1)
            .audioFrequency(8000)
            .on('error', reject);

        const stream = command.pipe();

        stream.on('end', () => {
            const fullBuffer = Buffer.concat(pcmData);
            const sampleRate = 8000;
            const bytesPerSample = 2; // 16-bit PCM
            const bytesPerSecond = sampleRate * bytesPerSample;

            const windowSize = duration * bytesPerSecond;
            const stepSize = bytesPerSecond; // 1 second step
            let maxEnergy = 0;
            let bestStartTime = 0;

            // Sliding window analysis
            for (let i = 0; i <= fullBuffer.length - windowSize; i += stepSize) {
                const windowBuffer = fullBuffer.slice(i, i + windowSize);
                const energy = calculateRMS(windowBuffer);

                if (energy > maxEnergy) {
                    maxEnergy = energy;
                    bestStartTime = i / bytesPerSecond;
                }
            }
            resolve(bestStartTime);
        });
    });
};

const createPreview = async (inputPath, outputDir) => {
    const startTime = await findLoudestSegment(inputPath, 30);
    const outputPath = path.join(outputDir, `preview_${randomUUID()}.mp3`);

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .setStartTime(startTime)
            .setDuration(30)
            .audioBitrate('128')
            .toFormat('mp3')
            .on('end', () => resolve(outputPath))
            .on('error', reject)
            .save(outputPath);
    });
};

module.exports = { createPreview };