export const drawHPBar = (ctx, x, y, width, height, current, max, color) => {
  ctx.fillStyle = '#fff';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, (current / max) * width, height);
};

export const drawEndMessage = (ctx, canvasWidth, canvasHeight, message) => {
  ctx.fillStyle = '#fff';
  ctx.font = '40px Arial';
  ctx.fillText(message, canvasWidth / 2 - 100, canvasHeight / 2);
};