CREATE DATABASE Seguimiento;
USE Seguimiento;

DROP TABLE Carros;
CREATE TABLE Carros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gw VARCHAR(255) NOT NULL,
    mactag VARCHAR(255) NOT NULL,
    time TIME
);

INSERT INTO Carros (gw, mactag, time) VALUES 
('ac233fc1775a', 'c300014b1c9', '20:52'),
('ac233fc1775b', 'c300014b1c9', NULL),
('ac233fc1775c', 'c300014b1c9', NULL);

SELECT * FROM Carros;