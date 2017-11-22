var mysql = require('mysql');

var CONFIG = {
    connectionLimit: 100, //important
    host: 'localhost',
    port: 1521,
    user: 'root',
    password: '',
    database: 'by_me',
    debug: false,
    dateStrings: 'date',
    charset: 'UTF8_GENERAL_CI'
};

module.exports = function () {
    var pool = mysql.createPool(CONFIG);

    pool.getConnection((err, connection) =>{
        if (err) {
            console.log(err);
            return;
        } else {
            console.log('connected as id ' + connection.threadId);
        }
    });

    return pool;
};