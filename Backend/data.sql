CREATE DATABASE seguimiento;
USE seguimiento;

DROP DATABASE seguimiento;

CREATE TABLE Carros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gw VARCHAR(255) NOT NULL,
    mactag VARCHAR(255) NOT NULL,
    placa VARCHAR(50),
    nombre VARCHAR(100),
    empresa VARCHAR(100),
    modelo VARCHAR(100),
    area VARCHAR(100),
    time TIME
);
SELECT 
  h.id,
  c.placa AS PLACA,
  c.nombre AS NOMBRE,
  c.empresa AS EMPRESA,
  c.modelo AS MODELO,
  c.area AS AREA,
  c.gw AS GATEWAY,
  p.nombre AS PUNTO_CONTROL,
  h.timestamp AS FECHA
FROM HistorialRecorrido h
LEFT JOIN Carros c ON h.carro_id = c.mactag
LEFT JOIN Puntos p ON h.punto_id = p.id
ORDER BY h.timestamp DESC;


CREATE TABLE Puntos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  mactag VARCHAR(255),
  x DOUBLE,
  y DOUBLE,
  z DOUBLE
);

CREATE TABLE Rutas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  origen_id INT,
  destino_id INT,
  tipo VARCHAR(50), -- "entrada", "salida", "túnel", etc.
  FOREIGN KEY (origen_id) REFERENCES Puntos(id),
  FOREIGN KEY (destino_id) REFERENCES Puntos(id)
);

CREATE TABLE HistorialRecorrido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carro_id VARCHAR(255),
    punto_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE RutaPersonalizada (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE RutaPersonalizadaPuntos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ruta_id INT,
    orden INT,
    x DOUBLE,
    y DOUBLE,
    z DOUBLE,
    FOREIGN KEY (ruta_id) REFERENCES RutaPersonalizada(id)
);


INSERT INTO Carros (gw, mactag, time) VALUES 
('c300014b1c9', 'c300014b1c9', '20:52');

INSERT INTO Carros (gw, mactag, time) VALUES 
('c300014b1cA', 'c300014b1cB', '20:52');

INSERT INTO RutaPersonalizada (nombre) VALUES ('Ruta animada');
INSERT INTO HistorialRecorrido (carro_id, punto_id, timestamp) VALUES
('c300014b1c9', 1, '2025-05-17 10:00:00'),
('c300014b1c9', 2, '2025-05-17 10:00:10'),
('c300014b1c9', 3, '2025-05-17 10:00:20'),
('c300014b1c9', 4, '2025-05-17 10:00:30'),
('c300014b1c9', 5, '2025-05-17 10:00:40'),
('c300014b1c9', 6, '2025-05-17 10:00:50'),
('c300014b1c9', 7, '2025-05-17 10:01:00'),
('c300014b1c9', 8, '2025-05-17 10:01:10'),
('c300014b1c9', 9, '2025-05-17 10:01:20'),
('c300014b1c9', 10, '2025-05-17 10:01:30'),
('c300014b1c9', 11, '2025-05-17 10:01:40'),
('c300014b1c9', 12, '2025-05-17 10:01:50'),
('c300014b1c9', 13, '2025-05-17 10:02:00'),
('c300014b1c9', 14, '2025-05-17 10:02:10'),
('c300014b1c9', 15, '2025-05-17 10:02:20'),
('c300014b1c9', 16, '2025-05-17 10:02:30'),
('c300014b1c9', 17, '2025-05-17 10:02:40'),
('c300014b1c9', 46, '2025-05-17 10:07:30');

INSERT INTO HistorialRecorrido (carro_id, punto_id, timestamp) VALUES
('c300014b1cB', 18, '2025-06-05 10:00:00'),
('c300014b1cB', 19, '2025-06-05 10:00:10'),
('c300014b1cB', 20, '2025-06-05 10:00:20'),
('c300014b1cB', 21, '2025-06-05 10:00:30'),
('c300014b1cB', 22, '2025-06-05 10:00:40'),
('c300014b1cB', 23, '2025-06-05 10:00:50');

DELETE FROM historialrecorrido WHERE carro_id= 'c300014b1cA';
SELECT * FROM historialrecorrido;


INSERT INTO Puntos (id, nombre, mactag, x, y, z) VALUES
(1, 'Punto_1', 'beacon_1', 1141.2003, 13391.1088, -21978.56),
(2, 'Punto_2', 'beacon_2', 705.4177, 13388.4288, -22024.6038),
(3, 'Punto_3', 'beacon_3', 197.5259, 13313.8288, -22079.4936),
(4, 'Punto_4', 'beacon_4', -652.7339, 13231.2032, -22187.1458),
(5, 'Punto_5', 'beacon_5', -1507.0797, 13128.3488, -22296.6),
(6, 'Punto_6', 'beacon_6', -2449.9197, 13009.0688, -22450.7),
(7, 'Punto_7', 'beacon_7', -3370.082, 12906.1088, -22561.339),
(8, 'Punto_8', 'beacon_8', -4212.7797, 12794.1688, -22707.58),
(9, 'Punto_9', 'beacon_9', -5083.3597, 12682.6688, -22854),
(10, 'Punto_10', 'beacon_10', -5945.4397, 12572.2288, -22991.84),
(11, 'Punto_11', 'beacon_11', -6636.8597, 12543.6088, -23115.24),
(12, 'Punto_12', 'beacon_12', -7161.9329, 12519.3088, -23196.1784),
(13, 'Punto_13', 'beacon_13', -7784.7442, 12438.8288, -23245.6664),
(14, 'Punto_14', 'beacon_14', -8331.1603, 12382.8288, -23327.264),
(15, 'Punto_15', 'beacon_15', -8814.8623, 12371.3888, -23455.3643),
(16, 'Punto_16', 'beacon_16', -9150.6906, 12368.5088, -23688.0953),
(17, 'Punto_17', 'beacon_17', -9207.4725, 12364.5088, -23790.2391),
(18, 'Punto_18', 'beacon_18', -9236.9597, 12359.5488, -23929.6),
(19, 'Punto_19', 'beacon_19', -9118.8608, 12313.6197, -24467.1971),
(20, 'Punto_20', 'beacon_20', -8949.6094, 12265.6696, -24748.2566),
(21, 'Punto_21', 'beacon_21', -8651.381, 12213.1221, -24983.7401),
(22, 'Punto_22', 'beacon_22', -8506.0984, 12190.3804, -25037.1948),
(23, 'Punto_23', 'beacon_23', -8280.9807, 12165.9028, -25039.5695),
(24, 'Punto_24', 'beacon_24', -7961.1784, 12141.3288, -24931.7403),
(25, 'Punto_25', 'beacon_25', -7599.0933, 12134.9458, -24779.9449),
(26, 'Punto_26', 'beacon_26', -7217.9232, 12127.5201, -24619.0883);


INSERT INTO Puntos (id, nombre, mactag, x, y, z) VALUES
(27, 'Punto_27', 'beacon_27', -5660.0181, 13168.3488, -7622.5311),
(28, 'Punto_28', 'beacon_28', -6594.3058, 13160.4288, -7842.1178),
(29, 'Punto_29', 'beacon_29', -7456.7461, 13156.2688, -8028.2889),
(30, 'Punto_30', 'beacon_30', -8477.3056, 13053.3488, -8270.6957),
(31, 'Punto_31', 'beacon_31', -9279.0456, 12961.2513, -8478.2206),
(32, 'Punto_32', 'beacon_32', -10493.6947, 12815.0841, -8791.8741);

DELETE FROM carros;
DELETE FROM HistorialRecorrido;
DELETE FROM RutaPersonalizadaPuntos;
DELETE FROM Puntos;
SELECT * FROM Carros;
SELECT * FROM Puntos;
SELECT * FROM Rutas;
SELECT * FROM RutaPersonalizada;
SELECT * FROM RutaPersonalizadaPuntos;

UPDATE RutaPersonalizada SET nombre='Turquesa' WHERE id = 3;
DELETE FROM rutapersonalizadapuntos WHERE ruta_id = 10 AND orden= 207;
DELETE FROM rutapersonalizadapuntos WHERE ruta_id = 9 AND orden= 19;
DELETE FROM rutapersonalizadapuntos WHERE ruta_id = 11 AND orden= 167;
DELETE FROM rutapersonalizadapuntos WHERE ruta_id = 12 AND orden= 112;
DELETE FROM rutapersonalizadapuntos WHERE ruta_id = 14 AND orden= 25;
DELETE FROM rutapersonalizadapuntos WHERE ruta_id = 15 AND orden= 54;
SELECT * FROM HistorialRecorrido;
SELECT * FROM HistorialRecorrido ORDER BY timestamp DESC;

UPDATE RutaPersonalizada SET nombre='Ruta animada' WHERE nombre = 'bocamina_1';
