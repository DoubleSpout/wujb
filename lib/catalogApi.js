/*
*根据session检查是否登录，3个参数，req,res,callback;
*callback的返回值作为本函数的返回值
*/
var catalogApi = {},
	fs = require('fs'),
	path = require('path'),
	catalogDao = require('../dao/catalogDao.js'),
	checkname = _rrest.mod.stools.checkname,
	baseDir =  _rrest.config.baseDir,
	autoStatic = _rrest.config.autoStatic,
	staticFolder = _rrest.config.staticFolder,
	uploadFolder = _rrest.config.uploadFolder
	checkemail = _rrest.mod.stools.checkemail,
	checkpwd = _rrest.mod.stools.checkpwd,
	checkdesc = _rrest.mod.stools.checkdesc,
	checkeuid = _rrest.mod.stools.checkeuid,
	merge = _rrest.mod.stools.merge,
	htmltostring = _rrest.mod.stools.htmltostring,
	fdate = _rrest.mod.stools.fdate,
	gravatar = _rrest.mod.gravatar,
	check_img = _rrest.mod.stools.check_img,
	md5 = _rrest.mod.stools.md5;

var trueUpload = '/upload'

var emsg={
		dberr:'数据库连接失败',
		fileerr1:'文件保存失败',
		fileerr2:'文件格式错误',
		fileerr3:'伪造的jpg文件',
		titlelenerr:'标题长度有误',
		setuiderr:'用户id错误',
	};
var dmsg={
		name:'WuJB会员',
		desc:'这家伙什么都没写！',
	}
var defaultImg = autoStatic+'/img/default_bg.jpg',
	defaultLimit = 20;
	

catalogApi.insert = function(catobj, callback){//插入一条封面的信息数据
	var cb = function(err, suc){//封装了下回调，如果出错则把文件删除
		if(err){
			callback(err);
			if(catobj.file.path) fs.unlink(catobj.file.path, function(){})
		}
		else callback(null, suc)
	};
	if(catobj.title.length>20 || catobj.title.length<1) return cb(emsg.titlelenerr);//如果标题过长则报错
	if(!checkeuid(catobj.author)) return cb(emsg.setuiderr);//如果用户id错误则报错
	var imgtype = check_img(catobj.file.type);//获得图片的类型
	if(!imgtype) return cb(emsg.fileerr2);//如果图片类型为false，则报错
	
	var imgpath = catobj.file.path;  //获得临时存放的图片地址
	path.exists(imgpath, function(isexist){//判断是否存在图片
		if(!isexist) return cb(emsg.fileerr1);//不存在，则报错
		fs.readFile(imgpath, function (err, data) {
			if(err) return cb(emsg.fileerr1);//不存在，则报错
			var fileHead = data.slice(0,3);//获取jpg图片头信息
			if(fileHead.toString('hex') !== 'ffd8ff') return cb(emsg.fileerr3);
	//如果头文件不等于ffd8ff，则不是有效的jpg文件

			var parray = imgpath.split('/'),
				imgname = parray[parray.length-1]+'.'+imgtype;//获得图片的名字
			var parray2 = imgpath.split(uploadFolder),
				relativePath = autoStatic + trueUpload + parray2[parray2.length-1]+'.'+imgtype;//存入数据库的相对路径
	//		console.log(catobj.file.path)
	//		console.log(imgname);
	//		console.log( baseDir+staticFolder+trueUpload+'/'+imgname);
	//		console.log(relativePath);
			fs.link(catobj.file.path, baseDir+staticFolder+trueUpload+'/'+imgname,function(err){
				//使用fs.link将临时上传目录拷贝到真实目录
				if(err) return cb(emsg.fileerr1);
				catobj.url = relativePath;//准备写入数据库的数据，相对路径
				catobj.timestamp = Date.now();//时间戳
				catalogDao.insert(catobj, function(err,doc){//插入数据库操作
					if(err) return cb(err);
					cb(null, doc)
				})//插入结束
			})//fs.link链接结束
	  })
	})
	
}
var imgList = [
"/static/img/1.jpg",
"/static/img/2.jpg",
"/static/img/3.jpg",
"/static/img/4.jpg",
"/static/img/5.jpg",
"/static/img/6.jpg",
"/static/img/7.jpg",
"/static/img/8.jpg",
"/static/img/9.jpg",
"/static/img/10.jpg",
]
catalogApi.showIndex = function(callback){
	var len = imgList.length;
	if(len === 0) return callback(null, defaultImg);
	var r = Math.floor(Math.random()*len);
	callback(null, imgList[r]);
} 

var getList = function(){
	catalogDao.find(defaultLimit, function(err, imglist){
		if(err) return;
		var imgList2=[]
		imglist.forEach(function(v){
			imgList2.push(v.url);
		});
		imglist = imgList2;
	})
	return arguments.callee;
}();


setInterval(function(){getList();},1000);//间隔一定的时间去数据库获取最新20条的

module.exports = catalogApi;