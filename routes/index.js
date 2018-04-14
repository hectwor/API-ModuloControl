let express = require('express');
let bodyParser = require('body-parser');
let router = express.Router();
let db= require('../src/queries');

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
router.use(bodyParser.json());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'WebAPI Recaudaciones' });
});

router.get('/recaudaciones', db.getAll);                            /*Recaudaciones Totales */

router.post('/recaudaciones/detallada/', db.getComplet);            /*Recaudacion detallada*/
router.post('/recaudaciones/id/', db.validate);                     /*Editar Recaudacion*/

router.get('/auditoria/fecha/:dt', db.getRegisterbyDate);
router.get('/auditoria/nombre/:nama', db.getRegisterbyName);

module.exports = router;
