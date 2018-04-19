let express = require('express');
let bodyParser = require('body-parser');
let router = express.Router();
let db= require('../src/algoritms');

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
router.use(bodyParser.json());

/*  GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'WebAPI Recaudaciones' });
});
/*  GET Recaudaciones Totales */
router.get('/recaudaciones', db.getAll);

/*  POST Recaudacion detallada*/
router.post('/recaudaciones/detallada/', db.getComplet);

/*  POST Editar Recaudacion*/
router.post('/recaudaciones/id/', db.validate);

module.exports = router;
