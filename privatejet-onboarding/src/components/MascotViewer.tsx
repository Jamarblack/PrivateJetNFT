import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface MascotViewerProps {
  imagePath?: string;
}

const MascotViewer: React.FC<MascotViewerProps> = ({ imagePath = '/mascot.png' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // fully transparent — without this the canvas renders as an opaque black box
    mountRef.current.appendChild(renderer.domElement);

    // Street Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    
    // Neon rim lights to catch the card edges
    const orangeLight = new THREE.PointLight(0xFF4500, 3, 10);
    orangeLight.position.set(4, 0, -2);
    scene.add(orangeLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = true;
    controls.rotateSpeed = 0.8;
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.ROTATE };
    // minPolarAngle/maxPolarAngle are left at their full default range (0 → π) on purpose —
    // restricting them would cap how far the card can tip, which would stop it short of an
    // actual "flip." Full range is what makes a vertical drag read as flipping the card over.

    // The honest tradeoff on a touchscreen: a vertical swipe that starts on the card is
    // ambiguous on the very first pixel of movement — it could mean "flip the card" or
    // "scroll past it," and there's no way to read that intent before the gesture commits.
    // touch-action: 'pan-y' (the previous approach) resolved that ambiguity by always
    // siding with page scroll, which is what made the card un-flippable on mobile.
    //
    // Resolving it the other way — siding with the card — means a touch that starts on the
    // card's hit area claims the page scroll for that one gesture. That's an acceptable
    // tradeoff here because the card only occupies a bounded region behind the text (not
    // the full page), so the rest of the page still scrolls normally; the card area becomes
    // a deliberate "interactive zone" rather than scrollable real estate, similar to how a
    // map embed or video player claims its own touch area on a page.
    renderer.domElement.style.touchAction = 'none';

    // Load Texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imagePath);
    texture.colorSpace = THREE.SRGBColorSpace;

    // Create the Thick Card Geometry (Width, Height, Depth)
    const cardGeo = new THREE.BoxGeometry(3, 4, 0.2);

    // Materials Array: [right, left, top, bottom, front, back]
    const edgeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x111111, 
      roughness: 0.2, 
      metalness: 0.8 
    });
    
    const frontMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.4,
      metalness: 0.1,
    });

    // Mirror the back texture so it reads correctly when spun 180 degrees
    const backTexture = texture.clone();
    backTexture.repeat.x = -1;
    backTexture.wrapS = THREE.RepeatWrapping;
    const backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      roughness: 0.4,
      metalness: 0.1,
    });

    const materials = [
      edgeMaterial,  // Right
      edgeMaterial,  // Left
      edgeMaterial,  // Top
      edgeMaterial,  // Bottom
      frontMaterial, // Front
      backMaterial   // Back
    ];

    const cardMesh = new THREE.Mesh(cardGeo, materials);
    scene.add(cardMesh);

    // Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;
    let isInteracting = false; // tracked via the down/up handlers below, not via controls.state

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Floating effect
      cardMesh.position.y = Math.sin(elapsed * 2) * 0.1;

      // Auto-spin only when the user isn't actively dragging
      if (!isInteracting) {
        cardMesh.rotation.y += 0.005;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Interaction states — drive both the cursor (via React state) and the
    // animation loop's auto-spin (via the plain isInteracting flag, since
    // the loop closure shouldn't depend on React state/re-renders)
    const handleDown = () => { setIsDragging(true); isInteracting = true; };
    const handleUp = () => { setIsDragging(false); isInteracting = false; };
    renderer.domElement.addEventListener('mousedown', handleDown);
    renderer.domElement.addEventListener('mouseup', handleUp);
    renderer.domElement.addEventListener('touchstart', handleDown, { passive: true });
    renderer.domElement.addEventListener('touchend', handleUp);

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w < 2 || h < 2) return; // guard against 0x0 reads before layout has settled
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    // Fonts/flex layout can resolve after this effect runs, so re-check a couple times early on
    const settleTimers = [setTimeout(handleResize, 50), setTimeout(handleResize, 300)];

    return () => {
      window.removeEventListener('resize', handleResize);
      settleTimers.forEach(clearTimeout);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', handleDown);
        renderer.domElement.removeEventListener('mouseup', handleUp);
        renderer.domElement.removeEventListener('touchstart', handleDown);
        renderer.domElement.removeEventListener('touchend', handleUp);
      }
      if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
      cancelAnimationFrame(animationFrameId);
      cardGeo.dispose();
      edgeMaterial.dispose();
      frontMaterial.dispose();
      backMaterial.dispose();
      renderer.dispose();
    };
  }, [imagePath]);

  return (
    <div className="relative w-[300px] h-[400px] mx-auto md:w-[350px] md:h-[450px]">
      <div ref={mountRef} className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} />
    </div>
  );
};

export default MascotViewer;