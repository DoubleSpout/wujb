var home = {},
	ajaxRes = _rrest.mod.ajaxRes,
	userApi = require('../lib/userApi.js'),
	articleApi = require('../lib/articleApi.js'),
	title = _rrest.config.webtitle;

home.index = home.content = function(req, res){//搜索文章
	var searchWords = req.getparam.search || false;
	if(!searchWords){
		res.render('/search.jade', {pagetitle:title+'-搜索结果', noSearch:true,contentlist:[]});	
	}
	else{
		articleApi.searchList(searchWords, function(err, contentlist, keywords){
			if(err)	return res.r404();
			res.render('/search.jade', {pagetitle:title+'-'+keywords+'搜索结果', noSearch:false, searchWords:keywords, contentlist:contentlist});	
		})
	}
}



module.exports = home; 