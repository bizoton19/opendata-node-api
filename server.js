var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    elasticsearch=require('elasticsearch'),
    //jsonschema= require('express-json-schema'),
    //hits=require('./api/models/searchModel'),
    bodyParser= require('body-parser');

//elasticsearch instance connection url
var client = new elasticsearch.Client({
    host: 'https://23bf5fceda4a1576ebcdadb4e252a3a3.us-east-1.aws.found.io:9243',
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
app.use(express.static('web-client'))
var routes = require('./api/routes/searchRoutes');//import route
routes(app);//register route

app.listen(port,()=>{
    console.log('listening on port ' + port)
});
