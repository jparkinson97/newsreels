import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import './ShaderOverlay.css';

// Vertex shader shared by all effects
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Your custom FBM shader from Background.glsl - full screen background
const fbmBackgroundShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 3; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 st = vUv;
    float aspect = uResolution.x / uResolution.y;
    st.x *= aspect;
    st *= 0.6;

    float time = uTime;

    vec2 q = vec2(0.0);
    q.x = fbm(st + 0.02 * time);
    q.y = fbm(st + vec2(1.0));

    vec2 r = vec2(0.0);
    r.x = fbm(st + 0.6 * q + vec2(1.7, 9.2) + 0.08 * time);
    r.y = fbm(st + 0.6 * q + vec2(8.3, 2.8) + 0.06 * time);

    float f = fbm(st + r);
    float height = smoothstep(0.2, 1.0, f);
    height = height * height;

    vec3 colDeep = vec3(0.0, 0.1, 0.2);
    vec3 colBlue = vec3(0.0, 0.4, 0.6);
    vec3 colGold = vec3(1.0, 0.75, 0.2);
    vec3 colRed  = vec3(1.0, 0.1, 0.1);

    vec3 color = vec3(0.0);

    float t1 = smoothstep(0.0, 0.4, height);
    color = mix(colDeep, colBlue, t1);

    float t2 = smoothstep(0.3, 0.7, height);
    color = mix(color, colGold, t2);

    float t3 = smoothstep(0.6, 1.0, height);
    color = mix(color, colRed, t3);

    float valOffset = fbm(st + r + vec2(0.01));
    float slope = (f - valOffset) * 10.0;
    float specular = clamp(slope, 0.0, 1.0);
    color += vec3(1.0, 0.9, 0.8) * specular * 0.3 * height;

    float grain = (random(st + time * 0.1) - 0.5) * 0.08;
    color += grain * sqrt(height);

    // Vignette from original shader
    float vignette = 1.0 - smoothstep(0.5, 1.5, length(vUv - 0.5) * 1.5);
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// Custom shader material
const ShaderPlane = ({ shaderType = 'fbm-border' }) => {
  const materialRef = useRef();
  const { size, viewport } = useThree();

  const uniforms = useRef({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  });

  // Update resolution on resize
  useEffect(() => {
    uniforms.current.uResolution.value.set(size.width, size.height);
  }, [size]);

  useFrame((state) => {
    if (materialRef.current) {
      uniforms.current.uTime.value = state.clock.getElapsedTime();
    }
  });

  const shaders = {
    'fbm-border': {
      vertexShader,
      fragmentShader: fbmBackgroundShader,
    },
    vignette: {
      vertexShader,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        varying vec2 vUv;

        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          float vignette = smoothstep(0.8, 0.2, dist);
          float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
          float edgeGlow = smoothstep(0.4, 0.8, dist) * pulse * 0.3;
          vec3 color = mix(vec3(0.0), vec3(0.1, 0.15, 0.3), edgeGlow);
          float alpha = (1.0 - vignette) * 0.6 + edgeGlow;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    },
    scanlines: {
      vertexShader,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        varying vec2 vUv;

        void main() {
          float scanline = sin(vUv.y * uResolution.y * 0.5 + uTime * 2.0) * 0.5 + 0.5;
          float alpha = scanline * 0.08;
          float scanBar = smoothstep(0.0, 0.02, abs(vUv.y - fract(uTime * 0.1)));
          alpha += (1.0 - scanBar) * 0.15;
          gl_FragColor = vec4(vec3(1.0), alpha);
        }
      `,
    },
    chromatic: {
      vertexShader,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          vec2 center = vec2(0.5);
          vec2 dir = vUv - center;
          float dist = length(dir);
          float aberration = smoothstep(0.3, 0.8, dist);
          vec3 color = vec3(0.0);
          color.r = aberration * 0.3;
          color.b = aberration * 0.3;
          float alpha = aberration * 0.2;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    },
    glitch: {
      vertexShader,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;

        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        void main() {
          float blockSize = 0.05;
          vec2 block = floor(vUv / blockSize);
          float noise = random(block + floor(uTime * 10.0));
          float glitchChance = step(0.97, noise);
          vec3 color = vec3(random(block), 0.0, random(block + 1.0));
          float alpha = glitchChance * 0.5;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    },
  };

  const selectedShader = shaders[shaderType] || shaders['fbm-border'];

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={selectedShader.vertexShader}
        fragmentShader={selectedShader.fragmentShader}
        uniforms={uniforms.current}
        transparent={true}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

export default function ShaderOverlay({ shaderType = 'fbm-border', enabled = true }) {
  if (!enabled) return null;

  return (
    <div className="shader-overlay">
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 100] }}
        gl={{ alpha: true, antialias: false, preserveDrawingBuffer: true }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <ShaderPlane shaderType={shaderType} />
      </Canvas>
    </div>
  );
}

// Export available shader types for UI
export const SHADER_TYPES = ['fbm-border', 'vignette', 'scanlines', 'chromatic', 'glitch'];
