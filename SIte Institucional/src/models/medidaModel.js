var database = require("../database/config");

function indicadores(empresa, habitat) {

    var instrucaoSql = `
    SELECT 
    (SELECT AVG(med.LeituraTemp)
     FROM Medidas AS med
     INNER JOIN habitatAnimal AS hab ON med.fkHabitat = hab.idHabitat
     INNER JOIN empresa AS em ON hab.fk_empresa = em.id
     WHERE em.id = '${empresa}') AS media_temperatura,


    (SELECT AVG(med.LeituraLumi)
     FROM Medidas AS med
     INNER JOIN habitatAnimal AS hab ON med.fkHabitat = hab.idHabitat
     INNER JOIN empresa AS em ON hab.fk_empresa = em.id
     WHERE em.id = '${empresa}) AS media_lumin,

   
    (SELECT med.LeituraLumi
     FROM Medidas AS med
     INNER JOIN habitatAnimal AS hab ON med.fkHabitat = hab.idHabitat
     INNER JOIN empresa AS emp ON hab.fk_empresa = emp.id
     WHERE emp.id = '${empresa}' AND hab.idHabitat = '${habitat}'
     ORDER BY med.idMedidas DESC LIMIT 1) AS FkLeituraLumi,

 
    (SELECT med.LeituraTemp
     FROM Medidas AS med
     INNER JOIN habitatAnimal AS hab ON med.fkHabitat = hab.idHabitat
     INNER JOIN empresa AS emp ON hab.fk_empresa = emp.id
     WHERE emp.id = '${empresa}' AND hab.idHabitat = '${habitat}'
     ORDER BY med.idMedidas DESC LIMIT 1) AS FkLeituraTemp,

   
    (SELECT DATE_FORMAT(med.DataLeitura, '%d/%m/%Y %H:%i:%s')
     FROM Medidas AS med
     INNER JOIN habitatAnimal AS hab ON med.fkHabitat = hab.idHabitat
     INNER JOIN endereco AS e ON hab.fkEndereco = e.idEndereco
     INNER JOIN empresa AS emp ON hab.fk_empresa = emp.id
     WHERE emp.id = '${empresa}'
     AND ((med.LeituraTemp < 22 OR med.LeituraTemp > 29) OR (med.LeituraLumi < 400 OR med.LeituraLumi > 800))
     ORDER BY med.idMedidas DESC LIMIT 1) AS ultimo_alerta,

    
    (SELECT hab.idHabitat
     FROM habitatAnimal AS hab
     INNER JOIN empresa AS emp ON hab.fk_empresa = emp.id
     WHERE emp.id = '${empresa}'
     AND hab.idHabitat IN (
         SELECT med.fkHabitat
         FROM Medidas AS med
         WHERE ((med.LeituraTemp < 22 OR med.LeituraTemp > 29) OR (med.LeituraLumi < 400 OR med.LeituraLumi > 800))
     )
     ORDER BY hab.idHabitat DESC LIMIT 1) AS ultimo_alertaID,

    
    (SELECT COUNT(DISTINCT hab.idHabitat)
     FROM Medidas AS med
     INNER JOIN habitatAnimal AS hab ON med.fkHabitat = hab.idHabitat
     INNER JOIN empresa AS emp ON hab.fk_empresa = emp.id
     WHERE emp.id = '${empresa}'
     AND ((med.LeituraTemp < 22 OR med.LeituraTemp > 29) OR (med.LeituraLumi < 400 OR med.LeituraLumi > 800))) AS quantidade_habitats_alerta,


    (SELECT COUNT(hab.idHabitat)
     FROM habitatAnimal AS hab
     INNER JOIN empresa AS emp ON hab.fk_empresa = emp.id
     WHERE emp.id = '${empresa}') AS qtd_habitats,


    (SELECT COUNT(DISTINCT hab.idHabitat) * 100.0 / (
         SELECT COUNT(hab.idHabitat)
         FROM habitatAnimal AS hab
         WHERE hab.fk_empresa = '${empresa}'
     )
     FROM Medidas AS med
     INNER JOIN habitatAnimal AS hab ON med.fkHabitat = hab.idHabitat
     INNER JOIN empresa AS emp ON hab.fk_empresa = emp.id
     WHERE emp.id = '${empresa}'
     AND ((med.LeituraTemp < 22 OR med.LeituraTemp > 29) OR (med.LeituraLumi < 400 OR med.LeituraLumi > 800))) AS percentual_habitats_em_alerta,

    (SELECT GROUP_CONCAT(subquery.idHabitat SEPARATOR ' e ')
     FROM (
         SELECT ha.idHabitat
         FROM habitatAnimal AS ha
         INNER JOIN empresa AS emp ON ha.fk_empresa = emp.id
         WHERE emp.id = '${empresa}'
         AND ha.idHabitat IN (
             SELECT med.fkHabitat
             FROM Medidas AS med
             WHERE (med.LeituraTemp < 22 OR med.LeituraTemp > 29)
         )
         ORDER BY ha.idHabitat DESC
         LIMIT 2
     ) AS subquery) AS ultimo2_alertaID;`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarUltimasMedidas(idAquario, limite_linhas) {

    var instrucaoSql = `SELECT 
        dht11_temperatura as temperatura, 
        dht11_umidade as umidade,
                        momento,
                        DATE_FORMAT(momento,'%H:%i:%s') as momento_grafico
                    FROM medida
                    WHERE fk_aquario = ${idAquario}
                    ORDER BY id DESC LIMIT ${limite_linhas}`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarMedidasEmTempoReal(idAquario) {

    var instrucaoSql = `SELECT 
        dht11_temperatura as temperatura, 
        dht11_umidade as umidade,
                        DATE_FORMAT(momento,'%H:%i:%s') as momento_grafico, 
                        fk_aquario 
                        FROM medida WHERE fk_aquario = ${idAquario} 
                    ORDER BY id DESC LIMIT 1`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarResultadoGraficoBar() {
    var instrucaoSql = `
    SELECT 
        AVG(CASE WHEN LeituraTemp < 22 THEN LeituraTemp END) AS MediaAbaixo22,
        AVG(CASE WHEN LeituraTemp >= 22 AND LeituraTemp <= 29 THEN LeituraTemp END) AS MediaEntre22e29,
        AVG(CASE WHEN LeituraTemp > 29 THEN LeituraTemp END) AS MediaAcima29
    FROM (
        SELECT 
            MONTH(DataLeitura) AS Mes,
            LeituraTemp
        FROM Medidas
        JOIN Leituras ON Medidas.fkLeituras = Leituras.id
        WHERE MONTH(DataLeitura) BETWEEN 1 AND 6
    ) AS TempMes
    GROUP BY Mes
    ORDER BY Mes;
                    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}
function buscarResultadoGraficoBarLumin(empresa) {
    var instrucaoSql = `
   
    SELECT AVG(l.LeituraTemp) AS MediaTemperatura
    FROM Leituras l;
                    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarResultadoGraficoPie() {
    var instrucaoSql = `
    SELECT 
        AVG(CASE WHEN LeituraTemp < 22 THEN LeituraTemp END) AS MediaAbaixo22,
        AVG(CASE WHEN LeituraTemp >= 22 AND LeituraTemp <= 29 THEN LeituraTemp END) AS MediaEntre22e29,
        AVG(CASE WHEN LeituraTemp > 29 THEN LeituraTemp END) AS MediaAcima29
    FROM (
        SELECT 
            MONTH(DataLeitura) AS Mes,
            LeituraTemp
        FROM Medidas
        JOIN Leituras ON Medidas.fkLeituras = Leituras.id
        WHERE MONTH(DataLeitura) BETWEEN 1 AND 6
    ) AS TempMes
    GROUP BY Mes
    ORDER BY Mes;
                    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}
function buscarResultadoGraficoBarLumin(empresa) {
    var instrucaoSql = `
   
    SELECT AVG(l.LeituraTemp) AS MediaTemperatura
    FROM Leituras l;
                    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}
function buscarResultadoGraficoLineTemp(empresa) {
    var instrucaoSql = `
   
    SELECT AVG(l.LeituraTemp) AS MediaTemperatura
    FROM Leituras l;
                    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}
















function alertas(empresa, habitat) {

    var instrucaoSql = `
   SELECT 
    lei.LeituraLumi AS LeituraLumi,
    lei.LeituraTemp AS LeituraTemp
    FROM Leituras AS lei INNER JOIN Medidas AS med 
    ON med.FkLeituras = lei.id
    JOIN habitatAnimal AS hab ON med.fkHabitat = hab.idHabitat
    JOIN empresa AS em ON hab.fk_empresa = em.id
    WHERE em.id = '${empresa}' AND hab.idHabitat = '${habitat}'
    ORDER BY med.DataLeitura DESC LIMIT 1
;`;
    

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarUltimasMedidas,
    buscarMedidasEmTempoReal,
    indicadores,
    buscarResultadoGraficoBar,
    buscarResultadoGraficoPie,
    buscarResultadoGraficoBarLumin,
    buscarResultadoGraficoLineTemp,
    alertas
}
