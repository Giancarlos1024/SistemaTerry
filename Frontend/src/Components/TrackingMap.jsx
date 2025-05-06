import React, { useEffect, useRef, useState } from 'react';
import { Application } from '@pixi/app';
import { Graphics } from '@pixi/graphics';
import { Text } from '@pixi/text';
import { gsap } from 'gsap';
import { Sprite } from '@pixi/sprite';
import { Assets } from '@pixi/assets';
import { Container } from '@pixi/display';

const TrackingMap = () => {
    const pixiContainer = useRef(null);
    const [puntos, setPuntos] = useState([]);
    const [grabando, setGrabando] = useState(true);
    const [historialVisible, setHistorialVisible] = useState(false);
    const [gridStep, setGridStep] = useState(50);
    const spritesRef = useRef({});
    const recorridoLine = useRef(null);
    const initialized = useRef(false);
    const recorridoCoords = useRef([]);
    const appRef = useRef(null);
    const gridGraphics = useRef(null);
    const axisLabelsRef = useRef([]);
    const mapContainer = useRef(null);
    const baseStep = 50;

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const iniciarPixi = async () => {
            if (!pixiContainer.current) return;

            if (pixiContainer.current.firstChild) {
                pixiContainer.current.removeChild(pixiContainer.current.firstChild);
            }

            const puntosResp = await fetch('http://localhost:5000/puntos');
            const puntosData = await puntosResp.json();
            setPuntos(puntosData);

            const rutasResp = await fetch('http://localhost:5000/rutas');
            const rutasData = await rutasResp.json();

            const containerWidth = pixiContainer.current.clientWidth;
            const containerHeight = pixiContainer.current.clientHeight;

            const app = new Application({ width: containerWidth, height: containerHeight, backgroundColor: 0x2f2f2f });
            appRef.current = app;
            pixiContainer.current.appendChild(app.view);

            const texture = await Assets.load('/img/mapa2.png');
            const background = new Sprite(texture);
            background.width = app.screen.width;
            background.height = app.screen.height;
            app.stage.addChild(background); // fondo fuera del contenedor escalable

            const map = new Container();
            mapContainer.current = map;
            app.stage.addChild(map);

            // Cuadrícula
            const drawGrid = (step) => {
                const grid = new Graphics();
                grid.lineStyle(1, 0x444444, 0.3);
                for (let x = 0; x <= app.screen.width; x += step) {
                    grid.moveTo(x, 0);
                    grid.lineTo(x, app.screen.height);
                }
                for (let y = 0; y <= app.screen.height; y += step) {
                    grid.moveTo(0, y);
                    grid.lineTo(app.screen.width, y);
                }
                return grid;
            };

            gridGraphics.current = drawGrid(gridStep);
            map.addChild(gridGraphics.current);

            // Rutas
            rutasData.forEach(ruta => {
                const origen = puntosData.find(p => p.id === ruta.origen_id);
                const destino = puntosData.find(p => p.id === ruta.destino_id);
                if (origen && destino) {
                    const linea = new Graphics();
                    linea.lineStyle(2, 0xff0000);
                    linea.moveTo(origen.x, origen.y);
                    linea.lineTo(destino.x, destino.y);
                    map.addChild(linea);
                }
            });

            // Puntos
            puntosData.forEach(p => {
                const circle = new Graphics();
                circle.beginFill(0x00ff00);
                circle.drawCircle(0, 0, 6);
                circle.endFill();
                circle.x = p.x;
                circle.y = p.y;
                map.addChild(circle);

                const label = new Text(p.nombre, { fontSize: 10, fill: 'white' });
                label.x = p.x + 8;
                label.y = p.y - 8;
                map.addChild(label);
            });

            // Carro
            const icon = new Text('🚗', { fontSize: 20 });
            icon.x = 50;
            icon.y = 50;
            map.addChild(icon);
            spritesRef.current['simulado'] = icon;

            recorridoLine.current = new Graphics();
            recorridoLine.current.lineStyle(2, 0x00ffff);
            map.addChild(recorridoLine.current);

            const timeline = gsap.timeline({ repeat: -1, defaults: { duration: 2, ease: 'power1.inOut' } });
            rutasData.forEach(ruta => {
                const destino = puntosData.find(p => p.id === ruta.destino_id);
                if (destino) {
                    timeline.to(icon, {
                        x: destino.x,
                        y: destino.y,
                        onComplete: async () => {
                            if (grabando) {
                                recorridoCoords.current.push({ x: destino.x, y: destino.y });
                                drawRecorrido();
                                await fetch('http://localhost:5000/historial', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ carro_id: 'simulado', punto_id: destino.id })
                                });
                            }
                        }
                    });
                }
            });

            // Interacción
            let puntoIndex = puntosData.length;
            app.stage.interactive = true;
            app.stage.hitArea = app.screen;

            app.stage.on('pointerdown', (event) => {
                const { x, y } = event.data.global;
                const local = map.toLocal({ x, y });
                const alignedX = Math.round(local.x / gridStep) * gridStep;
                const alignedY = Math.round(local.y / gridStep) * gridStep;

                const circle = new Graphics();
                circle.beginFill(0x00ff00);
                circle.drawCircle(0, 0, 6);
                circle.endFill();
                circle.x = alignedX;
                circle.y = alignedY;
                map.addChild(circle);

                const label = new Text(`PUNTO_${puntoIndex}`, { fontSize: 10, fill: 'white' });
                label.x = alignedX + 8;
                label.y = alignedY - 8;
                map.addChild(label);

                setPuntos(prev => [...prev, { id: `nuevo_${puntoIndex}`, x: alignedX, y: alignedY, nombre: `PUNTO_${puntoIndex}` }]);
                puntoIndex++;
            });
        };

        const drawRecorrido = () => {
            if (!recorridoLine.current) return;
            const g = recorridoLine.current;
            g.clear();
            g.lineStyle(2, 0x00ffff);
            if (recorridoCoords.current.length > 1) {
                g.moveTo(recorridoCoords.current[0].x, recorridoCoords.current[0].y);
                recorridoCoords.current.forEach(coord => g.lineTo(coord.x, coord.y));
            }
        };

        iniciarPixi();

        return () => {
            if (appRef.current) appRef.current.destroy(true, true);
            spritesRef.current = {};
        };
    }, [grabando]);

    useEffect(() => {
        const map = mapContainer.current;
        if (!map) return;

        const scaleFactor = gridStep / baseStep;
        map.scale.set(scaleFactor);
    }, [gridStep]);

    return (
        <div>
            <div style={{ padding: '8px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => setGrabando(!grabando)}>
                    {grabando ? '🛑 Detener Grabación' : '▶️ Reanudar Grabación'}
                </button>
                <button onClick={() => setHistorialVisible(true)}>📜 Ver Historial</button>
                <button onClick={() => setGridStep(prev => Math.max(10, prev - 10))}>− Reducir Cuadrícula</button>
                <button onClick={() => setGridStep(prev => prev + 10)}>＋ Ampliar Cuadrícula</button>
                <span>Espaciado actual: {gridStep}px</span>
            </div>
            <div
                ref={pixiContainer}
                style={{ overflow: 'hidden', width: '100%', height: '90vh', border: '1px solid #ccc' }}
            />
            {historialVisible && (
                <iframe
                    title="historial"
                    src="http://localhost:5000/ver-historial"
                    width="100%"
                    height="300px"
                    style={{ border: '1px solid #ccc', marginTop: '10px' }}
                />
            )}
        </div>
    );
};

export default TrackingMap;
