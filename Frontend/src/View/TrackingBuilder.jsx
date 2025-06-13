import React, { useRef, useState, useEffect } from 'react';
import TrackingForms from '../Components/TrackingForms';
import WifiForm from '../Components/WifiForm';
import { useApi } from '../context/ApiContext';

const TrackingBuilder = () => {
  const sceneRef = useRef(); // Referencia ficticia por si se necesita para los formularios
  const [puntos, setPuntos] = useState([]);
  const { getPuntos } = useApi();

  useEffect(() => {
    const fetchPuntos = async () => {
      const data = await getPuntos();
      setPuntos(data);
    };
    fetchPuntos();
  }, []);

  const handleAddWifi = ({ nombre, x, y, z }) => {
    alert(`WiFi agregado: ${nombre} en (${x}, ${y}, ${z})`);
    // Aquí puedes conectarlo con tu backend o añadir lógica con Three.js
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">🛠️ Constructor de Tracking</h1>
      <div className="bg-white rounded shadow p-4">
        <TrackingForms puntos={puntos} sceneRef={sceneRef} />
      </div>
      <div className="bg-white rounded shadow p-4">
        <WifiForm onAddWifi={handleAddWifi} />
      </div>
    </div>
  );
};

export default TrackingBuilder;
