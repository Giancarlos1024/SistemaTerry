import { createContext, useContext } from 'react';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
    const API_BASE = 'http://localhost:5000';

    // const fetchCarros = async () => {
    //     const response = await fetch('http://localhost:5000/carros');
    //     const carros = await response.json();

    //     carrosRef.current = carros.map(carro => {
    //         const mesh = new THREE.Mesh(
    //             new THREE.BoxGeometry(400, 200, 200),
    //             new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
    //         );
    //         mesh.position.set(0, 100, 0);
    //         sceneRef.current.add(mesh);

    //         return {
    //             id: carro.id,
    //             mactag: carro.mactag,
    //             mesh,
    //             ruta: rutaAnimada.current, // temporalmente la misma para todos
    //             index: 0,
    //             recorrido: []
    //         };
    //     });
    // };


    const getPuntos = async () => {
        const res = await fetch(`${API_BASE}/puntos`);
        return await res.json();
    };

    const getRutas = async () => {
        const res = await fetch(`${API_BASE}/rutas`);
        return await res.json();
    };

    const getRutasPersonalizadas = async () => {
        const res = await fetch(`${API_BASE}/rutas-personalizadas`);
        return await res.json();
    };

    const postPunto = async (punto) => {
        const res = await fetch(`${API_BASE}/puntos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(punto)
        });
        return await res.json();
    };

    const postRuta = async (ruta) => {
        const res = await fetch(`${API_BASE}/rutas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ruta)
        });
        return await res.json();
    };

    const postRutaPersonalizada = async (ruta) => {
        const res = await fetch(`${API_BASE}/rutas-personalizadas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ruta)
        });
        return await res.json();
    };

    const updateRutaPersonalizada = async (id, puntos) => {
        const res = await fetch(`${API_BASE}/rutas-personalizadas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ puntos })
        });
        return await res.json();
    };
    
    const getHistorial = async () => {
        const res = await fetch(`${API_BASE}/api/historial`);
        return await res.json();
    };

    const getCarros = async () => {
        const res = await fetch(`${API_BASE}/carros`);
        return await res.json();
    };

    // En ApiProvider dentro de context/ApiContext.jsx
    const getHistorialVehiculos = async () => {
        const res = await fetch(`${API_BASE}/api/historial-vehiculos`);
        if (!res.ok) throw new Error("Error al obtener historial");
        return await res.json();
    };



    return (
        <ApiContext.Provider value={{
            getPuntos,
            getRutas,
            getRutasPersonalizadas,
            postPunto,
            postRuta,
            postRutaPersonalizada,
            updateRutaPersonalizada,
            getHistorial,
            getCarros,
            getHistorialVehiculos,
           
        }}>
            {children}
        </ApiContext.Provider>
    );
};
