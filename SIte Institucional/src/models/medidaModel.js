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
    SUM(CASE WHEN MediaLumi < 22 THEN 1 ELSE 0 END) AS HabitatsAbaixo400,
    SUM(CASE WHEN MediaLumi >= 22 AND MediaLumi <= 29 THEN 1 ELSE 0 END) AS HabitatsEntre400e800,
    SUM(CASE WHEN MediaLumi > 29 THEN 1 ELSE 0 END) AS HabitatsAcima800
FROM (
    SELECT 
        fkHabitat,
        AVG(LeituraTemp) AS MediaLumi
    FROM Medidas
    WHERE MONTH(DataLeitura) between 1 and 6
      AND YEAR(DataLeitura) = YEAR(NOW())
    GROUP BY fkHabitat
) AS MediasHabitat;
                    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarResultadoGraficoPie() {
    var instrucaoSql = `
    SELECT 
    SUM(CASE WHEN MediaLumi < 400 THEN 1 ELSE 0 END) AS HabitatsAbaixo400,
    SUM(CASE WHEN MediaLumi >= 400 AND MediaLumi <= 800 THEN 1 ELSE 0 END) AS HabitatsEntre400e800,
    SUM(CASE WHEN MediaLumi > 800 THEN 1 ELSE 0 END) AS HabitatsAcima800
FROM (
    SELECT 
        fkHabitat,
        AVG(LeituraLumi) AS MediaLumi
    FROM Medidas
    WHERE MONTH(DataLeitura) = MONTH(NOW())
      AND YEAR(DataLeitura) = YEAR(NOW())
    GROUP BY fkHabitat
) AS MediasHabitat;
                    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// function buscarResultadoGraficoBarLumin(empresa) {
//     var instrucaoSql = `
   
//     SELECT 
//     truncate(AVG(CASE WHEN MediaLumi < 400 THEN MediaLumi END),0) AS MediaAbaixo22,
//     truncate(AVG(CASE WHEN MediaLumi >= 400 AND MediaLumi <= 800 THEN MediaLumi END),0) AS MediaEntre22e29,
//     truncate(AVG(CASE WHEN MediaLumi > 800 THEN MediaLumi END),0) AS MediaAcima29
// FROM (
//     SELECT 
//         fkHabitat,
//         AVG(LeituraLumi) AS MediaLumi
//     FROM Medidas
//     WHERE DataLeitura >= DATE_SUB(NOW(), INTERVAL 6 HOUR)
//     GROUP BY fkHabitat
// ) AS TempMes
// WHERE fkHabitat = 1;

//                     `;

//     console.log("Executando a instrução SQL: \n" + instrucaoSql);
//     return database.executar(instrucaoSql);
// }

// function buscarResultadoGraficoLineTemp(empresa) {
//     var instrucaoSql = `
   
//  SELECT 
//     LeituraTemp AS MediaTemp
// FROM Medidas
// WHERE DataLeitura >= DATE_SUB(NOW(), INTERVAL 6 HOUR) as momento_grafico
//   AND fkHabitat = 1;
//                     `;

//     console.log("Executando a instrução SQL: \n" + instrucaoSql);
//     return database.executar(instrucaoSql);
// }

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
    // buscarResultadoGraficoBarLumin,
    // buscarResultadoGraficoLineTemp,
    alertas
}
