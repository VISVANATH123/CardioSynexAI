import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RiskCategory } from '../types/cardiac';
import { 
  Heart, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Activity, 
  ShieldAlert, 
  Info, 
  Eye,
  Maximize2
} from 'lucide-react';

interface ThreeDAnatomyProps {
  riskScore: number;
  riskCategory: RiskCategory;
  restingHeartRate?: number;
  compact?: boolean;
  selectedAnatomicalRegion?: string;
  onSelectRegion?: (regionName: string) => void;
}

interface AnatomicalRegionData {
  id: string;
  name: string;
  category: string;
  description: string;
  modelRisk: RiskCategory;
  clinicalSignificance: string;
  keyDrivers: string[];
}

export const ThreeDAnatomy: React.FC<ThreeDAnatomyProps> = ({
  riskScore,
  riskCategory,
  restingHeartRate = 72,
  compact = false,
  selectedAnatomicalRegion,
  onSelectRegion,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeRegion, setActiveRegion] = useState<AnatomicalRegionData | null>(null);
  const [viewPreset, setViewPreset] = useState<'heart' | 'torso' | 'coronary'>('heart');
  const [showTorsoMesh, setShowTorsoMesh] = useState<boolean>(true);
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  // References for Three.js animation and control updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const heartGroupRef = useRef<THREE.Group | null>(null);
  const coronaryGroupRef = useRef<THREE.Group | null>(null);
  const torsoGroupRef = useRef<THREE.Group | null>(null);
  const vesselsGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<{ [key: string]: THREE.Material }>({});

  // Region details registry
  const getRegionDetails = (id: string): AnatomicalRegionData => {
    switch (id) {
      case 'coronary':
        return {
          id: 'coronary',
          name: 'Coronary Arteries (LAD & RCA)',
          category: 'Atherosclerosis Focus',
          description: 'Network of epicardial arteries supplying oxygenated blood to the myocardium.',
          modelRisk: riskScore >= 55 ? 'HIGH' : riskScore >= 25 ? 'MODERATE' : 'LOW',
          clinicalSignificance: 'Primary site of atheroma formation, lipid plaque buildup, and coronary events.',
          keyDrivers: ['Elevated LDL-C', 'High Systolic BP', 'Tobacco Exposure'],
        };
      case 'aorta':
        return {
          id: 'aorta',
          name: 'Ascending Aorta & Arch',
          category: 'Hemodynamic Conduit',
          description: 'Primary high-pressure conduit receiving systolic stroke volume directly from the left ventricle.',
          modelRisk: riskScore >= 60 ? 'HIGH' : 'MODERATE',
          clinicalSignificance: 'Subject to chronic tensile and wall-shearing stress from elevated pulse pressure.',
          keyDrivers: ['Systolic Hypertension', 'Arterial Stiffness', 'Age Decades'],
        };
      case 'pulmonary':
        return {
          id: 'pulmonary',
          name: 'Pulmonary Arterial Trunk',
          category: 'Low-Pressure Circuit',
          description: 'Delivers deoxygenated blood from right ventricle to pulmonary capillary beds.',
          modelRisk: 'LOW',
          clinicalSignificance: 'Reflects right ventricular afterload and pulmonary vascular resistance.',
          keyDrivers: ['Cardiorespiratory Fitness', 'Resting Heart Rate'],
        };
      case 'myocardium':
      default:
        return {
          id: 'myocardium',
          name: 'Left & Right Ventricular Myocardium',
          category: 'Contractile Muscle',
          description: 'Muscular chamber walls responsible for continuous metabolic pumping capacity.',
          modelRisk: riskCategory,
          clinicalSignificance: 'Vulnerable to chronic subendocardial ischemia when epicardial perfusion is impaired.',
          keyDrivers: ['Resting Heart Rate', 'Mean Arterial Pressure', 'Metabolic Load'],
        };
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.05);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 4.2);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 8;
    controls.minDistance = 1.8;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.target.set(0, 0.4, 0);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0x0e243d, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.6);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // Heart Risk Dynamic Light
    const riskColorHex = riskCategory === 'CRITICAL' ? 0xef4444 : riskCategory === 'HIGH' ? 0xf43f5e : riskCategory === 'MODERATE' ? 0xf59e0b : 0x06b6d4;
    const heartPointLight = new THREE.PointLight(riskColorHex, 3.5, 3.5);
    heartPointLight.position.set(0.1, 0.45, 0.4);
    scene.add(heartPointLight);

    // -------------------------------------------------------------
    // PROCEDURAL ANATOMICAL GEOMETRY
    // -------------------------------------------------------------

    // 1. TORSO SILHOUETTE (Transparent Hologram Chest Cavity)
    const torsoGroup = new THREE.Group();
    torsoGroupRef.current = torsoGroup;
    scene.add(torsoGroup);

    // Procedural Torso Outer Shell
    const torsoGeom = new THREE.CylinderGeometry(1.2, 0.9, 3.2, 32, 16, true);
    // Deform torso geometry to match athletic human chest taper
    const pos = torsoGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const x = pos.getX(i);
      // Flatten AP diameter (chest is wider laterally than front-to-back)
      pos.setZ(i, z * 0.65);
      // Taper waist downwards and broaden shoulders
      if (y > 0.8) {
        pos.setX(i, x * 1.15);
      } else if (y < -0.6) {
        pos.setX(i, x * 0.9);
      }
    }
    torsoGeom.computeVertexNormals();

    const torsoMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e3a5f,
      transparent: true,
      opacity: 0.14,
      roughness: 0.2,
      metalness: 0.1,
      transmission: 0.7,
      wireframe: false,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    materialsRef.current.torso = torsoMat;
    const torsoMesh = new THREE.Mesh(torsoGeom, torsoMat);
    torsoMesh.position.set(0, 0.5, 0);
    torsoGroup.add(torsoMesh);

    // Holographic Thoracic Rib Rings
    const ribMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.22,
      wireframe: true,
    });
    for (let r = 0; r < 6; r++) {
      const ribRingGeom = new THREE.TorusGeometry(0.85 - r * 0.04, 0.015, 8, 36);
      const ribMesh = new THREE.Mesh(ribRingGeom, ribMat);
      ribMesh.rotation.x = Math.PI / 2 + 0.12 * (r - 2.5);
      ribMesh.scale.set(1.15, 0.7, 1);
      ribMesh.position.set(0, 1.2 - r * 0.3, 0);
      torsoGroup.add(ribMesh);
    }

    // Spine Column Silhouette
    const spineGeom = new THREE.CylinderGeometry(0.08, 0.09, 3.0, 12);
    const spineMat = new THREE.MeshBasicMaterial({ color: 0x0369a1, transparent: true, opacity: 0.3 });
    const spineMesh = new THREE.Mesh(spineGeom, spineMat);
    spineMesh.position.set(0, 0.5, -0.6);
    torsoGroup.add(spineMesh);

    // 2. CARDIOVASCULAR COMPLEX (Heart + Great Vessels)
    const heartGroup = new THREE.Group();
    heartGroupRef.current = heartGroup;
    scene.add(heartGroup);

    // Anatomical Ventricle Mass (Asymmetric tapered organic heart body)
    const heartGeom = new THREE.SphereGeometry(0.52, 32, 32);
    // Deform into anatomical heart shape (broad base superior, pointed apex inferior-left-anterior)
    const heartPos = heartGeom.attributes.position;
    for (let i = 0; i < heartPos.count; i++) {
      let x = heartPos.getX(i);
      let y = heartPos.getY(i);
      let z = heartPos.getZ(i);

      // Point towards cardiac apex (inferior, left, anterior)
      if (y < 0) {
        const factor = (1 + y / 0.52);
        x = x * (0.35 + factor * 0.65) - (1 - factor) * 0.16;
        z = z * (0.45 + factor * 0.55) + (1 - factor) * 0.14;
      } else {
        // Expand basal atria
        x = x * 1.12;
        z = z * 1.05;
      }
      heartPos.setXYZ(i, x, y, z);
    }
    heartGeom.computeVertexNormals();

    const heartMat = new THREE.MeshStandardMaterial({
      color: riskColorHex,
      emissive: riskColorHex,
      emissiveIntensity: riskScore > 50 ? 0.35 : 0.15,
      roughness: 0.35,
      metalness: 0.25,
    });
    materialsRef.current.heart = heartMat;

    const heartMesh = new THREE.Mesh(heartGeom, heartMat);
    heartMesh.name = 'myocardium';
    heartMesh.userData = { id: 'myocardium' };
    heartGroup.add(heartMesh);

    // Cardiac Position & Anatomical Axis Tilt
    heartGroup.position.set(-0.06, 0.45, 0.1);
    heartGroup.rotation.z = -0.32; // Leaning left apex
    heartGroup.rotation.y = 0.22;
    heartGroup.rotation.x = 0.18;

    // 3. GREAT VESSELS (Aorta, Pulmonary Artery, Vena Cava)
    const vesselsGroup = new THREE.Group();
    vesselsGroupRef.current = vesselsGroup;
    heartGroup.add(vesselsGroup);

    // Ascending Aorta & Arch (Curve tube)
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.04, 0.35, 0.05),     // Aortic root
      new THREE.Vector3(0.08, 0.72, 0.04),     // Ascending aorta
      new THREE.Vector3(0.04, 0.95, -0.05),    // Arch peak
      new THREE.Vector3(-0.16, 0.88, -0.18),   // Arch curve left
      new THREE.Vector3(-0.2, 0.4, -0.28),     // Descending thoracic
      new THREE.Vector3(-0.18, -0.4, -0.28),   // Abdominal continuation
    ]);
    const aortaGeom = new THREE.TubeGeometry(aortaCurve, 40, 0.088, 16, false);
    const aortaMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0x991b1b,
      emissiveIntensity: 0.25,
      roughness: 0.3,
      metalness: 0.3,
    });
    materialsRef.current.aorta = aortaMat;
    const aortaMesh = new THREE.Mesh(aortaGeom, aortaMat);
    aortaMesh.name = 'aorta';
    aortaMesh.userData = { id: 'aorta' };
    vesselsGroup.add(aortaMesh);

    // Branching Arch Vessels (Brachiocephalic, Carotid, Subclavian)
    const branchCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.06, 0.93, -0.02),
      new THREE.Vector3(0.12, 1.25, -0.02),
    ]);
    const branchCurve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.95, -0.05),
      new THREE.Vector3(0.02, 1.28, -0.06),
    ]);
    const branchCurve3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 0.93, -0.09),
      new THREE.Vector3(-0.12, 1.22, -0.1),
    ]);
    [branchCurve1, branchCurve2, branchCurve3].forEach((curve) => {
      const bGeom = new THREE.TubeGeometry(curve, 12, 0.028, 10, false);
      const bMesh = new THREE.Mesh(bGeom, aortaMat);
      vesselsGroup.add(bMesh);
    });

    // Pulmonary Trunk (Bifurcates anterior to ascending aorta)
    const pulmonaryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, 0.32, 0.22),
      new THREE.Vector3(-0.05, 0.68, 0.16),
      new THREE.Vector3(-0.12, 0.78, 0.02),
    ]);
    const pulmonaryGeom = new THREE.TubeGeometry(pulmonaryCurve, 20, 0.075, 14, false);
    const pulmonaryMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.2,
      roughness: 0.4,
    });
    materialsRef.current.pulmonary = pulmonaryMat;
    const pulmonaryMesh = new THREE.Mesh(pulmonaryGeom, pulmonaryMat);
    pulmonaryMesh.name = 'pulmonary';
    pulmonaryMesh.userData = { id: 'pulmonary' };
    vesselsGroup.add(pulmonaryMesh);

    // Left and Right Pulmonary Branches
    const pulmLBranch = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.12, 0.78, 0.02),
      new THREE.Vector3(-0.45, 0.74, -0.12),
    ]);
    const pulmRBranch = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 0.76, 0.05),
      new THREE.Vector3(0.42, 0.72, -0.08),
    ]);
    [pulmLBranch, pulmRBranch].forEach(curve => {
      const pGeom = new THREE.TubeGeometry(curve, 16, 0.045, 10, false);
      const pMesh = new THREE.Mesh(pGeom, pulmonaryMat);
      vesselsGroup.add(pMesh);
    });

    // 4. CORONARY ARTERY NETWORK (LAD, LCx, RCA)
    const coronaryGroup = new THREE.Group();
    coronaryGroupRef.current = coronaryGroup;
    heartGroup.add(coronaryGroup);

    // Coronary color depends heavily on risk state
    const coronaryRiskColor = riskScore >= 55 ? 0xff2a48 : riskScore >= 30 ? 0xf59e0b : 0x38bdf8;
    const coronaryMat = new THREE.MeshStandardMaterial({
      color: coronaryRiskColor,
      emissive: coronaryRiskColor,
      emissiveIntensity: riskScore >= 50 ? 0.7 : 0.35,
      roughness: 0.2,
      metalness: 0.4,
    });
    materialsRef.current.coronary = coronaryMat;

    // Left Anterior Descending (LAD) Artery across anterior interventricular groove
    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.32, 0.42),
      new THREE.Vector3(0.04, 0.12, 0.46),
      new THREE.Vector3(0.01, -0.12, 0.44),
      new THREE.Vector3(-0.05, -0.32, 0.36),
      new THREE.Vector3(-0.12, -0.48, 0.22), // reaches apex
    ]);
    const ladGeom = new THREE.TubeGeometry(ladCurve, 32, 0.024, 10, false);
    const ladMesh = new THREE.Mesh(ladGeom, coronaryMat);
    ladMesh.name = 'coronary';
    ladMesh.userData = { id: 'coronary' };
    coronaryGroup.add(ladMesh);

    // Left Circumflex (LCx) Artery
    const lcxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.32, 0.42),
      new THREE.Vector3(-0.25, 0.28, 0.34),
      new THREE.Vector3(-0.44, 0.2, 0.12),
      new THREE.Vector3(-0.42, 0.05, -0.15),
    ]);
    const lcxGeom = new THREE.TubeGeometry(lcxCurve, 24, 0.02, 10, false);
    const lcxMesh = new THREE.Mesh(lcxGeom, coronaryMat);
    lcxMesh.name = 'coronary';
    lcxMesh.userData = { id: 'coronary' };
    coronaryGroup.add(lcxMesh);

    // Right Coronary Artery (RCA)
    const rcaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.18, 0.35, 0.3),
      new THREE.Vector3(0.38, 0.24, 0.25),
      new THREE.Vector3(0.48, 0.04, 0.14),
      new THREE.Vector3(0.44, -0.16, -0.05),
      new THREE.Vector3(0.24, -0.36, -0.12),
    ]);
    const rcaGeom = new THREE.TubeGeometry(rcaCurve, 28, 0.022, 10, false);
    const rcaMesh = new THREE.Mesh(rcaGeom, coronaryMat);
    rcaMesh.name = 'coronary';
    rcaMesh.userData = { id: 'coronary' };
    coronaryGroup.add(rcaMesh);

    // Atheroma / Stenosis highlight indicator spheres if risk is elevated
    if (riskScore >= 50) {
      const plaqueMat = new THREE.MeshStandardMaterial({
        color: 0xff0033,
        emissive: 0xff0044,
        emissiveIntensity: 1.2,
      });
      const plaque1 = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), plaqueMat);
      plaque1.position.set(0.03, 0.05, 0.47);
      coronaryGroup.add(plaque1);

      const plaque2 = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), plaqueMat);
      plaque2.position.set(0.42, 0.12, 0.22);
      coronaryGroup.add(plaque2);
    }

    // 5. CIRCULATING PARTICLES (Blood Flow Stream)
    const particleCount = 120;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particlePhases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePhases[i] = Math.random();
      const point = aortaCurve.getPoint(particlePhases[i]);
      particlePositions[i * 3] = point.x + (Math.random() - 0.5) * 0.04;
      particlePositions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.04;
      particlePositions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.04;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xef4444,
      size: 0.038,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const bloodParticles = new THREE.Points(particleGeom, particleMat);
    vesselsGroup.add(bloodParticles);

    // 6. RAYCASTER FOR INTERACTIVE CLICKING
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactables = [heartMesh, aortaMesh, pulmonaryMesh, ladMesh, lcxMesh, rcaMesh];
      const intersects = raycaster.intersectObjects(interactables, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const regionId = hit.userData.id || 'myocardium';
        const details = getRegionDetails(regionId);
        setActiveRegion(details);
        if (onSelectRegion) {
          onSelectRegion(regionId);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // 7. ANIMATION LOOP (Dual-Phase Cardiac Pulsing)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const bps = restingHeartRate / 60; // Beats per second

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Realistic cardiac cycle: systole takes ~1/3 of the cycle, diastole ~2/3
      const cycle = (elapsedTime * bps) % 1;
      let pulseScale = 1.0;
      if (cycle < 0.25) {
        // Rapid systolic contraction
        pulseScale = 1.0 - Math.sin((cycle / 0.25) * Math.PI) * 0.085;
      } else if (cycle < 0.45) {
        // Isovolumetric relaxation
        pulseScale = 1.0 + Math.sin(((cycle - 0.25) / 0.2) * Math.PI) * 0.05;
      } else {
        // Diastolic resting fill
        pulseScale = 1.0 + Math.sin(((cycle - 0.45) / 0.55) * Math.PI) * 0.02;
      }

      if (heartMesh) {
        heartMesh.scale.set(pulseScale, pulseScale * 1.02, pulseScale);
      }

      // Pulse coronary arteries slightly
      if (coronaryGroupRef.current) {
        const cScale = 1.0 + (pulseScale - 1.0) * 0.6;
        coronaryGroupRef.current.scale.set(cScale, cScale, cScale);
      }

      // Update blood particles flowing through the aorta
      const positions = particleGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particlePhases[i] = (particlePhases[i] + 0.007 * (restingHeartRate / 70)) % 1;
        const point = aortaCurve.getPoint(particlePhases[i]);
        positions[i * 3] = point.x + (Math.sin(elapsedTime * 4 + i) * 0.015);
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z + (Math.cos(elapsedTime * 4 + i) * 0.015);
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Dynamic light pulsation
      if (heartPointLight) {
        heartPointLight.intensity = (riskScore > 50 ? 3.5 : 2.0) + (1.0 - pulseScale) * 12;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // RESIZE LISTENER
    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update dynamic materials when risk props change
  useEffect(() => {
    const riskColorHex =
      riskCategory === 'CRITICAL'
        ? 0xef4444
        : riskCategory === 'HIGH'
        ? 0xf43f5e
        : riskCategory === 'MODERATE'
        ? 0xf59e0b
        : 0x06b6d4;

    if (materialsRef.current.heart) {
      const mat = materialsRef.current.heart as THREE.MeshStandardMaterial;
      mat.color.setHex(riskColorHex);
      mat.emissive.setHex(riskColorHex);
      mat.emissiveIntensity = riskScore > 50 ? 0.38 : 0.16;
    }

    if (materialsRef.current.coronary) {
      const coronaryColor = riskScore >= 55 ? 0xff2a48 : riskScore >= 30 ? 0xf59e0b : 0x38bdf8;
      const mat = materialsRef.current.coronary as THREE.MeshStandardMaterial;
      mat.color.setHex(coronaryColor);
      mat.emissive.setHex(coronaryColor);
      mat.emissiveIntensity = riskScore >= 50 ? 0.75 : 0.35;
    }
  }, [riskScore, riskCategory]);

  // Toggle torso visibility
  useEffect(() => {
    if (torsoGroupRef.current) {
      torsoGroupRef.current.visible = showTorsoMesh;
    }
  }, [showTorsoMesh]);

  // Toggle vessels visibility
  useEffect(() => {
    if (vesselsGroupRef.current) {
      vesselsGroupRef.current.visible = showVessels;
    }
  }, [showVessels]);

  // Toggle auto-rotation
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isRotating;
    }
  }, [isRotating]);

  // Camera presets
  const handleApplyPreset = (preset: 'heart' | 'torso' | 'coronary') => {
    setViewPreset(preset);
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (preset === 'heart') {
      camera.position.set(0, 0.6, 2.7);
      controls.target.set(0, 0.45, 0.1);
    } else if (preset === 'torso') {
      camera.position.set(0, 0.9, 4.6);
      controls.target.set(0, 0.4, 0);
    } else if (preset === 'coronary') {
      camera.position.set(0.4, 0.55, 2.2);
      controls.target.set(0.04, 0.35, 0.3);
    }
    controls.update();
  };

  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 0.8, 3.8);
    controlsRef.current.target.set(0, 0.4, 0);
    controlsRef.current.update();
    setViewPreset('heart');
  };

  const riskBadgeClass =
    riskCategory === 'CRITICAL'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      : riskCategory === 'HIGH'
      ? 'bg-red-500/20 text-red-300 border-red-500/40'
      : riskCategory === 'MODERATE'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden glass-panel border border-cyan-500/20 shadow-2xl flex flex-col ${compact ? 'h-[440px]' : 'h-[620px]'}`}>
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay HUD Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 pointer-events-auto bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase">3D Cardiovascular Map</span>
            <span className="text-[10px] text-slate-400">Interactive Anatomical Twin</span>
          </div>
        </div>

        {/* Live Risk Status Beacon */}
        <div className={`flex items-center space-x-2 pointer-events-auto px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-lg ${riskBadgeClass}`}>
          <div className={`w-2 h-2 rounded-full animate-ping ${
            riskCategory === 'CRITICAL' || riskCategory === 'HIGH' ? 'bg-red-400' : riskCategory === 'MODERATE' ? 'bg-amber-400' : 'bg-emerald-400'
          }`} />
          <span className="text-xs font-bold tracking-wider">
            {riskCategory} PREDICTED RISK ({riskScore}%)
          </span>
        </div>
      </div>

      {/* Floating 3D Region Callout Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 flex flex-col space-y-1.5 pointer-events-auto max-w-[260px] bg-slate-900/85 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 shadow-xl text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            Anatomy Regions
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">Click to inspect</span>
        </div>

        <button
          onClick={() => setActiveRegion(getRegionDetails('myocardium'))}
          className="flex items-center justify-between hover:bg-slate-800/60 px-2 py-1 rounded text-left transition"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="text-slate-300 font-medium">Myocardium</span>
          </div>
          <span className="text-[10px] text-slate-400">{restingHeartRate} bpm</span>
        </button>

        <button
          onClick={() => setActiveRegion(getRegionDetails('coronary'))}
          className="flex items-center justify-between hover:bg-slate-800/60 px-2 py-1 rounded text-left transition"
        >
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${riskScore >= 50 ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-slate-300 font-medium">Coronary Arteries</span>
          </div>
          <span className={`text-[10px] font-semibold ${riskScore >= 50 ? 'text-red-400' : 'text-amber-400'}`}>
            {riskScore >= 50 ? 'High Risk' : 'Moderate'}
          </span>
        </button>

        <button
          onClick={() => setActiveRegion(getRegionDetails('aorta'))}
          className="flex items-center justify-between hover:bg-slate-800/60 px-2 py-1 rounded text-left transition"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span className="text-slate-300 font-medium">Aorta & Arch</span>
          </div>
          <span className="text-[10px] text-slate-400">High Pressure</span>
        </button>
      </div>

      {/* Camera and View Controls Toolbar (Bottom Right) */}
      <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 pointer-events-auto bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800/80 shadow-xl">
        <button
          title="Cardiac Closeup View"
          onClick={() => handleApplyPreset('heart')}
          className={`px-2.5 py-1 text-xs rounded-lg transition font-medium ${
            viewPreset === 'heart' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          Heart
        </button>
        <button
          title="Coronary Artery Focus"
          onClick={() => handleApplyPreset('coronary')}
          className={`px-2.5 py-1 text-xs rounded-lg transition font-medium ${
            viewPreset === 'coronary' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          Coronary
        </button>
        <button
          title="Full Torso View"
          onClick={() => handleApplyPreset('torso')}
          className={`px-2.5 py-1 text-xs rounded-lg transition font-medium ${
            viewPreset === 'torso' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          Torso
        </button>

        <div className="w-[1px] h-4 bg-slate-700 mx-1" />

        <button
          title={isRotating ? 'Pause Rotation' : 'Resume Auto-Rotate'}
          onClick={() => setIsRotating(!isRotating)}
          className={`p-1.5 rounded-lg transition ${isRotating ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-400 hover:text-white'}`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          title="Toggle Torso Silhouette"
          onClick={() => setShowTorsoMesh(!showTorsoMesh)}
          className={`p-1.5 rounded-lg transition ${showTorsoMesh ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        <button
          title="Reset Camera"
          onClick={handleResetCamera}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Selected Region Detailed Modal/Drawer */}
      {activeRegion && (
        <div className="absolute top-16 right-3 max-w-sm w-80 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 shadow-2xl z-20 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-3">
            <div>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-cyan-400">{activeRegion.category}</span>
              <h4 className="text-sm font-bold text-slate-100">{activeRegion.name}</h4>
            </div>
            <button
              onClick={() => setActiveRegion(null)}
              className="text-slate-400 hover:text-slate-100 text-xs px-2 py-1 rounded-md bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">Model-Associated Risk Status</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                  activeRegion.modelRisk === 'HIGH' || activeRegion.modelRisk === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : activeRegion.modelRisk === 'MODERATE'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {activeRegion.modelRisk} PREDICTED RISK
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">Physiological Significance</span>
              <p className="text-slate-300 leading-relaxed text-[11.5px]">{activeRegion.clinicalSignificance}</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Key Contributing Drivers</span>
              <div className="flex flex-wrap gap-1.5">
                {activeRegion.keyDrivers.map((driver, idx) => (
                  <span key={idx} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60 text-[10.5px]">
                    {driver}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>Model-associated educational risk visualization. Not actual clinical imagery.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
