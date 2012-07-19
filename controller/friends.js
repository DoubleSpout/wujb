var home = {},
	ajaxRes = _rrest.mod.ajaxRes,
	userApi = require('../lib/userApi.js'),
	title = _rrest.config.webtitle;

//我的好友列表
home.index =  function(req, res){//我的好友列表
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	 userApi.findOne(req.session.uid, function(err,doc){
		if(err)	return res.r404();
		userApi.findMyFriends(doc.friends, function(err, docary){	
			if(err)	return res.r404();
				userApi.findNewUsers(function(err, docnary){
					if(err)	return res.r404();
					res.render('/friends.jade', {pagetitle:title+'-我的好友', my:doc, myfriends:true,friendslist:docary,newfriendslist:docnary});			
					//输出模板
				});				
					
		})
    })
}


//探索好友列表
home.explorer =  function(req, res){//我的好友列表
	if(!userApi.isLogin(req,res)) return false;//判断是否登录

		userApi.findOne(req.session.uid, function(err,doc){
			if(err)	return res.r404();
			if(req.path[2]) var lid = req.path[2];
			else lid = false
			userApi.findExplorerFriends(lid, function(err, docary, limit){	
				if(err)	return res.r404();
				var len = docary.length;
				if(len>0 && len == limit) var lastid = docary[len-1]._id
				else var lastid = 0;
					userApi.findNewUsers(function(err, docnary){
						if(err)	return res.r404();
						res.render('/friends.jade', {pagetitle:title+'-发现好友', my:doc, myfriends:false,friendslist:docary,newfriendslist:docnary,lastid:lastid});			
						//输出模板
					});									
			})
		})
}


//添加好友
home.add = function(req, res){
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	var fuid = req.path[2];
	userApi.addFriend(req.session.uid, fuid, function(err, doc){
		if(err) return res.sendjson(ajaxRes(false, {info:err}));
		res.sendjson(ajaxRes(true));	
	})
}

//移除好友
home.cancel = function(req, res){
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	var fuid = req.path[2];
	userApi.cancelFriend(req.session.uid, fuid, function(err, doc){
		if(err) return res.sendjson(ajaxRes(false, {info:err}));
		res.sendjson(ajaxRes(true));	
	})
}
module.exports = home;