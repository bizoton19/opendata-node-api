require('dotenv').config()
var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    
    elasticsearch=require('elasticsearch'),
    config=require('./config'),
    //jsonschema= require('express-json-schema'),
    //hits=require('./api/models/searchModel'),
    bodyParser= require('body-parser');

    console.log("remote es url is :" +config.host)
//elasticsearch instance connection url
var client = new elasticsearch.Client({
    host: config.host,
    httpAuth:config.username+':'+config.password,
    log: 'trace'

});

client.ping({
        requestTimeout: 30000,

    }, function(error) {
        if (error) {
            console.error('elastic cluster is down!');

        } else {
            console.log('Cluster is up');
        }
    }


);
app.use(express.static(__dirname + '/web-client'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
var routes = require('./api/routes/search-routes');//import route
routes(app);//register route
app.listen(port,()=>{
    console.log('listening on port ' + port)
});
