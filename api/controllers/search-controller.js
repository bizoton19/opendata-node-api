

'use strict'
var bodybuilder = require('bodybuilder');
const elasticsearch = require('elasticsearch');
const config = require('../../config');
//jsonschema= require('express-json-schema'),
const bodyParser = require('body-parser');
const searchmodel = require('../models/search-model')
const searchresult = require('../models/search-results')

console.log("remote es url is :" + config.host)
//elasticsearch instance connection url
const client = new elasticsearch.Client({
    host: config.host,
    httpAuth: config.username + ':' + config.password,
    log: 'trace'

});
function buildBody(reqBody) {
    let body = {
        query: {
            bool: {
                must: [
                    {
                        match: {
                            _all: reqBody.FullText

                        }
                    }
                ],//end of match
                filter: buildFilter(reqBody)
            }
        },
        size: 50,
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
            },
            artifact_category: {
                terms: {
                    field: 'category.keyword' //case sensitive
                }
            }


        }//end of aggs
    }//end of query

console.log('body os query in buildBody')
console.log(JSON.stringify(body))
return body
}

function buildFilter(reqBody) {
    console.log(reqBody)
    let filter = {
        bool: {
            must: [
                {
                    range: {
                        artifactDate: {
                            gte: reqBody.Filter.StartDate,
                            lte: reqBody.Filter.EndDate
                        }
                    }
                }

            ]
        }
    }


    if (reqBody.Filter.Source != null && reqBody.Filter.Source !== "") {
        filter.bool.must.push({
            terms: {
                artifactSource: [
                    reqBody.Filter.Source
                ]

            }
        })
    }

    if (reqBody.Filter.Type != null && reqBody.Filter.Type!=="") {
        filter.bool.must.push({
            terms: {
                type: [
                    reqBody.Filter.Type
                ]

            }
        })
    }

    if (reqBody.Filter.Category != null && reqBody.Filter.Category!=="") {
        filter.bool.must.push({
            terms: {
                'category.keyword': [
                    reqBody.Filter.Category
                ]

            }
        })
    }



    return filter
}





exports.crossDatasetSearch = (req, response) => {
    let reqBody = req.body
    let docType = reqBody.Filter.Type.length > 0 ? reqBody.Filter.Type : ''
    let inputSource = reqBody.Filter.Source.length > 0 ? reqBody.Filter.Source : ''
    console.log(reqBody.StartPage)
    console.log(reqBody)
    let bod = buildBody(reqBody)

    let searchParams = {
        index: inputSource + '*',
        from: (reqBody.StartPage - 1) * reqBody.NumPerPage,
        size: reqBody.NumPerPage,
        //body: bod
        body: bod

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
    let resData = res.hits.hits
    let searchRes = new searchresult()
    let resModel;

    for (let r = 0; r < resData.length; r++) {
        let src = resData[r]._source
        resModel = new searchmodel()
        resModel.type = src.type
        resModel.artifactSource = src.artifactSource
        resModel.artifactDate = new Date(src.artifactDate).toLocaleDateString()
        resModel.category = src.category
        resModel.description = src.description
        resModel.title = src.title
        resModel.uuid = src.uUID
        resModel.url = src.uRL
        resModel.tags = [],
            resModel.images = src.images !== undefined ? src.images : []
        searchRes.artifacts.push(resModel);
    }
    searchRes.aggregation = res.aggregations
    searchRes.docCount = res.hits.total
    searchRes.startPage = req.body.StartPage
    searchRes.totalPages = Math.ceil((res.hits.total) / req.body.NumPerPage)
    searchRes.maxScore = res.hits.max_score
    searchRes.took = res.took;
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
        index: '*',
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