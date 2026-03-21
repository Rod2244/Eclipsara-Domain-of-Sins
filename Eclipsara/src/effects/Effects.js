// Effects.js - Utility functions for game effects

export const createParticles = (x, y, count = 5, color = '#fff') => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + Math.random() * 20 - 10,
      y: y + Math.random() * 20 - 10,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      life: 30,
      color,
    });
  }
  return particles;
};

export const updateParticles = (particles) => {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.dx;
    p.y += p.dy;
    p.life--;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
};

export const drawParticles = (ctx, particles) => {
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 30;
    ctx.fillRect(p.x, p.y, 2, 2);
    ctx.globalAlpha = 1;
  });
};

export const drawFireballTrail = (ctx, fireball, trail) => {
  trail.forEach((pos, index) => {
    const alpha = (index / trail.length) * 0.5;
    ctx.fillStyle = `rgba(255, 165, 0, ${alpha})`;
    ctx.fillRect(pos.x, pos.y, fireball.width * (index / trail.length), fireball.height * (index / trail.length));
  });
};