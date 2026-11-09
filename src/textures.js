import * as THREE from 'three';

// Fine horizontal grain used as a normal map on brushed metal.
export function brushedNormalTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    const grain = (Math.random() - 0.5) * 46;
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n = 128 + grain + (Math.random() - 0.5) * 10;
      image.data[i] = 128;
      image.data[i + 1] = n;
      image.data[i + 2] = 255;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 18);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

// Fine horizontal lines. Multiplied by the metal color so the grain stays visible.
export function brushedStreakTexture() {
  const width = 64;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    const stripe = y % 3 === 0 ? 145 : 198 + (y % 5) * 2;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const n = stripe + (Math.random() - 0.5) * 12;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = Math.max(0, Math.min(255, n));
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 28);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Horizontal streaks. Multiplied by the metal roughness so polished stays even.
export function brushedRoughnessTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    const band = 232 + Math.sin(y * 0.85) * 18 + (Math.random() - 0.5) * 10;
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n = Math.max(0, Math.min(255, band + (Math.random() - 0.5) * 8));
      image.data[i] = image.data[i + 1] = image.data[i + 2] = n;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 10);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

// Printed dial. Indices and hands stay real meshes so they catch the light.
// The canvas is 2048px; keep new strokes proportional to `w` so they stay sharp.
export function paintDial(canvas, top, bottom, look) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const c = w / 2;
  ctx.clearRect(0, 0, w, w);

  const gradient = ctx.createLinearGradient(0, 0, 0, w);
  gradient.addColorStop(0, '#' + top.getHexString());
  gradient.addColorStop(1, '#' + bottom.getHexString());
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, w);

  // Sunburst on plain dials. The gridded dial stays an even field of squares.
  if (look.pattern !== 'grid') {
    ctx.save();
    ctx.translate(c, c);
    ctx.globalCompositeOperation = 'soft-light';
    const rays = 160;
    for (let i = 0; i < rays; i++) {
      ctx.rotate((Math.PI * 2) / rays);
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
      ctx.fillRect(-w * 0.0014, 0, w * 0.0028, c);
    }
    ctx.restore();
  }

  const vignette = ctx.createRadialGradient(c, c, c * 0.42, c, c, c * 0.72);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = vignette;
  ctx.beginPath();
  ctx.arc(c, c, c, 0, Math.PI * 2);
  ctx.fill();

  const grid = look.pattern === 'grid';
  ctx.save();
  ctx.translate(c, c);
  ctx.strokeStyle = look.print;
  ctx.lineCap = 'butt';
  ctx.lineWidth = w * 0.0014;
  ctx.beginPath();
  ctx.arc(0, 0, w * (grid ? 0.455 : 0.462), 0, Math.PI * 2);
  ctx.stroke();
  if (!grid) {
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.398, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const major = i % 5 === 0;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const tx = -dy;
    const ty = dx;
    const outer = w * (grid ? 0.45 : 0.458);
    const inner = w * (grid ? (major ? 0.42 : 0.436) : (major ? 0.404 : 0.44));
    ctx.lineWidth = major ? w * (grid ? 0.0022 : 0.0034) : w * 0.00135;
    // Five-minute marks are a railroad pair, the way a printed dial is engraved.
    const offsets = !grid && major ? [-w * 0.0042, w * 0.0042] : [0];
    for (const off of offsets) {
      ctx.beginPath();
      ctx.moveTo(dx * inner + tx * off, dy * inner + ty * off);
      ctx.lineTo(dx * outer + tx * off, dy * outer + ty * off);
      ctx.stroke();
    }
  }
  ctx.restore();

  if (look.pattern === 'grid') {
    ctx.save();
    ctx.translate(c, c);
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.4, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = Math.max(1, w * 0.001);
    const step = w * 0.024;
    for (let p = -w * 0.4; p <= w * 0.4; p += step) {
      ctx.beginPath();
      ctx.moveTo(p, -w * 0.4);
      ctx.lineTo(p, w * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-w * 0.4, p);
      ctx.lineTo(w * 0.4, p);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.fillStyle = look.print;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawTracked(ctx, look.title, c, w * (grid ? 0.3 : 0.325), w * (grid ? 0.03 : 0.052), '600', 'Georgia, "Times New Roman", serif', grid ? 0.16 : 0.22);
  drawTracked(ctx, look.line, c, w * (grid ? 0.34 : 0.385), w * (grid ? 0.014 : 0.02), '500', '"Segoe UI", sans-serif', 0.34);
  drawTracked(ctx, look.foot, c, w * (grid ? 0.63 : 0.7), w * (grid ? 0.014 : 0.018), '500', '"Segoe UI", sans-serif', 0.42);
}

function drawTracked(ctx, text, x, y, size, weight, family, trackingEm) {
  ctx.font = `${weight} ${size}px ${family}`;
  const gap = size * trackingEm;
  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, text.length - 1);
  let cursor = x - total / 2;
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], cursor + widths[i] / 2, y);
    cursor += widths[i] + gap;
  }
}

export function paintDate(canvas) {
  const ctx = canvas.getContext('2d');
  const day = String(new Date().getDate());
  ctx.fillStyle = '#f7f4ee';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1a1a1a';
  ctx.font = `600 ${Math.round(canvas.height * 0.62)}px "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(day, canvas.width / 2, canvas.height / 2 + canvas.height * 0.02);
}
