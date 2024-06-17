CREATE DATABASE ReptiHabitatSolutions;

USE ReptiHabitatSolutions;

CREATE TABLE empresa (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(45),
    cnpj CHAR(14)
);

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

CREATE TABLE Medidas(
	idMedidas INT AUTO_INCREMENT,
    LeituraLumi DECIMAL(5,2) NULL,
	LeituraTemp DECIMAL(5,2) NULL,
    fkHabitat INT,
    DataLeitura DATETIME,
    FOREIGN KEY (fkHabitat) REFERENCES habitatAnimal (idHabitat),
    PRIMARY KEY (idMedidas, fkHabitat)
);
