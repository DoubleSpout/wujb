/*
*根据session检查是否登录，3个参数，req,res,callback;
*callback的返回值作为本函数的返回值
*/
var articleApi = {
		showHomeNum:5,
	},
	articleDao = require('../dao/articleDao.js'),
	checkname = _rrest.mod.stools.checkname,
	checkemail = _rrest.mod.stools.checkemail,
	checkpwd = _rrest.mod.stools.checkpwd,
	checkdesc = _rrest.mod.stools.checkdesc,
	checkeuid = _rrest.mod.stools.checkeuid,
	merge = _rrest.mod.stools.merge,
	htmltostring = _rrest.mod.stools.htmltostring,
	gravatar = _rrest.mod.gravatar,
	md5 = _rrest.mod.stools.md5;

var emsg={
		dberr:'数据库连接失败',
		titleErr1:'标题不能超过15个字',
		titleErr2:'标题不能为空',
		contentErr1:'内容不能超过300个字',
		contentErr2:'内容不能为空',
		typeErr:'发布类型错误',
		urlErr:'图片或者视频不能为空',
		articleIdErr:'文章id错误',
		setuiderr:'用户id错误',
		pageErr:'分页错误',
		aidErr:'文章id错误',
		searcherr:'搜索关键字过长',
		nexterr:'没有下一篇了',
		preverr:'没有上一篇了',
	};
var dmsg={
		name:'WuJB会员',
		thumb:'/static/img/defaul_article_pic.gif',
	}

articleApi.add = function(uid, articleObj, callback){//检查是否登录模块
	var type = articleObj.type;
	if(!checkeuid(uid)) return callback(emsg.setuiderr);
	if(articleObj.title.length>15) return callback(emsg.titleErr1);
	if(articleObj.title === '' ) return callback(emsg.titleErr2);
	if(articleObj.content.length>300) return callback(emsg.contentErr1);
	if(articleObj.content === '' ) return callback(emsg.contentErr2);
	if(type !=='pic' && type !=='word' && type !=='video') return callback(emsg.typeErr);
	if((type=='pic' || type=='video') && articleObj.url === '') return callback(emsg.urlErr);
	articleObj.author = uid;
	articleObj.content = htmltostring(articleObj.content);//转化html标记
	//验证数据完毕
	articleDao.insert(articleObj,function(err, doc){
		if(err) return callback(emsg.dberr);
		callback(null, doc);
	})
}
/*
返回一篇文章的内容 uid 和 articleid

*/
articleApi.findone = function(uid, articleId, callback){
	if(!checkeuid(uid)) return callback(emsg.setuiderr);
	if(!checkeuid(articleId)) return callback(emsg.articleIdErr);
	articleDao.findone(articleId, function(err, doc){
		if(err) return callback(emsg.dberr);
		callback(null, doc);
	})
}
/*
门户首页返回最新的5篇消息
接受参数
下一页时，最后一个 articleId
上一页时，第一个 articleId
*/
articleApi.showHome = function(uid, articleId, isnext, callback){
	if(!checkeuid(uid)) return callback(emsg.setuiderr);
	if(articleId && !checkeuid(articleId)) return callback(emsg.articleIdErr);
	articleDao.find(false, articleApi.showHomeNum, articleId, isnext, false, function(err, doc){
		if(err) return callback(emsg.dberr);
		callback(null, doc);
	})	
};
/*
文章分页


返回参数
{
	total:总数
	totalPage:总页数
}
*/
articleApi.page = function(callback){
	articleDao.count(function(err, count){
		if(err) return callback(emsg.pageErr);
		var tp = count === 0 ? 1 : Math.ceil(count/articleApi.showHomeNum);
		callback(null, {total:count,totalPage:tp});
	});
}
/*
某一个用户的文章列表
auid 某一个用户的id
返回 err和article list

*/
articleApi.uList = function(auid, callback){
	if(!checkeuid(auid)) return callback(emsg.setuiderr);
	articleDao.findAuthor(auid, false, false, function(err, doclist){
		if(err) return callback(emsg.pageErr);
		doclist.forEach(function(v){
			v.thumb = v.thumb || dmsg.thumb;
			v.lovenum = v.love || 0;
		});
		callback(null, doclist)
		
	});
}

//探索文章
articleApi.explorer = function(callback){
	articleDao.find(false, false, false, false, {'love':-1},function(err, doclist){
			if(err) return callback(emsg.dberr);
			doclist.forEach(function(v){
				v.thumb = v.thumb || dmsg.thumb;
				v.lovenum = v.love || 0;
			});
		callback(null, doclist)
	})
}

//查找关键字
articleApi.searchList = function(keywords, callback){
	var keywords = keywords;
	if(keywords.length>20) return callback(emsg.searcherr);
	keywords = decodeURIComponent(keywords);//解码
	keywords = htmltostring(keywords);//过滤
	articleDao.find(keywords, false, false, false, false, function(err, doclist){
		if(err) return callback(emsg.dberr)
		doclist.forEach(function(v){
				v.thumb = v.thumb || dmsg.thumb;
				v.lovenum = v.love || 0;
				v._id = v._id.toString();
			});	
		callback(null, doclist, keywords);//将查询结果以及关键字返回
	})

}



//我喜欢的文章
articleApi.loveList = function(aidary, callback){
	articleDao.loveList(aidary, function(err, doclist){
		if(err) return callback(emsg.dberr);
		doclist.forEach(function(v){
				v.thumb = v.thumb || dmsg.thumb;
				v.lovenum = v.love || 0;
				v._id = v._id.toString();
			});
		callback(null, doclist);
	})
}

//喜欢这篇文章
articleApi.love = function(aid, callback){
	if(!checkeuid(aid)) return callback(emsg.aidErr);
	articleDao.love(aid, 1, function(err, doc){
		if(err) return callback(emsg.dberr)
		callback(null, doc);
	});
}

//不喜欢这篇文章
articleApi.dislove = function(aid, callback){
	if(!checkeuid(aid)) return callback(emsg.aidErr);
	articleDao.love(aid, -1, function(err, doc){
		if(err) return callback(emsg.dberr)
		callback(null, doc);
	});
}

//评论数加1
articleApi.addComment = function(aid, callback){
	if(!checkeuid(aid)) return callback(emsg.aidErr);
	articleDao.addcomment(aid, function(err, doc){
		if(err) return callback(emsg.dberr)
		callback(null, doc);
	});
}

articleApi.nextView = function(aid, isNext, callback){
	if(!checkeuid(aid)) return callback(emsg.aidErr);
	articleDao.nextprev(aid, isNext, function(err, doc){
		if(err) return callback(emsg.dberr);
		if(!doc){
			var msg = isNext ? emsg.nexterr : emsg.preverr;
			return callback(msg);
		}
		callback(null, doc._id);
	})
}


module.exports = articleApi;