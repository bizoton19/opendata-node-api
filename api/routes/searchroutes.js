'use strict'
module.exports= (app) => {
    var searchController = require('../controllers/searchcontroller');
    

    //general search routes
    app.route('/search/type=:type&q=:search_query&per_page=:per_page&:start_page=:page')
        .get(searchController.hits)
    app.route('/search')
       .post(searchController.post)

   
}