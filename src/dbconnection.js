let promise = require('bluebird');
let options = {
    promiseLib: promise
};

let pgp = require('pg-promise')(options);

//var connectString = 'postgres://postgres:1234@localhost/recaudaciones'; /*local host*/

const urlconnection = 'postgres://uftbygmj:nFxQIXtb7tYuelhThPv9_7ZI7bt8LTpS@stampy.db.elephantsql.com:5432/uftbygmj';

let cn = pgp(urlconnection);

module.exports = {
    connection: cn
};