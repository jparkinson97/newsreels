import { useState } from 'react';
import { SHADER_TYPES } from './ShaderOverlay';
import './ControlPanel.css';

export default function ControlPanel({
  shaderEnabled,
  setShaderEnabled,
  currentShader,
  setCurrentShader,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`control-panel ${isOpen ? 'open' : ''}`}>
      <button
        className="control-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle controls"
      >
        {isOpen ? '×' : '⚙'}
      </button>

      {isOpen && (
        <div className="control-content">
          <h3>Visual Effects</h3>

          <div className="control-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={shaderEnabled}
                onChange={(e) => setShaderEnabled(e.target.checked)}
              />
              <span className="toggle-switch"></span>
              Enable Shaders
            </label>
          </div>

          {shaderEnabled && (
            <div className="control-group">
              <label>Shader Type</label>
              <div className="shader-options">
                {SHADER_TYPES.map((type) => (
                  <button
                    key={type}
                    className={`shader-btn ${currentShader === type ? 'active' : ''}`}
                    onClick={() => setCurrentShader(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="control-info">
            <p>Keyboard shortcuts:</p>
            <ul>
              <li><kbd>↑</kbd> / <kbd>k</kbd> Previous video</li>
              <li><kbd>↓</kbd> / <kbd>j</kbd> Next video</li>
              <li>Click to play/pause</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
