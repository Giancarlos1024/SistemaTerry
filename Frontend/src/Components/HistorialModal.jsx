import React, { useState, useEffect } from 'react';
import Pagination from './Pagination';
import { useApi } from '../context/ApiContext';

const formatFecha = (fecha) => new Date(fecha).toLocaleString();

const HistorialModal = ({ modalOpen, setModalOpen }) => {
  const { getHistorialVehiculos } = useApi();

  const [historial, setHistorial] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (modalOpen) {
      getHistorialVehiculos().then(setHistorial);
    }
  }, [modalOpen]);

  const filteredData = historial.filter((vehiculo) => {
    const texto = `${vehiculo.PLACA} ${vehiculo.NOMBRE} ${vehiculo.EMPRESA} ${vehiculo.MODELO} ${vehiculo.AREA} ${vehiculo.GATEWAY} ${vehiculo.PUNTO_CONTROL} ${vehiculo.FECHA}`.toLowerCase();
    return texto.includes(searchQuery.toLowerCase());
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800/50 bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded-lg shadow-xl h-auto relative max-w-6xl w-full">
        <div className="mb-1 flex items-center">
          <video className="w-20 rounded-lg" autoPlay loop muted>
            <source src="/car.mp4" type="video/mp4" />
            Tu navegador no soporta videos.
          </video>
          <h2 className="ml-4 text-xl font-semibold text-cyan-600 mb-2 text-center">Historial de unidad</h2>
        </div>

        <button
          onClick={() => setModalOpen(false)}
          className="absolute cursor-pointer text-xl right-5 top-0 mt-4 px-5 py-2 text-black rounded-lg transition duration-300"
        >
          x
        </button>

        <div className='flex mb-2'>
          <input
            type="text"
            placeholder="Buscar por placa, nombre, empresa, modelo, área, gateway, punto o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 border rounded-md h-10"
          />
          <button
            onClick={() => setSearchQuery(searchTerm)}
            className="ml-2 mt-0 bg-[rgb(23,50,107)] text-white text-lg px-4 py-1 rounded-lg cursor-pointer hover:bg-cyan-400 hover:scale-102 transition-all duration-200 active:opacity-50"
          >
            Buscar
          </button>
        </div>

        <p className="text-sm text-center text-gray-600 mt-2">Resumen de recorridos registrados</p>

        <div className="mt-2 overflow-x-auto overflow-y-auto max-h-[350px]">
          <table className="w-full border-collapse shadow-md">
            <thead className="sticky top-0 bg-gray-100">
              <tr className="bg-[rgb(23,50,107)] text-white uppercase text-sm leading-normal">
                <th className="py-3 px-4 text-left">PLACA</th>
                <th className="py-3 px-4 text-left">NOMBRE COMPLETO</th>
                <th className="py-3 px-4 text-left">EMPRESA</th>
                <th className="py-3 px-4 text-left">MODELO</th>
                <th className="py-3 px-4 text-left">ÁREA</th>
                <th className="py-3 px-4 text-left">GATEWAY</th>
                <th className="py-3 px-4 text-left">PUNTO DE CONTROL</th>
                <th className="py-3 px-4 text-left">FECHA</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {currentItems.map((vehiculo, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-4">{vehiculo.PLACA}</td>
                  <td className="py-3 px-4">{vehiculo.NOMBRE}</td>
                  <td className="py-3 px-4">{vehiculo.EMPRESA}</td>
                  <td className="py-3 px-4">{vehiculo.MODELO}</td>
                  <td className="py-3 px-4">{vehiculo.AREA}</td>
                  <td className="py-3 px-4">{vehiculo.GATEWAY}</td>
                  <td className="py-3 px-4">{vehiculo.PUNTO_CONTROL}</td>
                  <td className="py-3 px-4">{formatFecha(vehiculo.FECHA)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
          paginate={paginate}
        />
      </div>
    </div>
  );
};

export default HistorialModal;
