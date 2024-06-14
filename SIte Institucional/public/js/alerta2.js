//variaveis que armazenam as valores atuais das medidas de temp e lumin
var id_habitat = sessionStorage.ID_HABITAT_ALERTA
var dataHora_alerta = sessionStorage.DADO_ULTIMO_ALERTA


function validarAlertas() {
    mudarKPIMedias()
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
                mudarKPIMedias()
            }
        }).catch(function (erro) {
            console.error(`#ERRO: ${erro.message}`);
        });
}
function mudarKPIMedias() {
    var mediaTemp = parseFloat(sessionStorage.getItem('MEDIA_GERAL_TEMP'));
    var mediaLumin = parseFloat(sessionStorage.getItem('MEDIA_GERAL_LUMIN'));

    const spanTemp = document.querySelector('.divTextoKPI3 span');
    const spanLumin = document.querySelector('.divTextoKPI4 span');


    if (mediaTemp < 22 || mediaTemp > 29) {
        spanTemp.style.color = 'red';
        console.log('Temperatura fora do intervalo');

        imgTemp1.style.display = 'none'
        imgTemp2.style.display = 'block'
    } else {
        spanTemp.style.color = '#548D3D';

        imgTemp1.style.display = 'block'
        imgTemp2.style.display = 'none'
    }
    if (mediaLumin < 400 || mediaLumin > 800) {
        spanLumin.style.color = 'red';
        console.log('Luminosidade fora do intervalo');

        imgLumin1.style.display = 'none'
        imgLumin2.style.display = 'block'
    } else {
        spanLumin.style.color = '#548D3D';
        imgLumin1.style.display = 'block'
        imgLumin2.style.display = 'none'
    }
}
function avaliarMetrica() {
    const temp = sessionStorage.MEDIA_ATUAL_TEMP
    const lumin = sessionStorage.MEDIA_ATUAL_LUMIN

    const abaixoTemp = 21;
    const acimaTemp = 29;
    const acimaLumin = 800;
    const abaixoLumin = 400;
    mudarCorKPI()

    if ((temp <= abaixoTemp || temp >= acimaTemp) && (lumin > acimaLumin || lumin < abaixoLumin)) {
        const habitatLista = document.getElementById('nomeHabitat')
        habitatLista.style.color = 'red'
        document.getElementById('habitatAlerta').innerHTML = `
            <h3 style=" text-align: center; color:#ffee00; font-size: 22px;";>Alerta Máximo<h3><br>
                <span style="text-align: center;";>A Temperatura e Luminosidade no <span style="color: red;">habitat ${id_habitat}</span> estão fora da faixa ideal!</span>
        
            `
        mostrarAlerta();
        mudarCorKPI()
    }
    else if (temp <= abaixoTemp || temp >= acimaTemp) {
        const habitatLista = document.getElementById('nomeHabitat')
        habitatLista.style.color = 'red'
        document.getElementById('habitatAlerta').innerHTML = `
                <h3 style=" text-align: center; color:#ffee00; font-size: 20px;";> Alerta de Temperatura<h3><br>
                <span style="text-align: center;";>A temperatura no <span style="color: red;">habitat ${id_habitat}</span> está fora da faixa ideal!</span>
                `
        mostrarAlerta();
        mudarCorKPI()

    }

    else if (lumin > acimaLumin || lumin < abaixoLumin) {
        const habitatLista = document.getElementById('nomeHabitat')
        habitatLista.style.color = 'red'
        document.getElementById('habitatAlerta').innerHTML = `
            <h3 style=" text-align: center; color:#ffee00; font-size: 20px;";> Alerta de Luminosidade<h3><br>
                <span style="text-align: center;";>A Luminosidade no <span style="color: red;">habitat ${id_habitat}</span> está fora da faixa ideal!</span>
        
            `
        mostrarAlerta();
        mudarCorKPI()
    }

    else {
        const habitatLista = document.getElementById('nomeHabitat')
        habitatLista.style.color = '#548D3D'

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

function mudarCorKPI() {
    const temp = sessionStorage.MEDIA_ATUAL_TEMP;
    const lumin = sessionStorage.MEDIA_ATUAL_LUMIN;
    const kpiTemp = document.getElementById('medidasAtuaisTempLumin');
    const kpiLumin = document.getElementById('medidasAtuaisTempLumin2');
    if (temp < 22 || temp > 29) {
        kpiTemp.style.color = 'red'
    } else {
        kpiTemp.style.color = '#548D3D'
    }
    if (lumin < 400 || lumin > 800) {
        kpiLumin.style.color = 'red'
    } else {

        kpiLumin.style.color = '#548D3D'
    }
}


