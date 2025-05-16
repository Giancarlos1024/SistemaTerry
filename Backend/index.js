// Backend: Node.js
const express = require('express');
const mysql = require('mysql2'); // Cambiado a mysql2
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    port: 3309,
    user: 'root',
    password: 'gian1024*',
    database: 'Seguimiento'
});


// Conectar a la base de datos
db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1); // Finaliza el proceso si hay un error crítico
    }
    console.log('Conectado a la base de datos');
});

// Obtener todos los carros
app.get('/carros', (req, res) => {
    db.query('SELECT * FROM Carros', (err, results) => {
        if (err) {
            console.error('Error al obtener los datos:', err);
            res.status(500).json({ error: 'Error al obtener los datos' });
            return;
        }
        res.json(results);
    });
});

// Actualizar la posición y hora de un carro
app.put('/carros/:id', (req, res) => {
    const { id } = req.params;
    const { mactag } = req.body;
    const time = new Date().toTimeString().split(' ')[0]; // Hora actual en formato HH:MM:SS

    db.query(
        'UPDATE Carros SET mactag = ?, time = ? WHERE id = ?',
        [mactag, time, id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar el carro:', err);
                res.status(500).json({ error: 'Error al actualizar el carro' });
                return;
            }

            if (results.affectedRows === 0) {
                res.status(404).json({ message: 'Carro no encontrado' });
                return;
            }

            res.json({ success: true, message: 'Carro actualizado' });
        }
    );
});

app.get('/puntos', (req, res) => {
    db.query('SELECT * FROM Puntos', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener los puntos' });
        } else {
            res.json(results);
        }
    });
});

app.get('/rutas', (req, res) => {
    db.query(`
        SELECT r.id, r.tipo, 
               p1.x AS x1, p1.y AS y1, p1.z AS z1,
               p2.x AS x2, p2.y AS y2, p2.z AS z2
        FROM Rutas r
        JOIN Puntos p1 ON r.origen_id = p1.id
        JOIN Puntos p2 ON r.destino_id = p2.id
    `, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener las rutas' });
        } else {
            res.json(results);
        }
    });
});

// Agregar punto
app.post('/puntos', (req, res) => {
    const { nombre, mactag, x, y, z } = req.body;
    db.query('INSERT INTO Puntos (nombre, mactag, x, y, z) VALUES (?, ?, ?, ?, ?)', 
        [nombre, mactag, x, y, z], 
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Error al guardar punto' });
            res.json({ success: true, id: results.insertId });
        }
    );
});

// Agregar ruta
app.post('/rutas', (req, res) => {
    const { origen_id, destino_id, tipo } = req.body;
    db.query('INSERT INTO Rutas (origen_id, destino_id, tipo) VALUES (?, ?, ?)', 
        [origen_id, destino_id, tipo], 
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Error al guardar ruta' });
            res.json({ success: true, id: results.insertId });
        }
    );
});
app.get('/rutas-personalizadas', (req, res) => {
    db.query(`
        SELECT rp.id, rp.nombre, rpp.orden, rpp.x, rpp.y, rpp.z
        FROM RutaPersonalizada rp
        JOIN RutaPersonalizadaPuntos rpp ON rp.id = rpp.ruta_id
        ORDER BY rp.id, rpp.orden
    `, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al cargar rutas' });

        const rutasMap = {};
        results.forEach(row => {
            if (!rutasMap[row.id]) rutasMap[row.id] = { id: row.id, nombre: row.nombre, puntos: [] };
            rutasMap[row.id].puntos.push({ x: row.x, y: row.y, z: row.z });
        });

        res.json(Object.values(rutasMap));
    });
});


app.post('/rutas-personalizadas', (req, res) => {
    const { nombre, puntos } = req.body; // puntos = [{x, y, z}, {x, y, z}, ...]
    db.query('INSERT INTO RutaPersonalizada (nombre) VALUES (?)', [nombre], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error creando la ruta' });
        const rutaId = result.insertId;

        const values = puntos.map((p, i) => [rutaId, i, p.x, p.y, p.z]);
        db.query('INSERT INTO RutaPersonalizadaPuntos (ruta_id, orden, x, y, z) VALUES ?', [values], err2 => {
            if (err2) return res.status(500).json({ error: 'Error guardando puntos' });
            res.json({ success: true, id: rutaId });
        });
    });
});

app.put('/rutas-personalizadas/:id', async (req, res) => {
    const rutaId = req.params.id;
    const { puntos } = req.body;

    await db.query('DELETE FROM RutaPersonalizadaPuntos WHERE ruta_id = ?', [rutaId]);

    for (let i = 0; i < puntos.length; i++) {
        const { x, y, z } = puntos[i];
        await db.query(
            'INSERT INTO RutaPersonalizadaPuntos (ruta_id, orden, x, y, z) VALUES (?, ?, ?, ?, ?)',
            [rutaId, i, x, y, z]
        );
    }

    res.json({ success: true });
});


app.post('/rutas-personalizadas/:id/insertar', (req, res) => {
    const rutaId = parseInt(req.params.id);
    const { x, y, z, orden } = req.body;

    db.query(
        'UPDATE RutaPersonalizadaPuntos SET orden = orden + 1 WHERE ruta_id = ? AND orden >= ? ORDER BY orden DESC',
        [rutaId, orden],
        (err) => {
            if (err) {
                console.error('Error al desplazar puntos:', err);
                return res.status(500).json({ error: 'Error al actualizar orden de puntos' });
            }

            db.query(
                'INSERT INTO RutaPersonalizadaPuntos (ruta_id, orden, x, y, z) VALUES (?, ?, ?, ?, ?)',
                [rutaId, orden, x, y, z],
                (err2) => {
                    if (err2) {
                        console.error('Error al insertar punto:', err2);
                        return res.status(500).json({ error: 'Error al insertar el nuevo punto' });
                    }

                    res.json({ success: true, message: 'Punto insertado correctamente' });
                }
            );
        }
    );
});


app.post('/historial', (req, res) => {
    const { carro_id, punto_id } = req.body;
    db.query(
        'INSERT INTO HistorialRecorrido (carro_id, punto_id) VALUES (?, ?)',
        [carro_id, punto_id],
        (err, results) => {
            if (err) {
                console.error('Error al guardar recorrido:', err);
                return res.status(500).json({ error: 'Error al guardar recorrido' });
            }
            res.json({ success: true });
        }
    );
});

app.get('/api/historial', (req, res) => {
    db.query(
        `SELECT h.id, h.carro_id, p.nombre AS punto_nombre, h.timestamp
         FROM HistorialRecorrido h
         LEFT JOIN Puntos p ON h.punto_id = p.id
         ORDER BY h.timestamp DESC`,
        (err, results) => {
            if (err) {
                console.error('Error al consultar historial:', err);
                return res.status(500).json({ error: 'Error al consultar historial' });
            }
            res.json(results); // <<--- importante: responde en formato JSON
        }
    );
});
// Guardar múltiples puntos del recorrido cuando llega al WiFi
app.post('/historial/lote', (req, res) => {
    const { carro_id, puntos } = req.body;
  console.log('📥 Recibido historial/lote:', carro_id, puntos); // <--- Agrega esto
    if (!Array.isArray(puntos) || puntos.length === 0 || !carro_id) {
        return res.status(400).json({ error: 'Datos incompletos o lista vacía' });
    }

    const values = puntos.map(punto_id => [carro_id, punto_id]);

    db.query(
        'INSERT INTO HistorialRecorrido (carro_id, punto_id) VALUES ?',
        [values],
        (err, results) => {
            if (err) {
                console.error('Error al insertar lote de historial:', err);
                return res.status(500).json({ error: 'Error en la base de datos' });
            }
            res.json({ success: true, insertados: results.affectedRows });
        }
    );
});


// Servidor corriendo
app.listen(5000, () => {
    console.log('Servidor corriendo en el puerto 5000');
});
