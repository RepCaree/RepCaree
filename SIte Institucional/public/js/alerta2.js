//variaveis que armazenam as valores atuais das medidas de temp e lumin
id_habitat = sessionStorage.ID_HABITAT_ALERTA
dataHora_alerta = sessionStorage.DADO_ULTIMO_ALERTA


function validarAlertas() {
    console.log('Iniciando validação para emitir os alertas')
    var fk_empresa1 = sessionStorage.FK_EMPRESA;
    var habitatID = sessionStorage.FK_HABITAT;
    fetch("/medidas/alertas", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fk_empresa: fk_empresa1,
            fk_habitat: habitatID
        })
    })
        .then(function (resposta) {
            if (!resposta.ok) {
                throw new Error('Erro ao recuperar os dados');
            }
            return resposta.json();
        }).then((alertas) => {
            if (alertas.length > 0) {

                const AtualTemp = alertas[0].LeituraTemp;
                const AtualLumin = alertas[0].LeituraLumi;

                sessionStorage.MEDIA_ATUAL_TEMP = AtualTemp;
                sessionStorage.MEDIA_ATUAL_LUMIN = AtualLumin;
                console.log(AtualLumin, AtualTemp);
                avaliarMetrica()
            }
        }).catch(function (erro) {
            console.error(`#ERRO: ${erro.message}`);
        });
}

function avaliarMetrica() {
    const temp = sessionStorage.MEDIA_ATUAL_TEMP
    const lumin = sessionStorage.MEDIA_ATUAL_LUMIN

    const abaixoTemp = 21;
    const acimaTemp = 29;
    const acimaLumin = 800;
    const abaixoLumin = 400;

    if (temp <= abaixoTemp || temp >= acimaTemp) {
    //    const habitatLista = document.querySelector('alistaHabitats')
    //    habitatLista.style.color = 'blue'
        document.getElementById('habitatAlerta').innerHTML = `
                Alerta no Habitat ${id_habitat} <br>
                Temperatura fora da média
                `
        mostrarAlerta();
    }

    else if (lumin > acimaLumin || lumin < abaixoLumin) {
    //     const habitatLista = document.querySelector('alistaHabitats')
    //    habitatLista.style.color = 'blue'
        document.getElementById('habitatAlerta').innerHTML = `
            Alerta no Habitat ${id_habitat} <br>
            Luminosidade fora da média
            `
        mostrarAlerta();
    }

}

function mostrarAlerta() {
    document.getElementById('meuPopup').style.display = 'block'

    var popup = document.getElementById("meuPopup");
    var link = document.getElementById("popupLink");
    var span = document.getElementsByClassName("close-popup")[0];
    // link.onclick = function () {
    //     popup.style.display = "block";
    // }
    span.onclick = function () {
        popup.style.display = "none";
    }

}


