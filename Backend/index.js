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
    db.query('SELECT * FROM Rutas', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener las rutas' });
        } else {
            res.json(results);
        }
    });
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

app.get('/ver-historial', (req, res) => {
    db.query(
        `SELECT h.id, h.carro_id, p.nombre AS punto_nombre, h.timestamp
         FROM HistorialRecorrido h
         LEFT JOIN Puntos p ON h.punto_id = p.id
         ORDER BY h.timestamp DESC`,
        (err, results) => {
            if (err) {
                console.error('Error al consultar historial:', err);
                return res.status(500).send('Error al consultar historial');
            }

            let html = `
                <html>
                    <head>
                        <title>Historial de Recorrido</title>
                        <style>
                            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
                            table { width: 100%; border-collapse: collapse; background: white; }
                            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                            th { background: #333; color: white; }
                        </style>
                    </head>
                    <body>
                        <h2>Historial de Recorrido</h2>
                        <table>
                            <tr>
                                <th>ID</th>
                                <th>Carro ID</th>
                                <th>Punto</th>
                                <th>Fecha y Hora</th>
                            </tr>
                            ${results.map(r => `
                                <tr>
                                    <td>${r.id}</td>
                                    <td>${r.carro_id}</td>
                                    <td>${r.punto_nombre || '-'}</td>
                                    <td>${new Date(r.timestamp).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </table>
                    </body>
                </html>
            `;

            res.send(html);
        }
    );
});


// Servidor corriendo
app.listen(5000, () => {
    console.log('Servidor corriendo en el puerto 5000');
});
