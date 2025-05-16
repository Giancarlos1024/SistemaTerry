// Components/HistorialModal.jsx
import React from 'react';

const HistorialModal = ({ historial, onClose }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '12px',
        width: '800px',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📋 Historial de Recorridos</h2>

        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'Arial, sans-serif',
          fontSize: '15px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#007BFF', color: '#fff' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>ID del Carro</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Punto</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {historial.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#777' }}>
                  No hay registros aún.
                </td>
              </tr>
            ) : (
              historial.map((item, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                  <td style={{ padding: '10px' }}>{item.carro_id}</td>
                  <td style={{ padding: '10px' }}>{item.punto_nombre}</td>
                  <td style={{ padding: '10px' }}>{new Date(item.timestamp).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 30px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#007BFF',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#007BFF'}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistorialModal;
