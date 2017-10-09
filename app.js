var mysql = require('mysql2')
var _ = require('lodash')

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'porsche',
  database: 'dance-display'
})

connection.query('SHOW TABLES', function (err, result, fields) {
    if (err) throw err
    _.each(result, function (r) {
        console.log(_.map(fields, function (f) { return r[f.name] }).join(' '))
    })
})