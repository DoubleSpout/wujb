var home = {},
	ajaxRes = _rrest.mod.ajaxRes,
	userApi = require('../lib/userApi.js'),
	articleApi = require('../lib/articleApi.js'),
	commentApi = require('../lib/commentApi.js'),
	stool = _rrest.mod.stools,
	title = _rrest.config.webtitle;
home.index = home.info = function(req, res){//用户首页显示
	var uid = userApi.isLogin(req,res),
		aid = req.path[2];
	if(uid){
		articleApi.findone(uid,aid,function(err, articleObj){		
			if(err || !articleObj) return res.r404();
			commentApi.show(aid, function(err, commentArray){
				if(err||!commentArray) return res.r404();
				userApi.findOne(uid, function(err, userdoc){
					if(err||!userdoc) return res.r404();
					var authorid = articleObj['author'];
					userApi.findOne(authorid, function(err, authordoc){
						if(err||!authordoc) return res.r404();

						var cont = {//文章详细内容
								id:articleObj['_id'].toString(),
								authorface:articleObj['face'],
								authorid:articleObj['author'],
								title:articleObj['title'],
								authorname:articleObj['authorname'],
								name:authordoc.name,
								lastLoginTime:authordoc.lastLoginTime,
								authorcreatetime:stool.fdate('y-m-d h:m:s', articleObj['timestamp']),
								content:articleObj['content'],
								imgs:[articleObj['url']],
								commetnum:articleObj['comment']||0,
								lovenum:articleObj['love']||0,	
								islove:true,
								isfriend:false,
								type:articleObj['type'],
								description:authordoc.description,
								
							};
						commentArray.forEach(function(v,i){//评论模块
							v.timestamp = stool.fdate('y-m-d', v.timestamp);
						});

						userdoc.lovenum = userdoc.love.length;//用户模块
						userdoc.friendsnum = userdoc.friends.length;

						cont.islove = ~userdoc.love.indexOf(aid)?true:false;//是否关注
						cont.isfriend = ~userdoc.friends.indexOf(articleObj['author'])?true:false;
						
						ismy = userdoc._id == cont.authorid?true:false;
						res.render('/content.jade', {pagetitle:title+'-'+cont.title, user:userdoc, content:cont, commentlist:commentArray, ismy:ismy});			
						
					   })//获取作者信息
					});//获取用户信息
			
			});//评论内容获取完毕
	
		});//文章内容获取完毕
	}
	return;
}

home.list = function(req, res){//用户的文章列表显示
	var listuid = req.path[2];
	if(!listuid) return res.r404();
	userApi.findOne(req.session.uid, function(err, my){
		if(err || !my)	return res.r404();
		if(~my.friends.indexOf(listuid)) my.isFriend = true;
		else my.isFriend = false;
		my.isme = req.session.uid == listuid ? true:false;//判断下是否是自己
		userApi.findOne(listuid, function(err, user){
			if(err)	return res.r404();			
			articleApi.uList(listuid, function(err, contentlist){
				if(err)	return res.r404();
				res.render('/contentlist.jade', {pagetitle:title+'-'+user.name+'内容列表', my:my, isuser:true, user:user, contentlist:contentlist});	
			})
		})
	})
}

//发现好文章
home.explorer = function(req, res){
		articleApi.explorer(function(err, contentlist){
			var searchWords = '';
				res.render('/search.jade', {pagetitle:title+'-发现好文章',isexplorer:true ,searchWords:searchWords, contentlist:contentlist});	
		})
}

//我喜欢的文章
home.mylove = function(req, res){
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	var uid = req.session.uid;
	userApi.findOne(uid, function(err, user){
			if(err)	return res.r404();	
			articleApi.loveList(user.love, function(err, contentlist){
				if(err)	return res.r404();
				res.render('/contentlist.jade', {pagetitle:title+'-'+user.name+'喜欢的文章', my:user, lovelist:true, isuser:false, user:user, contentlist:contentlist});	
				//响应给用户文章列表
				if(contentlist.length !== user.love.length){//当用户喜欢的文章被删除了，则从用户love列表中剔除此文章
					var newlove = [];
					contentlist.forEach(function(v){
						newlove.push(v._id);
					});
					userApi.modLove(uid, newlove, function(err,doc){})
				}
			})
		})
}




//我喜欢 ajax接口
home.ilove = function(req, res){
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	var aid = req.path[2];
	userApi.addLove(req.session.uid, aid ,function(err, doc){
		if(err) return res.sendjson(ajaxRes(false, {info:err}));
		articleApi.love(aid, function(err, doc){
			if(err) return res.sendjson(ajaxRes(false, {info:err}));
			res.sendjson(ajaxRes(true))
		})	
	})
}
//我不喜欢 ajax
home.inotlove = function(req, res){
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	var aid = req.path[2];
	userApi.disLove(req.session.uid, aid ,function(err, doc){
		if(err) return res.sendjson(ajaxRes(false, {info:err}));
		articleApi.dislove(aid, function(err, doc){
			if(err) return res.sendjson(ajaxRes(false, {info:err}));
			res.sendjson(ajaxRes(true))
		})	
	})
}


//上一篇的ajax接口
home.prev = function(req, res){	
	var aid = req.path[2];
	articleApi.nextView(aid, false, function(err, id){
		if(err) return res.sendjson(ajaxRes(false, {info:err}))
		res.sendjson(ajaxRes(true, id))
	});
}


//下一篇的ajax接口
home.next = function(req, res){
	var aid = req.path[2];
	articleApi.nextView(aid, true, function(err, id){
		if(err) return res.sendjson(ajaxRes(false, {info:err}))
		res.sendjson(ajaxRes(true, id))
	});
}




module.exports = home; 