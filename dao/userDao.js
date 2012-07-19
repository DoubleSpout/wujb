/*
用户数据 mongodb 访问层

*/
var mongoDao = require('./mongoDao.js').mongodcol,
    userDao= {
		colname:'user',
	};

/*
根据登录用户的用户名，去数据库查找，返回这个文档
*/
userDao.login = function(email, callback){
	mongoDao(userDao.colname,function(err,col,release){
		if(err) return callback(err);
		col.findOne({email: email}, function(err, doc) {
			if(err) return callback(err) || release();
			release();
			callback(null, doc);
			
		});
	});
}
/*
根据用户录入的用户名和密码去数据库插入用户
*/
userDao.regist = function(email, pwd, face, callback){
	mongoDao(userDao.colname,function(err,col,release){
		if(err) return callback(err);
		var nowst = Date.now();//生成当前时间戳
		col.insert({email:email, password:pwd, face:face, regtime:nowst, love:[], friends:[], beAddFriend:0, readtimestamp:nowst}, {safe: true}, function(err, doc){
			if(err) return callback(err) || release();
			release();
			callback(null, doc[0]);
			
		});
	});
}
/*
用户资料修改
/*
用户资料修改
uid:用户id必须,字符串型
传参 uid
{

}
*/
userDao.setting = function(uid, userobj, callback){
	mongoDao(userDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		var userid = genid(uid);
		if(userid===false) return callback('uid generate error');
		col.update({_id:userid}, {$set: userobj},{safe:true},function(err,doc){
			if(err) return callback(err) || release();
			release();
			callback(null, doc);
			
		});
	});
}

/*
用户好友加减1
uid:用户id必须,字符串型
传参 uid
{

}
*/
userDao.inc = function(uid, userobj, callback){
	mongoDao(userDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		var userid = genid(uid);
		if(userid===false) return callback('uid generate error');
		col.update({_id:userid}, {$inc: userobj},{safe:true},function(err,doc){
			if(err) return callback(err) || release();
			release();
			callback(null, doc);			
		});
	});
}
/*
用户更新时间戳和ip地址
/*
用户资料修改
传参userobj
{
	lastLoginTime: 时间戳
	lastLoginIp: ip字符串
	password:原来没有密码，更新密码
}
*/

userDao.update = function(uid, userobj, callback){
	mongoDao(userDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		col.update({_id:genid(uid)}, {$set: userobj},{safe:true}, function(err,doc){
			if(err) return callback(err) || release();
			release();
			callback(null, doc);
			
		});
	});
}

/*
根据用户id返回一个用户信息
*/
userDao.findOne = function(uid, callback){
	mongoDao(userDao.colname,function(err,col,release, genid){
		if(err) return callback(err);
		col.findOne({_id: genid(uid)}, function(err, doc) {
			if(err) return callback(err) || release();
			release();
			callback(null, doc);			
		});
	});
}
/*
查找用户id的高级方式

*/
userDao.findMore = function(uid,keys,limit,skip,sortname,callback){
	mongoDao(userDao.colname,function(err,col,release, genid){
		if(err) return callback(err);
		var uidc = {},
			keysc={},
			searchc = {}
		if(uid){
			var guid = [];
			 uid.forEach(function(v){
				guid.push(genid(v.toString()));
			});
			uidc = {"_id":{$in:guid}};
		}
		if(limit) searchc.limit = limit;
		if(skip) searchc.skip = skip;
		if(sortname) searchc.sort = sortname;

		col.find(uidc, keys||keysc, searchc).toArray(function(err,docary){
			if(err) return callback(err) || release();
			release();
			callback(null, docary);
			
		})
	});
}
/*
发现好友
*/
userDao.explorFriends = function(lid, limit, callback){
	mongoDao(userDao.colname,function(err,col,release, genid){
		if(err) return callback(err);
		if(lid){
			var lastid = genid(lid);
			var qc = {_id:{"$lt":lastid}};
		}
		else var qc = {}
		col.find(qc, {}, {limit:limit, sort:[["_id","desc"]]}).toArray(function(err,docary){
			if(err) return callback(err) || release();
			release();
			callback(null, docary);		
		})
	})
}
//更新用户的已读消息时间戳
userDao.updateReadTime = function(uid, ts, callback){
	mongoDao(userDao.colname,function(err,col,release,genid){
		if(err) return callback(err);
		col.update({_id:genid(uid)}, {'$set': {'readtimestamp':ts}},{safe:true}, function(err,doc){
			if(err) return callback(err) || release();
			release();
			callback(null, doc);
			
		});
	});
}




module.exports = userDao;