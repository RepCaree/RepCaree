// Importa os módulos necessários
// não altere!
const serialport = require('serialport'); // Módulo para comunicação serial
const express = require('express'); // Módulo para criar um servidor web
const mysql = require('mysql2'); // Módulo para conectar ao MySQL

// Constantes para configurações
// não altere!
const SERIAL_BAUD_RATE = 9600;
const SERVIDOR_PORTA = 3300;

// Habilita ou desabilita a inserção de dados no banco de dados
// false -> nao insere
// true -> insere
const HABILITAR_OPERACAO_INSERIR = true;

// Função para comunicação serial
const serial = async (
    valoresLm35Temperatura,
    valoresLuminosidade
) => {
    let poolBancoDados = ''

    //CRIAR USUARIO SÓ COM PERMISSÃO DE INSERT
    // Conexão com o banco de dados MySQL
    poolBancoDados = mysql.createPool(
        {
            // altere!
            // Credenciais do banco de dados
            host: 'localhost',            //Na máquina virtual devo pegar o IP da nova máquina.
            user: 'RHS', // ReptiHabitatSolution
            password: 'Repti@123', // 
            database: 'ReptiHabitatSolutions',
            port: 3307
        }
    ).promise();

    // Lista as portas seriais disponíveis e procura pelo Arduino
    const portas = await serialport.SerialPort.list();
    const portaArduino = portas.find((porta) => porta.vendorId == 2341 && porta.productId == 43);
    if (!portaArduino) {
        throw new Error('O arduino não foi encontrado em nenhuma porta serial');
    }

    // Configura a porta serial com o baud rate especificado
    const arduino = new serialport.SerialPort(
        {
            path: portaArduino.path,
            baudRate: SERIAL_BAUD_RATE
        }
    );

    // Evento quando a porta serial é aberta
    arduino.on('open', () => {
        console.log(`A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`);
    });

    // Processa os dados recebidos do Arduino
    arduino.pipe(new serialport.ReadlineParser({ delimiter: '\r\n' })).on('data', async (data) => {
        //console.log(data); 
        const valores = data.split(';');
        const lm35Temperatura = parseFloat(valores[0]);     // 0 é a porta de leitura
        const luminosidade = parseInt(valores[1]);         // paseFloat - decimal

        // Armazena os valores dos sensores nos arrays correspondentes
        valoresLm35Temperatura.push(lm35Temperatura);
        valoresLuminosidade.push(luminosidade);
        var fkHabitat = 1;
        // Insere os dados no banco de dados (se habilitado)
        if (HABILITAR_OPERACAO_INSERIR) {

            // altere!
            // Este insert irá inserir os dados na tabela "leitura"
            await poolBancoDados.execute( //ALTERAR PARA NOME DA MINHA TABELA
                'INSERT INTO Medidas (LeituraLumi, LeituraTemp, fkHabitat, DataLeitura) VALUES (?, ?, ?, NOW())',
            [luminosidade, lm35Temperatura, fkHabitat]
        ); // TROCAR O "?" PELOS VALORES EM AZUL AQUI <<
        

           
        
            

            console.log("valores inseridos no banco: ", lm35Temperatura + ", " + luminosidade)
        }
      
          

    });

    // Evento para lidar com erros na comunicação serial
    arduino.on('error', (mensagem) => {
        console.error(`Erro no arduino (Mensagem: ${mensagem}`)
    });
}


// não altere!
// Função para criar e configurar o servidor web
const servidor = (
    valoresLm35Temperatura,
    valoresLuminosidade
) => {
    const app = express();

    // Configurações de CORS
    app.use((request, response, next) => {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
        next();
    });

    // Inicia o servidor na porta especificada     
    //a partir do momento que essa função excecutar a porta "listen", ele vai procurar/escutar qual é a porta correta, levando em consideração que possa haver mais de uma porta.
    app.listen(SERVIDOR_PORTA, () => {
        console.log(`API executada com sucesso na porta ${SERVIDOR_PORTA}`);
    });

    // Define os endpoints da API para cada tipo de sensor
    app.get('/sensores/lm35/temperatura', (_, response) => {
        return response.json(valoresLm35Temperatura);
    });
    app.get('/sensores/luminosidade', (_, response) => {
        return response.json(valoresLuminosidade);
    });
}

// Função principal assíncrona para iniciar a comunicação serial e o servidor web
(async () => {
    // Arrays para armazenar os valores dos sensores
    const valoresLm35Temperatura = [];
    const valoresLuminosidade = [];

    // Inicia a comunicação serial
    await serial(
        valoresLm35Temperatura,
        valoresLuminosidade,
    );

    // Inicia o servidor web
    servidor(
        valoresLm35Temperatura,
        valoresLuminosidade,
    );
})();
