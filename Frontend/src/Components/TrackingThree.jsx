import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const TrackingThree = () => {
    const containerRef = useRef();
    const planeRef = useRef(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 100, 200);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 100, 100).normalize();
        scene.add(light);

        // Ejes con líneas personalizadas
        const drawAxis = (dir, color) => {
            const material = new THREE.LineBasicMaterial({ color });
            const points = [];
            points.push(new THREE.Vector3(0, 0, 0));
            points.push(dir.clone().multiplyScalar(150));
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            scene.add(line);
        };

        drawAxis(new THREE.Vector3(1, 0, 0), 0xff0000); // X - rojo
        drawAxis(new THREE.Vector3(0, 1, 0), 0x00ff00); // Y - verde
        drawAxis(new THREE.Vector3(0, 0, 1), 0x0000ff); // Z - azul

        const crearEtiqueta = (texto, posicion) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.font = '20px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText(texto, 10, 30);
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(20, 10, 1);
            sprite.position.copy(posicion);
            scene.add(sprite);
        };

        crearEtiqueta('X', new THREE.Vector3(155, 0, 0));
        crearEtiqueta('Y', new THREE.Vector3(0, 155, 0));
        crearEtiqueta('Z', new THREE.Vector3(0, 0, 155));

        const crearNumeroEje = (valor, posicion) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.font = '16px Arial';
            ctx.fillStyle = '#00ffff';
            ctx.fillText(valor.toString(), 0, 20);
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(10, 5, 1);
            sprite.position.copy(posicion);
            scene.add(sprite);
        };

        for (let i = -150; i <= 150; i += 50) {
            crearNumeroEje(i, new THREE.Vector3(i, 0.1, 0));
            crearNumeroEje(i, new THREE.Vector3(0, 0.1, i));
        }
        for (let i = 0; i <= 150; i += 50) {
            crearNumeroEje(i, new THREE.Vector3(0, i, 0));
        }

        // Plano base y grillas
        if (!planeRef.current) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load('/img/mapa2.png', texture => {
                const geometry = new THREE.PlaneGeometry(300, 300);
                const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
                const plane = new THREE.Mesh(geometry, material);
                plane.rotation.x = -Math.PI / 2;
                scene.add(plane);
                planeRef.current = plane;

                const gridHelper = new THREE.GridHelper(300, 30, 0xffffff, 0x555555);
                gridHelper.rotation.x = Math.PI / 2;
                scene.add(gridHelper);

                const gridYZ = new THREE.GridHelper(300, 30, 0x00ff00, 0x555555);
                gridYZ.rotation.z = Math.PI / 2;
                scene.add(gridYZ);

                const gridXY = new THREE.GridHelper(300, 30, 0x0000ff, 0x555555);
                scene.add(gridXY);
            });
        }

        // Carro
        const carroGeometry = new THREE.BoxGeometry(4, 2, 2);
        const carroMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff });
        const carro = new THREE.Mesh(carroGeometry, carroMaterial);
        carro.position.set(0, 1, 0);
        scene.add(carro);

        // Puntos desde el backend
       // Puntos desde el backend
        const fetchPuntos = async () => {
            const puntosResp = await fetch('http://localhost:5000/puntos');
            const puntosData = await puntosResp.json();

            const minX = Math.min(...puntosData.map(p => p.x));
            const maxX = Math.max(...puntosData.map(p => p.x));
            const minY = Math.min(...puntosData.map(p => p.y));
            const maxY = Math.max(...puntosData.map(p => p.y));
            const minZ = Math.min(...puntosData.map(p => p.z ?? 0));
            const maxZ = Math.max(...puntosData.map(p => p.z ?? 0));

            const rangoX = maxX - minX || 1;
            const rangoY = maxY - minY || 1;
            const rangoZ = maxZ - minZ || 1;

            puntosData.forEach(p => {
                const normX = ((p.x - minX) / rangoX) * 300 - 150;
                const normZ = ((p.y - minY) / rangoY) * 300 - 150;
                const normY = ((p.z ?? 0 - minZ) / rangoZ) * 150; // altura en eje Y

                // Esfera
                const geometry = new THREE.SphereGeometry(1.5, 16, 16);
                const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(normX, normY, normZ);
                scene.add(sphere);

                // Etiqueta
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                ctx.font = '20px Arial';
                ctx.fillStyle = 'white';
                ctx.fillText(p.nombre, 2, 20);
                const texture = new THREE.CanvasTexture(canvas);
                const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                const label = new THREE.Sprite(spriteMaterial);
                label.scale.set(20, 10, 1);
                label.position.set(normX, normY + 5, normZ);
                scene.add(label);
            });
            
        };


        fetchPuntos();

        const animate = () => {
            requestAnimationFrame(animate);
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
        <div
            ref={containerRef}
            style={{ width: '100%', height: '90vh', backgroundColor: '#000' }}
        />
    );
};

export default TrackingThree;
