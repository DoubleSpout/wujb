/*
用户数据 mongodb 访问层

*/
var mongoDao = require('./mongoDao.js').mongodcol,
    commentDao= {
		colname:'comment',
		generr:'comment id generate error',
	};

commentDao.intial = function(){
	mongoDao(commentDao.colname, function(err,col,release){
		col.indexInformation(function(err,indexObj){	
				if(err || indexObj.articleid_1) return;
				col.ensureIndex({"articleid":1}, function(err, r){//这里建立一个根据plus点数排序的索引
					if(err){
						release();
						return restlog.error(commentDao.colname+'索引建立失败：'+err);
					}
					col.indexInformation(function(err,array){
					   release();
					   if(!err) restlog.info('当前'+commentDao.colname+'集合所有索引为：'+JSON.stringify(array));					  
					});
				});

		});
	});
}();

/*
根据用户录入的评论插入数据库
object{
	articleid: 所属文章的id
	content(string)
	timestamp:(st)
	author:(userid)
	authorname:用户名
	face:gravatar头像
}
*/
commentDao.insert = function(object, callback){
	mongoDao(commentDao.colname, function(err,col,release){
		if(err) return callback(err);
		col.insert({articleid:object.articleid, 
			content:object.content,
			timestamp:object.timestamp, 
			author:object.author,
			authorname:object.authorname,
			face:object.face}, {safe: true}, function(err, doc){
					if(err) return callback(err) || release();
					release();
					callback(null, doc[0]);
					
		});
	});
}
/*
根据文章的id找出所有的评论
接受参数articleid
*/
commentDao.find = function(articleid, callback){
	mongoDao(commentDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		var queryC = {articleid:articleid},
			options  = {sort:{"_id":-1}};
		col.find(queryC, {}, options).toArray(function(err, docArray) {
			if(err) return callback(err) || release();
			release();
			callback(null, docArray);
			
		});
	});
}


module.exports = commentDao;