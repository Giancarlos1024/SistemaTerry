import React from 'react';
import * as THREE from 'three'; // <-- asegúrate de importar esto
import { useApi } from '../context/ApiContext';

const TrackingForms = ({ puntos, sceneRef, escala }) => {
    const {
        postPunto,
        postRuta,
        postRutaPersonalizada
    } = useApi();

    return (
        <div className='formularios'>
            {/* Crear punto */}
            <form
                onSubmit={async e => {
                    e.preventDefault();
                    const nombre = e.target.nombre.value;
                    const mactag = e.target.mactag.value;
                    const x = Number(e.target.x.value);
                    const y = Number(e.target.y.value);
                    const z = Number(e.target.z.value);

                    const data = await postPunto({ nombre, mactag, x, y, z });
                    if (data.success) {
                        alert('Punto creado con éxito');
                        e.target.reset();
                        window.location.reload();
                    }
                }}
                style={{ padding: '1rem', background: '#222', color: 'white' }}
            >
                <h3>Crear nuevo punto</h3>
                <input name="nombre" placeholder="Nombre" required /><br />
                <input name="mactag" placeholder="MAC tag" required /><br />
                <input name="x" type="number" placeholder="X" required /><br />
                <input name="y" type="number" placeholder="Y" required /><br />
                <input name="z" type="number" placeholder="Z" required /><br />
                <button type="submit">Guardar Punto</button>
            </form>

            {/* Crear ruta */}
            <form
                onSubmit={async e => {
                    e.preventDefault();
                    const origen_id = e.target.origen.value;
                    const destino_id = e.target.destino.value;
                    const tipo = e.target.tipo.value;

                    const data = await postRuta({ origen_id, destino_id, tipo });
                    if (data.success) {
                        alert('Ruta creada con éxito');
                        e.target.reset();
                        window.location.reload();
                    }
                }}
                style={{ padding: '1rem', background: '#333', color: 'white' }}
            >
                <h3>Crear nueva ruta</h3>
                <select name="origen" required>
                    <option value="">Origen</option>
                    {puntos.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.nombre} ({p.x}, {p.y}, {p.z})
                        </option>
                    ))}
                </select><br />
                <select name="destino" required>
                    <option value="">Destino</option>
                    {puntos.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.nombre} ({p.x}, {p.y}, {p.z})
                        </option>
                    ))}
                </select><br />
                <input name="tipo" placeholder="Tipo (entrada, túnel...)" required /><br />
                <button type="submit">Guardar Ruta</button>
            </form>

            {/* Crear ruta personalizada */}
            <form
                onSubmit={async e => {
                    e.preventDefault();
                    const nombre = e.target.nombreRuta.value.trim();
                    const coordsRaw = e.target.coordenadas.value.trim();
                    const puntos = coordsRaw.split(';').map(coord => {
                        const [x, y, z] = coord.split(',').map(Number);
                        return { x, y, z };
                    });

                    // Dibujar en escena con escala aplicada
                    const geometry = new THREE.BufferGeometry().setFromPoints(
                        puntos.map(p => new THREE.Vector3(p.x * escala, p.y * escala, p.z * escala))
                    );
                    const material = new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff });
                    const line = new THREE.Line(geometry, material);
                    sceneRef.current.add(line);

                    // Guardar en backend sin escala (se almacena en mm)
                    const data = await postRutaPersonalizada({ nombre, puntos });
                    if (data.success) {
                        alert('Ruta personalizada guardada con éxito');
                        e.target.reset();
                    }
                }}
                style={{ padding: '1rem', background: '#444', color: 'white' }}
            >
                <h3>Crear ruta personalizada</h3>
                <input name="nombreRuta" placeholder="Nombre de la ruta" required /><br />
                <textarea
                    name="coordenadas"
                    placeholder="Ej: 0,0,0; 2000,500,1000"
                    rows="4"
                    style={{ width: '100%' }}
                    required
                /><br />
                <button type="submit">Dibujar y Guardar</button>
            </form>
        </div>
    );
};

export default TrackingForms;
