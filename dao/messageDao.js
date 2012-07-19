/*
用户私信 mongodb 访问层

*/
var mongoDao = require('./mongoDao.js').mongodcol,
	merge = _rrest.mod.stools.merge,//简单对象复制函数
    messageDao= {
		colname:'message',
		generr:'message id generate error',
	};


//对belong key进行添加索引
messageDao.intial = function(){
	mongoDao(messageDao.colname, function(err,col,release){
		col.indexInformation(function(err,indexObj){	
				if(err || indexObj.belong_1) return;
				col.ensureIndex({"belong":1}, function(err, r){//这里建立一个根据plus点数排序的索引
					if(err){
						release();
						return restlog.error(messageDao.colname+'索引建立失败：'+err);
					}
					col.indexInformation(function(err,array){
					   release();
					   if(!err) restlog.info('当前'+messageDao.colname+'集合所有索引为：'+JSON.stringify(array));					  
					});
				});

		});
	});
}();
/*
将用户消息录入数据库,每次都会插入2条记录
msgobj{
	from 发起用户id，当前用户的uid
	fromname 发起用户名称
	fromeface 发起用户头像
	to   目标用户id
	toname 发起用户名称
	toface 发起用户头像
	content 消息内容
	timestamp 当前时间戳
}
返回这条消息的内容
*/
messageDao.insert = function(msgobj, callback){
	mongoDao(messageDao.colname, function(err,col,release){
		if(err) return callback(err);
		msgobj.belong = msgobj.from;//将发消息者作为belong存一条消息记录
		var msgobj2 = merge({}, msgobj);
		msgobj2.belong = msgobj.to;//将获得消息者作为belong存一份消息记录

		col.insert([msgobj, msgobj2], {safe: true}, function(err, doc1){
			if(err) return callback(err) || release();	
			callback(null, msgobj);

//以上插入2次消息记录，将内容响应给用户，并且下面继续执行save更新操作
				
				msgobj.belong = msgobj.from;//字符串没关系
				msgobj._id = msgobj.from+msgobj.to;//将_id设置为当前用户id+目标用户id
				msgobj.islist = 1;//设置key的islist值为1，表示此条消息是为列表用
				col.save(msgobj, {safe: true}, function(err, doc){//这边再更新或者插入 uid和other的最新消息记录，以供用户消息列表页显示
					if(err) return release();
					msgobj.belong = msgobj.to;//字符串没关系
					msgobj._id = msgobj.to+msgobj.from;//将_id设置为目标用户id+当前用户id
					col.save(msgobj, {safe: true}, function(err, doc){//这边再更新或者插入 other和uid的最新消息记录，以供用户消息列表页显示	
						release();						
					});//第二次save操作
				});//第一次save操作		

		});
	});
}


/*
返回单个消息的内容
需要提供参数 msgid
*/
messageDao.findone = function(msgid, callback){
	mongoDao(messageDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		col.findOne({_id: msgid}, function(err, doc) {
			release();
			callback(err,doc);						
		});
	});
}


/*
删除批量信息个消息
需要提供参数 msgid
*/
messageDao.del = function(uid, otherid, callback){
	mongoDao(messageDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		col.remove({'belong':uid, '$or':[{'from':otherid},{'to':otherid}]}, {safe:true},function(err, numberOfRemovedDocs) {
			release();
			callback(err,numberOfRemovedDocs);						
		});
	});
}

//返回该用户的信息列表首页
//接收参数 uid
messageDao.list = function(uid, callback){
	mongoDao(messageDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		col.find({'belong':uid, 'islist':1}, {}, {'sort':[['timestamp','desc']]}).toArray(function(err, doclist) {
			release();
			callback(err,doclist);						
		});
	});
}
//某一个用户和目标用户的聊天记录详细页
messageDao.show = function(uid, otherid, callback){
	mongoDao(messageDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		col.find({'belong':uid, 'islist':{'$ne':1}, '$or':[{'from':otherid},{'to':otherid}]}, {}, {'sort':[['_id','desc']]}).toArray(function(err, doclist) {
			release();
			callback(err,doclist);						
		});
	});
}

messageDao.unreadnumber = function(uid, st, callback){
	mongoDao(messageDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		col.find({'belong':uid,'to':uid, 'islist':{'$ne':1}, timestamp:{'$gt':st}}, {}, {}).toArray(function(err, doclist) {
			release();
			callback(err,doclist);						
		});
	});
} 


module.exports = messageDao;