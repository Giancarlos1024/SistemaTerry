import React, { useEffect, useRef, useState } from 'react';
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
  pausado = false,
  rutasPersonalizadas,
  indiceHistorial = null   
}) => {
  const containerRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const controlsRef = useRef();
  const carroRef = useRef(null);
  const carroIdRef = useRef(carroSeleccionado);
  const indexRef = useRef(0);
  const pauseStateRef = useRef(pausado);
  const stepProgressRef = useRef(0);
  const velocidadRef = useRef(velocidad);
  const historialFiltradoRef = useRef([]);
  const [hoverData, setHoverData] = useState(null);
  const [infoCarro, setInfoCarro] = useState(null);
  useEffect(() => {
    pauseStateRef.current = pausado;
  }, [pausado]);

  useEffect(() => {
    velocidadRef.current = velocidad;
  }, [velocidad]);

  useEffect(() => {
    carroIdRef.current = carroSeleccionado;
  }, [carroSeleccionado]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // 💡 Luz ambiental para iluminar rutas y modelos correctamente
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);
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
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = carroRef.current?.mesh
      ? raycaster.intersectObject(carroRef.current.mesh, true)
      : [];
      if (intersects.length > 0) {
        const pos = carroRef.current.mesh.position;
        setHoverData({
          id: carroIdRef.current,
          coords: `x: ${pos.x.toFixed(1)}, y: ${pos.y.toFixed(1)}, z: ${pos.z.toFixed(1)}`,
          speed: `${(velocidadRef.current * 100).toFixed(2)} u/s`,
          time: historialFiltradoRef.current[indexRef.current]?.timestamp ?? '---',  // ← esta línea corregida
        });
      } else {
        setHoverData(null);
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
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
      const points = [new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(1000)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    };
    drawAxis(new THREE.Vector3(1, 0, 0), 0xff0000);
    drawAxis(new THREE.Vector3(0, 1, 0), 0x00ff00);
    drawAxis(new THREE.Vector3(0, 0, 1), 0x0000ff);
    const animate = () => {
      requestAnimationFrame(animate);
      if (!carroRef.current || carroRef.current.ruta.length < 2) {
        renderer.render(sceneRef.current, cameraRef.current);
      
        return;
      }
      const { mesh, ruta, luces, halo } = carroRef.current;
      if (!pauseStateRef.current) {
        const i = indexRef.current;
        const p1 = ruta[i];
        const p2 = ruta[i + 1];

        if (p2) {
          const dir = new THREE.Vector3().subVectors(p2, p1);
          const distancia = dir.length();
          dir.normalize();
          stepProgressRef.current += velocidadRef.current;

          if (stepProgressRef.current >= 1) {
            indexRef.current++;
            stepProgressRef.current = 0;
          } else {
            const newPos = p1.clone().add(dir.multiplyScalar(distancia * stepProgressRef.current));
            mesh.position.copy(newPos);
            mesh.lookAt(newPos.clone().add(dir));
          }

          if (indexRef.current >= ruta.length - 1) {
            indexRef.current = ruta.length - 1;
            stepProgressRef.current = 0;
          }
        } else {
          // ✅ Si no hay p2, estamos en el último punto. Colócalo directamente
          if (p1) {
            mesh.position.copy(p1);
          }
        }
      }


      luces?.forEach(light => light.visible = !pauseStateRef.current);
      if (halo) halo.rotation.z += 0.1;
      controls.update();
      renderer.render(sceneRef.current, cameraRef.current);
    };
    animate();
    return () => {
        rendererRef.current?.domElement?.removeEventListener('mousemove', handleMouseMove); // ✅ AQUÍ
      if (carroRef.current?.linea) {
        scene.remove(carroRef.current.linea);
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
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !rutasPersonalizadas?.length) return;

    // ✅ Evitar duplicar rutas al recargar
    sceneRef.current.children
      .filter(obj => obj.userData?.tipo === 'rutaPersonalizada')
      .forEach(obj => {
        sceneRef.current.remove(obj);
        obj.geometry.dispose();
        obj.material.dispose();
      });

    const colorMap = {
      "Ruta animada": 0x87CEFA,
      "Celeste": 0xff00ff,
      "Rosado": 0xFFC0CB,
      "Violeta":0x8A2BE2,
      "Azul": 0x0000ff,
      "Naranja": 0xFFA500,
      "Azul_Marino":0xFFFF00, //amarillo,
      "Rosa_Marino":0xC080A0 ,
      "Morado": 0x800080,     // Purple
      "Rojo": 0xFF0000,       // Red
      "Verde": 0xFF7F50,      // Green
      "Blanco": 0xFFFFFF,    // White
      "Dorado": 0xFFD700,
      "Marron":0xCCCCCC,
      "Turquesa":0x40E0D0
    };

  const coordenadasEtiquetas = {
    "Celeste": new THREE.Vector3(1141.2003, 13391.1088, -21978.56),
    "Turquesa": new THREE.Vector3(-5660.0181, 13168.3488, -7622.5311),
    // ... otras rutas
  };
  rutasPersonalizadas.forEach(rutaPersonal => {
    const puntosRuta = rutaPersonal.puntos.map(p => new THREE.Vector3(p.x, p.y, p.z ?? 0));
    // Validación
    if (
      puntosRuta.some(
        p => !p || isNaN(p.x) || isNaN(p.y) || isNaN(p.z) ||
        Math.abs(p.x) > 100000 || Math.abs(p.y) > 100000 || Math.abs(p.z) > 100000
      )
    ) {
      // console.warn(`❌ Ruta descartada por valores fuera de rango o datos inválidos: ${rutaPersonal.nombre}`);
      return;
    }
    if (puntosRuta.length > 1) {
      const curve = new THREE.CatmullRomCurve3(puntosRuta);
      const tubeGeometry = new THREE.TubeGeometry(curve, 100, 40, 16, false);
      const colorRuta = colorMap[rutaPersonal.nombre] || 0x00ffff;
      const esRutaAnimada = rutaPersonal.nombre === "Ruta animada";
      const material = new THREE.MeshPhysicalMaterial({
        color: colorRuta,
        transparent: true,
        opacity: 1,
        roughness: 0.3,
        metalness: 0.5,
        reflectivity: 0.6,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
      });
      const tuboRutaPersonalizada = new THREE.Mesh(tubeGeometry, material);
      tuboRutaPersonalizada.castShadow = true;
      tuboRutaPersonalizada.receiveShadow = true;
      tuboRutaPersonalizada.userData.tipo = 'rutaPersonalizada';
      sceneRef.current.add(tuboRutaPersonalizada);

      // 👇 Aquí agregas el nombre de la ruta
      const midPoint = coordenadasEtiquetas[rutaPersonal.nombre] || curve.getPoint(0.5);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.font = 'Bold 60px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(rutaPersonal.nombre, 0, 60);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(2000, 1000, 1); // ajusta el tamaño
      // Mover el texto más arriba (aumenta el valor Y) y girar hacia el eje del usuario
      sprite.position.copy(midPoint.clone().add(new THREE.Vector3(0, 500, 0))); // sube 1000 unidades en Y
      // Rotar el texto para que siempre mire hacia la cámara (opcional si usas Sprite), o girar en un eje:
      sprite.material.rotation = 2 * Math.PI;// 🔁 rota 45 grados (puedes usar -Math.PI/2, etc.)
      sprite.userData.tipo = 'rutaPersonalizada';
      sceneRef.current.add(sprite);
    }
  });
}, [rutasPersonalizadas]);

  useEffect(() => {
    if (!sceneRef.current || !carroSeleccionado || historial.length === 0 || puntos.length === 0) return;
    console.log('🚗 carroSeleccionado:', carroSeleccionado);
    console.log('📦 historial:', historial);
    console.log('📍 puntos:', puntos);
    // ✅ LIMPIAR esferas verdes anteriores
    sceneRef.current.children
      .filter(obj => obj.userData?.tipo === 'esfera')
      .forEach(obj => {
        sceneRef.current.remove(obj);
        obj.geometry.dispose();
        obj.material.dispose();
      });
    // ✅ LIMPIAR rutas anteriores
      sceneRef.current.children
      .filter(obj => obj.userData?.tipo === 'rutaHistorial')
      .forEach(obj => {
        sceneRef.current.remove(obj);
        obj.geometry.dispose();
        obj.material.dispose();
      });

    // ✅ LIMPIAR recorrido adicional anterior
    sceneRef.current.children
      .filter(obj => obj.userData?.tipo === 'recorridoAdicional')
      .forEach(obj => {
        sceneRef.current.remove(obj);
        obj.geometry.dispose();
        obj.material.dispose();
      });
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const historialFiltrado = historial
      .filter((h) => h.carro_id?.trim().toLowerCase() === carroSeleccionado.trim().toLowerCase())
      .filter((h) => {
        const t = new Date(h.timestamp);
        
        return t >= inicio && t <= fin;
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    // console.log('✅ historialFiltrado:', historialFiltrado);
    historialFiltradoRef.current = historialFiltrado;
    // console.log("🔍 Comparando punto_id del historial con IDs de puntos...");
    //console.log("📋 Revisando campos del historial:");
    // console.table(historialFiltrado.map(h => ({ carro: h.carro_id, punto_id: h.punto_id, timestamp: h.timestamp })));
    const ruta = historialFiltrado
      .map((h) => {
        const punto = puntos.find((p) => Number(p.id) === Number(h.punto_id));
        if (!punto) {
          console.warn(`❌ No se encontró punto para punto_id=${h.punto_id}`);
          return null;
        } else {
          console.log(`✅ Punto encontrado: punto_id=${h.punto_id} => (${punto.x}, ${punto.y}, ${punto.z})`);
          return new THREE.Vector3(punto.x, punto.y, punto.z ?? 0);
        }
      })
      .filter(Boolean);
    // console.log("🛣️ Ruta generada (Vector3):", ruta);
    // ✅ LIMPIAR carro anterior si existe
    if (carroRef.current?.mesh) {
      sceneRef.current.remove(carroRef.current.mesh);
    }
    if (carroRef.current?.linea) {
      sceneRef.current.remove(carroRef.current.linea);
      carroRef.current.linea.geometry.dispose();
      carroRef.current.linea.material.dispose();
    }
    const puntosUsados = historialFiltrado
    .map((h) => puntos.find((p) => p.id === h.punto_id))
    .filter(Boolean);
    puntosUsados.forEach((p) => {
      const esfera = new THREE.Mesh(
        new THREE.SphereGeometry(40, 16, 16),
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
        model.scale.set(2,2, 2);
        model.rotation.y = -Math.PI / 2;
        const group = new THREE.Group();
        group.add(model);
        // ✨ Clon luminoso del carro para efecto de glow
       const glowCar = model.clone(true);
        glowCar.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({
              color: 0x00ffff,               // Color brillante
              transparent: true,
              opacity: 0.1,                  // Más opacidad
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              side: THREE.DoubleSide,
            });
            child.scale.multiplyScalar(1); // Aumenta el tamaño del glow
          }
        });
        group.add(glowCar);
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
        const curve = new THREE.CatmullRomCurve3(ruta);
        const tubeGeometry = new THREE.TubeGeometry(curve, 100, 10, 32, false);
        const tubeMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 1,
          roughness: 0.2,
          metalness: 0.5,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
        });
        const tubo = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tubo.userData.tipo = 'rutaHistorial'; // ✅ se limpia solo cuando debe
        sceneRef.current.add(tubo);
        carroRef.current = {
          mesh: group,
          ruta: ruta,
          linea: tubo, // ← ahora es el tubo
          luces: [headlightLeft, headlightRight],
          halo: halo,
        };
        indexRef.current = 0;
      });
      // 🔵 Línea visual adicional para el recorrido del carro
      if (ruta.length > 1) {
        const recorridoGeometry = new THREE.BufferGeometry().setFromPoints(ruta);
        const recorridoMaterial = new THREE.LineBasicMaterial({
          color: 0x00ff00, // Verde brillante
          transparent: true,
          opacity: 1, // Aumentar opacidad
          blending: THREE.AdditiveBlending, // Glow
          depthTest: false, // Forzar que siempre se vea
        });

        const recorridoLine = new THREE.Line(recorridoGeometry, recorridoMaterial);
        recorridoLine.userData.tipo = 'recorridoAdicional'; // para poder limpiar si lo deseas

        sceneRef.current.add(recorridoLine);
      }

    }
  }, [historial, carroSeleccionado, fechaInicio, fechaFin, puntos]);
 useEffect(() => {
  if (!carroRef.current || !carroRef.current.ruta || !carroRef.current.ruta.length) return;
  const ruta = carroRef.current.ruta;
  const i = indiceHistorial;

  // Asegúrate de que el índice no se pase del último
  if (i >= 0 && i < ruta.length) {
    const pos = ruta[i];
    carroRef.current.mesh.position.copy(pos);
    if (i < ruta.length - 1) {
      const dir = new THREE.Vector3().subVectors(ruta[i + 1], pos).normalize();
      carroRef.current.mesh.lookAt(pos.clone().add(dir));
    }
  }
  indexRef.current = i;
  stepProgressRef.current = 0;
}, [indiceHistorial]);

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
      {hoverData && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          padding: '12px',
          backgroundColor: 'rgba(255,255,255,0.95)',
          border: '1px solid #ccc',
          borderRadius: '8px',
          zIndex: 1000
        }}>
          <p><strong>🚗 ID:</strong> {hoverData.id}</p>
          <p><strong>📍 Posición:</strong> {hoverData.coords}</p>
          <p><strong>⚡ Velocidad:</strong> {hoverData.speed}</p>
          <p><strong>🕒 Tiempo:</strong> {hoverData.time}</p>
        </div>
      )}
    </div>
  );
};
export default Mapa3D;
