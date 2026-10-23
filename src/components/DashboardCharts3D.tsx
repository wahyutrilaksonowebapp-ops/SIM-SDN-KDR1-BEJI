import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Pegawai, Siswa, NilaiIjazahBTQ } from '../types';
import { 
  Users, 
  GraduationCap, 
  RotateCw, 
  Eye, 
  Maximize2, 
  Sparkles, 
  Award, 
  BookOpen, 
  Layers, 
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';

interface DashboardCharts3DProps {
  pegawai: Pegawai[];
  siswa: Siswa[];
  btq: NilaiIjazahBTQ[];
}

export const DashboardCharts3D: React.FC<DashboardCharts3DProps> = ({
  pegawai,
  siswa,
  btq,
}) => {
  // Mode toggles
  const [pegawaiMode, setPegawaiMode] = useState<'status' | 'gender'>('status');
  const [siswaMode, setSiswaMode] = useState<'kelas' | 'gender' | 'btq'>('kelas');
  const [autoRotate, setAutoRotate] = useState(true);

  // Hover states for tooltips
  const [hoveredPegawaiItem, setHoveredPegawaiItem] = useState<{ label: string; count: number; percent: number; color: string } | null>(null);
  const [hoveredSiswaItem, setHoveredSiswaItem] = useState<{ label: string; count: number; percent: number; color: string } | null>(null);

  // Canvas Refs
  const pegawaiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const siswaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // -------------------------------------------------------------
  // DATA CALCULATION
  // -------------------------------------------------------------
  const totalPegawai = pegawai.length || 1;
  const pnsCount = pegawai.filter((p) => p.statusKepegawaian === 'PNS').length;
  const pppkCount = pegawai.filter((p) => p.statusKepegawaian === 'PPPK').length;
  const nonAsnCount = pegawai.filter((p) => p.statusKepegawaian === 'GTT' || p.statusKepegawaian === 'PTT').length;

  const pegLakiCount = pegawai.filter((p) => p.jenisKelamin === 'L').length;
  const pegPerempuanCount = pegawai.filter((p) => p.jenisKelamin === 'P').length;

  const pegawaiData = pegawaiMode === 'status' ? [
    { label: 'PNS (Pegawai Negeri Sipil)', shortLabel: 'PNS', count: pnsCount, percent: Number(((pnsCount / totalPegawai) * 100).toFixed(1)), color: '#2563EB', hex: 0x2563EB },
    { label: 'PPPK (Pegawai P3K)', shortLabel: 'PPPK', count: pppkCount, percent: Number(((pppkCount / totalPegawai) * 100).toFixed(1)), color: '#059669', hex: 0x059669 },
    { label: 'Non-ASN (GTT / PTT)', shortLabel: 'Non-ASN', count: nonAsnCount, percent: Number(((nonAsnCount / totalPegawai) * 100).toFixed(1)), color: '#D97706', hex: 0xD97706 },
  ] : [
    { label: 'Laki-laki (♂)', shortLabel: 'Laki-laki', count: pegLakiCount, percent: Number(((pegLakiCount / totalPegawai) * 100).toFixed(1)), color: '#0284C7', hex: 0x0284C7 },
    { label: 'Perempuan (♀)', shortLabel: 'Perempuan', count: pegPerempuanCount, percent: Number(((pegPerempuanCount / totalPegawai) * 100).toFixed(1)), color: '#E11D48', hex: 0xE11D48 },
  ];

  const totalSiswa = siswa.length || 1;
  const siswaLakiCount = siswa.filter((s) => s.jenisKelamin === 'L').length;
  const siswaPerempuanCount = siswa.filter((s) => s.jenisKelamin === 'P').length;

  const kelasColors = ['#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];
  const kelasHex = [0x10B981, 0x06B6D4, 0x3B82F6, 0x6366F1, 0x8B5CF6, 0xEC4899];

  const perKelasData = [1, 2, 3, 4, 5, 6].map((k, idx) => {
    const c = siswa.filter((s) => s.kelas === k).length;
    return {
      label: `Kelas ${k}`,
      shortLabel: `Kls ${k}`,
      count: c,
      percent: Number(((c / totalSiswa) * 100).toFixed(1)),
      color: kelasColors[idx],
      hex: kelasHex[idx],
    };
  });

  const siswaGenderData = [
    { label: 'Laki-laki (♂)', shortLabel: 'Laki-laki', count: siswaLakiCount, percent: Number(((siswaLakiCount / totalSiswa) * 100).toFixed(1)), color: '#0284C7', hex: 0x0284C7 },
    { label: 'Perempuan (♀)', shortLabel: 'Perempuan', count: siswaPerempuanCount, percent: Number(((siswaPerempuanCount / totalSiswa) * 100).toFixed(1)), color: '#E11D48', hex: 0xE11D48 },
  ];

  const totalBtq = btq.length || 1;
  const btqLulus = btq.filter((b) => b.statusKelulusan === 'Lulus').length;
  const btqProses = Math.max(0, totalBtq - btqLulus);
  const btqData = [
    { label: 'Lulus Sertifikasi BTQ', shortLabel: 'Lulus', count: btqLulus, percent: Number(((btqLulus / totalBtq) * 100).toFixed(1)), color: '#059669', hex: 0x059669 },
    { label: 'Proses Pembinaan BTQ', shortLabel: 'Pembinaan', count: btqProses, percent: Number(((btqProses / totalBtq) * 100).toFixed(1)), color: '#D97706', hex: 0xD97706 },
  ];

  const activeSiswaData = siswaMode === 'kelas' ? perKelasData : siswaMode === 'gender' ? siswaGenderData : btqData;

  // -------------------------------------------------------------
  // THREE.JS SCENE 1: KEPEGAWAIAN 3D PIE / DONUT CHART
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = pegawaiCanvasRef.current;
    if (!canvas) return;

    let animationId: number;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const width = canvas.clientWidth || 380;
    const height = canvas.clientHeight || 280;
    renderer.setSize(width, height, false);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5.5, 6.5);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa7f3d0, 0.8);
    dirLight2.position.set(-5, -2, -5);
    scene.add(dirLight2);

    // Group for chart
    const chartGroup = new THREE.Group();
    scene.add(chartGroup);

    // Ground reflective disc pedestal
    const groundGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.25, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.4,
      metalness: 0.3,
      transparent: true,
      opacity: 0.7,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.5;
    chartGroup.add(groundMesh);

    // Inner glowing ring
    const ringGeo = new THREE.RingGeometry(1.0, 1.08, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -0.36;
    chartGroup.add(ringMesh);

    // Build 3D Extruded Pie Slices
    const meshes: { mesh: THREE.Mesh; item: any; targetY: number }[] = [];
    let startAngle = 0;
    const outerRadius = 2.4;
    const innerRadius = 0.95;
    const heightSlice = 0.85;

    pegawaiData.forEach((item) => {
      const angle = (item.count / totalPegawai) * Math.PI * 2;
      if (angle <= 0.001) return;

      const shape = new THREE.Shape();
      // Outer arc
      shape.absarc(0, 0, outerRadius, startAngle, startAngle + angle, false);
      // Inner arc
      shape.absarc(0, 0, innerRadius, startAngle + angle, startAngle, true);
      shape.closePath();

      const extrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: heightSlice,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.05,
        bevelThickness: 0.05,
      };

      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.rotateX(Math.PI / 2); // Align horizontally

      const mat = new THREE.MeshStandardMaterial({
        color: item.hex,
        roughness: 0.2,
        metalness: 0.25,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = -0.2;
      mesh.userData = { item };

      chartGroup.add(mesh);
      meshes.push({ mesh, item, targetY: -0.2 });

      startAngle += angle;
    });

    // Raycaster for Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        chartGroup.rotation.y += deltaX * 0.01;
        chartGroup.rotation.x = Math.max(-0.4, Math.min(0.4, chartGroup.rotation.x + deltaY * 0.005));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(meshes.map((m) => m.mesh));
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const matched = meshes.find((m) => m.mesh === hit);
          if (matched) {
            setHoveredPegawaiItem(matched.item);
            canvas.style.cursor = 'pointer';
            meshes.forEach((m) => {
              m.targetY = m.mesh === hit ? 0.15 : -0.2;
            });
            return;
          }
        }
        setHoveredPegawaiItem(null);
        canvas.style.cursor = 'default';
        meshes.forEach((m) => {
          m.targetY = -0.2;
        });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseLeave = () => {
      isDragging = false;
      setHoveredPegawaiItem(null);
      meshes.forEach((m) => {
        m.targetY = -0.2;
      });
    };

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Resize Handler
    const handleResize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        chartGroup.rotation.y += 0.006;
      }

      // Smooth elevate hovered mesh
      meshes.forEach((m) => {
        m.mesh.position.y += (m.targetY - m.mesh.position.y) * 0.15;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);

      meshes.forEach((m) => {
        m.mesh.geometry.dispose();
        if (Array.isArray(m.mesh.material)) {
          m.mesh.material.forEach((mat) => mat.dispose());
        } else {
          m.mesh.material.dispose();
        }
      });
      groundGeo.dispose();
      groundMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [pegawaiData, autoRotate, pegawaiMode, totalPegawai]);

  // -------------------------------------------------------------
  // THREE.JS SCENE 2: KESISWAAN 3D PILLARS / BARS
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = siswaCanvasRef.current;
    if (!canvas) return;

    let animationId: number;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const width = canvas.clientWidth || 380;
    const height = canvas.clientHeight || 280;
    renderer.setSize(width, height, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 6, 8);
    camera.lookAt(0, 0, 0);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight1.position.set(5, 12, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.9);
    dirLight2.position.set(-6, 2, -6);
    scene.add(dirLight2);

    const chartGroup = new THREE.Group();
    scene.add(chartGroup);

    // Base podium platform
    const platformGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.25, 48);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.4,
      transparent: true,
      opacity: 0.75,
    });
    const platformMesh = new THREE.Mesh(platformGeo, platformMat);
    platformMesh.position.y = -0.5;
    chartGroup.add(platformMesh);

    // Grid Floor Circle Accent
    const gridCircleGeo = new THREE.RingGeometry(3.2, 3.28, 48);
    const gridCircleMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const gridCircle = new THREE.Mesh(gridCircleGeo, gridCircleMat);
    gridCircle.rotation.x = -Math.PI / 2;
    gridCircle.position.y = -0.36;
    chartGroup.add(gridCircle);

    // Pillars Mesh array
    const meshes: { mesh: THREE.Mesh; item: any; baseScaleY: number }[] = [];
    const count = activeSiswaData.length;
    const maxVal = Math.max(...activeSiswaData.map((d) => d.count), 1);
    const radius = 2.1;

    activeSiswaData.forEach((item, idx) => {
      const angle = (idx / count) * Math.PI * 2;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      const normHeight = (item.count / maxVal) * 2.8 + 0.4;
      const pillarGeo = new THREE.CylinderGeometry(0.35, 0.38, normHeight, 24);
      pillarGeo.translate(0, normHeight / 2, 0); // Origin at base

      const pillarMat = new THREE.MeshStandardMaterial({
        color: item.hex,
        roughness: 0.25,
        metalness: 0.2,
      });

      const mesh = new THREE.Mesh(pillarGeo, pillarMat);
      mesh.position.set(x, -0.38, z);
      mesh.userData = { item, normHeight };

      // Top glowing cap disc
      const capGeo = new THREE.CylinderGeometry(0.37, 0.37, 0.05, 24);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.5,
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = normHeight;
      mesh.add(cap);

      chartGroup.add(mesh);
      meshes.push({ mesh, item, baseScaleY: 1 });
    });

    // Center Core 3D Diamond / Trophy
    const coreGeo = new THREE.OctahedronGeometry(0.55);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 1.0;
    chartGroup.add(coreMesh);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        chartGroup.rotation.y += deltaX * 0.01;
        chartGroup.rotation.x = Math.max(-0.4, Math.min(0.4, chartGroup.rotation.x + deltaY * 0.005));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(meshes.map((m) => m.mesh));
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const matched = meshes.find((m) => m.mesh === hit);
          if (matched) {
            setHoveredSiswaItem(matched.item);
            canvas.style.cursor = 'pointer';
            meshes.forEach((m) => {
              if (m.mesh === hit) {
                m.mesh.scale.set(1.15, 1.15, 1.15);
              } else {
                m.mesh.scale.set(1, 1, 1);
              }
            });
            return;
          }
        }
        setHoveredSiswaItem(null);
        canvas.style.cursor = 'default';
        meshes.forEach((m) => {
          m.mesh.scale.set(1, 1, 1);
        });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseLeave = () => {
      isDragging = false;
      setHoveredSiswaItem(null);
      meshes.forEach((m) => {
        m.mesh.scale.set(1, 1, 1);
      });
    };

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        chartGroup.rotation.y += 0.006;
      }
      coreMesh.rotation.y += 0.02;
      coreMesh.rotation.x += 0.01;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);

      meshes.forEach((m) => {
        m.mesh.geometry.dispose();
        if (Array.isArray(m.mesh.material)) {
          m.mesh.material.forEach((mat) => mat.dispose());
        } else {
          m.mesh.material.dispose();
        }
      });
      platformGeo.dispose();
      platformMat.dispose();
      gridCircleGeo.dispose();
      gridCircleMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      renderer.dispose();
    };
  }, [activeSiswaData, autoRotate, totalSiswa]);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold tracking-wide text-white">
                Visualisasi 3D Interaktif Rekapitulasi Data Lembaga
              </h3>
              <span className="text-[10px] bg-emerald-700/80 text-emerald-200 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Three.js WebGL
              </span>
              <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full">
                Real-Time Prosentase
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Putar model 3D dengan mouse/sentuhan, amati sudut ruang, dan arahkan kursor ke elemen grafik untuk rincian persentase data.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              autoRotate 
                ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50 hover:bg-emerald-600/50' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Aktifkan/nonaktifkan rotasi otomatis 3D"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>{autoRotate ? 'Rotasi 3D Aktif' : 'Rotasi Diam'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Side-by-Side 3D Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ========================================================= */}
        {/* GRAFIK 3D 1: REKAP KEPEGAWAIAN (GTK) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Grafik 3D Prosentase Kepegawaian & GTK
                </h4>
                <div className="text-[11px] text-slate-500">
                  Total Terdaftar: <strong className="text-slate-800">{totalPegawai} Personil</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPegawaiMode('status')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  pegawaiMode === 'status' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Status ASN
              </button>
              <button
                type="button"
                onClick={() => setPegawaiMode('gender')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  pegawaiMode === 'gender' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gender (L/P)
              </button>
            </div>
          </div>

          {/* 3D Canvas Viewport */}
          <div className="relative w-full h-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
            <canvas 
              ref={pegawaiCanvasRef} 
              className="w-full h-full block cursor-grab active:cursor-grabbing"
            />

            {/* Hover Tooltip Overlay */}
            {hoveredPegawaiItem && (
              <div 
                className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white px-3 py-1.5 rounded-xl shadow-lg text-xs pointer-events-none animate-in fade-in"
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredPegawaiItem.color }} />
                  <span>{hoveredPegawaiItem.label}</span>
                </div>
                <div className="text-emerald-300 font-mono text-[11px] mt-0.5">
                  Jumlah: <strong>{hoveredPegawaiItem.count} Personil</strong> ({hoveredPegawaiItem.percent}%)
                </div>
              </div>
            )}

            <div className="absolute bottom-2 right-3 text-[10px] text-slate-500 font-mono pointer-events-none">
              Geser mouse / sentuh untuk memutar 3D
            </div>
          </div>

          {/* Data List & Percentage Bars */}
          <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-2.5">
            {pegawaiData.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-800">{item.label}</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900">
                    {item.count} <span className="text-slate-500 font-normal">({item.percent}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* GRAFIK 3D 2: REKAP KESISWAAN */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Grafik 3D Prosentase Kesiswaan
                </h4>
                <div className="text-[11px] text-slate-500">
                  Total Terdaftar: <strong className="text-slate-800">{totalSiswa} Siswa</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto flex-wrap gap-0.5">
              <button
                type="button"
                onClick={() => setSiswaMode('kelas')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  siswaMode === 'kelas' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tingkat Kelas
              </button>
              <button
                type="button"
                onClick={() => setSiswaMode('gender')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  siswaMode === 'gender' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gender (L/P)
              </button>
              <button
                type="button"
                onClick={() => setSiswaMode('btq')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  siswaMode === 'btq' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kelulusan BTQ
              </button>
            </div>
          </div>

          {/* 3D Canvas Viewport */}
          <div className="relative w-full h-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
            <canvas 
              ref={siswaCanvasRef} 
              className="w-full h-full block cursor-grab active:cursor-grabbing"
            />

            {/* Hover Tooltip Overlay */}
            {hoveredSiswaItem && (
              <div 
                className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white px-3 py-1.5 rounded-xl shadow-lg text-xs pointer-events-none animate-in fade-in"
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredSiswaItem.color }} />
                  <span>{hoveredSiswaItem.label}</span>
                </div>
                <div className="text-cyan-300 font-mono text-[11px] mt-0.5">
                  Jumlah: <strong>{hoveredSiswaItem.count} Siswa</strong> ({hoveredSiswaItem.percent}%)
                </div>
              </div>
            )}

            <div className="absolute bottom-2 right-3 text-[10px] text-slate-500 font-mono pointer-events-none">
              Geser mouse / sentuh untuk memutar 3D
            </div>
          </div>

          {/* Data List & Percentage Grid */}
          <div className="p-4 bg-slate-50/70 border-t border-slate-100">
            <div className={`grid gap-2 text-xs ${siswaMode === 'kelas' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {activeSiswaData.map((item) => (
                <div key={item.label} className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.shortLabel || item.label}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">{item.count}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Prosentase:</span>
                    <strong className="text-emerald-700">{item.percent}%</strong>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
