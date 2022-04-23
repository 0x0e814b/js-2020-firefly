const orbitState = {
  hz: 100,
  radius: 200,
  particleCount: 100
};

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

let wSize = getBodyRect();
canvas.width = wSize.width;
canvas.height = wSize.height;

document.body.appendChild(canvas);

const initialTime = performance.now();
let currentTime = 0;
const particles = [];

let imagedata = ctx.createImageData(wSize.width, wSize.height);
// 파티클 생성하는대신 이미지 데이터로 처리
let int32 = new Uint32Array(imagedata.data.buffer);


function particle() {
  const { hz, radius } = orbitState;
  const rand = [];
  rand.push(Math.random() * (radius / 2) + 1);
  rand.push(Math.random() * (radius / 2) + radius);

  this.orbitA = (rand.reduce((total, next) => total + next, 0) / rand.length);
  this.opacity = Math.floor((1 - ((this.orbitA) / radius)) * radius) + Math.floor(Math.random() * 80);

  this.position = {
    x: wSize.width / 2,
    y: wSize.height / 2 + this.orbitA
  };

  this.position = rotating(
    wSize.width / 2,
    wSize.height / 2,
    this.position.x,
    this.position.y,
    Math.PI * (Math.random() * 2)
  );
  this.originalPos = this.position;

  this.rotateSpeed = (Math.random() * .0005 + (this.opacity / 20000));

  this.waveSpeed = Math.random() * 0.01;
  this.waveSpeed2 = Math.random() * 0.01;

  this.wave = Math.sin(currentTime * this.waveSpeed) * hz;
  this.wave2 = Math.sin(currentTime * this.waveSpeed2) * hz;

  this.id = particles.length;
  particles.push(this);
};


function draw(particle) {
  const { hz, radius } = orbitState;
  const {
    originalPos: { x: originX, y: originY },
    position: { x: posX, y: posY },
    wave, waveSpeed, wave2, waveSpeed2,
    rotateSpeed, orbitA
  } = particle;

  const bufferPos =
    Math.floor(originY + wave) * wSize.width + Math.floor(originX + wave2);

  int32[bufferPos] =
    (0 << 24) | // red
    (155 < 16) | // blue
    (0 << 8) | // green
    0; // red;

  particle.wave = Math.sin(currentTime * waveSpeed) * hz;
  particle.wave2 = Math.sin(currentTime * waveSpeed2) * hz;

  particle.originalPos = rotating(
    wSize.width / 2, wSize.height / 2,
    posX, posY,
    rotateSpeed * currentTime
  );

  particle.opacity = Math.floor((1 - (orbitA / radius)) * radius) + Math.floor(Math.random() * 80);

  const nextBuffer =
    Math.floor(particle.originalPos.y + particle.wave) * wSize.width +
    Math.floor(particle.originalPos.x + particle.wave2);
  int32[
    nextBuffer
  ] =
    (particle.opacity << 24) |	// alpha
    (125 << 16) |	// blue
    (225 << 8) |	// green
    125;
}

function update(particle) {
  particle.position = rotating(
    wSize.width / 2,
    wSize.height / 2,
    wSize.width / 2,
    wSize.height / 2 + particle.orbitA,
    Math.PI * (Math.random() * 2)
  );
}

window.requestFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

function render() {
  let now = performance.now();
  currentTime = (now - initialTime) / 10;
  if (orbitState.particleCount >= particles.length) {
    for (let i = 0; i < orbitState.particleCount; i++) {
      new particle();
    }
  }

  for (var i = 0; i <= particles.length; i++) {
    if (particles[i]) {
      draw(particles[i]);
    }
  }
  ctx.putImageData(imagedata, 0, 0);
  requestFrame(render);
}

function rotating(cx, cy, x, y, rad) {

  const cosR = Math.cos(rad);
  const sinS = Math.sin(rad);

  const newX = (cosR * (x - cx)) + (sinS * (y - cy)) + cx;
  const newY = (cosR * (y - cy)) - (sinS * (x - cx)) + cy;

  return { x: newX, y: newY };
}

function resize() {
  wSize = getBodyRect();
  canvas.width = wSize.width;
  canvas.height = wSize.height;

  // update Buffer
  imagedata = ctx.createImageData(wSize.width, wSize.height);
  int32 = new Uint32Array(imagedata.data.buffer);

  // update Position
  for (var i = 0; i <= particles.length; i++) {
    if (particles[i]) {
      update(particles[i]);
    }
  }
}

function getBodyRect() {
  const { width, height } = document.body.getBoundingClientRect();
  return { width, height };
};


window.addEventListener('resize', resize);
render();