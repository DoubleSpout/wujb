// JavaScript Document
//通用

(function(win){
	
var restips = function(bl, msg){
		if(bl){
			 var msg = msg || '操作成功';
			 return '<span class="pbg tipres tipsuc">'+msg+'</span>';
		}
		var msg = msg || '操作失败';
	    return '<span class="pbg tipres tiperr">'+msg+'</span>';
	},
	autoajax = function(obj){
	var obj={
			suc:obj.suc||restips(true),
			err:obj.err||restips(),
			url:obj.url ||'',
			method:obj.method||'GET',
			data:obj.data||{},
			cache:obj.cache,
			time:obj.time||3000,
			cb:obj.cb||function(){}
		}
		if('undefined' === obj.cache) obj.cache = false;
		$.ajax({
				cache:obj.cache,
				data:obj.data,
				dataType:'json',
				error:function(){
						base.tip(obj.err, obj.time,function(){obj.cb(true);});
					},
				success:function(data){
					var t = data.status == 1 ? obj.suc : restips(false, data.data.info) || obj.err;
					base.tip(t, obj.time, function(){obj.cb(null, data);});
					},
				timeout:1000*60,
				type:obj.method,
				url:obj.url
			});
	},
 formajax = function($form, cb){
	autoajax({
		method:$form.prop('method'),
		url:$form.prop('action'),
		data:$form.serialize(),
		cb:cb
	})
	return false;
	};
$('a[name="addfriend"], a[name="cancelfriend"], a[name="love"], a[name="dislove"]').live('click', function(){
		autoajax({url:$(this).prop('href')});
		return false;
	});
$('a[name="delMsg"]').click(function(){
	var url = $(this).attr('href');
	$.get(url, {r:Math.random()}, function(data){
		if(data.status != 1) return base.tip(restips(false, data.data.info));
		base.tip(restips(true, '成功删除 '+data.data+' 条记录'),3000,function(){
					 location.href =  location.href;
		});
	}, 'json')
})
//通用
//资料设置
if($('#settingForm').length>0){//资料修改
	$('#setpwd').click(function(){
		$(this).parents('tr').hide().next('#setpwdtr').show();
	})
	$('#changename').click(function(){
		$(this).parents('tr').hide().next('#changenamebox').show();
	})
	$('#settingForm').submit(function(){
		$.post('/setting/update', $(this).serialize(), function(d){
			if(d.status==1) base.tip(restips(true, '保存成功！'));
			else base.tip(restips(false, d.data.info));
		},'json')
		return false;
	})
}
//资料设置
//用户首页
if($('#pQuick').length>0){
	$('.blacka ').hover(function(){
		$(this).stop(true, true);
			$(this).animate({opacity: 1},300);
		},function(){
			$(this).animate({opacity: 0.4},300);
	});
	var myface = $('#myface')
	$('#pqFace').hover(function(){myface.hide();},function(){myface.show();});
	$('#pList').delegate('dl','mouseenter', function(){
				$(this).addClass('dlh');
		}).delegate('dl', 'mouseleave', function(){
				$(this).removeClass('dlh');
		})
	}
//用户首页	
//文章内容页
if($('.commentForm').length>0){
	var screenW = screenw = document.documentElement.clientWidth || document.body.clientWidth;
	if(screenW<=1240){
		$('.pcCommentFix').hide();
		$('.pcComment').find('h4.clearfix').eq(1).hide();
		$('.commentInput').show();
	}
	$('.msg').charcheck(100, 2, function(input, total){
		var msgc = $(this).parents('.pcComment').find('.msgCondition');
			condition = input+'/'+total;
			if(input>total) msgc.html('<font class="ftred">'+condition+'</font>');
			else  msgc.html(condition);
		});
	$('.commentForm').submit(function(){
		var inlen = charcheck($(this).find('.msg').val(), 100, 2);
		if(inlen === 0) base.tip(restips(false, base.error[1]));
		else if(inlen > 100) base.tip(restips(false, base.error[2]));
		else formajax($(this), function(err, d){
					if(!err && d.status === 1) location.href = location.href;
				});
		return false;
	});	
	$('#prevArt, #nextArt').css('visibility', 'visible').click(function(){
		var url = $(this).attr('href');
		$.get(url, {}, function(data){
			if(data.status != 1) return base.tip(restips(false, data.data.info));
			if(data.data) location.href = '/content/info/'+data.data;
			else  base.tip(restips());
		}, 'json')
		return false;
	})
}
//文章内容页
//发布封面页面
if($('#pubCat').length>0){
	var err = $('#caterr').val(),
		suc = $('#catsuc').val();
	if($.trim(err) !== '') base.tip(restips(false,err));
	else if($.trim(suc) !== '') base.tip(restips(true,'封面上传成功'));
}
//发布封面
//发布内容
if($('#publish').length>0){

	var typeObj = $('input[name="type"]'),
		typeObjChecked = $('input[name="type"]:checked'),
		urlPobj = $('#url').parents('tr'),
		videoHobj = $('#videoHelp'),
		typev = typeObjChecked.val();
	if(typev === 'word') urlPobj.hide();
	else if(typev === 'video') videoHobj.show();
	typeObj.click(function(){

		var v = $(this).val();
		if(v === 'word') {
			urlPobj.hide();
			videoHobj.hide();
		}
		else  if(v === 'pic'){
			urlPobj.show();
			videoHobj.hide();
		}
		else{
			urlPobj.show();
			videoHobj.show();
		}
	});
	typeObjChecked.trigger('click');
	$('#publish').submit(function(){
		var titlev = $.trim($('#title').val()),
			urlv = $.trim($('#url').val()),
			contentv = $.trim($('#content').val()),
			typev = $('input[name="type"]:checked').val();
		
		if(titlev === '') {
			base.tip(restips(false, '标题必填'));
			return false
		}
		if(contentv === '') {
			base.tip(restips(false, '内容必填'));
			return false
		}
		if(contentv.length>300) {
			base.tip(restips(false, '内容过长')); 
			return false
		}
		if(typev === 'pic' && urlv === ''){
			base.tip(restips(false, '图片路径必填')); 
			return false
		}
		else if (typev === 'video'){
			if(urlv === ''){
				base.tip(restips(false, '视频路径必填')); 
				return false
			}
			if(urlv.indexOf('.swf') === -1){
				base.tip(restips(false, '视频路径为.swf文件')); 
				return false
			}
		}
		return true;
	});

	var err = $('#err').val(),
		suc = $('#suc').val();
	if($.trim(err) !== '') base.tip(restips(false,err));
}
//发布内容
//发送消息
if($('#selFriend').length>0){
	$('#selFriend').change(function(){
		var v = $(this).val();
		if(v===0) return false;
		var href = '/message/send/'+v;
		location.href = href;
		return false;
	})
}
if($('#msgSend').length>0){
	$('#msgSend').submit(function(){
			var v = $.trim($('#msg').val());
			if(v==='') return base.tip(false, '内容不能为空')||false;
			var that = $(this);
			$.post(that.attr('action'), that.serialize(), function(data){
				if(data.status != 1) return base.tip(restips(false, data.data.info));
				base.tip(restips(true, '发送成功'),3000,function(){
					 location.href =  location.href;
				});
			},'json')
			return false;
	})
}
//发送消息
//获取未读消息
if($('.pNav').length>0){
    var getMsg = function(){
         $.get('/message/unread',{'r':Math.random},function(res){
			if(res.status === 1){
				var num = res.data - 0;
				if(num>0) $('#unRead').html(num).parent().show();
			}
			else clearInterval(setI)
		},'json');       
    };
    setTimeout(function(){getMsg();},1000*3);
	var setI = setInterval(function(){
        getMsg();
	},1000*30);
}
}(window))
