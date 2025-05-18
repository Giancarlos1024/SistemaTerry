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
    const { getPuntos, getRutas, getRutasPersonalizadas, getHistorial, getCarros } = useApi();
    const [carroSeleccionado, setCarroSeleccionado] = useState("");

    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

    const [carroClickeado, setCarroClickeado] = useState(null);
    const [mostrarModalCarro, setMostrarModalCarro] = useState(false);


    const reproducirHistorial = (historialData = historial) => {
        if (!puntos.length || !carroSeleccionado || !fechaInicio || !fechaFin) {
            console.warn("⛔ Faltan datos para reproducir historial.");
            return;
        }

        // Buscar el carro seleccionado y asignarlo como controlado
        const carro = carrosRef.current.find(c => c.mactag === carroSeleccionado);
        if (!carro) {
            console.warn("❌ Carro no encontrado:", carroSeleccionado);
            return;
        }
        carroControlado.current = carro;

        // Filtrar historial por carro y rango de fechas
        console.log("Historial antes de filtrar:", historialData);

        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        const historialCarro = historialData
            .filter(h => h.carro_id === carroSeleccionado)
            .filter(h => {
                const t = new Date(h.timestamp);
                return t >= inicio && t <= fin;
            })
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // más antiguo primero ✅

console.log("🔎 Historial filtrado por fecha:", historialCarro.map(h => h.punto_nombre));
        const ruta = historialCarro
            .map(h =>
            puntos.find(
                p => p.nombre.toLowerCase().trim() === h.punto_nombre.toLowerCase().trim()
            )
            )
            .filter(Boolean)
            .map(p => new THREE.Vector3(p.x, p.y, p.z ?? 0))
          


        if (ruta.length > 1) {
            carro.ruta = ruta;
            carro.index = 0;
            carro.mesh.position.copy(ruta[0]);

            // 👇 Forzar detección del primer punto BLE
            const puntoInicial = puntos.find(pt => {
                const punto = new THREE.Vector3(pt.x, pt.y, pt.z ?? 0);
                const dist = punto.distanceTo(ruta[0]);
                console.log(`🔍 Distancia de ${pt.nombre} a ruta[0]:`, dist);
                return dist < 1000;
            });

            if (puntoInicial && !carro.recorrido.includes(puntoInicial.id)) {
                carro.recorrido.push(puntoInicial.id);
                console.log("📍 Primer punto BLE detectado manualmente:", puntoInicial.nombre);
            }

            console.log(`🚗 Ruta cargada para ${carro.mactag}`, ruta);
        } else {
            console.warn("⚠️ No se pudo construir una ruta válida desde el historial filtrado.");
        }
    };



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
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

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
            points.push(dir.clone().multiplyScalar(15000));
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
        scene.add(cubo);
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
                const canvas = document.createElement('canvas');
                canvas.width = 1024;
                canvas.height = 256;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.font = '48px Arial';
                ctx.fillStyle = 'white';
                ctx.fillText(`${p.nombre}`, 20, 60);
                ctx.fillText(`(${p.x}, ${p.y}, ${p.z ?? 0})`, 20, 120);
                const texture = new THREE.CanvasTexture(canvas);
                const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
                label.scale.set(1500, 400, 1);
                label.position.set(p.x, p.y + 500, p.z ?? 0);
                scene.add(label);
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
            const data = await getRutasPersonalizadas();
            data.forEach(ruta => {
                const puntosRuta = ruta.puntos.map(p => new THREE.Vector3(p.x, p.y, p.z));
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
                color: 0xffffff,
                transparent: true,
                opacity: 0.3,
                roughness: 0.2,
                metalness: 0.5,
                clearcoat: 1,
                clearcoatRoughness: 0.1
                });

                const tube = new THREE.Mesh(tubeGeometry, material);
                scene.add(tube);
                puntosRuta.forEach((p, index) => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 1024;
                    canvas.height = 256;
                    const ctx = canvas.getContext('2d');
                    ctx.font = '48px Arial';
                    ctx.fillStyle = 'white';
                    ctx.fillText(`(${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})`, 20, 40);

                    const texture = new THREE.CanvasTexture(canvas);
                    texture.needsUpdate = true;

                    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
                        map: texture,
                        transparent: true // 🔑 Esto permite mostrar solo el texto
                    }));

                    sprite.scale.set(2500, 600, 1);
                    sprite.position.copy(p.clone().add(new THREE.Vector3(0, 600, 0)));
                    scene.add(sprite);
                });
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
                    const historial = await getHistorial();
                    setHistorial(historial);
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
                    const data = await getHistorial();
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
            rendererRef.current.render(scene, camera);
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
            <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, width: 300, height: 300 }}>
                <CameraCube onFaceClick={setCameraView} />
            </div>
            <div
            ref={containerRef}
            tabIndex={0}
            style={{ width: '100%', height: '100vh', backgroundColor: '#000' }}
            />
            <TrackingForms puntos={puntos} sceneRef={sceneRef} />
            <WifiForm onAddWifi={handleAddWifi} />
           {showHistorial && (
               <HistorialModal historial={historial} onClose={() => setShowHistorial(false)} />
            )}
            {showControlModal && (
            <ControlModal
                onClose={() => setShowControlModal(false)}
                onPlay={async () => {
                    isPausedRef.current = false;
                    const data = await getHistorial();
                    setHistorial(data);
                    reproducirHistorial(data); // 👈 pásalo como parámetro
                }}

                onPause={() => {
                    isPausedRef.current = true;
                }}
                velocidad={velocidad}
                carroSeleccionado={carroSeleccionado}
                setCarroSeleccionado={setCarroSeleccionado}
                carros={carrosRef.current}
                setVelocidad={setVelocidad}
                fechaInicio={fechaInicio}
                setFechaInicio={setFechaInicio}
                fechaFin={fechaFin}
                setFechaFin={setFechaFin}
                direccion={"/public/img/persona.jpg"} // imagen o reemplázalo si aún no usas esto
                setHistorial={setHistorial} // 👈 necesario
            />
            )}

           <button
            onClick={() => setShowControlModal(true)}
            className="fixed bottom-6 left-6 z-40 bg-gray-800 text-white font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-gray-700 hover:scale-105 transition duration-200"
            >
            ⚙️ Control
            </button>
            {mostrarModalCarro && carroClickeado && (
                <div className="fixed z-50 top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-xl font-bold mb-4">Carro: {carroClickeado.mactag}</h2>
                        <button
                            className="w-full bg-blue-600 text-white py-2 rounded mb-2 hover:bg-blue-700"
                            onClick={() => {
                                setCarroSeleccionado(carroClickeado.mactag);
                                navigate('/dashboard/historial'); // ✅ redirige a la vista de historial
                            }}
                        >
                            📜 Ver trayectoria histórica
                        </button>
                        <button
                            className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
                            onClick={() => setMostrarModalCarro(false)}
                        >
                            ✖️ Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default TrackingThree;
