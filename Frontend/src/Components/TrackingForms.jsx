import React from 'react';
import * as THREE from 'three';
import { useApi } from '../context/ApiContext';

const TrackingForms = ({ puntos, sceneRef, escala }) => {
  const {
    postPunto,
    postRuta,
    postRutaPersonalizada
  } = useApi();

  return (
   <div className="top-6 left-6 z-50 flex flex-col md:flex-row gap-6 w-full max-w-7xl">

        {/* Crear Punto */}
        <form
            onSubmit={async e => {
                e.preventDefault();
                const { nombre, mactag, x, y, z } = e.target;
                const data = await postPunto({
                nombre: nombre.value,
                mactag: mactag.value,
                x: Number(x.value),
                y: Number(y.value),
                z: Number(z.value)
                });
                if (data.success) {
                alert('Punto creado con éxito');
                e.target.reset();
                window.location.reload();
                }
            }}
            className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 w-80 border border-gray-100 dark:border-gray-700 space-y-4 transition hover:shadow-2xl"
            >
            <h3 className="text-xl font-bold text-center text-pink-600 dark:text-pink-400">📍 Crear Punto</h3>

            <input name="nombre" placeholder="Nombre" required className="input" />
            <input name="mactag" placeholder="MAC tag" required className="input" />
            <input name="x" type="number" placeholder="X" step="any" required className="input" />
            <input name="y" type="number" placeholder="Y" step="any" required className="input" />
            <input name="z" type="number" placeholder="Z" step="any" required className="input" />

            <button type="submit" className="btn-primary w-full">Guardar Punto</button>
        </form>


      {/* Crear Ruta */}
      {/* <form
        onSubmit={async e => {
          e.preventDefault();
          const { origen, destino, tipo } = e.target;
          const data = await postRuta({
            origen_id: origen.value,
            destino_id: destino.value,
            tipo: tipo.value
          });
          if (data.success) {
            alert('Ruta creada con éxito');
            e.target.reset();
            window.location.reload();
          }
        }}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 space-y-4 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-white">🔗 Crear Ruta</h3>
        <select name="origen" required className="input">
          <option value="">Origen</option>
          {puntos.map(p => (
            <option key={p.id} value={p.id}>
              {p.nombre} ({p.x}, {p.y}, {p.z})
            </option>
          ))}
        </select>
        <select name="destino" required className="input">
          <option value="">Destino</option>
          {puntos.map(p => (
            <option key={p.id} value={p.id}>
              {p.nombre} ({p.x}, {p.y}, {p.z})
            </option>
          ))}
        </select>
        <input name="tipo" placeholder="Tipo (entrada, túnel...)" required className="input" />
        <button type="submit" className="btn-primary w-full">Guardar Ruta</button>
      </form> */}

      {/* Crear Ruta Personalizada */}
      <form
        onSubmit={async e => {
          e.preventDefault();
          const nombre = e.target.nombreRuta.value.trim();
          const coordsRaw = e.target.coordenadas.value.trim();
          const puntosParsed = coordsRaw.split(';').map(coord => {
            const [x, y, z] = coord.split(',').map(Number);
            return { x, y, z };
          });

          const geometry = new THREE.BufferGeometry().setFromPoints(
            puntosParsed.map(p => new THREE.Vector3(p.x * escala, p.y * escala, p.z * escala))
          );
          const material = new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff });
          const line = new THREE.Line(geometry, material);
          sceneRef.current.add(line);

          const data = await postRutaPersonalizada({ nombre, puntos: puntosParsed });
          if (data.success) {
            alert('Ruta personalizada guardada con éxito');
            e.target.reset();
          }
        }}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 space-y-4 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-white">🛣️ Ruta Personalizada</h3>
        <input name="nombreRuta" placeholder="Nombre de la ruta" required className="input" />
        <textarea
          name="coordenadas"
          placeholder="Ej: 0,0,0; 2000,500,1000"
          rows="4"
          required
          className="input resize-none"
        />
        <button type="submit" className="btn-primary w-full">Dibujar y Guardar</button>
      </form>
    </div>
  );
};

export default TrackingForms;
