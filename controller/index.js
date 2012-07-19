var home = {},
	ajaxRes = _rrest.mod.ajaxRes,
	articleApi = require('../lib/articleApi.js'),
	catalogApi = require('../lib/catalogApi.js'),
	title = _rrest.config.webtitle;
home.index = function(req, res){//首页显示
	if(req.session.uid)	return res.redirect('/home');
	catalogApi.showIndex(function(err, imgurl){
		if(err) return res.r404();
		res.render('/index.jade', {pagetitle:title+'-首页', isindex:'true', imgurl:imgurl});
	})
	
}


home.explorer = function(req, res){//探索页面ajax接口
	articleApi.explorer(function(err, doclist){
		if(err) return res.sendjson(ajaxRes(false));
		res.compiletemp('/explorer.jade', {explorer:doclist}, function(err, html){
			if(err) res.sendjson(ajaxRes(false))
			else res.sendjson(ajaxRes(true, html));
		})
		
	})
}

module.exports = home; 