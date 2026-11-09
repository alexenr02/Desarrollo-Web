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
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

// Dial ground, minute track, and words. Indices and hands are real meshes.
export function paintDial(canvas, top, bottom, look) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  ctx.clearRect(0, 0, w, w);

  const gradient = ctx.createLinearGradient(0, 0, 0, w);
  gradient.addColorStop(0, '#' + top.getHexString());
  gradient.addColorStop(1, '#' + bottom.getHexString());
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, w);

  ctx.save();
  ctx.translate(w / 2, w / 2);
  ctx.strokeStyle = look.print;
  ctx.lineCap = 'butt';
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const inner = w * (i % 5 === 0 ? 0.405 : 0.432);
    const outer = w * 0.455;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    ctx.lineWidth = i % 5 === 0 ? 5 : 2;
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = look.print;
  ctx.textAlign = 'center';
  ctx.font = '600 64px Georgia, "Times New Roman", serif';
  ctx.fillText(look.title, w / 2, w * 0.34);
  ctx.font = '500 26px "Segoe UI", sans-serif';
  ctx.fillText(look.line, w / 2, w * 0.4);
  ctx.font = '500 22px "Segoe UI", sans-serif';
  ctx.fillText(look.foot, w / 2, w * 0.72);
}

export function paintDate(canvas) {
  const ctx = canvas.getContext('2d');
  const day = String(new Date().getDate());
  ctx.fillStyle = '#f7f4ee';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '600 64px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(day, canvas.width / 2, canvas.height / 2 + 2);
}
