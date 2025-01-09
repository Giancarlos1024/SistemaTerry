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
    user: 'root',
    password: '123456',
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

// Servidor corriendo
app.listen(5000, () => {
    console.log('Servidor corriendo en el puerto 5000');
});
