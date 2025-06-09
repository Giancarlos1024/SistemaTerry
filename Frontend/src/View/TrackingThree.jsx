import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useApi } from '../context/ApiContext';
import TrackingForms from '../Components/TrackingForms';
import CameraCube from '../Components/CameraCube';
import HistorialModal from '../Components/HistorialModal';
import WifiForm from '../Components/WifiForm';
import ControlModal from '../Components/ControlModal';
import { useNavigate } from 'react-router-dom';

const TrackingThree = () => {

    const navigate = useNavigate();

    const containerRef = useRef();
    const [puntos, setPuntos] = useState([]);
    const sceneRef = useRef();
    const cameraRef = useRef();
    const controlsRef = useRef();
    const carrosRef = useRef([]);
    const rutaAnimada = useRef([]);
    const animIndex = useRef(0);
    const wifiRef = useRef();
    const wifiPointsRef = useRef([]);
    const [showHistorial, setShowHistorial] = useState(false);
    const [showControlModal, setShowControlModal] = useState(false);
    const [historial, setHistorial] = useState([]);
    const [velocidad, setVelocidad] = useState(0.01);
    const recorridoActual = useRef([]);
    const isPausedRef = useRef(true);
    const rendererRef = useRef(null);
    const carroControlado = useRef(null);
    const { getPuntos, getRutas, getRutasPersonalizadas, getHistorial, getCarros,getHistorialVehiculos} = useApi();
    const [carroSeleccionado, setCarroSeleccionado] = useState("");

    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

    const [carroClickeado, setCarroClickeado] = useState(null);
    const [mostrarModalCarro, setMostrarModalCarro] = useState(false);

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
    const handleAddWifi = ({ nombre, x, y, z }) => {
        const isWifi = p.mactag === 'wifi';
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(isWifi ? 300 : 100, 32, 32),
            new THREE.MeshBasicMaterial({
                color: isWifi ? 0x0000ff : 0x00ff00,
                transparent: isWifi,
                opacity: isWifi ? 0.3 : 1
            })
        );
        wifiSphere.position.set(x, y, z);
        sceneRef.current.add(wifiSphere);
        wifiPointsRef.current.push({ nombre, x, y, z, mesh: wifiSphere });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = '48px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(nombre, 10, 90);
        const texture = new THREE.CanvasTexture(canvas); // no reutilices uno viejo
        texture.needsUpdate = true; // solo si lo acabas de crear
        const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
        label.scale.set(1500, 400, 1);
        label.position.set(x, y + 500, z);
        sceneRef.current.add(label);
    };

    useEffect(() => {

        let isRunning = true;
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
       if (rendererRef.current) {
            rendererRef.current.dispose();
            if (containerRef.current?.firstChild) {
                containerRef.current.removeChild(containerRef.current.firstChild);
            }
            rendererRef.current = null;
        }

        // ✅ CREA EL RENDERER AQUÍ
        const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;
        renderer.setClearColor(0x000000, 0); // fondo transparente (alfa 0)
        containerRef.current?.focus();

        // ✅ AHORA renderer sí existe y puedes usarlo
        const controls = new OrbitControls(camera, rendererRef.current.domElement);


        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
        controlsRef.current = controls;
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 10000, 10000).normalize();
        scene.add(light);
        // Dibujar líneas de los ejes X (rojo), Y (verde), Z (azul)
        const drawAxis = (dir, color) => {
            const material = new THREE.LineBasicMaterial({ color });
            const points = [];
            points.push(new THREE.Vector3(0, 0, 0));
            points.push(dir.clone().multiplyScalar(1000));
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            scene.add(line);
        };
        drawAxis(new THREE.Vector3(1, 0, 0), 0xff0000); // X - rojo
        drawAxis(new THREE.Vector3(0, 1, 0), 0x00ff00); // Y - verde
        drawAxis(new THREE.Vector3(0, 0, 1), 0x0000ff); // Z - azul
        const crearEtiqueta = (texto, posicion, color = 'white') => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.font = '48px Arial';
            ctx.fillStyle = color;
            ctx.fillText(texto, 10, 90);
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(600, 300, 1);
            sprite.position.copy(posicion);
            scene.add(sprite);
        };
        crearEtiqueta('X', new THREE.Vector3(15500, 0, 0), 'red');
        crearEtiqueta('Y', new THREE.Vector3(0, 15500, 0), 'green');
        crearEtiqueta('Z', new THREE.Vector3(0, 0, 15500), 'blue');
        const cubo = new THREE.Mesh(
            new THREE.BoxGeometry(112000, 38000, 68000),
            new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true, transparent: true, opacity: 0.3 })
        );
        // scene.add(cubo);
        const mostrarTexto = (texto, posicion) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.font = '60px Arial';
            ctx.fillStyle = 'yellow';
            ctx.fillText(texto, 10, 80);
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(4000, 2000, 1);
            sprite.position.copy(posicion);
            scene.add(sprite);
        };
        mostrarTexto('Ancho: 112,000 mm', new THREE.Vector3(0, 20000, 34000));
        mostrarTexto('Alto: 38,000 mm', new THREE.Vector3(0, 20000, 0));
        mostrarTexto('Profundidad: 68,000 mm', new THREE.Vector3(56000, 20000, 0));
        const fetchPuntos = async () => {
            const puntosData = await getPuntos();

            // ✅ Mostrar los puntos obtenidos con sus IDs
            console.log("🧠 Puntos con ID:", puntosData.map(p => ({
                id: p.id,
                nombre: p.nombre,
                x: p.x,
                y: p.y,
                z: p.z
            })));

            setPuntos(puntosData);

            puntosData.forEach(p => {
                const pos = new THREE.Vector3(p.x, p.y, p.z ?? 0);
                const isWifi = p.mactag === 'wifi';
                const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(isWifi ? 300 : 100, 32, 32),
                    new THREE.MeshBasicMaterial({
                        color: isWifi ? 0x0000ff : 0x00ff00,
                        transparent: isWifi,
                        opacity: isWifi ? 0.3 : 1
                    })
                );
                sphere.position.copy(pos);
                scene.add(sphere);
                if (isWifi) {
                    wifiPointsRef.current.push({ nombre: p.nombre, x: p.x, y: p.y, z: p.z, mesh: sphere });
                }
            });
        };
        const fetchCarros = async () => {
            const carros = await getCarros();
            carrosRef.current = carros.map(carro => {
                const mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(400, 200, 200),
                    new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
                );
                mesh.position.set(0, 100, 0);
                sceneRef.current.add(mesh);
                const labelCanvas = document.createElement('canvas');
                labelCanvas.width = 256;
                labelCanvas.height = 128;
                const labelCtx = labelCanvas.getContext('2d');
                labelCtx.font = '48px Arial';
                labelCtx.fillStyle = 'white';
                labelCtx.textAlign = 'center';
                labelCtx.textBaseline = 'middle';
                labelCtx.fillText(`${carro.id}`, labelCanvas.width / 2, labelCanvas.height / 2);
                const labelTexture = new THREE.CanvasTexture(labelCanvas);
                const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture, transparent: true });
                const labelSprite = new THREE.Sprite(labelMaterial);
                labelSprite.scale.set(1000, 400, 1); // tamaño del texto
                labelSprite.position.set(0, 300, 0); // encima del carro
                const group = new THREE.Group();
                group.add(mesh);
                group.add(labelSprite);
                sceneRef.current.add(group);
                return {
                    id: carro.id,
                    mactag: carro.mactag,
                    mesh: group,
                    ruta: rutaAnimada.current, // luego puedes asignar una ruta específica
                    index: 0,
                    recorrido: []
                };
            });
             carroControlado.current = carrosRef.current[0];
        };
        const fetchRutas = async () => {
            const rutas = await getRutas();
            rutas.forEach(r => {
                const geometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(r.x1, r.y1, r.z1),
                    new THREE.Vector3(r.x2, r.y2, r.z2)
                ]);
                const material = new THREE.LineBasicMaterial({
                    color: r.tipo === 'entrada' ? 0x00ff00 : r.tipo === 'túnel' ? 0xff0000 : 0x0000ff
                });
                scene.add(new THREE.Line(geometry, material));
            });
        };
        const fetchRutasPersonalizadas = async () => {
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
                "Verde": 0x00FF00,      // Green
                "Blanco": 0xFFFFFF,    // White
                "Dorado": 0xFFD700
            };

            const data = await getRutasPersonalizadas();
            data.forEach(ruta => {
                if (!ruta.puntos || ruta.puntos.length < 2) {
                    console.warn(`⚠️ Ruta ignorada: ${ruta.nombre}, tiene ${ruta.puntos?.length || 0} puntos`);
                    return;
                }

                const puntosRuta = ruta.puntos
                .filter(p => p && typeof p.x === 'number' && typeof p.y === 'number')
                .map(p => new THREE.Vector3(p.x, p.y, p.z ?? 0));

                // Validación para evitar rutas con puntos fuera de rango
                if (puntosRuta.some(p => 
                    Math.abs(p.x) > 100000 || 
                    Math.abs(p.y) > 100000 || 
                    Math.abs(p.z) > 100000
                )) {
                    console.warn(`❌ Ruta descartada por valores fuera de rango: ${ruta.nombre}`);
                    return;
                }

                if (puntosRuta.length < 2) {
                    console.warn(`❌ Ruta ${ruta.nombre} tiene puntos inválidos y fue omitida`);
                    return;
                }
                if (ruta.nombre === 'Ruta animada' && puntosRuta.length > 1) {
                    rutaAnimada.current = puntosRuta;
                    animIndex.current = 0;
                    carrosRef.current.forEach(carro => {
                        carro.ruta = puntosRuta;
                        carro.index = 0;
                        carro.mesh.position.copy(puntosRuta[0]);

                    });

                }
                const curve = new THREE.CatmullRomCurve3(puntosRuta);
                const tubeGeometry = new THREE.TubeGeometry(curve, 100, 150, 16, false);


                


                const material = new THREE.MeshPhysicalMaterial({
                color: colorMap[ruta.nombre] || 0xffffff, // usa color personalizado o blanco por defecto
                transparent: true,
                opacity: 0.4,
                roughness: 0.2,
                metalness: 0.5,
                clearcoat: 1,
                clearcoatRoughness: 0.1
                });


                const tubo = new THREE.Mesh(tubeGeometry, material);
                tubo.userData.tipo = 'rutaPersonalizada'; // ✅ para limpiar después
                scene.add(tubo);

            }); 
        };
        const init = async () => {
            await fetchPuntos();
            await fetchRutas();
            await fetchCarros(); // 🆕 añade los carros a la escena
            await fetchRutasPersonalizadas();
        };
        init();
        const step = 500;
        const handleKeyDown = (e) => {
        if (!carroControlado.current) return;
        const dir = new THREE.Vector3();
        switch (e.key) {
            case 'ArrowUp':    dir.set(0, 0, -step); break; // adelante
            case 'ArrowDown':  dir.set(0, 0, step); break;  // atrás
            case 'ArrowLeft':  dir.set(-step, 0, 0); break; // izquierda
            case 'ArrowRight': dir.set(step, 0, 0); break;  // derecha
            case 'q':          dir.set(0, step, 0); break;  // subir
            case 'e':          dir.set(0, -step, 0); break; // bajar
            default: return;
        }
        const mesh = carroControlado.current.mesh;
        mesh.position.add(dir);
        const puntoCercano = puntos.find(pt => {
            const punto = new THREE.Vector3(pt.x, pt.y, pt.z ?? 0);
            return mesh.position.distanceTo(punto) < 1000;
        });

        if (puntoCercano && !carroControlado.current.recorrido.includes(puntoCercano.id)) {
            carroControlado.current.recorrido.push(puntoCercano.id);
            console.log("📍 Punto BLE detectado:", puntoCercano.nombre);
        }
        const estaEnWifi = wifiPointsRef.current.some(wifi =>
            mesh.position.distanceTo(new THREE.Vector3(wifi.x, wifi.y, wifi.z)) < 1000
        );
        if (estaEnWifi && carroControlado.current.recorrido.length > 0) {
            fetch('http://localhost:5000/historial/lote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    carro_id: carroControlado.current.mactag,
                    puntos: carroControlado.current.recorrido
                })
            })
                .then(res => res.json())
                .then(async data => {
                    console.log(`✅ Historial guardado para ${carroControlado.current.mactag}:`, data);
                    carroControlado.current.recorrido = [];
                    const historialVehiculos = await getHistorialVehiculos();
                    setHistorial(historialVehiculos);
                    setShowHistorial(true);
                    })
                .catch(err => {
                    console.error("❌ Error al guardar historial:", err);
                });
        }
    };
        window.addEventListener('keydown', handleKeyDown);
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const onMouseClick = async (event) => {
            const bounds = rendererRef.current.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
            mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
            raycaster.setFromCamera(mouse, cameraRef.current);
            const intersectCarros = raycaster.intersectObjects(
                carrosRef.current.map(c => c.mesh), 
                true // 👈 importante para detectar subcomponentes del Group
            );

            if (intersectCarros.length > 0) {
                const carroMesh = intersectCarros[0].object.parent; // porque el carro está en un Group
                const carro = carrosRef.current.find(c => c.mesh === carroMesh);
                if (carro) {
                    setCarroClickeado(carro);
                    setMostrarModalCarro(true);
                    return; // 👈 Detenemos aquí para no continuar con otros clics
                }
            }
            const intersects = raycaster.intersectObjects(
                wifiPointsRef.current.map(p => p.mesh)
            );
            if (intersects.length > 0) {
                try {
                    const data = await getHistorialVehiculos();
                    console.log("📄 Historial recibido:", data);
                    setHistorial(data);
                    setShowHistorial(true);
                } catch {
                    alert('Error al obtener historial');
                }
            }
        };

        window.addEventListener('click', onMouseClick);
        const animate = () => {
            requestAnimationFrame(animate);

           
            carrosRef.current.forEach(carro => {
           if (isPausedRef.current) return;
            if (!carro.ruta || carro.ruta.length < 2) return;
            const ruta = carro.ruta;
            if (!ruta || ruta.length < 2) return;
            const i = carro.index;
            const p1 = ruta[i];
            const p2 = ruta[i + 1];
            if (!p2) return;
            const pos = carro.mesh.position.clone();
            const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
            const paso = velocidad * p1.distanceTo(p2);
            pos.add(dir.multiplyScalar(paso));
            carro.mesh.position.copy(pos);
            if (pos.distanceTo(p2) < 10) {
                carro.index++;
                const puntoCercano = puntos.find(pt => {
                    const punto = new THREE.Vector3(pt.x, pt.y, pt.z ?? 0);
                    return punto.distanceTo(p2) < 1000;
                });
                if (puntoCercano && !carroControlado.current.recorrido.includes(puntoCercano.id)) {
                    carroControlado.current.recorrido.push(puntoCercano.id);
                    console.log("📍 BLE detectado:", puntoCercano.nombre, "Recorrido:", carroControlado.current.recorrido);
                }
                const estaEnWifi = wifiPointsRef.current.some(wifi =>
                    carro.mesh.position.distanceTo(new THREE.Vector3(wifi.x, wifi.y, wifi.z)) < 1000
                );
                if (estaEnWifi && carro.recorrido.length > 0) {
                    console.log("📦 Enviando recorrido al WiFi:", carroControlado.current.recorrido);
                    if (!carroControlado.current.recorrido.every(id => typeof id === 'number')) {
                        console.warn("❗ Hay IDs no numéricos en el recorrido:", carroControlado.current.recorrido);
                        return;
                    }
                    fetch('http://localhost:5000/historial/lote', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            carro_id: carro.mactag,
                            puntos: carro.recorrido
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        console.log(`✅ Historial guardado para ${carro.mactag}:`, data);
                        carro.recorrido = [];
                    })
                    .catch(err => {
                        console.error(`❌ Error al guardar historial de ${carro.mactag}:`, err);
                    });
                }
            }
            if (carro.index >= ruta.length - 1) {
            carro.index = ruta.length - 1;
            }

        });
            controls.update();
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
            }

        };
        animate();
        return () => {
            window.removeEventListener('click', onMouseClick);
            window.removeEventListener('keydown', handleKeyDown);
            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current.forceContextLoss?.();
                rendererRef.current.domElement?.remove();
                rendererRef.current = null;
            }
            if (sceneRef.current) {
                sceneRef.current.traverse(object => {
                    if (object.isMesh) {
                        object.geometry?.dispose();
                        if (Array.isArray(object.material)) {
                            object.material.forEach(mat => mat.dispose?.());
                        } else {
                            object.material?.dispose();
                        }
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

    return (
        <div style={{ position: 'relative' }}>
            <div style={{
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    width: 300,
    height: 300,
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    padding: 0,
    margin: 0
}}>
    <CameraCube onFaceClick={setCameraView} />
</div>


            <div
            ref={containerRef}
            tabIndex={0}
            style={{ width: '100%', height: '100vh' }}
            />
            <TrackingForms puntos={puntos} sceneRef={sceneRef} />
            <WifiForm onAddWifi={handleAddWifi} />
           {showHistorial && (
               <HistorialModal
                modalOpen={showHistorial}
                setModalOpen={setShowHistorial}
                modalData={{
                    title: 'Historial de unidad',
                    descripcion: 'Resumen de recorridos registrados',
                    video: '/car.mp4',
                    historial: historial
                }}
                />

            )}
        </div>
    );
};
export default TrackingThree;
