'use strict'
var bodyBuilder = require('bodybuilder');
var elasticsearch = require('elasticsearch');
var config = require('../../config');
//jsonschema= require('express-json-schema'),
var bodyParser = require('body-parser');

console.log("remote es url is :" + config.host)
//elasticsearch instance connection url
var client = new elasticsearch.Client({
    host: config.host,
    httpAuth: config.username + ':' + config.password,
    log: 'trace'

});


exports.baseSearch = (req, response) => {

    var reqBody = req.body
    var docType = reqBody.Filter.Type.length > 0 ? reqBody.Filter.Type : ''
    var inputSource = reqBody.Filter.Source.length > 0 ? reqBody.Filter.Source : ''
    console.log(inputSource);
    var searchParams = {
        index: inputSource + '*',
        type: docType,
        from: (reqBody.StartPage - 1) * reqBody.NumPerPage,
        size: reqBody.NumPerPage,
        body: {
            query: {
                query_string: {
                    query: reqBody.FullText

                },
                filter: [ 
                    { terms:  { _type: [reqBody.Type] }}, 
                    { range: {
                         artifactDate: {
                         gte: reqBody.StartDate,
                         lte: reqBody.EndDate,
                         format: "dd/MM/yyyy||dd/MM/yyyy"
                    }}}
                  ]

            },
            aggregations: {
                artifact_type: {
                    terms: {
                        field: 'type.keyword'
                    }
                },
                artifact_source: {
                    terms: {
                        field: 'artifactSource.keyword' //case sensitive
                    }
                }
                             
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
                aggregations: res.hits.total>0?res.aggregations:null,
                docCount: res.hits.total,
                page: reqBody.StartPage,
                pages: Math.ceil((res.hits.total) / reqBody.NumPerPage)

            });
        }
    });

};
exports.queryStringSearch = (req, response) => {
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
            console.log('the hits url is being called')

            response.status(200).json({
                results: res.hits.hits,
                aggregations: res.aggregations,
                page: pageNum,
                pages: Math.ceil((res.hits.total) / perPage)

            });
        }
    });
};