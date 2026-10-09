import React, { useEffect, useRef } from 'react';
import './AuthBackground.css';

// Vertices and edges of an icosahedron (golden ratio based)
const PHI = (1 + Math.sqrt(5)) / 2;
const BASE_VERTICES = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]
].map(([x, y, z]) => {
  const len = Math.hypot(x, y, z);
  return [x / len, y / len, z / len];
});

const EDGES = [];
for (let i = 0; i < BASE_VERTICES.length; i++) {
  for (let j = i + 1; j < BASE_VERTICES.length; j++) {
    const dx = BASE_VERTICES[i][0] - BASE_VERTICES[j][0];
    const dy = BASE_VERTICES[i][1] - BASE_VERTICES[j][1];
    const dz = BASE_VERTICES[i][2] - BASE_VERTICES[j][2];
    const dist = Math.hypot(dx, dy, dz);
    // In normalized icosahedron, edge distance is ~ 1.051
    if (dist > 0.9 && dist < 1.2) {
      EDGES.push([i, j]);
    }
  }
}

export default function AuthBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking for interactive grab effect
    const mouse = { x: -1000, y: -1000, radius: 180 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Constellation Particles
    const PARTICLE_COUNT = Math.min(85, Math.floor((width * height) / 16000));
    const WORDS = ['DSA', 'Algo', 'Graph', 'HashMap', 'Node', 'Tree', 'O(1)', 'O(log N)', 'Stack', 'Queue'];
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1.2,
        isText: Math.random() < 0.25,
        word: WORDS[Math.floor(Math.random() * WORDS.length)],
        color: Math.random() < 0.5 ? '#9c73ff' : '#2dd4bf',
        alpha: Math.random() * 0.4 + 0.25
      });
    }

    // 3D Wireframe Polyhedra (4 floating gem graphs in corners as seen in reference image)
    const polyhedra = [
      {
        getPos: (w, h) => ({ x: w * 0.12, y: h * 0.22 }),
        scale: 48,
        rot: { x: 0.2, y: 0.4, z: 0.1 },
        speed: { x: 0.003, y: 0.005, z: 0.002 },
        color: '#9c73ff',
        glow: 'rgba(156, 115, 255, 0.4)'
      },
      {
        getPos: (w, h) => ({ x: w * 0.09, y: h * 0.78 }),
        scale: 62,
        rot: { x: 0.5, y: 0.2, z: 0.3 },
        speed: { x: -0.002, y: 0.004, z: 0.003 },
        color: '#9c73ff',
        glow: 'rgba(156, 115, 255, 0.5)'
      },
      {
        getPos: (w, h) => ({ x: w * 0.88, y: h * 0.18 }),
        scale: 44,
        rot: { x: 0.3, y: 0.5, z: 0.2 },
        speed: { x: 0.004, y: -0.003, z: 0.002 },
        color: '#2dd4bf',
        glow: 'rgba(45, 212, 191, 0.4)'
      },
      {
        getPos: (w, h) => ({ x: w * 0.91, y: h * 0.74 }),
        scale: 58,
        rot: { x: 0.1, y: 0.3, z: 0.5 },
        speed: { x: -0.003, y: -0.004, z: 0.002 },
        color: '#2dd4bf',
        glow: 'rgba(45, 212, 191, 0.5)'
      },
      {
        getPos: (w, h) => ({ x: w * 0.24, y: h * 0.46 }),
        scale: 30,
        rot: { x: 0.4, y: 0.1, z: 0.2 },
        speed: { x: 0.002, y: 0.003, z: -0.001 },
        color: '#a78bfa',
        glow: 'rgba(167, 139, 250, 0.3)'
      }
    ];

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw and update 3D Wireframe Polyhedra
      polyhedra.forEach((poly) => {
        poly.rot.x += poly.speed.x;
        poly.rot.y += poly.speed.y;
        poly.rot.z += poly.speed.z;

        const { x: cx, y: cy } = poly.getPos(width, height);
        const { x: rx, y: ry, z: rz } = poly.rot;

        const cosX = Math.cos(rx), sinX = Math.sin(rx);
        const cosY = Math.cos(ry), sinY = Math.sin(ry);
        const cosZ = Math.cos(rz), sinZ = Math.sin(rz);

        // Project vertices
        const projected = BASE_VERTICES.map(([vx, vy, vz]) => {
          // Rotate X
          const y1 = vy * cosX - vz * sinX;
          const z1 = vy * sinX + vz * cosX;
          // Rotate Y
          const x2 = vx * cosY + z1 * sinY;
          const z2 = -vx * sinY + z1 * cosY;
          // Rotate Z
          const x3 = x2 * cosZ - y1 * sinZ;
          const y3 = x2 * sinZ + y1 * cosZ;

          const fov = 160;
          const pScale = fov / (fov + z2 * poly.scale * 0.5);
          return {
            x: cx + x3 * poly.scale * pScale,
            y: cy + y3 * poly.scale * pScale,
            z: z2
          };
        });

        // Draw edges
        ctx.save();
        ctx.strokeStyle = poly.color;
        ctx.lineWidth = 1;
        ctx.shadowColor = poly.glow;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = 0.55;

        EDGES.forEach(([i, j]) => {
          const p1 = projected[i];
          const p2 = projected[j];
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        });

        // Draw glowing vertex nodes
        projected.forEach((p) => {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      });

      // 2. Draw and update Particle Constellation
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        // Interactive mouse connection
        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.hypot(dxMouse, dyMouse);
        if (distMouse < mouse.radius) {
          ctx.beginPath();
          ctx.strokeStyle = '#c084fc';
          ctx.globalAlpha = (1 - distMouse / mouse.radius) * 0.6;
          ctx.lineWidth = 1.2;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // Particle connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 115) {
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 115) * 0.22;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw particle dot or text
        ctx.save();
        ctx.globalAlpha = p.alpha;
        if (p.isText) {
          ctx.fillStyle = p.color;
          ctx.font = '10px monospace';
          ctx.fillText(p.word, p.x, p.y);
        } else {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="auth-cyber-bg" aria-hidden="true">
      {/* 1. Deep cosmic gradient base */}
      <div className="cyber-ambient-glow" />

      {/* 2. Interactive Canvas: 3D Polyhedra & Particle Constellation */}
      <canvas ref={canvasRef} className="cyber-canvas" />

      {/* 3. Cyber Data Pipelines & Algorithmic Highways (SVG Layer matching image 2) */}
      <svg className="cyber-svg-overlay" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <defs>
          {/* Luminous linear gradients */}
          <linearGradient id="purpleTrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#9c73ff" stopOpacity="0.85" />
            <stop offset="80%" stopColor="#c084fc" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="cyanTrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
            <stop offset="20%" stopColor="#22d3ee" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#2dd4bf" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.1" />
          </linearGradient>

          {/* Neon Glow Filters */}
          <filter id="purpleGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- LEFT PIPELINE: PURPLE DATA HIGHWAY --- */}
        {/* Outer Glow Track */}
        <path
          d="M -50 310 C 180 310, 240 450, 420 460 C 530 465, 590 460, 680 460"
          fill="none"
          stroke="url(#purpleTrackGrad)"
          strokeWidth="28"
          strokeLinecap="round"
          strokeOpacity="0.12"
        />
        {/* Boundary Track Border */}
        <path
          d="M -50 310 C 180 310, 240 450, 420 460 C 530 465, 590 460, 680 460"
          fill="none"
          stroke="#9c73ff"
          strokeWidth="2"
          filter="url(#purpleGlow)"
        />
        {/* Animated Moving Chevrons along Purple Track */}
        <path
          d="M -50 310 C 180 310, 240 450, 420 460 C 530 465, 590 460, 680 460"
          fill="none"
          stroke="#e9d5ff"
          strokeWidth="3"
          strokeDasharray="6 18"
          className="animated-flow-purple"
        />

        {/* --- RIGHT PIPELINE: CYAN DATA HIGHWAY --- */}
        {/* Outer Glow Track */}
        <path
          d="M 760 460 C 850 460, 920 465, 1020 310 C 1200 310, 1320 370, 1500 370"
          fill="none"
          stroke="url(#cyanTrackGrad)"
          strokeWidth="28"
          strokeLinecap="round"
          strokeOpacity="0.12"
        />
        {/* Boundary Track Border */}
        <path
          d="M 760 460 C 850 460, 920 465, 1020 310 C 1200 310, 1320 370, 1500 370"
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="2"
          filter="url(#cyanGlow)"
        />
        {/* Animated Moving Chevrons along Cyan Track */}
        <path
          d="M 760 460 C 850 460, 920 465, 1020 310 C 1200 310, 1320 370, 1500 370"
          fill="none"
          stroke="#ccfbf1"
          strokeWidth="3"
          strokeDasharray="6 18"
          className="animated-flow-cyan"
        />
      </svg>

      {/* 4. Linked List Diagrams & Algorithm Track Labels */}
      <div className="cyber-hud-elements">
        {/* Left Side DSA Labels & Linked List */}
        <div className="cyber-badge badge-dsa">DSA</div>
        <div className="cyber-badge badge-algo">Algo</div>
        <div className="cyber-binary-stream left-binary">0110 › 1001 › 0101</div>

        <div className="cyber-linked-list list-left">
          <div className="list-node">
            <span className="node-box" />
            <span className="node-arrow">→</span>
          </div>
          <div className="list-node">
            <span className="node-box" />
            <span className="node-arrow">→</span>
          </div>
          <div className="list-node">
            <span className="node-box" />
            <span className="node-arrow">→</span>
          </div>
          <div className="list-label">LinkedList</div>
        </div>

        {/* Right Side Graph / HashMap Labels & Data Flow */}
        <div className="cyber-badge badge-graph">Graph</div>
        <div className="cyber-badge badge-hashmap">HashMap</div>
        <div className="cyber-badge badge-node">Node</div>
        <div className="cyber-binary-stream right-binary">0101 › 0011 › 1100</div>

        <div className="cyber-linked-list list-right">
          <div className="list-node">
            <span className="node-box cyan-node" />
            <span className="node-arrow cyan-arrow">→</span>
          </div>
          <div className="list-node">
            <span className="node-box cyan-node" />
            <span className="node-arrow cyan-arrow">→</span>
          </div>
          <div className="list-node">
            <span className="node-box cyan-node" />
          </div>
          <div className="list-label cyan-label">HashTable</div>
        </div>

        {/* Subtle Watermark Code Snippets */}
        <div className="cyber-code-block top-left-code">
          <code>
            {`template <typename T>\nstruct ListNode {\n  T val;\n  ListNode* next;\n};`}
          </code>
        </div>

        <div className="cyber-code-block top-right-code">
          <code>
            {`// DFS Traversal Matrix\nDSA\n*memory allocated*\nreturn node;`}
          </code>
        </div>

        <div className="cyber-code-block bottom-right-code">
          <code>
            {`import HashMap;\nfunction dfs(node, visited) {\n  if (visited.has(node)) return;\n  visited.add(node);\n  for (let n of node.adj) {\n    dfs(n, visited);\n  }\n  return true;\n}`}
          </code>
        </div>
      </div>
    </div>
  );
}
