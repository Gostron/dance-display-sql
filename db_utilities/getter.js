var mysql = require('mysql2')

var pool = null

exports.initialize = function () {
  pool = mysql.createPool({
    connectionLimit: 100, // important
    host: 'localhost',
    user: 'root',
    password: 'porsche',
    database: 'dance-display'
  })
}

exports.makeQuery = function (query, callback) {
  if (!pool) {
    callback(null, { code: -101, status: "Connection pool was not initialized." })
    return
  }

  pool.getConnection(function (err, connection) {
    if (err) {
      callback(null, { code: -102, status: "Error in retrieving a connection pool.", error: err })
      return
    }

    connection.query(query, function (err, rows, fields) {
      connection.release()
      if (err) callback(null, { code: -103, status: "Error making the query.", error: err })
      else callback({ rows: rows, fields: fields })
    })

    if (!connection._events.error) connection.on('error', function (err) { callback(null, { code: -104, status: "Error in the connection.", error: err }) })
  })
}