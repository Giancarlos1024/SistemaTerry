import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import minaImage from '/NewProject.png';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryUser, setRecoveryUser] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const navigate = useNavigate();

  const manejarLogin = (e) => {
    e.preventDefault();
    if (usuario === 'admin' && password === '123456') {
      navigate('/dashboard');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const manejarRecuperacion = (e) => {
    e.preventDefault();
    setRecoverySuccess(true);
    setTimeout(() => {
      setShowRecovery(false);
      setRecoveryUser('');
      setRecoverySuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white relative">
      {/* Modal recuperación */}
      {showRecovery && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Recuperar cuenta</h3>
            {recoverySuccess ? (
              <p className="text-green-600">Se ha enviado un enlace de recuperación a tu correo.</p>
            ) : (
              <form onSubmit={manejarRecuperacion} className="space-y-4">
                <input
                  type="text"
                  placeholder="Ingresa tu correo o usuario"
                  value={recoveryUser}
                  onChange={(e) => setRecoveryUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="px-4 py-2 border rounded text-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Recuperar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Izquierda: Login */}
      <div className="flex flex-col justify-center items-center px-8 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yellow-600 mb-2">NewProject</h1>
            <h2 className="text-xl font-semibold text-gray-800">
              Plataforma de Monitoreo Minero
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Accede al sistema de control de flota, personal y sensores subterráneos.
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-300 rounded p-2">
              {error}
            </div>
          )}

          <form onSubmit={manejarLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
            <div className="text-right text-sm">
              <button
                type="button"
                onClick={() => navigate('/recuperar')}
                className="text-yellow-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded"
              >
                Ingresar
              </button>
              <button
                type="button"
                className="flex-1 py-3 border border-yellow-500 text-yellow-500 hover:bg-yellow-50 rounded"
              >
                Crear cuenta
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Derecha: Imagen */}
      <div className="hidden md:block bg-black">
        <div className="flex items-center justify-center h-full">
          <img
            src={minaImage}
            alt="Ilustración de mina"
            className="max-w-md w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
