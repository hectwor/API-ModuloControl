let promise = require('bluebird');
let options = {
    promiseLib: promise
};

let pgp = require('pg-promise')(options);

//var connectString = 'postgres://postgres:1234@localhost/recaudaciones'; /*local host*/

const urlconnection = 'postgres://modulo4@sigap.postgres.database.azure.com:modulo4@sigap.postgres.database.azure.com:5432/tcs';

let cn = pgp(urlconnection);

module.exports = {
    connection: cn
};