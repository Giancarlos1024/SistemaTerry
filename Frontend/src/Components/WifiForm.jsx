import React, { useState } from 'react';

const WifiForm = ({ onAddWifi }) => {
  const [nombre, setNombre] = useState('');
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [z, setZ] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      nombre,
      mactag: 'wifi',
      x: parseFloat(x),
      y: parseFloat(y),
      z: parseFloat(z)
    };

    try {
      const res = await fetch('http://localhost:5000/puntos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (result.success) {
        onAddWifi(data);
        setNombre('');
        setX('');
        setY('');
        setZ('');
      } else {
        alert('Error al guardar en base de datos');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" bottom-6 right-6 w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 space-y-4 border border-gray-200 dark:border-gray-700 z-50"
    >
      <h3 className="text-lg font-bold text-center text-blue-600 dark:text-blue-400">📶 Agregar Punto WiFi</h3>

      <input
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        placeholder="Nombre"
        required
        className="input"
      />
      <input
        type="number"
        value={x}
        onChange={e => setX(e.target.value)}
        placeholder="X"
        required
        className="input"
      />
      <input
        type="number"
        value={y}
        onChange={e => setY(e.target.value)}
        placeholder="Y"
        required
        className="input"
      />
      <input
        type="number"
        value={z}
        onChange={e => setZ(e.target.value)}
        placeholder="Z"
        required
        className="input"
      />

      <button
        type="submit"
        className="btn-primary w-full"
      >
        ➕ Agregar WiFi
      </button>
    </form>
  );
};

export default WifiForm;
