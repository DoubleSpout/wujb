/*
用户数据 mongodb 访问层

*/
var mongoDao = require('./mongoDao.js').mongodcol,
    articleDao= {
		colname:'article',
		generr:'article id generate error',
	};

articleDao.intial = function(){
	mongoDao(articleDao.colname, function(err,col,release){
		col.indexInformation(function(err,indexObj){	
				if(err || indexObj.author_1) return;
				col.ensureIndex({"author":1}, function(err, r){//这里建立一个根据plus点数排序的索引
					if(err){
						release();
						return restlog.error(articleDao.colname+'索引建立失败：'+err);
					}
					col.indexInformation(function(err,array){
					   release();
					   if(!err) restlog.info('当前'+articleDao.colname+'集合所有索引为：'+JSON.stringify(array));					  
					});
				});

		});
	});
}();
/*
根据用户录入的文章对象插入mongodb数据库
aobject{
	type:(pic,word,video)
	title:(string)
	url:(pic/video url)
	content(string)
	author:(userid)
	timestamp(st)时间戳
	authorname:用户名
	face:gravatar头像
}
*/
articleDao.insert = function(aobject, callback){
	mongoDao(articleDao.colname, function(err,col,release){
		if(err) return callback(err);
		col.insert({type:aobject.type, title:aobject.title, url:aobject.url, content:aobject.content, author:aobject.author,authorname:aobject.authorname, face:aobject.face,  timestamp:aobject.timestamp, love:0, comment:0}, {safe: true}, function(err, doc){
			if(err) return callback(err) || release();
			release();
			callback(null, doc[0]);			
		});
	});
}
/*
从数据空中删除一个文章
需要提供参数 articleid
作者id author
*/
articleDao.del = function(articleid, author, callback){
	mongoDao(articleDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		var aid = genid(articleid);
		if(aid===false) return callback(articleDao.generr);
		col.remove({_id:aid, author:author}, {safe: true}, function(err, delnum){
			if(err) return callback(err) || release();
			release();
			callback(null, delnum);
			
		});
	});
}
/*
单篇文章信息内容查询
需要提供参数 articleid
*/
articleDao.findone = function(articleid, callback){
	mongoDao(articleDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		var aid = genid(articleid);
		if(aid===false) return callback(articleDao.generr);
		col.findOne({_id: aid}, function(err, doc) {
			if(err) return callback(err) || release();
			release();
			callback(null, doc);
			
		});
	});
}

/*
多篇文章信息内容查询
需要提供参数 articleArray

*/
articleDao.findsome = function(articleArray, callback){
	mongoDao(articleDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		var aidArray = articleArray.map(function(v){//批量生成aid
			return genid(v);
		})
		col.find({_id: {$in:aidArray}}).toArray(function(err, docArray) {
			if(err) return callback(err) || release();
			release();
			callback(null, docArray);
			
		});
	});
}

/*
查找某一个人下的所有文章
author 参数
limit 参数
pageArticleId 参数,分页用,表示大于这个ID的limit个数
*/
articleDao.findAuthor = function(author,limit, pageArticleId, callback){
	mongoDao(articleDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		var queryC = author?{author:author}:{},
			options  = {sort:{"_id":-1}};
		if(pageArticleId) queryC['_id'] = {"$gt":genid(pageArticleId)};
		if(limit) options['limit'] = limit;
		col.find(queryC, {}, options).toArray(function(err, docArray) {
			if(err) return callback(err) || release();
			release();
			callback(null, docArray);
			
		});
	});
}

/*
根据搜索关键字
keyword 参数
limit 参数
pageArticleId 参数,分页用,表示大于这个ID的limit个数
*/
articleDao.find = function(keyword, limit, pageArticleId, isnext, sortc, callback){
	mongoDao(articleDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		var queryC = {},
			reservt = false;
			options  = sortc ? {sort:sortc} : {sort:{"_id":-1}};
		if(keyword) queryC.title = new RegExp(keyword);//是否传关键字
		if(pageArticleId && isnext) queryC['_id'] = {"$lt":genid(pageArticleId)};//是否传id分页，如果是下一页
		else if(pageArticleId && !isnext){
			queryC['_id'] = {"$gt":genid(pageArticleId)};//是否传id分页，如果是上一页
			options.sort = {"_id":1};
			reservt = true;
		}
		if(limit) options['limit'] = limit;//是否传递limit条件
		col.find(queryC, {}, options).toArray(function(err, docArray) {
			if(err) return callback(err) || release();
			release();
			var len = docArray.length;
			if(reservt && len>1){//如果是上一页反转数组
				var docArray2 = [];
				while(len--){
					docArray2.push(docArray[len]);
				}
			}
			else docArray2 = docArray;
			callback(null, docArray2);
			
		});
	});
}



//查看某人的所喜欢的文章列表
articleDao.loveList = function(aidary, callback){
	mongoDao(articleDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		var ary = [];
		aidary.forEach(function(v){
			ary.push(genid(v));
		})
		col.find({"_id":{$in:ary}}, {}, {"sort":{"_id":-1}}).toArray(function(err,docary){
			if(err) return callback(err) || release();
			release();
			callback(null, docary);			
		})
	});


}


/*
单篇文章喜欢 love指数+1或者-1
需要提供参数 
articleid 
inc +1或者-1			 
*/

articleDao.love = function(articleid, inc, callback){
	mongoDao(articleDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		var aid = genid(articleid);
		if(aid===false) return callback(articleDao.generr);
		col.update({_id:aid}, {$inc:{love:inc}}, {safe:false}, function(err,doc){//safe false
			if(err) return callback(err) || release();
			release();
			callback(null, doc);
			
		});
	});
}

/*
单篇文章评论增加 comment +1
需要提供参数 
articleid 
*/
articleDao.addcomment = function(articleid, callback){
	mongoDao(articleDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		var aid = genid(articleid);
		if(aid===false) return callback(articleDao.generr);
		col.update({_id:aid}, {$inc:{comment:1}}, {safe:false}, function(err,doc){//safe false
			if(err) return callback(err) || release();
			release();
			callback(null, doc);
			
		});
	});
}
/*
该用户的上一篇文章或者下一篇文章
需要提供参数 
articleid 文章id
isnext 是否是下一篇
*/
articleDao.nextprev = function(articleid, isnext, callback){
	mongoDao(articleDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		var aid = genid(articleid);
		if(aid===false) return callback(articleDao.generr);
		var sortc = {limit:1}
		sortc.sort = isnext ? [['_id','asc']] : [['_id','desc']];
		var condition = isnext?{$gt:aid}:{$lt:aid};//如果isnext是真，则找出大于aid的文章，否则找出小于aid的文章
		col.find({_id: condition}, sortc).toArray(function(err, doc){
			if(err) return callback(err) || release();
			release();
			callback(null, doc[0]);			
		});
	});
}
/*
所有文章的count数量
*/
articleDao.count = function(callback){
	mongoDao(articleDao.colname,function(err,col,release,genid){		
			var cursor = col.find({});
			cursor.count(function(err, count){
				if(err) return callback(err) || release();
				release();
				callback(null, count);
				
			});
	});
}

module.exports = articleDao;