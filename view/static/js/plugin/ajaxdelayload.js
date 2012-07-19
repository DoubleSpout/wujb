(function(win){
	
function AjaxDelay(settings){
        	this.doing = false;
        	this.settings = settings;
            this.start = 1;
            this.unbind = false;
            this.$that = settings.self;
            this.endfuc = function(){return this.start+this.settings.number};
            this.go();
            if(this.settings.defaultsend) this.send(this.gendata(this.settings.send_data));
            }
        AjaxDelay.prototype.send = function(sdata){ //后台ajax获取数据
        	var selfme = this;
           selfme.doing = true;
           $.ajax({
  			 type: selfme.settings.send_method,
  			 url: selfme.settings.send_url,
  			 data: sdata,
  			 dataType:selfme.settings.send_dataType,
  			 timeout:6000,
  			 error:function(){selfme.settings.fail_cb(selfme);},
  			 beforeSend:function(){selfme.settings.before_cb(selfme);},
 			 success: function(data){
    			 if(selfme.settings.complete_cb(data, selfme) === true) selfme.bind();
    			 selfme.start += selfme.settings.number;
    			 selfme.doing = false;
  			 }
			});
        }; 
        AjaxDelay.prototype.gendata =function(obj){ //生成json字符串拼装数据
        	var strary = [],
        		json_str;
        	for(var i in obj){
        		json_str = '"'+i+'":';
        		if (typeof obj[i] == 'object') json_str += arguments.callee(obj[i]);
        		else if(typeof obj[i] == 'number') json_str += obj[i];
        		else json_str += '"'+obj[i].toString()+'"';
        		strary.push(json_str);
        	}
        	json_str = '{'+strary.join(',')+'}';
        	json_str = json_str.replace('$start', this.start);
        	json_str = json_str.replace('$end', this.endfuc());
        	return $.parseJSON(json_str);
        }
  		AjaxDelay.prototype.check = function(){ //判断是否要去获取数据
  			if(this.doing) return false;
  			var now_h = this.$that.height() + this.$that.scrollTop(),
  				box_h = this.settings.scroll_box.height();
  			if(box_h - now_h <= this.settings.scroll_bottom) return true;
  			return false;		
  		}
        AjaxDelay.prototype.bind = function(bl, cb){ //绑定和解除绑定函数
        	var cb = cb || function(){},
        		that = this;
  			if(bl) this.$that.bind('scroll', function(){
  				if(!that.unbind) cb();				
  				})
  			else that.unbind = true;
  		}   
        AjaxDelay.prototype.go = function(){ //初始化函数
        	var that = this;
        	that.bind(true, function(){
        		if(that.check()) that.send(that.gendata(that.settings.send_data));
        	})
        }	
		
$.fn.AjaxScrollLoad = function(options) {
         var  self = this,  //此处的this为jquery对象
		 	  settings = {
         			 send_url:'/?r=ajaxchannel/run',
         			 send_method:'POST',
                     send_data: {"a":"gettopchannels","m":"channel","start":"$start", "end":"$end"},  //向后端发送的数据
                     send_dataType:'json',
                     number : 10,          //获取条数
                     before_cb:function(){},   //加载ajax发送前回调
                     complete_cb:function(){},  //加载完成回调函数,注意，当return true时认为完毕，取消绑定
                     fail_cb:function(){}, //ajax失败加载回调函数
                     scroll_bottom:500, //当距离底部500像素触发
                     scroll_box:$('body'), //默认滚动条的dom是body
                     defaultsend:true, //默认发送ajax请求
                     self:this //jquery的this对象
                };
        $.extend(settings, options||{});

        
   var ad = new AjaxDelay(settings);
   return self;
  }
}(window));