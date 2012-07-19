$(function(){


//intial
	var bgimg = $('#iPbg'),
		loading = $('#loading'),
		tip = $('#iTips'),
		iewrap = $('#ieWrap'),
		iebody = $('#ieBody'),
		wrap = $('#iWrap'),
		screenh = document.documentElement.clientHeight || document.body.clientHeight;
		screenw = document.documentElement.clientWidth || document.body.clientWidth;
	$('#iWantPwd').click(function(){
			$(this).unbind('click');
			$(this).hide();
			$('#iEmail').animate({left:0},500, 'easeOutCubic');
			$('#iSubmit').animate({right:0},500, 'easeOutCubic' ,function(){
					$('#iPwd').fadeIn()
				});
			return false;
	});
	$('#iForm').hover(function(){
		tip.show();
		}, function(){
			tip.hide();
			});
	$('.iForm input').focus(function(){$(this).parent().addClass('iiBoxh');})
			  .blur(function(){$(this).parent().removeClass('iiBoxh');});
	$('#explorer').click(function(){
			var data,
				suc = 0,
				putdata = function(data){
						iewrap.html(data);
						loading.hide();
						$('#ieBox').fadeIn();
				};
			$.get('/index/explorer', function(d){
				data = d;
				if(d.status === 1 && ++suc ===2) putdata(data.data);
				else if(d.status === 0) base.tip(base.error[0]);
				}).error(function(){
						base.tip(base.error[0]);
					});
			wrap.animate({"margin-top":-1*screenh}, 500,  'easeOutCubic', function(){
				wrap.hide()//.css('top', -300)
				loading.show();
					if(++suc ===2) putdata(data.data);
				});
			iebody.fadeIn(800);			
		});
		$('#ieBack').click(function(){
			iebody.animate({"margin-top":screenh, opacity:0}, 800, function(){
						$(this).hide().css({"margin-top":0, opacity:100});
						iewrap.html('');
					})
			wrap.show().animate({"margin-top":0}, 600, 'easeOutCubic');	

		});
//load over
	loading.hide();
	
	bgimg.css('width',screenw+'px')
bgimg.fadeIn('normal', function(){
	$('#iForm').fadeIn('normal', function(){
			$('#iFoot').fadeIn();
			var errstr = $.trim($('#err').val());
			if(errstr !== '') base.tip('<span class="pbg tipres tiperr">'+errstr+'</span>')
		});
	});
$('#iLoginForm, #iLoginForm2').submit(function(){
	var val = $(this).find('input[name="email"]').val();
	var reg = /^\w+((-|\.)\w+)*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
	if(!reg.test(val)){
		base.tip('<span class="pbg tipres tiperr">邮箱格式有误</span>');
		return false;
	}
	return true
})
//intial

});