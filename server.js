var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    elasticsearch=require('elasticsearch'),
    //jsonschema= require('express-json-schema'),
    //hits=require('./api/models/searchModel'),
    bodyParser= require('body-parser');
console.log('listening on port ' + port)
//elasticsearch instance connection url
var client = new elasticsearch.Client({
    host: 'localhost:9200',
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

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var routes = require('./api/routes/searchRoutes');//import route
routes(app);//register route

app.listen(port);
console.log('open data search api is live and ready')