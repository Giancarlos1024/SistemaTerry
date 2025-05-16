import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CameraCube = ({ onFaceClick, activeView }) => {
    const cubeContainerRef = useRef();
    const cubeRef = useRef();
    const arrowsRef = useRef([]);
    const targetRotationRef = useRef(new THREE.Euler());
    const materials = useRef([]);
    const rendererRef = useRef();
    const animationFrameRef = useRef();

    const createTextMaterial = (label, color) => {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, size, size);

        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label.toUpperCase(), size / 2, size / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: texture, name: label });
        material.transparent = true;
        material.opacity = 0.6;
        return material;
    };

    useEffect(() => {
        const cubeScene = new THREE.Scene();
        const cubeCamera = new THREE.PerspectiveCamera(50, 1, 1, 1000);
        cubeCamera.position.set(5, 5, 5);
        cubeCamera.lookAt(0, 0, 0);

        const cubeRenderer = new THREE.WebGLRenderer({ alpha: true });
        cubeRenderer.setSize(240, 240);
        cubeRenderer.domElement.classList.add(
            'w-full', 'h-full', 'rounded-xl',
            'shadow-lg', 'border', 'border-gray-700',
            'backdrop-blur-md', 'cursor-pointer'
        );
        rendererRef.current = cubeRenderer;

        cubeContainerRef.current.appendChild(cubeRenderer.domElement);

        materials.current = [
            createTextMaterial('right', '#e74c3c'),
            createTextMaterial('left', '#2ecc71'),
            createTextMaterial('top', '#3498db'),
            createTextMaterial('bottom', '#f1c40f'),
            createTextMaterial('front', '#1abc9c'),
            createTextMaterial('back', '#9b59b6'),
        ];

        const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), materials.current);
        cubeRef.current = cube;
        cubeScene.add(cube);

        const directions = [
            { dir: new THREE.Vector3(1, 0, 0), color: 0xff0000 },
            { dir: new THREE.Vector3(0, 1, 0), color: 0x00ff00 },
            { dir: new THREE.Vector3(0, 0, 1), color: 0x0000ff },
        ];
        directions.forEach(({ dir, color }) => {
            const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), 2.5, color);
            arrowsRef.current.push(arrow);
            cubeScene.add(arrow);
        });

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const rotationMap = {
            top: new THREE.Euler(-Math.PI / 2, 0, 0),
            bottom: new THREE.Euler(Math.PI / 2, 0, 0),
            front: new THREE.Euler(0, 0, 0),
            back: new THREE.Euler(0, Math.PI, 0),
            left: new THREE.Euler(0, Math.PI / 2, 0),
            right: new THREE.Euler(0, -Math.PI / 2, 0)
        };

        const highlightActiveFace = (faceName) => {
            materials.current.forEach(material => {
                material.opacity = 0.6;
                material.transparent = true;
            });
            const activeMaterial = materials.current.find(m => m.name === faceName);
            if (activeMaterial) {
                activeMaterial.opacity = 1;
                activeMaterial.transparent = false;
            }
        };

        const handleClick = (event) => {
            const bounds = cubeRenderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
            mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
            raycaster.setFromCamera(mouse, cubeCamera);
            const intersects = raycaster.intersectObject(cube, true);
            if (intersects.length > 0) {
                const faceIndex = intersects[0].face.materialIndex;
                const face = materials.current[faceIndex];
                if (rotationMap[face.name]) {
                    targetRotationRef.current.copy(rotationMap[face.name]);
                    highlightActiveFace(face.name);
                    onFaceClick(face.name);
                }
            }
        };

        cubeRenderer.domElement.addEventListener('click', handleClick);

        const animateCube = () => {
            animationFrameRef.current = requestAnimationFrame(animateCube);
            const target = targetRotationRef.current;
            cube.rotation.x += (target.x - cube.rotation.x) * 0.1;
            cube.rotation.y += (target.y - cube.rotation.y) * 0.1;
            cube.rotation.z += (target.z - cube.rotation.z) * 0.1;
            cubeRenderer.render(cubeScene, cubeCamera);
        };

        animateCube();

        return () => {
            cubeRenderer.domElement.removeEventListener('click', handleClick);
            cancelAnimationFrame(animationFrameRef.current);
            cubeRenderer.dispose();
            cubeRenderer.forceContextLoss?.();
            cubeRenderer.domElement?.remove();

            if (cubeContainerRef.current) {
                while (cubeContainerRef.current.firstChild) {
                    cubeContainerRef.current.removeChild(cubeContainerRef.current.firstChild);
                }
            }
        };
    }, [onFaceClick]);

    useEffect(() => {
        const rotationMap = {
            top: new THREE.Euler(-Math.PI / 2, 0, 0),
            bottom: new THREE.Euler(Math.PI / 2, 0, 0),
            front: new THREE.Euler(0, 0, 0),
            back: new THREE.Euler(0, Math.PI, 0),
            left: new THREE.Euler(0, Math.PI / 2, 0),
            right: new THREE.Euler(0, -Math.PI / 2, 0)
        };

        if (activeView && rotationMap[activeView]) {
            targetRotationRef.current.copy(rotationMap[activeView]);
            const material = materials.current.find(m => m.name === activeView);
            if (material) {
                materials.current.forEach(m => {
                    m.opacity = 0.6;
                    m.transparent = true;
                });
                material.opacity = 1;
                material.transparent = false;
            }
        }
    }, [activeView]);

    return (
        <div
            ref={cubeContainerRef}
            className="w-[240px] h-[240px] rounded-2xl p-1 bg-white/10 border border-gray-700 shadow-xl backdrop-blur-sm"
        />
    );
};

export default CameraCube;
