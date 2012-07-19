var home = {},
	ajaxRes = _rrest.mod.ajaxRes,//ajax返回
	userApi = require('../lib/userApi.js'),
	title = _rrest.config.webtitle;

home.index = function(req, res){//用户首页显示
   if(!userApi.isLogin(req,res)) return false;
   userApi.findOne(req.session.uid, function(err,doc){
		if(err)	return res.r404();
		res.render('/setting.jade', {pagetitle:title+'-资料修改', my:doc});	
   })
}
home.update = function(req, res){
	if(!userApi.isLogin(req,res,function(uid){
			if(!uid) return res.sendjson(ajaxRes(false, {info:''}))||false;
			return true;
	})) return false;
	var uid = req.session.uid,
		uobj = {
			password: req.postparam.password,
			name: req.postparam.name,
			description: req.postparam.description,
		}
	userApi.setting(uid,uobj,function(err,doc){
		if(err) return res.sendjson(ajaxRes(false, {info:err}));
		res.sendjson(ajaxRes(true));
	})
}
module.exports = home; 