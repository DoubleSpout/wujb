var publish = {},
	ajaxRes = _rrest.mod.ajaxRes,
	userApi = require('../lib/userApi.js'),
	articleApi = require('../lib/articleApi.js'),
	catalogApi = require('../lib/catalogApi.js'),
	title = _rrest.config.webtitle;

publish.index = publish.publish = function(req, res){//用户首页显示
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	var addType = req.path[2];
	if(!addType) addType = 'word';
	var uid = userApi.isLogin(req,res)
	if(uid){
		res.render('/publish.jade', {pagetitle:title+'-发布封面', pubType:'publish', addType:addType});	
	}
	return;
}
publish.catalog = function(req, res){//修改封面
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	res.render('/publish.jade', {pagetitle:title+'-发布封面', pubType:'catalog', error:'',suc:''});	
	return;
}

publish.addcatalog = function(req, res){	
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	if(req.method !== 'POST') return res.redirect('/publish/catalog');//判断是否是post方法

	var uid = req.session.uid;
	var catobj = {
		title:req.postparam['title'],
		file:req.file.image,
		author:uid,
	};
	catalogApi.insert(catobj, function(err, suc){//调用插入数据的catalogapi方法
		if(err) return res.render('/publish.jade', {pagetitle:title+'-发布封面', pubType:'catalog', error:err,suc:''});
		res.render('/publish.jade', {pagetitle:title+'-发布封面', pubType:'catalog', error:'',suc:true});

	})

}


publish.add = function(req, res){//插入一篇文章
	if(!userApi.isLogin(req,res)) return false;//判断是否登录
	if(req.method !== 'POST') return res.redirect('/publish/index');
	var uid = req.session.uid,
	    articleObj = {
			title:req.postparam['title'],
			type:req.postparam['type'],
			url:req.postparam['url'],
			content :req.postparam['content'],
			timestamp:Date.now(),
			face:req.session.face,
			authorname:req.session.email,
		}
	articleApi.add(uid, articleObj, function(err, doc){
		if(err) return res.render('/publish.jade', {pagetitle:title+'-发布文章', pubType:'publish', addType:articleObj.type, articleObj:articleObj, err:err});		
		res.redirect('/content/info/'+doc._id);
	})
}
module.exports = publish; 