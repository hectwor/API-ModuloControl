let q = require('../src/queries');

const indice_name = 'alumno.ape_nom';
const indice_concepto = 'concepto.concepto';
const indice_voucher = 'numero';
const indice_fecha = 'fecha';
const indice_recaudacion = "id_rec";
const indice_flag = 'validado';
const indice_dni = 'alumno.dni';
const indice_obs = 'observacion';
const indice_codigo = 'alumno.codigo';

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
        when = when+"END";when2 = when2+"END";
        when = [when, when2];
    }
    return when;
}
function where_construct(ListValor, indice){
    let where = "";
    if (ListValor != null) {
        let valores = ListValor.split(',');
        for(let i=0;i<valores.length;i++) valores[i]=valores[i].trim();
        if (indice===indice_name){
            let tam= valores.length;
            for (let i=0;i<tam;i++){
                let noms = valores[i].split(' ');
                switch (noms.length) {
                    case 1 :
                        where="( ";
                        for(let i=0;i<valores.length;i++){
                            let noms = valores[i].split(' ');
                            noms[0] =noms[0].toUpperCase();
                            if (noms.length===2){
                                noms[1] =noms[1].toUpperCase();
                                where = where+indice+" SIMILAR TO '%"+noms[0]+"%"+noms[1]+"%' OR " +indice+
                                    " SIMILAR TO '%"+noms[1]+"%"+noms[0]+"%' OR ";
                            }else
                                where =where+indice+" SIMILAR TO '%"+noms[0]+"%' OR ";
                        }
                        where = where.slice(0,-3);
                        where=where+")";
                        return where;
                    case 2 :
                        where="( ";
                        for(let i=0;i<valores.length;i++){
                            let noms = valores[i].split(' ');
                            noms[0] =noms[0].toUpperCase();
                            if (noms.length===2) {
                                noms[1] =noms[1].toUpperCase();
                                where = where+indice+" SIMILAR TO '%"+noms[0]+"%"+noms[1]+"%' OR " +indice+
                                    " SIMILAR TO '%"+noms[1]+"%"+noms[0]+"%' OR ";
                            }else
                                where =where+indice+" SIMILAR TO '%"+noms[0]+"%' OR ";
                        }
                        where = where.slice(0,-3);
                        where=where+")";
                        return where;
                    case 3 :
                        noms[0] =noms[0].toUpperCase();
                        noms[1] =noms[1].toUpperCase();
                        noms[2] =noms[2].toUpperCase();
                        valores.push(`${noms[0]} ${noms[1]} ${noms[2]}`);
                        valores.push(`${noms[1]} ${noms[2]} ${noms[0]}`);
                        break;
                    case 4 :
                        noms[0] =noms[0].toUpperCase();
                        noms[1] =noms[1].toUpperCase();
                        noms[2] =noms[2].toUpperCase();
                        noms[3] =noms[3].toUpperCase();
                        valores.push(`${noms[0]} ${noms[1]} ${noms[2]} ${noms[3]}`);
                        valores.push(`${noms[2]} ${noms[3]} ${noms[0]} ${noms[1]}`);
                }
            }
        }
        let valorcomillas="";
        for(let i=0;i<valores.length;i++)
            valorcomillas=valorcomillas+"'"+valores[i]+"',";
        valorcomillas = valorcomillas.slice(0,-1);
        where = where + indice+" IN ("+valorcomillas+")";
    }else
        where = 'true';
    return where;
}
function getAll(req, res, next){
    q.SelectQuery(req, res, next, "");
}
function getComplet (req, res, next) {
    let jsonR = req.body;
    let whereperiod;
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
    if ((jsonR.periodoI === null ||jsonR.periodoI === "") && (jsonR.periodoF === null ||jsonR.periodoF === ""))
        whereperiod='true';
    else
        whereperiod = "("+indice_fecha+" < "+FPeriod+" AND " + indice_fecha + " >= "+ IPeriod +")";

    let where = where_construct(ListNames, indice_name)+" AND "
        +whereperiod+" AND "
        +where_construct(Listvoucher, indice_voucher)+" AND "
        +where_construct(ListConcepts, indice_concepto)+" AND "
        +"("+where_construct(ListDNI,indice_dni)+" OR "+where_construct(ListDNI, indice_codigo)+") " +
        "AND tipo_concepto.id_clase_pagos = 2";

    q.SelectQuery(req, res, next, where);
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
    if (indices != null && valores!=null) {
        let v = when_construct(indices, valores);
        q.UpdateQuery(req,res,next,v[0] , v[1],indices);
    }
}

module.exports = {
    getAll: getAll,
    getComplet:getComplet,
    validate: validate,

    i_name:indice_name,
    i_concepto:indice_concepto,
    i_voucher:indice_voucher,
    i_fecha:indice_fecha,
    i_recaudacion:indice_recaudacion,
    i_flag:indice_flag,
    i_dni:indice_dni,
    i_obs:indice_obs,
    i_codigo:indice_codigo
};