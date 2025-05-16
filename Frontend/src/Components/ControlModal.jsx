import React from 'react';

const ControlModal = ({
  onClose,
  onPlay,
  onPause,
  velocidad,
  setVelocidad,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  direccion,
  carroSeleccionado,
  setCarroSeleccionado,
  carros,
  setHistorial
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-2xl px-10 py-8 space-y-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <span className="text-indigo-500">🎮</span> Controles de Simulación
        </h2>

        {/* Velocidad */}
        <div>
          <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
            Velocidad
          </label>
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={velocidad}
            onChange={(e) => setVelocidad(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
          <p className="text-center font-mono text-blue-700 dark:text-blue-400 mt-1 text-lg">
            {velocidad.toFixed(2)}
          </p>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Fecha Inicio
            </label>
            <input
              type="datetime-local"
              value={fechaInicio || ''}
              onChange={e => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Fecha Fin
            </label>
            <input
              type="datetime-local"
              value={fechaFin || ''}
              onChange={e => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Imagen */}
        <div className="flex justify-center">
          <img
            src={direccion}
            alt="Carro"
            className="w-28 h-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-2"
          />
        </div>

        {/* Carro selector */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Carro a simular
          </label>
          <select
            value={carroSeleccionado}
            onChange={e => setCarroSeleccionado(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="">Seleccione...</option>
            {carros.map(c => (
              <option key={c.mactag} value={c.mactag}>{c.mactag}</option>
            ))}
          </select>
        </div>

        {/* Botones */}
        <div className="flex justify-center gap-6 mt-4">
          <button
            onClick={async () => {
              const data = await fetch('http://localhost:5000/api/historial').then(res => res.json());
              setHistorial(data);
              onPlay();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-full shadow-md transition"
          >
            ▶️ Play
          </button>
          <button
            onClick={onPause}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-full shadow-md transition"
          >
            ⏸️ Pause
          </button>
        </div>

        {/* Cerrar */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="text-red-600 hover:text-red-800 font-semibold mt-6 transition underline"
          >
            ❌ Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlModal;
