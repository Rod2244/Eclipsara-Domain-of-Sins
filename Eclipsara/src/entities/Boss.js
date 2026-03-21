export const createBoss = (canvasWidth) => ({
  x: canvasWidth / 2 - 40,
  y: 50,
  width: 80,
  height: 80,
  speed: 2,
  dmg: 10,
  fireballs: [],
  fireballCooldown: 0,
  enraged: false,
  meleeRush: false,
  meleeTimer: 0,
  hitTimer: 0,
});