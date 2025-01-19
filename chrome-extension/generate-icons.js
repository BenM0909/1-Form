const fs = require('fs');

function generateIcon(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#3498db';
  ctx.fillRect(0, 0, size, size);

  // Draw text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size / 2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('1F', size / 2, size / 2);

  // Convert to base64
  const base64 = canvas.toDataURL().split(',')[1];

  // Save to file
  fs.writeFileSync(`icon${size}.png`, Buffer.from(base64, 'base64'));
}

[16, 48, 128].forEach(generateIcon);
console.log('Icons generated successfully!');

