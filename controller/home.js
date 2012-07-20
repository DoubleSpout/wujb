var home = {},
	ajaxRes = _rrest.mod.ajaxRes,
	title = _rrest.config.webtitle,
	stool = _rrest.mod.stools,
	userApi = require('../lib/userApi.js'),
	catalogApi = require('../lib/catalogApi.js'),
	articleApi = require('../lib/articleApi.js');



home.login = function(req, res){//用户post接口
	if(req.method !== 'POST') return res.redirect('/');
	var email = req.postparam.email,
		password = req.postparam.password;
	catalogApi.showIndex(function(err, imgurl){
		userApi.login(email, password, function(err, doc){

			if(err)	res.render('/index.jade', {pagetitle:title+'-首页', isindex:'true',err:err, imgurl:imgurl});
			else{
				var uid = doc._id+'';
				req.session.uid = uid; 
				req.session.face = doc.face;
				req.session.email = stool.addstar(doc.email);
				req.session.name = req.session.email;
				userApi.update(doc._id, req.ip, password);//更新用户信息和密码
				res.redirect('/home');
			}
		})
	})
}

home.logout = function(req, res){//退出登录
	req.delsession();
	res.redirect('/');
}

home.index = function(req, res){//用户首页显示
	var uid = userApi.isLogin(req,res),
		lastAid = req.path[5] || false,
		isnext =  req.path[4] === 'next' ? true : false,
		curPage = req.path[3] || 1;

	if(curPage===1) lastAid=false;
	if(uid){		
			articleApi.page(function(err, pageObj){
				articleApi.showHome(uid, lastAid, isnext, function(err, articleArray){
					if(err) return res.r404();
					 userApi.findOne(req.session.uid, function(err,user){
						user.lovenum = user.love.length;
						user.friendsnum = user.friends.length;;		
						articleArray.forEach(function(v){
							v.authorid = v.author;
							v.authorface =v.face;
							v.id = v._id.toString();
							v.authorname = v.authorname;
							v.imgs = [v.url];
							v.createtime = stool.fdate('y-m-d h:m:s', v.timestamp);
							v.commetnum = v.comment||0;
							v.lovenum = v.love||0;
						});
						/*分页对象*/
						var page ={
								totalnum:pageObj.total,
								curpage:curPage,
								totalpage:pageObj.totalPage,
								hrefnext:'javascript:;',
								hrefprev:'javascript:;',		
							};
						if(articleArray.length>0){
								if(curPage> 1)	page.hrefprev = '/home/index/page/'+(curPage-1)+'/prev/'+articleArray[0].id;
								if(curPage < pageObj.totalPage) page.hrefnext = '/home/index/page/'+(curPage-0+1)+'/next/'+articleArray[articleArray.length-1].id;
						
						}

						/*分页对象*/
						res.render('/home.jade', {pagetitle:title+'-个人中心',user:user, contentlist:articleArray,page:page});	
					 })
				});
			});
	}
	return;

}
module.exports = home; 