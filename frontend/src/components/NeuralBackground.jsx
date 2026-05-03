import { useEffect, useRef } from "react";
import * as THREE from "three";

const NeuralBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Create particles
    const particleCount = 120;
    const positions = [];
    const velocities = [];
    const particleData = [];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 100;
      positions.push(x, y, z);
      velocities.push(
        (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.04
      );
      particleData.push({ x, y, z });
    }

    // Particle geometry
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(positions);
    particleGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.8,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Line connections
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.08,
    });

    const lineGroup = new THREE.Group();
    scene.add(lineGroup);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.3;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const positions = particleGeo.attributes.position.array;

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        positions[ix] += velocities[ix / 3 * 3] || velocities[i * 3];
        positions[iy] += velocities[i * 3 + 1];
        positions[iz] += velocities[i * 3 + 2];

        // Bounce off boundaries
        if (Math.abs(positions[ix]) > 100) velocities[i * 3] *= -1;
        if (Math.abs(positions[iy]) > 100) velocities[i * 3 + 1] *= -1;
        if (Math.abs(positions[iz]) > 50) velocities[i * 3 + 2] *= -1;
      }

      particleGeo.attributes.position.needsUpdate = true;

      // Update line connections
      while (lineGroup.children.length > 0) {
        lineGroup.remove(lineGroup.children[0]);
      }

      const connectionDistance = 30;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          const jx = j * 3, jy = j * 3 + 1, jz = j * 3 + 2;

          const dx = positions[ix] - positions[jx];
          const dy = positions[iy] - positions[jy];
          const dz = positions[iz] - positions[jz];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.15;
            const mat = new THREE.LineBasicMaterial({
              color: 0x00d4ff,
              transparent: true,
              opacity,
            });
            const geo = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(positions[ix], positions[iy], positions[iz]),
              new THREE.Vector3(positions[jx], positions[jy], positions[jz]),
            ]);
            lineGroup.add(new THREE.Line(geo, mat));
          }
        }
      }

      // Smooth camera mouse follow
      camera.position.x += (mouseX * 20 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 20 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        zIndex: 0,
        background: "linear-gradient(135deg, #020817 0%, #0a0f1e 50%, #020817 100%)",
      }}
    />
  );
};

export default NeuralBackground;