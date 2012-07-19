/*
*根据session检查是否登录，3个参数，req,res,callback;
*callback的返回值作为本函数的返回值
*/
var commentApi = {},
	commentDao = require('../dao/commentDao.js'),
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
		contentErr1:'内容不能超过200个字',
		contentErr2:'内容不能为空',
		typeErr:'发布类型错误',
		urlErr:'图片或者视频不能为空',
		articleIdErr:'文章id错误',
		setuiderr:'用户id错误',
		pageErr:'分页错误',
	};
var dmsg={
		name:'WuJB会员',
	}
/*增加留言*/
commentApi.add = function(commentObj, callback){//检查是否登录模块
	if(!checkeuid(commentObj.articleid)) return callback(emsg.articleIdErr);
	if(!checkeuid(commentObj.author)) return callback(emsg.setuiderr);
	if(commentObj.content.length>200) return callback(emsg.contentErr1);
	if(commentObj.content === '' ) return callback(emsg.contentErr2);
	//验证数据完毕
	commentDao.insert(commentObj, function(err, doc){
		if(err) return callback(emsg.dberr);
		callback(null, doc);
	});

}
/*根据文章id展示留言*/
commentApi.show = function(articleid, callback){//检查是否登录模块
	if(!checkeuid(articleid)) return callback(emsg.articleIdErr);
	//验证数据完毕
	commentDao.find(articleid, function(err, doc){
		if(err) return callback(emsg.dberr);
		callback(null, doc);
	})
}

module.exports = commentApi;