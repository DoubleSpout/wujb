/*
用户数据 mongodb 访问层

*/
var mongoDao = require('./mongoDao.js').mongodcol,
    catDao= {
		colname:'catalog',
		generr:'catalog id generate error',
	};
catDao.insert = function(catobj, callback){
	mongoDao(catDao.colname, function(err,col,release){
		if(err) return callback(err);
		col.insert({title:catobj.title, url:catobj.url, author:catobj.author, timestamp:catobj.timestamp}, {safe: true}, function(err, doc){
			if(err) return callback(err) || release();
			release();
			callback(null, doc[0]);			
		});
	});
}

catDao.find = function(limit, callback){
	mongoDao(catDao.colname, function(err,col,release){
		if(err) return callback(err);
		col.find({}, {}, {"limit":limit, "sort":{"_id":-1}}).toArray(function(err, docArray) {
			if(err) return callback(err) || release();
			release();
			callback(null, docArray);			
		});
	});
}


module.exports = catDao;