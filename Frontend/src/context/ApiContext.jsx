import { createContext, useContext } from 'react';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
    const API_BASE = 'http://localhost:5000';

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

    return (
        <ApiContext.Provider value={{
            getPuntos,
            getRutas,
            getRutasPersonalizadas,
            postPunto,
            postRuta,
            postRutaPersonalizada,
            updateRutaPersonalizada
        }}>
            {children}
        </ApiContext.Provider>
    );
};
