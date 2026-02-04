import { useState } from 'react';
import VideoFeed from './components/VideoFeed';
import ShaderOverlay from './components/ShaderOverlay';
import ControlPanel from './components/ControlPanel';
import './App.css';

function App() {
  const [shaderEnabled, setShaderEnabled] = useState(true);
  const [currentShader, setCurrentShader] = useState('fbm-border');

  return (
    <div className="app">
      {/* Shader background - renders behind video */}
      <ShaderOverlay
        shaderType={currentShader}
        enabled={shaderEnabled}
      />

      <VideoFeed shaderEnabled={shaderEnabled} />

      <ControlPanel
        shaderEnabled={shaderEnabled}
        setShaderEnabled={setShaderEnabled}
        currentShader={currentShader}
        setCurrentShader={setCurrentShader}
      />

      <header className="app-header">
        <h1 className="app-title">NewsReels</h1>
      </header>
    </div>
  );
}

export default App;
