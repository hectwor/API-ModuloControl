let cn = require('../src/dbconnection');

let db = cn.connection;

const indice_name = 'alumno.ape_nom';
const indice_name_invertido = 'alumno.nom_ape';
const indice_concepto = 'concepto.concepto';
const indice_voucher = 'numero';
const indice_fecha = 'fecha';
const indice_recaudacion = 'id_rec';
const indice_flag = 'validado';
const indice_dni = 'alumno.dni';
const indice_obs = 'observacion';
const indice_codigo = 'alumno.codigo';

function SelectQuery(req, res, next, whereIN){
    let where = "WHERE "+whereIN;
    if (whereIN === "") where = "";
    console.log("SELECT *, alumno.codigo as Codigo, alumno.ape_nom as Nombre, alumno.dni as DNI, concepto.concepto as Concepto " +
        "from recaudaciones " +
        "INNER JOIN alumno ON recaudaciones.id_alum = alumno.id_alum " +
        "JOIN concepto ON recaudaciones.id_concepto = concepto.id_concepto " +
        where);
    db.any("SELECT *, alumno.codigo as Codigo, alumno.ape_nom as Nombre, alumno.dni as DNI, concepto.concepto as Concepto " +
        "from recaudaciones " +
        "INNER JOIN alumno ON recaudaciones.id_alum = alumno.id_alum " +
        "JOIN concepto ON recaudaciones.id_concepto = concepto.id_concepto " +
        where)
        .then(function(data){
            res.status(200)
                .json({
                    status : 'success',
                    data:data,
                    message : 'Retrieved List'
                });
        })
        .catch(function(err){
            return next(err);
        })
}
function UpdateQuery(req, res, next, indiceSet, when1, when2, indices) {
    db.any("UPDATE recaudaciones SET "+indice_flag+"= CASE "+indice_recaudacion+" "+when1+
        ","+indice_obs+" = CASE "+indice_recaudacion+" "+when2+
        " WHERE "+indice_recaudacion+" IN ("+indices+")")
        .then(function(data){
            res.status(200)
                .json({
                    status : 'success',
                    data:data,
                    message : 'Retrieved List'
                });
        })
        .catch(function (err) {
            return next(err);
        })
}
function when_construct(ListIndices, ListValor) {
    let when = "", when2 = "";
    let valores = ListValor.split(',');
    let indices = ListIndices.split(',');
    if (ListIndices != null && ListValor != null) {
        for(let i=0;i<valores.length;i++){
            let v = valores[i].split('-');
            when = when + "WHEN "+indices[i]+" THEN "+v[0]+" ";
            when2 = when2 + "WHEN "+indices[i]+" THEN '"+v[1]+"' ";
        }
        when = when+" END";when2 = when2+" END";
        when = [when, when2];
    }
    return when;
}
function where_construct(ListValor, indice){
    let where = "";
    if (ListValor != null) {
        let valor = ListValor.split(',');
        let valorcomillas="";
        for(let i=0;i<valor.length;i++)
            valorcomillas=valorcomillas+"'"+valor[i]+"',";
        valorcomillas = valorcomillas.slice(0,-1);
        where = indice+" IN ("+valorcomillas+")";
    }else
        where = 'true';
    return where;
}
function getAll(req, res, next){
    SelectQuery(req, res, next, "");
}
function getComplet (req, res, next) {
    let jsonR = req.body;
    let ListNames = jsonR.nombre;
    let ListConcepts = jsonR.id_concepto;
    let Listvoucher = jsonR.voucher;
    let IPeriod = "'"+jsonR.periodoI+"'";
    let FPeriod = "'"+jsonR.periodoF+"'";
    let ListDNI = jsonR.dni;
    let hoy = new Date();
    if (ListNames === "") ListNames = null;
    if (ListConcepts === "") ListConcepts = null;
    if (Listvoucher === "") Listvoucher = null;
    if (ListDNI === "") ListDNI = null;
    if (jsonR.periodoI === null ||jsonR.periodoI === "") IPeriod = "'0001-01-01'";
    if (jsonR.periodoF === null ||jsonR.periodoF === "") FPeriod = "'"+hoy.getFullYear()+'-'+hoy.getMonth()+'-'+hoy.getDate()+"'";
    const whereperiod = "("+indice_fecha+" < "+FPeriod+" AND " + indice_fecha + " >= "+ IPeriod +")";

    let where = where_construct(ListNames, indice_name)+" AND "
        +whereperiod+" AND "
        +where_construct(Listvoucher, indice_voucher)+" AND "
        +where_construct(ListConcepts, indice_concepto)+" AND "
        +"("+where_construct(ListDNI,indice_dni)+" OR "+where_construct(ListDNI, indice_codigo)+")";

    SelectQuery(req, res, next, where);
}
function validate(req, res, next){
    let jsonR = req.body;
    let indices="";
    let valores="";
    for (let i in jsonR){
        if (jsonR.hasOwnProperty(i)) {
            indices = indices +','+jsonR[i].id_rec;
            valores = valores+','+jsonR[i].obs;
        }
    }
    indices = indices.slice(1); valores = valores.slice(1);
    console.log(indices);
    console.log(valores);
    if (indices != null && valores!=null) {
        let v = when_construct(indices, valores);
        UpdateQuery(req,res,next,indice_flag,v[0] , v[1],indices);
    }
}
function getRegisterbyDate(req, res, next){}
function getRegisterbyName(req, res, next){}

module.exports = {
    getAll: getAll,
    getComplet:getComplet,
    validate: validate,

    getRegisterbyDate:getRegisterbyDate,
    getRegisterbyName:getRegisterbyName
};