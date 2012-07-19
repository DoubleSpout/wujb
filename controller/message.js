var home = {},
	ajaxRes = _rrest.mod.ajaxRes,
	userApi = require('../lib/userApi.js'),
	messageApi = require('../lib/messageApi.js'),
	title = _rrest.config.webtitle;


//私心列表
home.index = home.list = function(req, res){//私信列表显示
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	var uid = req.session.uid,
		nowts = Date.now();
    userApi.findOne(uid, function(err, doc){
		if(err) return res.r404();
		userApi.findMyFriends(doc.friends, function(err, friendlist){
			if(err) return res.r404();
			messageApi.list(uid, function(err, msglist){
					if(err) return res.r404();	
					res.render('/message.jade', {pagetitle:title+'-私信', msgType:'list',msglist:msglist,my:req.session,friendlist:friendlist});	
					userApi.updateReadST(uid, nowts, function(){});//打开列表页就会更新未读消息时间戳
					return;	
			 })
		})
	})
}

//私心详细
home.info = home.send = function(req, res){//私信详细
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	var otherid = req.path[2];
	var backid = req.getparam.backid || '';
	var uid = req.session.uid;
	if(!otherid) return res.r404();

	userApi.findOne(otherid, function(err, otherobj){
		if(err) return res.r404();	
	    messageApi.show(uid, otherid, function(err, msglist){
		   if(err) return res.r404();	
		   res.render('/message.jade', {pagetitle:title+'-私信',my:req.session, otherobj:otherobj, msgType:'info',msginfolist:msglist,backid:backid});	
	    })
	})
}



//私信删除
home.del = function(req, res){//私信删除 ajax接口
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	var msgid = req.path[2];
	messageApi.del(req.session.uid, msgid, function(err, delnum){
		if(err) return res.sendjson(ajaxRes(false, {info:err}));
		res.sendjson(ajaxRes(true, delnum));
	})
}

//私心添加
home.add = function(req, res){//私信添加,ajax接口
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	var otherid = req.path[2];
	if(req.method !== 'POST') return res.r404();
	var content = req.postparam.content;//获得post的内容
	userApi.findOne(otherid, function(err, otherobj){
		if(err) return res.r404();
		messageApi.add(req.session, otherobj, content, function(err, doc){
			if(err) return res.sendjson(ajaxRes(false, {info:err}));
			res.sendjson(ajaxRes(true, doc));
		})
	})
}

//获得未读私信的数量
home.unread = function(req, res){
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	var uid = req.session.uid;
	userApi.findOne(uid, function(err, userobj){
		var readst = userobj.readtimestamp;
		messageApi.getUnread(uid, readst, function(err, len){
			if(err) return res.sendjson(ajaxRes(false, {info:err}));
			res.sendjson(ajaxRes(true, len+''));		
		})
	})
}

module.exports = home; 