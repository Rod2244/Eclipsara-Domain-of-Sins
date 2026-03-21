export const setupInput = (keys, player, pausedRef) => {
  const handleKeyDown = (e) => {
    if (pausedRef.current) return;

    keys[e.key.toLowerCase()] = true;

    if (e.key === ' ' && !player.attack.active && !player.cooldown) {
      player.attack.active = true;
      player.attack.x = player.x + player.width;
      player.attack.y = player.y;

      player.cooldown = true;
      setTimeout(() => { player.cooldown = false; }, 500);
      setTimeout(() => { player.attack.active = false; }, 200);
    }
  };

  const handleKeyUp = (e) => {
    if (pausedRef.current) return;
    keys[e.key.toLowerCase()] = false;
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
};