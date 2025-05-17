import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApi } from '../context/ApiContext';
import Mapa3D from '../Components/Mapa3D';

export const HistorialDashboard = () => {
  const location = useLocation();
  const carroId = location.state?.carroId || '';
  const [carroSeleccionado, setCarroSeleccionado] = useState(carroId);
  const [carros, setCarros] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [velocidad, setVelocidad] = useState(0.01);

  const [puntos, setPuntos] = useState([]);
  const [historial, setHistorial] = useState([]);

  const { getCarros, getHistorial, getPuntos } = useApi();

  useEffect(() => {
    const cargarDatos = async () => {
      const [listaCarros, listaPuntos] = await Promise.all([getCarros(), getPuntos()]);
      setCarros(listaCarros);
      setPuntos(listaPuntos);
    };
    cargarDatos();
  }, []);

  const handleComenzar = async () => {
    if (!carroSeleccionado || !fechaInicio || !fechaFin) {
      alert('Debe seleccionar carro y fechas válidas');
      return;
    }

    const data = await getHistorial();
    setHistorial(data);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded shadow border border-gray-200">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Equipo</label>
          <select
            value={carroSeleccionado}
            onChange={(e) => setCarroSeleccionado(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Seleccione...</option>
            {carros.map(c => (
              <option key={c.id} value={c.mactag}>{c.mactag}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Tiempo de empezar</label>
          <input
            type="datetime-local"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Hora de finalización</label>
          <input
            type="datetime-local"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Velocidad</label>
          <select
            value={velocidad}
            onChange={(e) => setVelocidad(parseFloat(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            <option value={0.01}>x1</option>
            <option value={0.02}>x2</option>
            <option value={0.04}>x4</option>
          </select>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded shadow"
            onClick={handleComenzar}
          >
            comenzar
          </button>
        </div>
      </div>

      {/* Renderiza Mapa3D */}
      <div className="mt-6">
        <Mapa3D
          puntos={puntos}
          historial={historial}
          carroSeleccionado={carroSeleccionado}
          velocidad={velocidad}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
        />
      </div>
    </div>
  );
};

