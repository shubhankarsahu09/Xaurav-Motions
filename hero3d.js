/* ── Xaurav Motions: 3D Hero Scene (Three.js) ── */
(() => {
  const container = document.getElementById("hero-canvas");
  if (!container || !window.THREE) return;

  const THREE = window.THREE;
  const scene = new THREE.Scene();

  /* ── Renderer ── */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  /* ── Camera ── */
  const camera = new THREE.PerspectiveCamera(
    40,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 8);

  /* ── Lighting ── */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xdbeafe, 1.8);
  dirLight1.position.set(5, 8, 6);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x7cf7d4, 0.6);
  dirLight2.position.set(-4, -3, 4);
  scene.add(dirLight2);

  const dirLight3 = new THREE.DirectionalLight(0xff9a6c, 0.4);
  dirLight3.position.set(-2, 5, -3);
  scene.add(dirLight3);

  /* ── Environment (PMREMGenerator for reflections) ── */
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  
  // Create a gradient environment for reflections
  const envGeo = new THREE.SphereGeometry(20, 32, 32);
  const envMat = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    color: 0x8cb6ff,
  });
  envScene.add(new THREE.Mesh(envGeo, envMat));
  
  const envLight = new THREE.AmbientLight(0xffffff, 1);
  envScene.add(envLight);
  
  const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
  scene.environment = envMap;
  pmremGenerator.dispose();

  /* ── Center Object: Glass Abstract Shape ── */
  const centerGeo = new THREE.TorusKnotGeometry(1.2, 0.45, 64, 16, 2, 3);
  const centerMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 1.0,
    roughness: 0.05,
    metalness: 0.0,
    ior: 1.5,
    thickness: 0.8,
    envMapIntensity: 2.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.95,
  });
  const centerObj = new THREE.Mesh(centerGeo, centerMat);
  centerObj.position.set(0, 0, 0);
  scene.add(centerObj);

  /* ── Left Object: Metallic Silver Shape ── */
  const leftGeo = new THREE.OctahedronGeometry(0.7, 1);
  const leftMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 0.95,
    roughness: 0.25,
    envMapIntensity: 1.8,
  });
  const leftObj = new THREE.Mesh(leftGeo, leftMat);
  leftObj.position.set(-3.2, 0.5, -0.5);
  scene.add(leftObj);

  /* ── Right Object: Dark Matte with Metallic Accents ── */
  const rightGeo = new THREE.IcosahedronGeometry(0.65, 1);
  const rightMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    metalness: 0.3,
    roughness: 0.8,
    envMapIntensity: 0.6,
  });
  const rightObj = new THREE.Mesh(rightGeo, rightMat);
  rightObj.position.set(3.0, -0.3, -0.8);
  scene.add(rightObj);

  /* ── Small Accent Spheres (floating particles) ── */
  const accentGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const accents = [];
  const accentColors = [0x7cf7d4, 0x8cb6ff, 0xff9a6c, 0x7cf7d4, 0x8cb6ff];
  const accentPositions = [
    [-2.0, 1.8, 1],
    [2.5, 1.5, 0.5],
    [-1.5, -1.5, 0.8],
    [1.8, -1.2, 1.2],
    [0.3, 2.2, -0.5],
  ];

  accentPositions.forEach((pos, i) => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: accentColors[i],
      transmission: 0.6,
      roughness: 0.1,
      metalness: 0.1,
      emissive: accentColors[i],
      emissiveIntensity: 0.3,
    });
    const mesh = new THREE.Mesh(accentGeo, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    scene.add(mesh);
    accents.push(mesh);
  });

  /* ── Mouse Tracking for Interactivity ── */
  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };
  
  window.addEventListener("mousemove", (event) => {
    targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  /* ── Interactive Particle Grid (Background Dots) ── */
  const particleCount = 1000; // Efficient grid count
  const particlesGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const spread = 25; // How far the dots spread

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * spread; // X
    positions[i3 + 1] = (Math.random() - 0.5) * spread; // Y
    positions[i3 + 2] = (Math.random() - 0.5) * spread - 5; // Z (behind objects)
  }

  particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const particlesMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.035,
    transparent: true,
    opacity: 0.25,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
  });

  const particleSystem = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particleSystem);

  /* ── Animation Loop ── */
  const clock = new THREE.Clock();
  let animationId;

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Smooth lerp for mouse movement
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    // Interactive swaying effect for background dots
    particleSystem.position.x = mouse.x * 0.45;
    particleSystem.position.y = mouse.y * 0.35;
    particleSystem.rotation.y = mouse.x * 0.05;

    // Center: slow rotation + gentle float
    centerObj.rotation.y = elapsed * 0.15;
    centerObj.rotation.x = elapsed * 0.08;
    centerObj.position.y = Math.sin(elapsed * 0.6) * 0.15;

    // Left: different rotation speed + float offset
    leftObj.rotation.y = elapsed * 0.25;
    leftObj.rotation.z = elapsed * 0.12;
    leftObj.position.y = 0.5 + Math.sin(elapsed * 0.5 + 1.2) * 0.2;

    // Right: opposite rotation + float
    rightObj.rotation.y = -elapsed * 0.2;
    rightObj.rotation.x = elapsed * 0.1;
    rightObj.position.y = -0.3 + Math.sin(elapsed * 0.45 + 2.5) * 0.18;

    // Accent spheres: orbiting micro-floats
    accents.forEach((sphere, i) => {
      const basePos = accentPositions[i];
      sphere.position.x = basePos[0] + Math.sin(elapsed * 0.3 + i * 1.5) * 0.3;
      sphere.position.y = basePos[1] + Math.sin(elapsed * 0.4 + i * 0.8) * 0.25;
      sphere.rotation.y = elapsed * 0.5;
    });

    renderer.render(scene, camera);
  };

  animate();

  /* ── Responsive Resize ── */
  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };

  window.addEventListener("resize", onResize, { passive: true });

  /* ── Theme Observer (Eliminates DOM reads in Animation Loop) ── */
  const updateParticlesTheme = () => {
    const currentTheme = document.documentElement.dataset.theme;
    const isLight = currentTheme === "light";
    
    // Particles: Lower opacity and deeper color to prevent "wash out" of the main heading
    particlesMat.opacity = isLight ? 0.72 : 0.12;
    particlesMat.color.set(isLight ? 0x0284c7 : 0x2563eb); // Deeper blue in dark mode
    particlesMat.size = isLight ? 0.052 : 0.03;
    
    // Lighting: Significantly reduced intensities to remove the "white effect" that washes out the UI
    ambientLight.intensity = isLight ? 1.6 : 0.18;
    dirLight1.intensity = isLight ? 4.2 : 1.0;
    renderer.toneMappingExposure = isLight ? 1.55 : 0.95; 
    
    // Adjust glass material: darker and less reflective in dark mode
    if (typeof centerMat !== 'undefined') {
      centerMat.envMapIntensity = isLight ? 3.8 : 1.2;
      centerMat.color.set(isLight ? 0xdbeafe : 0x94a3b8); // Muted slate in dark mode
    }
  };
  
  // Set initial theme
  updateParticlesTheme();

  // Watch for theme changes
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "data-theme") {
        updateParticlesTheme();
      }
    });
  });
  themeObserver.observe(document.documentElement, { attributes: true });

  /* ── Cleanup ── */
  window._hero3dCleanup = () => {
    themeObserver.disconnect();
    cancelAnimationFrame(animationId);
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
    container.removeChild(renderer.domElement);
  };
})();
