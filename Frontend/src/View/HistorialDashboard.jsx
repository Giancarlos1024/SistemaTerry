import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const HistorialDashboard = () => {
  const location = useLocation();
  const carroId = location.state?.carroId || '';
  const [carroSeleccionado, setCarroSeleccionado] = useState(carroId);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [velocidad, setVelocidad] = useState('1x');

  useEffect(() => {
    if (carroSeleccionado) {
      console.log("🔎 Carro recibido para historial:", carroSeleccionado);
      // Aquí puedes hacer fetch o cargar historial
    }
  }, [carroSeleccionado]);

  return (
    <div className="p-6 space-y-4">

      {/* Barra de filtros */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded shadow border border-gray-200">
        {/* Carro */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Equipo</label>
          <select
            value={carroSeleccionado}
            onChange={(e) => setCarroSeleccionado(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Seleccione...</option>
            <option value="0133-MA">0133-MA</option>
            <option value="0134-MB">0134-MB</option>
            {/* Agrega más equipos aquí */}
          </select>
        </div>

        {/* Fecha inicio */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Tiempo de empezar</label>
          <input
            type="datetime-local"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>

        {/* Fecha fin */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Hora de finalización</label>
          <input
            type="datetime-local"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>

        {/* Velocidad */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Velocidad de reproducción</label>
          <select
            value={velocidad}
            onChange={(e) => setVelocidad(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1x">x1</option>
            <option value="2x">x2</option>
            <option value="4x">x4</option>
          </select>
        </div>

        {/* Botones */}
        <div className="flex gap-2 mt-5">
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 py-2 rounded shadow">
            Preguntar
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded shadow">
            comenzar
          </button>
          <button className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-4 py-2 rounded shadow">
            ⬇ exportar
          </button>
        </div>
      </div>

      {/* Aquí puedes renderizar el mapa o historial en base a los filtros */}
      <div className="mt-6">
        <p className="text-gray-600 italic">[ Aquí va tu mapa o visualización histórica ]</p>
      </div>
    </div>
  );
};
