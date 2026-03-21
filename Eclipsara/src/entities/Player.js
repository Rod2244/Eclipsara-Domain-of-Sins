export const createPlayer = (canvasWidth, canvasHeight) => ({
  x: canvasWidth / 2 - 25,
  y: canvasHeight - 60,
  width: 50,
  height: 50,
  speed: 5,
  attack: { active: false, width: 20, height: 50, dmg: 10 },
  cooldown: false,
});