const fs = require('fs');
const path = require('path');

function createBeep(freq1, freq2, durationSec) {
  const sampleRate = 8000;
  const numSamples = Math.floor(durationSec * sampleRate);
  const buffer = Buffer.alloc(44 + numSamples);
  
  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples, 4);
  buffer.write('WAVE', 8);
  
  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
  buffer.writeUInt16LE(1, 22); // NumChannels (1)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 1, 28); // ByteRate
  buffer.writeUInt16LE(1, 32); // BlockAlign
  buffer.writeUInt16LE(8, 34); // BitsPerSample
  
  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples, 40);
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = t < durationSec / 2 ? freq1 : freq2;
    const sample = Math.sin(2 * Math.PI * freq * t) * 127 + 128;
    buffer.writeUInt8(Math.floor(sample), 44 + i);
  }
  
  return 'data:audio/wav;base64,' + buffer.toString('base64');
}

const sounds = {
  success: createBeep(523.25, 659.25, 0.3), // C5 to E5
  error: createBeep(300, 200, 0.4),
  approval: createBeep(440, 880, 0.3),
  lead: createBeep(600, 600, 0.2),
  notification: createBeep(400, 500, 0.2)
};

const fileContent = `// Auto-generated synthetic sounds
export const SOUNDS = ${JSON.stringify(sounds, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'client', 'src', 'utils', 'sounds.js'), fileContent);
console.log("Sounds generated in client/src/utils/sounds.js");
