(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReducedMotion.matches) return;

  const container = document.getElementById("hero-3d");
  if (!container) return;

  const THREE = window.THREE;
  if (!THREE) return;

  /* ── Scene ── */
  const scene = new THREE.Scene();

  /* ── Camera ── */
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  /* ── Renderer ── */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  /* ── Lighting ── */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0x7cf7d4, 2.4);
  directionalLight1.position.set(3, 4, 5);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0x8cb6ff, 1.8);
  directionalLight2.position.set(-3, -2, 4);
  scene.add(directionalLight2);

  const directionalLight3 = new THREE.DirectionalLight(0xff9a6c, 1.0);
  directionalLight3.position.set(0, -4, 3);
  scene.add(directionalLight3);

  const pointLight = new THREE.PointLight(0x4fe3e8, 1.5, 15);
  pointLight.position.set(2, 1, 3);
  scene.add(pointLight);

  /* ── Glass Material ── */
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.05,
    transmission: 0.95,
    thickness: 1.5,
    ior: 1.5,
    envMapIntensity: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });

  /* ── Geometries ── */
  const group = new THREE.Group();

  // Main torus knot
  const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.0, 0.35, 128, 32),
    glassMaterial
  );
  group.add(torusKnot);

  // Orbiting small spheres
  const orbitSpheres = [];
  const sphereGeo = new THREE.SphereGeometry(0.15, 32, 32);
  const sphereMat = new THREE.MeshPhysicalMaterial({
    color: 0x7cf7d4,
    metalness: 0.3,
    roughness: 0.1,
    transmission: 0.85,
    thickness: 0.8,
    ior: 1.3,
    transparent: true,
    opacity: 0.85,
  });

  for (let i = 0; i < 5; i++) {
    const sphere = new THREE.Mesh(sphereGeo, sphereMat.clone());
    sphere.material.color.setHSL(0.45 + i * 0.08, 0.7, 0.7);
    orbitSpheres.push({ mesh: sphere, offset: (i / 5) * Math.PI * 2, radius: 1.8 + i * 0.15, speed: 0.3 + i * 0.08 });
    group.add(sphere);
  }

  // Small floating icosahedrons
  const icoGeo = new THREE.IcosahedronGeometry(0.12, 1);
  const icoMat = new THREE.MeshPhysicalMaterial({
    color: 0x8cb6ff,
    metalness: 0.2,
    roughness: 0.15,
    transmission: 0.9,
    thickness: 0.5,
    ior: 1.4,
    transparent: true,
    opacity: 0.8,
  });

  const floatingIcos = [];
  for (let i = 0; i < 8; i++) {
    const ico = new THREE.Mesh(icoGeo, icoMat.clone());
    ico.material.color.setHSL(0.55 + i * 0.05, 0.6, 0.75);
    const angle = (i / 8) * Math.PI * 2;
    ico.position.set(
      Math.cos(angle) * (2.2 + Math.random() * 0.5),
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 1.5
    );
    floatingIcos.push({ mesh: ico, baseY: ico.position.y, speed: 0.5 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2 });
    group.add(ico);
  }

  scene.add(group);

  /* ── Mouse tracking ── */
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  window.addEventListener("mousemove", (event) => {
    mouse.targetX = (event.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = (event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ── Animation ── */
  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Smooth mouse follow
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Main torus knot rotation + float
    torusKnot.rotation.x = elapsed * 0.15 + mouse.y * 0.3;
    torusKnot.rotation.y = elapsed * 0.2 + mouse.x * 0.3;
    torusKnot.position.y = Math.sin(elapsed * 0.6) * 0.25;

    // Orbiting spheres
    orbitSpheres.forEach((s) => {
      const angle = elapsed * s.speed + s.offset;
      s.mesh.position.x = Math.cos(angle) * s.radius;
      s.mesh.position.y = Math.sin(angle * 0.7) * 0.8;
      s.mesh.position.z = Math.sin(angle) * s.radius * 0.4;
      s.mesh.scale.setScalar(0.8 + Math.sin(elapsed * 2 + s.offset) * 0.2);
    });

    // Floating icosahedrons
    floatingIcos.forEach((ico) => {
      ico.mesh.position.y = ico.baseY + Math.sin(elapsed * ico.speed + ico.phase) * 0.3;
      ico.mesh.rotation.x = elapsed * 0.4 + ico.phase;
      ico.mesh.rotation.z = elapsed * 0.3 + ico.phase;
    });

    // Subtle group parallax from mouse
    group.rotation.y = mouse.x * 0.15;
    group.rotation.x = -mouse.y * 0.1;

    // Animate lights slightly
    pointLight.position.x = Math.sin(elapsed * 0.5) * 3;
    pointLight.position.y = Math.cos(elapsed * 0.4) * 2;

    renderer.render(scene, camera);
  };

  animate();

  /* ── Resize handler ── */
  const onResize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  window.addEventListener("resize", onResize, { passive: true });

  /* ── Theme-aware light colors ── */
  const updateLightColors = () => {
    const isLight = document.documentElement.dataset.theme === "light";
    if (isLight) {
      directionalLight1.color.set(0x059669);
      directionalLight2.color.set(0x3b82f6);
      directionalLight3.color.set(0x2563eb);
      pointLight.color.set(0x0b9faa);
      glassMaterial.color.set(0xf8fafc);
    } else {
      directionalLight1.color.set(0x7cf7d4);
      directionalLight2.color.set(0x8cb6ff);
      directionalLight3.color.set(0xff9a6c);
      pointLight.color.set(0x4fe3e8);
      glassMaterial.color.set(0xffffff);
    }
  };

  updateLightColors();

  const themeObserver = new MutationObserver(updateLightColors);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
})();
