var comment = {},
	ajaxRes = _rrest.mod.ajaxRes,
	userApi = require('../lib/userApi.js'),
	articleApi = require('../lib/articleApi.js'),
	commentApi = require('../lib/commentApi.js'),
	stool = _rrest.mod.stools,
	title = _rrest.config.webtitle;

/*
ajax接口，返回ajax对象
提交评论的入口
*/
comment.send = function(req, res){
	if(req.method !== 'POST' || !req.session.uid) res.sendjson(ajaxRes(false, 'post only'));
	 var commentObj = {
			content :req.postparam['msg'].trim(),
			articleid:req.path[2],
			author:req.session.uid,
			timestamp:Date.now(),
			face:req.session.face,
			authorname:req.session.email,
		};
	commentApi.add(commentObj, function(err, doc){
		if(err)  return res.sendjson(ajaxRes(false, err));
		res.sendjson(ajaxRes(true, doc));
		articleApi.addComment(commentObj.articleid, function(err, doc){
		
		})
	});
}









module.exports = comment; 