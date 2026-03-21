import React from 'react';
import GameCanvas from './game/GameCanvas';

function App() {
  return (
    <div style={{ position: 'relative' }}>
      <h1 style={{ textAlign: 'center', marginTop: '10px' }}>Eclipsara: Wrath Phase 1</h1>
      <GameCanvas />
    </div>
  );
}

export default App;