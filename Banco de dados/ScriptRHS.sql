CREATE DATABASE ReptiHabitatSolutions;
USE ReptiHabitatSolutions;

 
-- Criação da tabela "empresa":
CREATE TABLE empresa (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(45),
    cnpj CHAR(14)
);
 
-- Criação da tabela "usuario":

CREATE TABLE usuario (
    id INT AUTO_INCREMENT,
    nome VARCHAR(50),
    cpf CHAR(11),
    email VARCHAR(100) UNIQUE,
    senha VARCHAR(50),
    fk_empresa INT,
    PRIMARY KEY (id),
    CONSTRAINT fkEmpresa FOREIGN KEY (fk_empresa)
        REFERENCES empresa (id)
);

-- Criação da tabela "endereco"
CREATE TABLE endereco (
    idEndereco INT AUTO_INCREMENT,
    logradouro VARCHAR(60) NOT NULL,
    numero INT NOT NULL,
    complemento VARCHAR(45),
    bairro VARCHAR(45) NOT NULL,
    cidade VARCHAR(45) NOT NULL,
    fkUsuario INT,
    fkIdEmpresa int,
    PRIMARY KEY (idEndereco),
    CONSTRAINT fk_Usuario FOREIGN KEY (fkUsuario) REFERENCES usuario (id),
	CONSTRAINT fkIdEmpresa FOREIGN KEY (fkIdEmpresa) REFERENCES empresa (id)
);


-- Criação da tabela do "habitatAnimal" que será registrado:

CREATE TABLE habitatAnimal (
  idHabitat INT AUTO_INCREMENT PRIMARY KEY,
  especieRepteis VARCHAR(45) NOT NULL,
  qtdRepteis INT NOT NULL,
  areaHabitat  INT NULL,
  fkEndereco INT NOT NULL,
  fk_empresa INT NOT NULL,
  INDEX fk_habitatAnimal_endereco1_idx (fkEndereco ASC) VISIBLE,
  CONSTRAINT fk_habitatAnimal_endereco1
    FOREIGN KEY (fkEndereco)
    REFERENCES endereco (idEndereco),
  CONSTRAINT fk_empresa_habitatAnimal
    FOREIGN KEY (fk_empresa)
    REFERENCES empresa (id)
);

-- Criação da tabela 'Leituras":
CREATE TABLE Leituras(
  id INT NOT NULL auto_increment,
  LeituraLumi DECIMAL(5,2) NULL,
  LeituraTemp DECIMAL(5,2) NULL,
  PRIMARY KEY (id));

CREATE TABLE Medidas(
	idMedidas INT AUTO_INCREMENT,
    fkHabitat INT,
    fkLeituras INT NOT NULL,
    DataLeitura DATETIME,
    FOREIGN KEY (FkLeituras) REFERENCES Leituras (id),
    FOREIGN KEY (fkHabitat) REFERENCES habitatAnimal (idHabitat),
    PRIMARY KEY (idMedidas, fkLeituras, fkHabitat)
);

-- Inserção de dados na tabela "empresa":
INSERT INTO empresa (nome, cnpj) VALUES
('São Tech School', '12345678901234'),
('Selva Habitats', '56789012345678');

-- Inserção de dados na tabela "usuario":
INSERT INTO usuario (nome, cpf, email, senha, fk_empresa) VALUES
('Paulo Silva', '12345678901', 'paulo@gmail.com', 'senha123', 1),
('Guilherme Matos', '23456789012', 'guilherme@gamail.com', 'senha456', 2);

-- Inserção de dados na tabela "endereco":
INSERT INTO endereco (logradouro, numero, complemento, bairro, cidade, fkUsuario, fkIdEmpresa) VALUES
('Rua Salve a Mocidade', 123, 'Sala 101', 'São Jorge', 'São Paulo', 1, 1),
('Avenida Nove de Julho', 456, NULL, 'Consolação', 'São Paulo', 2, 2);

-- Inserção de dados na tabela "habitatAnimal":
INSERT INTO habitatAnimal (idHabitat, especieRepteis, qtdRepteis, areaHabitat, fkEndereco, fk_empresa) VALUES
(1, 'Tartaruga', 5, 10, 1, 1),
(2, 'Cobra', 3, 8, 2, 2);

-- Inserção de dados na tabela "Leituras":
INSERT INTO Leituras (id, LeituraLumi, LeituraTemp) VALUES
(1, 400, 25.3),
(2, 555, 28.6),
(3, 345, 23.7),
(4, 678, 21);


-- Inserção de dados na tabela "Medidas":
INSERT INTO Medidas (fkHabitat, fkLeituras, DataLeitura) VALUES
(1, 1, '2024-06-10 08:00:00'),
(1, 2, '2024-06-10 12:00:00'),
(2, 3, '2024-06-10 09:00:00'),
(2, 4, '2024-06-10 15:00:00');


