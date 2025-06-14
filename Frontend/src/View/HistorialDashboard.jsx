import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApi } from '../context/ApiContext';
import Mapa3D from '../Components/Mapa3D';
import * as XLSX from 'xlsx';

export const HistorialDashboard = () => {
  const location = useLocation();
  const carroId = location.state?.carroId || '';
  const [carroSeleccionado, setCarroSeleccionado] = useState(carroId);
  const [carros, setCarros] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [velocidad, setVelocidad] = useState(0.01);
  const [cargando, setCargando] = useState(false);
  const [puntos, setPuntos] = useState([]);
  const [historial, setHistorial] = useState([]);

  const { getCarros, getHistorial, getPuntos } = useApi();
  const [pausado, setPausado] = useState(false);  

  const { getRutasPersonalizadas } = useApi();
  const [rutasPersonalizadas, setRutasPersonalizadas] = useState([]);

  const [indiceHistorial, setIndiceHistorial] = useState(0);


  useEffect(() => {
    const cargarDatos = async () => {
      const [listaCarros, listaPuntos] = await Promise.all([getCarros(), getPuntos()]);
      setCarros(listaCarros);
      setPuntos(listaPuntos);
    };

    const fetchRutas = async () => {
      const data = await getRutasPersonalizadas();
      setRutasPersonalizadas(data);
      };
    fetchRutas();
    cargarDatos();
  }, []);

  const handleComenzar = async () => {
    if (!carroSeleccionado || !fechaInicio || !fechaFin) {
      alert('Debe seleccionar carro y fechas válidas');
      return;
    }

    const data = await getHistorial();

    // Filtra y ordena el historial antes de enviarlo a Mapa3D
    const filtrado = data
      .filter((h) => h.carro_id?.trim().toLowerCase() === carroSeleccionado.trim().toLowerCase())
      .filter((h) => {
        const t = new Date(h.timestamp);
        return t >= new Date(fechaInicio) && t <= new Date(fechaFin);
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (filtrado.length < 1) {
      alert('⚠️ No se encontraron datos para mostrar el recorrido.');
      return;
    }

    setHistorial(filtrado); // 👈 SOLO lo necesario para Mapa3D
    setIndiceHistorial(0); // Reinicia al inicio del recorrido

  };


const handleInquire = async () => {
  if (!carroSeleccionado || !fechaInicio || !fechaFin) {
    alert("Debe seleccionar carro y fechas válidas");
    return;
  }

  const data = await getHistorial(); // 👈 esto carga el historial directamente
  const datos = data
    .filter((h) => h.carro_id?.trim().toLowerCase() === carroSeleccionado.trim().toLowerCase())
    .filter((h) => {
      const t = new Date(h.timestamp);
      return t >= new Date(fechaInicio) && t <= new Date(fechaFin);
    })
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  setHistorial(data); // 👈 actualiza el estado para Mapa3D

  if (datos.length < 2) {
    alert("❗ No hay suficientes datos para analizar.");
    return;
  }

  const inicio = new Date(datos[0].timestamp);
  const fin = new Date(datos[datos.length - 1].timestamp);
  const duracionSeg = (fin - inicio) / 1000;

  const coords = datos.map(h => {
    const p = puntos.find(p => p.id === h.punto_id);
    return p ? { x: p.x, y: p.y, z: p.z ?? 0 } : null;
  }).filter(Boolean);

  let distanciaTotal = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const dx = coords[i + 1].x - coords[i].x;
    const dy = coords[i + 1].y - coords[i].y;
    const dz = coords[i + 1].z - coords[i].z;
    distanciaTotal += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  const velocidadPromedio = distanciaTotal / duracionSeg;

  alert(`📊 Inquire:
Carro: ${carroSeleccionado}
Puntos registrados: ${datos.length}
Inicio: ${inicio.toLocaleString()}
Fin: ${fin.toLocaleString()}
Duración: ${duracionSeg.toFixed(1)} segundos
Distancia total: ${distanciaTotal.toFixed(2)} unidades
Velocidad promedio: ${velocidadPromedio.toFixed(2)} u/s`);
};



  const exportarHistorial = () => {
  const datosFiltrados = historial
    .filter((h) => h.carro_id === carroSeleccionado)
    .filter((h) => {
      const t = new Date(h.timestamp);
      return t >= new Date(fechaInicio) && t <= new Date(fechaFin);
    });

  if (datosFiltrados.length === 0) {
    alert("⚠️ No hay datos para exportar.");
    return;
  }

  // Prepara datos para Excel
  const hoja = datosFiltrados.map((h, i) => ({
    '#': i + 1,
    'Carro ID': h.carro_id,
    'Punto': h.punto_id,
    'Timestamp': new Date(h.timestamp).toLocaleString()
  }));

  const libro = XLSX.utils.book_new();
  const hojaExcel = XLSX.utils.json_to_sheet(hoja);
  XLSX.utils.book_append_sheet(libro, hojaExcel, "Historial");

  XLSX.writeFile(libro, `Historial_Carro_${carroSeleccionado}.xlsx`);
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
          className="bg-indigo-600 cursor-pointer hover:bg-indigo-700 text-white text-xs font-semibold px-2 py-2 rounded shadow"
          onClick={handleInquire}
        >
          📈 Inquire
        </button>

        <button
          disabled={cargando}
          onClick={async () => {
            setCargando(true);
            await handleComenzar();
            setPausado(false);
            setCargando(false);
          }}
          className={`bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer text-xs font-semibold px-2 py-2 rounded shadow ${
            cargando ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {cargando ? 'Cargando...' : 'Empezar'}
        </button>


       <button
        className={`${
          pausado ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
        } text-white font-semibold px-2 py-2 cursor-pointer rounded shadow text-xs`}
        onClick={() => setPausado(!pausado)}
      >
        {pausado ? '▶️ Continuar' : '⏸️ Pausar'}
      </button>


      <button
      className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-xs font-semibold px-2 py-2 rounded shadow"
      onClick={exportarHistorial}
      >
        📤 Exportar
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
          pausado={pausado}
          rutasPersonalizadas={rutasPersonalizadas}
          indiceHistorial={indiceHistorial}
        />
      </div>
     {historial.length > 1 && (
        <div className="mt-6 px-4 py-3 bg-yellow-100 rounded-lg shadow-inner overflow-x-auto">
          <div className="flex gap-3 justify-center items-center min-w-max">
            {historial.map((_, index) => (
                <button
                  key={index}
                  aria-label={`Ir al paso ${index + 1}`}
                  title={`Paso ${index + 1}`}
                  onClick={() => setIndiceHistorial(index)}
                  className={`w-5 h-5 rounded-full border-2 transition-all duration-300 cursor-pointer
                    ${index === indiceHistorial
                      ? 'bg-blue-600 border-blue-800 shadow-lg scale-125'
                      : 'bg-blue-300 border-blue-400 hover:bg-blue-400 hover:scale-110'}
                  `}
                />
              ))}
          </div>
        </div>
      )}

    </div>
  );
};

