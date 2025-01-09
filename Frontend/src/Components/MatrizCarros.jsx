import React, { useState } from 'react';

const MatrizCarros = () => {
    const filas = 11;
    const columnas = 16;
    const [carrosPos, setCarrosPos] = useState([
        { id: 1, fila: 0, columna: 0, mactag: 'c300014b1c9', icono: '🚗' },
        { id: 2, fila: 0, columna: 0, mactag: 'c300014b1c9', icono: '🚗' },
        { id: 3, fila: 0, columna: 0, mactag: 'c300014b1c9', icono: '🚛' }, // Ícono para el tercer carro
        { id: 4, fila: 0, columna: 0, mactag: 'c300014b1c9', icono: '👨‍👦' }, // Ícono para el tercer carro
    ]);
    

    // Definir ubicaciones estáticas con mactag
    const ubicacionesEstaticas = [
        { fila: 0, columna: 0, mactag: 'c300014b1c10' },
        { fila: 0, columna: 2, mactag: 'c300014b1c11' },
        { fila: 0, columna: 4, mactag: 'c300014b1c12' },
        { fila: 0, columna: 6, mactag: 'c300014b1c13' },
        { fila: 0, columna: 8, mactag: 'c300014b1c14' },
        { fila: 0, columna: 10, mactag: 'c300014b1c15' },
        { fila: 0, columna: 12, mactag: 'c300014b1c16' },
        { fila: 0, columna: 15, mactag: 'c300014b1c17' },
        { fila: 2, columna: 15, mactag: 'c300014b1c18' },
        { fila: 2, columna: 10, mactag: 'c300014b1c19' },
        { fila: 2, columna: 5, mactag: 'c300014b1c20' },
        { fila: 2, columna: 0, mactag: 'c300014b1c21' },
        { fila: 4, columna: 0, mactag: 'c300014b1c22' },
        { fila: 4, columna: 2, mactag: 'c300014b1c23' },
        { fila: 4, columna: 4, mactag: 'c300014b1c24' },
        { fila: 4, columna: 6, mactag: 'c300014b1c25' },
        { fila: 4, columna: 8, mactag: 'c300014b1c26' },
        { fila: 4, columna: 10, mactag: 'c300014b1c27' },
        { fila: 4, columna: 12, mactag: 'c300014b1c28' },
        { fila: 4, columna: 15, mactag: 'c300014b1c29' },
        { fila: 6, columna: 15, mactag: 'c300014b1c30' },
        { fila: 8, columna: 15, mactag: 'c300014b1c31' },
        { fila: 8, columna: 12, mactag: 'c300014b1c32' },
        { fila: 10, columna: 12, mactag: 'c300014b1c33' },
        { fila: 10, columna: 10, mactag: 'c300014b1c34' },
        { fila: 10, columna: 8, mactag: 'c300014b1c35' },
        { fila: 10, columna: 6, mactag: 'c300014b1c36' },
        { fila: 10, columna: 4, mactag: 'c300014b1c37' },
        { fila: 10, columna: 2, mactag: 'c300014b1c38' },
        { fila: 10, columna: 0, mactag: 'c300014b1c39' },
        { fila: 8, columna: 0, mactag: 'c300014b1c40' },
        { fila: 6, columna: 2, mactag: 'c300014b1c41' },
        { fila: 8, columna: 4, mactag: 'c300014b1c42' },
    ];

    const generarMatriz = () => {
        const matriz = [];
        for (let i = 0; i < filas; i++) {
            const fila = [];
            for (let j = 0; j < columnas; j++) {
                let carrosEnPosicion = '';
                // Iterar sobre los carros y añadir los que están en la posición actual
                carrosPos.forEach(carro => {
                    if (carro.fila === i && carro.columna === j) {
                        carrosEnPosicion += `${carro.icono}${carro.id} `; // Utilizar el ícono desde el objeto del carro
                    }
                });
                // Si no hay carros, mostrar el espacio vacío
                if (carrosEnPosicion === '') fila.push('⬜');
                else fila.push(carrosEnPosicion);
            }
            matriz.push(fila);
        }
        return matriz;
    };
    
    

    // Función para mover el carro
    const moverCarro = (id, direccion) => {
        setCarrosPos((prevPos) =>
            prevPos.map((carro) => {
                if (carro.id === id) {
                    let nuevaFila = carro.fila;
                    let nuevaColumna = carro.columna;
    
                    if (direccion === 'arriba' && nuevaFila > 0) nuevaFila--;
                    if (direccion === 'abajo' && nuevaFila < filas - 1) nuevaFila++;
                    if (direccion === 'izquierda' && nuevaColumna > 0) nuevaColumna--;
                    if (direccion === 'derecha' && nuevaColumna < columnas - 1) nuevaColumna++;
    
                    // Nuevos movimientos diagonales
                    if (direccion === 'arriba-izquierda' && nuevaFila > 0 && nuevaColumna > 0) {
                        nuevaFila--;
                        nuevaColumna--;
                    }
                    if (direccion === 'arriba-derecha' && nuevaFila > 0 && nuevaColumna < columnas - 1) {
                        nuevaFila--;
                        nuevaColumna++;
                    }
                    if (direccion === 'abajo-izquierda' && nuevaFila < filas - 1 && nuevaColumna > 0) {
                        nuevaFila++;
                        nuevaColumna--;
                    }
                    if (direccion === 'abajo-derecha' && nuevaFila < filas - 1 && nuevaColumna < columnas - 1) {
                        nuevaFila++;
                        nuevaColumna++;
                    }
    
                    // Verificar si el carro llegó a una ubicación estática
                    const ubicacion = ubicacionesEstaticas.find(
                        (ubicacion) => ubicacion.fila === nuevaFila && ubicacion.columna === nuevaColumna
                    );
    
                    if (ubicacion) {
                        // Actualizar mactag
                        carro.mactag = ubicacion.mactag;
                        actualizarMactag(id, ubicacion.mactag); // Actualizar backend
                    }
    
                    return { ...carro, fila: nuevaFila, columna: nuevaColumna };
                }
                return carro;
            })
        );
    };
    

    // Función para actualizar el mactag del carro en el backend
    const actualizarMactag = (id, mactag) => {
        fetch(`http://localhost:5000/carros/${id}`, { // Cambiar el id según corresponda
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mactag })
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(`Carro ${id} actualizado:`, data);
        })
        .catch((error) => {
            console.error('Error al actualizar el carro:', error);
        });
    };

    return (
        <div style={{ textAlign: 'center' }} className='contenedor' >
            <div>
                <div>
                    <h2>Seguimiento de Personal o Carro</h2>
                </div>
                <div className='datos'>
                    {carrosPos.map((carro) => (
                        <h3 key={carro.id}>{`C ${carro.id}: MacTag.A: ${carro.mactag}`}</h3>
                    ))}
                </div>

                <div>
                    {['arriba', 'izquierda', 'abajo', 'derecha', 'arriba-izquierda', 'arriba-derecha', 'abajo-izquierda', 'abajo-derecha'].map((direccion) => (
                        <div className='conteinerMo' key={direccion}>
                            {carrosPos.map((carro) => (
                                <button className='buttonMo' key={carro.id} onClick={() => moverCarro(carro.id, direccion)}>
                                    <div className='movimientos'>
                                        {direccion === 'arriba' && '⬆️'}
                                        {direccion === 'izquierda' && '⬅️'}
                                        {direccion === 'abajo' && '⬇️'}
                                        {direccion === 'derecha' && '➡️'}
                                        {direccion === 'arriba-izquierda' && '↖️'}
                                        {direccion === 'arriba-derecha' && '↗️'}
                                        {direccion === 'abajo-izquierda' && '↙️'}
                                        {direccion === 'abajo-derecha' && '↘️'}
                                        {` Mover Carro ${carro.id}`}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>

            </div>
            <div className='matrizCont' style={{ display: 'inline-block', marginTop: '20px' }}>
                {generarMatriz().map((fila, i) => (
                    <div  key={i} style={{ display: 'flex' }}>
                        {fila.map((celda, j) => {
                            const isTarget = ubicacionesEstaticas.some(ubicacion => ubicacion.fila === i && ubicacion.columna === j);
                            return (
                                <div
                                    key={j}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        border: '1px solid black',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        backgroundColor: isTarget ? 'lightgreen' : 'transparent',
                                    }}
                                >
                                    {celda}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MatrizCarros;
