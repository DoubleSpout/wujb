/*
*根据session检查是否登录，3个参数，req,res,callback;
*callback的返回值作为本函数的返回值
*/
var messageApi = {},
	messageDao = require('../dao/messageDao.js'),
	checkname = _rrest.mod.stools.checkname,
	checkemail = _rrest.mod.stools.checkemail,
	checkpwd = _rrest.mod.stools.checkpwd,
	checkdesc = _rrest.mod.stools.checkdesc,
	checkeuid = _rrest.mod.stools.checkeuid,
	merge = _rrest.mod.stools.merge,
	htmltostring = _rrest.mod.stools.htmltostring,
	fdate = _rrest.mod.stools.fdate,
	gravatar = _rrest.mod.gravatar,
	md5 = _rrest.mod.stools.md5;


var emsg={
		dberr:'数据库连接失败',
		contentlenerr:'消息内容长度有误',
		msgiderr:'消息id错误',
		uiderr:'用户id错误',
		delerr:'您没有权限删除',
	};

messageApi.list = function(uid, callback){//用户进来消息列表显示
	if(!checkeuid(uid)) return callback(emsg.uiderr);
	messageDao.list(uid, function(err, doclist){
		if(err || !doclist) return callback(emsg.dberr);
		doclist.forEach(function(v){
			v.timestamp = fdate('y-m-d h:m:s', v.timestamp);
		})
		callback(null, doclist);
	});
}

messageApi.del = function(uid, msgid, callback){//删除消息

	messageDao.findone(msgid, function(err, doc){//查找这个消息的所有人
		if(err || !doc) return callback(emsg.dberr);
		if(doc.belong !== uid) return  callback(emsg.delerr);//判断这条消息是否属于此人
		var otherid = doc.from ===uid ? doc.to : doc.from;//将otherid得到
		messageDao.del(uid, otherid, function(err, delnum){//执行删除
			if(err) return callback(emsg.dberr);
			callback(null, delnum);		
		})
	})

}

messageApi.show = function(uid, otherid, callback){//显示当前用户和目标用户聊天的详细页
	if(!checkeuid(otherid)) return callback(emsg.uiderr);

	messageDao.show(uid, otherid, function(err, doclist){
		if(err || !doclist) return callback(emsg.dberr);
		doclist.forEach(function(v){
			v.timestamp = fdate('y-m-d h:m:s', v.timestamp);
		})
		callback(null, doclist);
	});
}
/*
uobj={
face: 用户头像
name: 用户名字
uid:  用户id
}

*/


messageApi.add = function(uobj, otherobj, content, callback){//发送新消息
	if(!checkeuid(otherobj._id)) return callback(emsg.uiderr);
	if(content.length<1||content.length>50) return callback(emsg.contentlenerr);//检查消息内容长度

		var msgobj = {//准备插入数据库的消息对象
			from:uobj.uid,
			fromname:uobj.name,
			fromface:uobj.face,
			to:otherobj._id,
			toname:otherobj.name,
			toface:otherobj.face,
			content:htmltostring(content),//对html进行转码
			timestamp:Date.now(),
		}
		messageDao.insert(msgobj, function(err, msg){
			if(err || !msg) return callback(emsg.dberr);
			callback(null, msg);
		})	
}


/*

*/
messageApi.getUnread = function(uid, st, callback){
	if(!checkeuid(uid)) return callback(emsg.uiderr);
	messageDao.unreadnumber(uid, st, function(err, doclist){
		if(err) return callback(emsg.dberr);
		var len = doclist.length||0;
		callback(null, len);
	});
}




module.exports = messageApi;