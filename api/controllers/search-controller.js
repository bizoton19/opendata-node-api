'use strict'
var bodyBuilder = require('bodybuilder');
var elasticsearch = require('elasticsearch');
var config=require('../../config');
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


exports.post = (req, response) => {
    console.log(req.body);
    var reqBody = req.body;
    var docType = reqBody.Filter.Type;
    console.log(docType);
    var searchParams = {
        index: 'cpsc-*',
        type: docType,
        from: (reqBody.StartPage - 1) * reqBody.NumPerPage,
        size: reqBody.NumPerPage,
        body: {
            query: {
                match: {
                    _all: reqBody.FullText

                },

            }

        }

    };

    client.search(searchParams, (err, res) => {
        console.log(searchParams);
        if (err) {
            console.log('there was n error')
            response.status(400).json({ error: err })
        } else {
            console.log('alex sucesssssssss')

            response.status(200).json({
                results: res,
                docCount: res.hits.total,
                page: reqBody.StartPage,
                pages: Math.ceil((res.hits.total) / reqBody.NumPerPage)

            });
        }
    });

};
exports.hits = (req, response) => {
    var pageNum = req.params.page;
    var perPage = req.params.per_page;
    var userQuery = req.params.search_query;
    var dataType = req.params.type;
    console.log(dataType);
    console.log(userQuery);
    console.log(perPage);

    var searchParams = {
        index: 'cpsc-*',
        type: dataType,
        from: (pageNum - 1) * perPage,
        size: perPage,
        body: {
            query: {
                match: {
                    _all: userQuery

                }
            },

        }

    };

    client.search(searchParams, (err, res) => {

        if (err) {
            console.log('there was n error')
            response.status(400).json({ error: err })
        } else {
            console.log('alex sucesssssssss')

            response.status(200).json({
                results: res.hits.hits,
                page: pageNum,
                pages: Math.ceil((res.hits.total) / perPage)

            });
        }
    });
};