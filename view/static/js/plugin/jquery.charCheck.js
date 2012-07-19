// JavaScript Document
(function(win){
	function CharInputCheck(thatobj, val, maxnum, proportion, cb){
		var me = arguments.callee;
		if(!(this instanceof me)) return new me(thatobj, val, maxnum, proportion, cb);
		this.thatobj = thatobj;
		this.val = val;
		this.maxnum = maxnum;
		this.inputnum = 0;
		this.proportion = proportion;
		this.cb = cb;
		this.intial();
		}
	CharInputCheck.prototype = {
		intial : function(){
				this.charcheck(this.val);
			},
		charcheck:function(val, maxnum, proportion, cb){
			var val = val || this.val,
				maxnum = maxnum || this.maxnum,
				proportion = proportion || this.proportion,
				cb = cb || this.cb,
				rstr = function(rate){
						var s = '';
						for (var i=0; i<rate; i++){
							s += '*';
						}
						return s;
					}(this.proportion);
			if($.trim(val) === ''){
					cb.call(this.thatobj, len||0, maxnum);
					return 0;
				}
			var len  = Math.ceil(val.replace(/[^x00-xFF]/g, rstr).length/this.proportion);
			cb.call(this.thatobj, len, maxnum);
			return len;
			}
		}
		
win.charcheck = function(val, maxnum, proportion, cb){//对外方法,判断字符数是否超标,返回以输入字数
	var cb = cb || function(){};
	return CharInputCheck.prototype.charcheck(val, maxnum, proportion, cb);
	};
win.$.fn.charcheck = function(maxnum, proportion, cb){
		var maxnum = maxnum ||100,
			proportion = proportion || 2,
			cb = cb || function(){},
			$that = this;		
			$that.each(function(){
				var check = CharInputCheck(this, $that.val(), maxnum, proportion, cb);
				$(this).bind('keyup', function(){
						var val = $(this).val(),
							len = check.charcheck(val);
					})
			})			
		return $that;
	}
}(window))