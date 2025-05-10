import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useApi } from '../context/ApiContext';
import TrackingForms from '../Components/TrackingForms';
import CameraCube from '../Components/CameraCube';


const TrackingThree = () => {
    const containerRef = useRef();
    const planeRef = useRef(null);
    const [puntos, setPuntos] = useState([]); // Para usar en los select del formulario
    const sceneRef = useRef();
    const cameraRef = useRef();
    const controlsRef = useRef();
    const {
        getPuntos,
        getRutas,
        getRutasPersonalizadas,
        postPunto,
        postRuta,
        postRutaPersonalizada,
        updateRutaPersonalizada
    } = useApi();


    const carroRef = useRef();
    const rutaAnimada = useRef([]);
    const animIndex = useRef(0);
    const velocidad = 0.1; // Velocidad de animación ajustable

    const faceStyle = {
        cursor: 'pointer',
        backgroundColor: '#2b2b2b',
        color: 'white',
        border: '1px solid #444',
        borderRadius: '4px',
        fontSize: '14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    };
    
    const labelStyle = {
        fontSize: '10px',
        color: '#ccc',
        marginTop: '2px'
    };

    const setCameraView = (view) => {
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        switch (view) {
            case 'top':
                camera.position.set(0, 30000, 0);
                break;
            case 'bottom':
                camera.position.set(0, -30000, 0);
                break;
            case 'front':
                camera.position.set(0, 0, 30000);
                break;
            case 'back':
                camera.position.set(0, 0, -30000);
                break;
            case 'left':
                camera.position.set(-30000, 0, 0);
                break;
            case 'right':
                camera.position.set(30000, 0, 0);
                break;
            default:
                break;
        }
        camera.lookAt(0, 0, 0);
        controls.update();
    };

    useEffect(() => {
        sceneRef.current = new THREE.Scene();
        const scene = sceneRef.current;

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
            const points = [];
            points.push(new THREE.Vector3(0, 0, 0));
            points.push(dir.clone().multiplyScalar(15000));
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            scene.add(line);
        };

        drawAxis(new THREE.Vector3(1, 0, 0), 0xff0000);
        drawAxis(new THREE.Vector3(0, 1, 0), 0x00ff00);
        drawAxis(new THREE.Vector3(0, 0, 1), 0x0000ff);

        const crearEtiqueta = (texto, posicion) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.font = '60px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText(texto, 10, 90);
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(600, 300, 1);
            sprite.position.copy(posicion);
            scene.add(sprite);
        };

        crearEtiqueta('X', new THREE.Vector3(15500, 0, 0));
        crearEtiqueta('Y', new THREE.Vector3(0, 15500, 0));
        crearEtiqueta('Z', new THREE.Vector3(0, 0, 15500));

        const crearNumeroEje = (valor, posicion) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.font = '48px Arial';
            ctx.fillStyle = '#00ffff';
            ctx.fillText(valor.toString(), 0, 60);
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(300, 150, 1);
            sprite.position.copy(posicion);
            scene.add(sprite);
        };

        for (let i = -15000; i <= 15000; i += 5000) {
            crearNumeroEje(i, new THREE.Vector3(i, 1, 0));
            crearNumeroEje(i, new THREE.Vector3(0, 1, i));
        }
        for (let i = 0; i <= 15000; i += 5000) {
            crearNumeroEje(i, new THREE.Vector3(0, i, 0));
        }

        if (!planeRef.current) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load('/img/map2.png', texture => {
                const geometry = new THREE.PlaneGeometry(30000, 30000);
                const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
                const plane = new THREE.Mesh(geometry, material);
                plane.rotation.x = -Math.PI / 2;
                scene.add(plane);
                planeRef.current = plane;
            });
        }

        const carroGeometry = new THREE.BoxGeometry(400, 200, 200);
        const carroMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff });
        const carro = new THREE.Mesh(carroGeometry, carroMaterial);
        carro.position.set(0, 100, 0);
        scene.add(carro);
        carroRef.current = carro;

        // CUBO con dimensiones reales
       
        const cuboGeometry = new THREE.BoxGeometry(112000, 38000, 68000);
        const cuboMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const cubo = new THREE.Mesh(cuboGeometry, cuboMaterial);
        cubo.position.set(0, 0, 0); // Centro del cubo en el origen
        scene.add(cubo);

        // Mostrar texto con las dimensiones del cubo
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

        // Etiquetas de medidas
        mostrarTexto('Ancho: 112,000 mm', new THREE.Vector3(0, 20000, 34000));
        mostrarTexto('Alto: 38,000 mm', new THREE.Vector3(0, 20000, 0));
        mostrarTexto('Profundidad: 68,000 mm', new THREE.Vector3(56000, 20000, 0));




        const fetchPuntos = async () => {
            const puntosData = await getPuntos();
            setPuntos(puntosData);

            puntosData.forEach(p => {
                const normX = p.x;
                const normY = p.y;
                const normZ = p.z ?? 0;

                const geometry = new THREE.SphereGeometry(100, 16, 16);
                const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(normX, normY, normZ);
                scene.add(sphere);

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                ctx.font = '48px Arial';
                ctx.fillStyle = 'white';
                ctx.fillText(`${p.nombre}`, 10, 60);
                ctx.fillText(`(${p.x}, ${p.y}, ${p.z ?? 0})`, 10, 120);
                const texture = new THREE.CanvasTexture(canvas);
                const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                const label = new THREE.Sprite(spriteMaterial);
                label.scale.set(800, 300, 1);
                label.position.set(normX, normY + 500, normZ);
                scene.add(label);
            });

            const puntosLine = puntosData.map(p => new THREE.Vector3(p.x, p.y, p.z ?? 0));
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(puntosLine);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
            const linea = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(linea);
        };

        const fetchRutas = async () => {
            const rutasData = await getRutas();
            rutasData.forEach(r => {
                const v1 = new THREE.Vector3(r.x1, r.y1, r.z1);
                const v2 = new THREE.Vector3(r.x2, r.y2, r.z2);
                const geometry = new THREE.BufferGeometry().setFromPoints([v1, v2]);
                const material = new THREE.LineBasicMaterial({
                    color: r.tipo === 'entrada' ? 0x00ff00 : r.tipo === 'túnel' ? 0xff0000 : 0x0000ff
                });
                const line = new THREE.Line(geometry, material);
                scene.add(line);
            });
        };

        const fetchRutasPersonalizadas = async () => {
            const data = await getRutasPersonalizadas();
            data.forEach(ruta => {
                const puntos = ruta.puntos.map(p => new THREE.Vector3(p.x, p.y, p.z));
                if (ruta.nombre === 'Ruta animada' && ruta.puntos.length > 1) {
                rutaAnimada.current = puntos;
                animIndex.current = 0;
                carroRef.current.position.copy(puntos[0]);
                }
                const geometry = new THREE.BufferGeometry().setFromPoints(puntos);
                const material = new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff });
                const line = new THREE.Line(geometry, material);
                sceneRef.current.add(line);

                ruta.puntos.forEach(p => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    ctx.font = '48px Arial';
                    ctx.fillStyle = 'white';
                    ctx.fillText(`(${p.x}, ${p.y}, ${p.z})`, 10, 60);
                    const texture = new THREE.CanvasTexture(canvas);
                    const labelMaterial = new THREE.SpriteMaterial({ map: texture });
                    const label = new THREE.Sprite(labelMaterial);
                    label.scale.set(1000, 400, 1);
                    label.position.set(p.x, p.y + 1000, p.z);
                    sceneRef.current.add(label);
                });
            });
        };

        const init = async () => {
            await fetchPuntos();
            await fetchRutas();
            await fetchRutasPersonalizadas();
        };

        init();

      const animate = () => {
            requestAnimationFrame(animate);

            // Animación del carro en ruta personalizada
            if (rutaAnimada.current.length > 1) {
                const points = rutaAnimada.current;
                const i = animIndex.current;

                if (i < points.length - 1) {
                    const p1 = points[i];
                    const p2 = points[i + 1];

                    const pos = carroRef.current.position.clone();
                    const dir = new THREE.Vector3().subVectors(p2, p1);
                    const distancia = dir.length();
                    dir.normalize();

                    const paso = velocidad * distancia;
                    pos.add(dir.multiplyScalar(paso));

                    carroRef.current.position.copy(pos);

                    if (pos.distanceTo(p2) < 10) {
                        animIndex.current++;
                    }
                } else {
                    // Reiniciar el recorrido
                    animIndex.current = 0;
                    carroRef.current.position.copy(rutaAnimada.current[0]);
                }
            }

            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        
        return () => {
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
            top: '20px',
            right: '20px', // lo coloca en el lado derecho
            zIndex: 10,
            width: '300px',
            height: '300px'
        }}>
            <CameraCube onFaceClick={setCameraView} />
        </div>


        <div ref={containerRef} style={{ width: '100%', height: '100vh', backgroundColor: '#000' }} />
        <TrackingForms puntos={puntos} sceneRef={sceneRef} />
    </div>
);

};

export default TrackingThree;
