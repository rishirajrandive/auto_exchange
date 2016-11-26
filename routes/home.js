/**
 * Created by rishi on 11/23/16.
 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if(!req.session.branch_id){
        req.session.branch_id = 1;
    }
    res.render("homepage",{title: 'Auto Exchange'});
});

module.exports = router;
