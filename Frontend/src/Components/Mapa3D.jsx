import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import CameraCube from './CameraCube';

const Mapa3D = ({
  puntos = [],
  historial = [],
  carroSeleccionado = '',
  velocidad = 0.01,
  fechaInicio = '',
  fechaFin = '',
}) => {
  const containerRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const controlsRef = useRef();
  const carroRef = useRef(null);
  const indexRef = useRef(0);
  const animationFrameRef = useRef();
  
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100000
    );
    camera.position.set(0, 10000, 20000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controlsRef.current = controls;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10000, 10000).normalize();
    scene.add(light);

    const drawAxis = (dir, color) => {
      const material = new THREE.LineBasicMaterial({ color });
      const points = [new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(15000)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    };
    drawAxis(new THREE.Vector3(1, 0, 0), 0xff0000);
    drawAxis(new THREE.Vector3(0, 1, 0), 0x00ff00);
    drawAxis(new THREE.Vector3(0, 0, 1), 0x0000ff);

    const animate = () => {
      requestAnimationFrame(animate);

      if (!carroRef.current || carroRef.current.ruta.length < 2) return;

      const { mesh, ruta, luces, halo } = carroRef.current;
      const i = indexRef.current;
      const p1 = ruta[i];
      const p2 = ruta[i + 1];
      if (!p2) return;

      luces?.forEach(light => light.visible = true);

      const pos = mesh.position.clone();
      const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
      const paso = velocidad * p1.distanceTo(p2);
      pos.add(dir.clone().multiplyScalar(paso));
      mesh.position.copy(pos);
      mesh.lookAt(pos.clone().add(dir));

      if (pos.distanceTo(p2) < 10) indexRef.current++;
      if (indexRef.current >= ruta.length - 1) indexRef.current = ruta.length - 1;

      if (halo) {
        halo.rotation.z += 0.1;
      }

      controls.update();
      renderer.render(sceneRef.current, cameraRef.current);
    };

    animate();

    return () => {
      if (carroRef.current?.linea) {
        sceneRef.current.remove(carroRef.current.linea);
        carroRef.current.linea.geometry.dispose();
        carroRef.current.linea.material.dispose();
        carroRef.current.linea = null;
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss?.();
        rendererRef.current.domElement?.remove();
        rendererRef.current = null;
      }

      if (sceneRef.current) {
        sceneRef.current.traverse((obj) => {
          if (obj.isMesh) {
            obj.geometry?.dispose();
            Array.isArray(obj.material)
              ? obj.material.forEach((m) => m.dispose?.())
              : obj.material?.dispose();
          }
        });
      }

      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, [velocidad]);

  useEffect(() => {
    if (!sceneRef.current || !carroSeleccionado || historial.length === 0 || puntos.length === 0) return;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const historialFiltrado = historial
      .filter((h) => h.carro_id === carroSeleccionado)
      .filter((h) => {
        const t = new Date(h.timestamp);
        return t >= inicio && t <= fin;
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const ruta = historialFiltrado
      .map((h) => puntos.find((p) => p.nombre.toLowerCase().trim() === h.punto_nombre.toLowerCase().trim()))
      .filter(Boolean)
      .map((p) => new THREE.Vector3(p.x, p.y, p.z ?? 0));

    console.log("Ruta generada con", ruta.length, "puntos.");

    if (carroRef.current?.mesh) {
      sceneRef.current.remove(carroRef.current.mesh);
    }
    if (carroRef.current?.linea) {
      sceneRef.current.remove(carroRef.current.linea);
      carroRef.current.linea.geometry.dispose();
      carroRef.current.linea.material.dispose();
    }

    // 🔁 Eliminar esferas anteriores
    sceneRef.current.children
      .filter(obj => obj.userData?.tipo === 'esfera')
      .forEach(obj => {
        sceneRef.current.remove(obj);
        obj.geometry.dispose();
        obj.material.dispose();
      });

    // ✅ Renderizar solo puntos del historial filtrado
    const puntosUsados = historialFiltrado
      .map((h) => puntos.find((p) => p.nombre.toLowerCase().trim() === h.punto_nombre.toLowerCase().trim()))
      .filter(Boolean);

    puntosUsados.forEach((p) => {
      const esfera = new THREE.Mesh(
        new THREE.SphereGeometry(150, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      );
      esfera.position.set(p.x, p.y, p.z ?? 0);
      esfera.userData.tipo = 'esfera';
      sceneRef.current.add(esfera);
    });

    if (ruta.length > 1) {
      const loader = new GLTFLoader();
      loader.load('/car.glb', (gltf) => {
        const model = gltf.scene;
        model.scale.set(5, 5, 5);
        model.rotation.y = -Math.PI / 2;

        const group = new THREE.Group();
        group.add(model);
        group.position.copy(ruta[0]);

        const headlightLeft = new THREE.SpotLight(0xffffff, 2, 1000);
        const headlightRight = new THREE.SpotLight(0xffffff, 2, 1000);
        headlightLeft.position.set(1.5, 1, 4);
        headlightRight.position.set(-1.5, 1, 4);
        headlightLeft.target.position.set(1.5, 1, 10);
        headlightRight.target.position.set(-1.5, 1, 10);
        headlightLeft.visible = false;
        headlightRight.visible = false;
        model.add(headlightLeft, headlightRight, headlightLeft.target, headlightRight.target);

        const sensor = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        sensor.position.set(0, 2, 0);
        model.add(sensor);

        const haloGeometry = new THREE.TorusGeometry(3, 0.1, 8, 64);
        const haloMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 });
        const halo = new THREE.Mesh(haloGeometry, haloMaterial);
        halo.rotation.x = Math.PI / 2;
        halo.position.set(0, 2.2, 0);
        model.add(halo);

        sceneRef.current.add(group);

        const geometryLine = new THREE.BufferGeometry().setFromPoints(ruta);
        const materialLine = new THREE.LineBasicMaterial({ color: 0xffff00 });
        const lineaRuta = new THREE.Line(geometryLine, materialLine);
        sceneRef.current.add(lineaRuta);

        carroRef.current = {
          mesh: group,
          ruta: ruta,
          linea: lineaRuta,
          luces: [headlightLeft, headlightRight],
          halo: halo,
        };

        indexRef.current = 0;
      });
    }
  }, [historial, carroSeleccionado, fechaInicio, fechaFin, puntos]);

  const setCameraView = (view) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const positions = {
      top: [0, 30000, 0],
      bottom: [0, -30000, 0],
      front: [0, 0, 30000],
      back: [0, 0, -30000],
      left: [-30000, 0, 0],
      right: [30000, 0, 0],
    };
    camera.position.set(...positions[view]);
    camera.lookAt(0, 0, 0);
    controls.update();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, width: 300, height: 300 }}>
        <CameraCube onFaceClick={setCameraView} />
      </div>
      <div
        ref={containerRef}
        tabIndex={0}
        style={{ width: '100%', height: '80vh', backgroundColor: '#000' }}
      />
    </div>
  );
};

export default Mapa3D;
