import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const allowedDir = 'drive-download-20260825T163118Z-1-001/ภาพการรายงานท่อ';

// Get first image from flooded directory
const floodedDir = join(allowedDir, 'NZC - ขังน้ำ');
const files = readdirSync(floodedDir).filter(f => f.endsWith('.jpg'));
const testFile = files[0];

if (!testFile) {
  console.error('No test images found');
  process.exit(1);
}

const imagePath = join(floodedDir, testFile);
console.log(`Testing image: ${imagePath}`);

const imageBytes = readFileSync(imagePath);
const base64 = imageBytes.toString('base64');

const response = await fetch('http://localhost:8787/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-58d602cfdc3ca98a-cm4k9w-fc61cfab',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'openrouter/minimax/minimax-m3:free',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this pipe photo. Respond with JSON: {"valid": boolean, "water_state": "flooded"|"dry"|"not-applicable", "confidence": 0-1, "reason": "short Thai reason"}'
          },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64}` }
          }
        ]
      }
    ],
    max_tokens: 200
  })
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));
