'use strict'
module.exports = (app) => {
    var searchController = require('../controllers/search-controller');
    //general search routes
    app.route('/search/type=:type&q=:search_query&per_page=:per_page&:start_page=:page')
        .get(searchController.queryStringSearch)
    app.route('/search')
        .post(searchController.crossDatasetSearch)


}