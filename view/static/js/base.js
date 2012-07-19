// JavaScript Document
(function(win){
		var base = {
				tipid:'tip',
				error:[
					'对不起，加载失败！请<a href="javascript:location.href=location.href" title="刷新">刷新</a>',
					'对不起，您输入的内容为空',
					'对不起，您输入的内容过多'
				]
			}
		if($('#'+base.tipid).length === 0){
			 $('body').append('<div id="'+base.tipid+'" class="baseTip"><span class="btBox"></span></div>');
			 base.tipobj = $('#'+base.tipid);
		}
		base.tip = function(msg, time, cb){
			clearTimeout(base.st);
			base.tipobj.hide();
			var cb = cb||function(){}
				base.tipobj.find('span').html(msg)
				base.tipobj.fadeIn();
				if(time || 'undefined' === typeof time){
					var t = time || 3000;
					base.st = setTimeout(function(){
						base.hide();
						cb();
						}, t);
				}
				else cb();
			}
		base.hide = function(){
			 base.tipobj.fadeOut();
			}	
	win.base = base;	
}(window))
