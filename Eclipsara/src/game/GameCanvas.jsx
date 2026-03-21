import React, { useEffect, useRef, useState } from 'react';
import { createPlayer } from '../entities/Player';
import { createBoss } from '../entities/Boss';
import { setupInput } from '../systems/Input';
import { checkCollision } from '../systems/collision';
import { drawHPBar, drawEndMessage } from '../ui/HPBars';
import { createParticles, updateParticles, drawParticles, drawFireballTrail } from '../effects/Effects';
import slashImage from '../assets/SlashingAsset.png';

const GameCanvas = ({ width = 800, height = 600 }) => {
  const canvasRef = useRef(null);
  const [bossHP, setBossHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const slashImageRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = slashImage;
    img.onload = () => {
      slashImageRef.current = img;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const player = createPlayer(width, height);
    const boss = createBoss(width);
    const keys = {};
    const cleanupInput = setupInput(keys, player, pausedRef);

    let frameCount = 0;
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (!pausedRef.current) {
        frameCount++;

        // ---------------- Player Movement ----------------
        if (keys['w']) player.y -= player.speed;
        if (keys['s']) player.y += player.speed;
        if (keys['a']) player.x -= player.speed;
        if (keys['d']) player.x += player.speed;
        player.x = Math.max(0, Math.min(width - player.width, player.x));
        player.y = Math.max(0, Math.min(height - player.height, player.y));

        // ---------------- Player Attack ----------------
        if (player.attack.active) {
          const atk = player.attack;

          if (checkCollision(atk, boss)) {
            setBossHP(prev => Math.max(0, prev - atk.dmg));
            boss.hitTimer = 10;
            player.attack.active = false;
          }
        }

        // ---------------- Boss AI ----------------
        if (!boss.enraged && bossHP <= 50) {
          boss.enraged = true;
          boss.speed *= 1.5;
          boss.fireballCooldown = 60;
        }

        if (bossHP > 0) {
          // Melee rush every 300 frames
          if (!boss.meleeRush && frameCount % 300 === 0) {
            boss.meleeRush = true;
            boss.meleeTimer = 60;
          }

          let moveSpeed = boss.meleeRush ? boss.speed * 3 : boss.speed;
          if (boss.x + boss.width / 2 < player.x + player.width / 2) boss.x += moveSpeed;
          if (boss.x + boss.width / 2 > player.x + player.width / 2) boss.x -= moveSpeed;
          if (boss.y + boss.height / 2 < player.y + player.height / 2) boss.y += moveSpeed;
          if (boss.y + boss.height / 2 > player.y + player.height / 2) boss.y -= moveSpeed;

          if (boss.meleeRush) {
            boss.meleeTimer--;
            if (boss.meleeTimer <= 0) boss.meleeRush = false;
          }

          // Boss melee collision
          if (checkCollision(boss, player)) {
            setPlayerHP(prev => Math.max(0, prev - boss.dmg));
          }

          // ---------------- Fireball ----------------
          if (boss.fireballCooldown <= 0) {
            for (let i = -1; i <= 1; i++) {
              const dx = player.x + player.width / 2 - (boss.x + boss.width / 2) + i * 30;
              const dy = player.y + player.height / 2 - (boss.y + boss.height / 2);
              const dist = Math.sqrt(dx*dx + dy*dy);
              const speed = 4;
              boss.fireballs.push({
                x: boss.x + boss.width / 2,
                y: boss.y + boss.height / 2,
                dx: (dx/dist)*speed,
                dy: (dy/dist)*speed,
                width: 10,
                height: 10,
                dmg: 5
              });
            }
            boss.fireballCooldown = boss.enraged ? 60 : 90;
          } else boss.fireballCooldown--;

          // Move fireballs
          for (let i = boss.fireballs.length - 1; i >= 0; i--) {
            const f = boss.fireballs[i];
            f.x += f.dx;
            f.y += f.dy;

            if (checkCollision(f, player)) {
              setPlayerHP(prev => Math.max(0, prev - f.dmg));
              boss.fireballs.splice(i, 1);
              continue;
            }

            if (f.x < 0 || f.x > width || f.y < 0 || f.y > height) {
              boss.fireballs.splice(i, 1);
            }
          }
        }
      }

      // ---------------- Draw Player ----------------
      ctx.fillStyle = '#00f';
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // ---------------- Draw Player Attack ----------------
      if (player.attack.active && slashImageRef.current) {
        // const angle = Math.atan2(boss.y + boss.height / 2 - (player.y + player.height / 2), boss.x + boss.width / 2 - (player.x + player.width / 2));
        // ctx.save();
        // ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        // ctx.rotate(angle);
        // ctx.drawImage(slashImageRef.current, -slashImageRef.current.width / 2, -slashImageRef.current.height / 2);
        // ctx.restore();
        ctx.drawImage(slashImageRef.current, player.x + player.width, player.y, 100, 100); // temporary to test
      }

      // ---------------- Draw Boss ----------------
      ctx.fillStyle = boss.enraged ? '#ffa500' : '#f00';
      ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

      // ---------------- Draw Fireballs ----------------
      for (let f of boss.fireballs) {
        ctx.fillStyle = '#ffa500';
        ctx.fillRect(f.x, f.y, f.width, f.height);
      }

      // ---------------- Draw HP Bars ----------------
      drawHPBar(ctx, boss.x, boss.y - 10, boss.width, 5, bossHP, 100, '#0f0');
      drawHPBar(ctx, 20, height - 30, 200, 20, playerHP, 100, '#f00');

      // ---------------- Win / Lose ----------------
      if (bossHP <= 0) drawEndMessage(ctx, width, height, 'Victory!');
      else if (playerHP <= 0) drawEndMessage(ctx, width, height, 'Defeated!');
      else animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      cleanupInput();
    };
  }, [bossHP, playerHP, width, height]);

  return (
    <>
      <canvas ref={canvasRef} width={width} height={height} />
      <button
        onClick={() => {
          pausedRef.current = true;
          setPaused(true);
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '5px 10px',
          fontSize: '14px',
          cursor: 'pointer',
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          zIndex: 5
        }}
      >
        Menu
      </button>
      {paused && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
          }}>
            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: '48px',
              marginBottom: '20px',
              color: '#333'
            }}>Eclipsara</h1>
            <div>
              <button
                onClick={() => {
                  pausedRef.current = false;
                  setPaused(false);
                }}
                style={{
                  margin: '10px',
                  padding: '10px 20px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px'
                }}
              >
                Resume
              </button>
              <button
                onClick={() => {
                  setBossHP(100);
                  setPlayerHP(100);
                  pausedRef.current = false;
                  setPaused(false);
                }}
                style={{
                  margin: '10px',
                  padding: '10px 20px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px'
                }}
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameCanvas;