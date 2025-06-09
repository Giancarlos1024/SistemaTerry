// src/View/RecuperarCuenta.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Recuperar = () => {
  const [usuario, setUsuario] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const manejarEnvio = (e) => {
    e.preventDefault();
    setMensaje('🔐 Se ha enviado un enlace de recuperación a tu correo o cuenta asociada.');
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-yellow-600 mb-2">Recuperar Cuenta</h2>
        <p className="text-gray-600 mb-4">
          Ingresa tu usuario o correo para enviarte instrucciones de recuperación.
        </p>
        {mensaje ? (
          <div className="text-green-600 bg-green-100 p-3 rounded">{mensaje}</div>
        ) : (
          <form onSubmit={manejarEnvio} className="space-y-4">
            <input
              type="text"
              placeholder="Correo o Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded"
            >
              Enviar recuperación
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full text-sm text-gray-500 hover:underline mt-2"
            >
              Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Recuperar;
