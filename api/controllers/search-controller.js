'use strict'
var bodybuilder = require('bodybuilder');
var elasticsearch = require('elasticsearch');
var config = require('../../config');
//jsonschema= require('express-json-schema'),
var bodyParser = require('body-parser');
var searchmodel = require('../models/search-model')
var searchresult = require('../models/search-results')

console.log("remote es url is :" + config.host)
//elasticsearch instance connection url
var client = new elasticsearch.Client({
    host: config.host,
    httpAuth: config.username + ':' + config.password,
    log: 'trace'

});

exports.crossDatasetSearch = (req, response) => {
    var reqBody = req.body
    var docType = reqBody.Filter.Type.length > 0 ? reqBody.Filter.Type : ''
    var inputSource = reqBody.Filter.Source.length > 0 ? reqBody.Filter.Source : ''
    var searchParams = {
        index: inputSource + '*',
        type: docType,
        from: (reqBody.StartPage - 1) * reqBody.NumPerPage,
        size: reqBody.NumPerPage,
        body: {
            query: {
                match: {
                    _all: reqBody.FullText

                }

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
            response.status(200).json(
                buildSearchResultModel(req, res)
            );
        }
    });

};

function buildSearchResultModel(req, res) {
    var resData = res.hits.hits
    var searchRes = new searchresult()
    var resModel;
    for (var r = 0; r < resData.length; r++) {

        resModel = new searchmodel()
        resModel.type = resData[r]._type
        resModel.artifactSource = resData[r]._source.artifactSource
        resModel.artifactDate = resData[r]._source.artifactDate
        resModel.category = resData[r]._source.category
        resModel.description = resData[r]._source.description
        resModel.title = resData[r]._source.title
        resModel.uuid = resData[r]._source.uuid
        resModel.tags = []
        searchRes.artifacts.push(resModel);
    }
    searchRes.aggregation = res.aggregations
    searchRes.docCount = res.hits.total
    searchRes.startPage = req.body.StartPage
    searchRes.totalPages = Math.ceil((res.hits.total) / req.body.NumPerPage)
    return searchRes
}

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