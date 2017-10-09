var _ = require('lodash')
var express = require("express")
var app = express()

// Requests logging
var morgan = require('morgan')
app.use(morgan('tiny'))

var mysql = require('./db_utilities/getter')
mysql.initialize()

app.get("/",function(req,res) {
  mysql.makeQuery("SHOW TABLES", function (result, err) {
    if (err) res.json(err)
    else res.json(result)
  })
})

app.listen(3000)