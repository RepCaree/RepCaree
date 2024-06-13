var express = require("express");
var router = express.Router();

var medidaController = require("../controllers/medidaController");

router.get("/ultimas/:idAquario", function (req, res) {
    medidaController.buscarUltimasMedidas(req, res);
});

router.get("/tempo-real/:idAquario", function (req, res) {
    medidaController.buscarMedidasEmTempoReal(req, res);
})
router.post("/indicadores", function (req, res) {
    medidaController.indicadores(req, res);
});
router.post("/alertas", function (req, res) {
    medidaController.alertas(req, res);
});
router.get("/buscarResultadoGraficoBar/:fk_empresa", function (req, res) {
    medidaController.buscarResultadoGraficoBar(req, res);
});
router.get("/buscarResultadoGraficoPie/:fk_empresa", function (req, res) {
    medidaController.buscarResultadoGraficoPie(req, res);
});
router.get("/buscarResultadoGraficoBarLumin/:fk_empresa", function (req, res) {
    medidaController.buscarResultadoGraficoBarLumin(req, res);
});
router.get("/buscarResultadoGraficoLineTemp/:fk_empresa", function (req, res) {
    medidaController.buscarResultadoGraficoLineTemp(req, res);
});
module.exports = router;