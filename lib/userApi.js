/*
*根据session检查是否登录，3个参数，req,res,callback;
*callback的返回值作为本函数的返回值
*/
var userApi = {},
	userDao = require('../dao/userDao.js'),
	checkname = _rrest.mod.stools.checkname,
	checkemail = _rrest.mod.stools.checkemail,
	checkpwd = _rrest.mod.stools.checkpwd,
	checkdesc = _rrest.mod.stools.checkdesc,
	checkeuid = _rrest.mod.stools.checkeuid,
	merge = _rrest.mod.stools.merge,
	htmltostring = _rrest.mod.stools.htmltostring,
	fdate = _rrest.mod.stools.fdate,
	addstar = _rrest.mod.stools.addstar,
	gravatar = _rrest.mod.gravatar,
	md5 = _rrest.mod.stools.md5;



var emsg={
		dberr:'数据库连接失败',
		emailerr:'邮箱格式错误',
		pwderr:'密码格式错误',
		pwderr2:'密码错误',
		setpwderr:'设置密码错误',
		setnameerr:'设置昵称错误',
		setdescerr:'设置描述错误',
		setemptyerr:'表单不能为空',
		setuiderr:'用户id错误',
		friendserr1:'已经是好友',
		friendserr2:'不是好友，删除失败',
		loveerr1:'已经喜欢过了',
		loveerr2:'还没喜欢，取消喜欢失败',
		aiderr:'文章id错误',
	};
var dmsg={
		name:'WuJB会员',
		desc:'这家伙什么都没写！',
	}

userApi.isLogin = function(req, res, cb){//检查是否登录模块
	var uid = req.session.uid;
	if(cb) return cb(uid);
	if(!uid) {
		res.redirect('/');
		return false;
	}
	else return uid;
}
/*
用户登录方法，返回callback(err,doc)

*/
userApi.login = function(email, password, callback){
	var email = email || '',
		password = password || '',
		callback = callback || function(){};
	if(!checkemail(email)) return callback(emsg.emailerr);//判断邮箱合法
	if(!checkpwd(password)) return callback(emsg.pwderr);//判断密码合法
	var face = gravatar(email);
	userDao.login(email, function(err, doc){
		if(err) return callback(emsg.dberr);
		if(!doc){//如果用户不存在，注册
			userDao.regist(email, password, face,function(err,doc){
				if(err) return callback(emsg.dberr);
				callback(null, doc);
			})
		}
		else{
			var dbpwd = doc.password;
			if(!dbpwd) return callback(null, doc);
			if(!password) return callback(emsg.pwderr2);
			if(dbpwd!==md5(password)) return callback(emsg.pwderr2);
			doc._id = doc._id.toString();
			callback(null, doc);
		}
	})
}
/*
更新用户信息
*/	
userApi.update = function(uid,ip,password,callback){
	var now = Date.now(),
		ip = ip || '0.0.0.0',
		password = password.trim() || '',
		obj={
			lastLoginTime:now,
			lastLoginIp:ip,
			}
		callback = callback || function(){};
	if(checkpwd(password) && password !== '') obj.password = md5(password);
	if(!checkeuid(uid)) return callback(emsg.setuiderr);
	userDao.update(uid,obj,callback);
}



/*
用户资料修改，返回callback(err,doc)
接收userobj
{
	password:密码,非必须
	name:昵称,非必须
	description:签名,非必须
}
*/
userApi.setting = function(uid, userobj, callback){
	var uid = uid || '',
		userobj = userobj || {},
		updateobj = {};
	if(!checkeuid(uid)) return callback(emsg.setuiderr);
	if(userobj.password){
		if(checkpwd(userobj.password)) updateobj.password = md5(userobj.password);
		else return callback(emsg.setpwderr);		
	}
	if(userobj.name){
		if(checkname(userobj.name))  updateobj.name = htmltostring(userobj.name);
		else return callback(emsg.setnameerr);	
	}
	if(userobj.description){
		if(checkdesc(userobj.description)) updateobj.description = htmltostring(userobj.description);
		else return callback(emsg.setdescerr);	
	} 
	//如果表单为空
	if(!Object.keys(updateobj).length) return callback(emsg.setemptyerr);
	//正常访问数据库
	userDao.setting(uid,updateobj,function(err,doc){
		if(err) return callback(emsg.dberr);
		else return callback(null, doc);	
	});
}
/*
根据用户id返回一个用户信息
接收uid
*/
userApi.findOne = function(uid, callback){
	userDao.findOne(uid, function(err,doc){

		if(err) return callback(emsg.dberr);
		if(doc){
			doc.remail = doc.email;
			doc.email = addstar(doc.email);
			if(!doc.love) doc.love = [];
			if(!doc.friends) doc.friends = [];
			if(!doc.name) doc.name = dmsg.name;
			if(!doc.description) doc.description = dmsg.desc;	
			if(doc.regtime) doc.regtime = fdate('y-m-d h:m:s', doc.regtime);
			if(doc.lastLoginTime) doc.lastLoginTime = fdate('y-m-d h:m:s', doc.lastLoginTime);
			doc._id = doc._id.toString();
		} 
		return callback(null, doc);			
	});
}
/*
根据一个数组的用户id返回这些用户的信息(查找某个用户的好友)
*/
userApi.findMyFriends = function(uidArray, callback){
	userDao.findMore(uidArray, false, false, false, false, function(err, doc){
			if(err) return callback(emsg.dberr);
			var doc = doc || [];
			doc.forEach(function(v){
				v.remail = v.email;
				v.email = addstar(v.email);
				v.name = v.name || dmsg.name;
			});
			callback(null, doc);					
	})
}
/*
发现好友
*/
userApi.findExplorerFriends = function(lid, callback){
	var dflimit = 20;
	if(lid && !checkeuid(lid)) return callback(emsg.setuiderr);
	userDao.explorFriends(lid, dflimit, function(err,doc){
			if(err) return callback(emsg.dberr);
			var doc = doc || [];
			doc.forEach(function(v){
				v.remail = v.email;
				v.email = addstar(v.email);
				v.name = v.name || dmsg.name;
				v._id = v._id.toString();
			});
			callback(null, doc, dflimit);					
	})
}
/*
查找最新假如的用户
限制14个人limit=14
*/

userApi.findNewUsers = function(callback){
	userDao.findMore(false, {}, 14, false, [["_id","desc"]], function(err, doc){
			if(err) return callback(emsg.dberr);
			var doc = doc || [];
			doc.forEach(function(v){
				v.remail = v.email;
				v.email = addstar(v.email);
				v.name = v.name || dmsg.name;
				v._id = v._id.toString();
			});
			callback(null, doc);					
	})
}

/*
新增好友
myuid 我的用户id
friendid 想要添加的好友id
*/

userApi.addFriend = function(myuid, frienduid, callback){
	if(!checkeuid(myuid)) return callback(emsg.setuiderr);
	if(!checkeuid(frienduid)) return callback(emsg.setuiderr);
	userApi.findOne(myuid, function(err, doc){
			if(err) return callback(emsg.dberr);
			var friends = doc.friends;
			if(~friends.indexOf(frienduid)) return callback(emsg.friendserr1);
			friends.push(frienduid);
			userDao.update(myuid, {friends:friends}, callback);
			userDao.inc(frienduid, {"beAddFriend":1},function(){});

	});
}

/*
删除好友
myuid 我的用户id
friendid 想要添加的好友id
*/

userApi.cancelFriend = function(myuid, frienduid, callback){
	if(!checkeuid(myuid)) return callback(emsg.setuiderr);
	if(!checkeuid(frienduid)) return callback(emsg.setuiderr);
	userApi.findOne(myuid, function(err, doc){
			if(err) return callback(emsg.dberr);
			var friends = doc.friends;
			if(friends.indexOf(frienduid) == -1) return callback(emsg.friendserr2);
			friends = friends.filter(function(v){
				return v != frienduid;//过滤掉相同的 frienduid;
			})
			userDao.update(myuid, {friends:friends}, callback);
			userDao.inc(frienduid, {"beAddFriend":-1},function(){});
	});
}

//添加喜欢
userApi.addLove = function(myuid, aid, callback){
	if(!checkeuid(myuid)) return callback(emsg.setuiderr);
	if(!checkeuid(aid)) return callback(emsg.aiderr);
	userApi.findOne(myuid, function(err, doc){
			if(err) return callback(emsg.dberr);
			var love = doc.love;
			if(~love.indexOf(aid)) return callback(emsg.loveerr1);
			love.push(aid);
			userDao.update(myuid, {love:love}, function(err, doc){
				if(err) return callback(emsg.dberr)
				callback(null, doc);
			});
	});
}

//删除喜欢
userApi.disLove = function(myuid, aid, callback){
	if(!checkeuid(myuid)) return callback(emsg.setuiderr);
	if(!checkeuid(aid)) return callback(emsg.aiderr);
	userApi.findOne(myuid, function(err, doc){
			if(err) return callback(emsg.dberr);
			var love = doc.love;
			if(love.indexOf(aid) == -1) return callback(emsg.loveerr2);
			love = love.filter(function(v){
				return v != aid;//过滤掉相同的 frienduid;
			})
			userDao.update(myuid, {love:love}, function(err, doc){
				if(err) return callback(emsg.dberr)
				callback(null, doc);
			});
	});
}
//修改喜欢的列表，可能有部分文章被删除了
userApi.modLove = function(myuid, newlove, callback){
	if(!checkeuid(myuid)) return callback(emsg.setuiderr);
	userDao.update(myuid, {love:newlove}, function(err, doc){
		if(err) return callback(emsg.dberr)
		callback(null, doc);
	});
}
//更新用户的已读消息时间戳
userApi.updateReadST = function(myuid, timestamp, callback){
	if(!checkeuid(myuid)) return callback(emsg.setuiderr);
	userDao.updateReadTime(myuid, timestamp, function(err, doc){
		if(err) return callback(emsg.dberr)
		callback(null, doc);
	});
}



module.exports = userApi;