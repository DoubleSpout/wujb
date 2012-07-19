var tools = {},
	crypto = require('crypto'),
	fs = require('fs');
tools.fdate = function(format, timestamp){	
	var format = typeof format === 'undefined'?false:format.toLowerCase(),
		t = timestamp?new Date(timestamp) : new Date(),
		time = t.getFullYear()+"-"+(t.getMonth()+1)+"-"+t.getDate();
	if(format === 'y-m-d h:m:s'){
		var h = t.getHours()-0>9?t.getHours():'0'+t.getHours();
		var m = t.getMinutes()-0>9?t.getMinutes():'0'+t.getMinutes();
		var s = t.getSeconds()-0>9?t.getSeconds():'0'+t.getSeconds();

		time += ' '+h+":"+m+":"+s; 
	}
	return time;
};
tools.checkeuid = function(str){
	var reg = /^[A-Za-z0-9]{24,24}$/;
	return reg.test(str);
}

tools.checkemail = function(str){
	var reg = /^\w+((-|\.)\w+)*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
	return reg.test(str);
}
tools.checkpwd = function(str){
	if(str.length>30) return false;
	return true;
}
tools.checkdesc = function(str){
	if(str.length>100) return false;
	return true;
}
tools.checkname = function(str){
	var reg = /[(\u4e00-\u9fa5)a-zA-z0-9_-]{2,12}$/;
	return reg.test(str);
}
tools.htmltostring = function(text){
	text = text.replace(/&/g, "&amp;");
	text = text.replace(/"/g, "&quot;");
	text = text.replace(/</g, "&lt;");
	text = text.replace(/>/g, "&gt;");
	text = text.replace(/'/g, "&#146;");
	return  text;
}
tools.check_all_param = function(){
	var arg = [].slice.apply(arguments, [0, arguments.length]);
	for(var i=0;i<arg.length;i++){
		if(typeof arg[i] == 'undefined') return false;
	}
	return true;
}
tools.check_data = {}
tools.check_data.check_int = function(d){
	if(parseInt(d) != d) return false;
	return true;
}
tools.check_data.check_len = function(d, exlen){
	if(d.length != exlen) return false;
	return true;
}
tools.check_data.check_maxlen = function(d, maxlen){
	if(d.length > maxlen) return false;
	return true;
}
tools.check_img = function(type){
	if(~type.indexOf('gif')) return 'gif';
	if(~type.indexOf('jpg')) return 'jpg';
	if(~type.indexOf('jpeg')) return 'jpeg';
	if(~type.indexOf('png')) return 'png';
	return false;
}

tools.get_id = function(db, string){//生成mongodb _id
	return db.bson_serializer.ObjectID.createFromHexString(string);
}
tools.addstar = function(str, tag){
	var tag = tag || '@',
		header = str.slice(0,1),
		tail = str.split(tag)[1].slice(-2);
	return header +'***'+tail
}

/**
 * Return md5 hash of the given string and optional encoding,
 * defaulting to hex.
 *
 *     utils.md5('wahoo');
 *     // => "e493298061761236c96b02ea6aa8a2ad"
 *
 * @param {String} str
 * @param {String} encoding
 * @return {String}
 * @api public
 */
tools.md5 = function(str, encoding){
  return crypto
    .createHash('md5')
    .update(str)
    .digest(encoding || 'hex');
}
/**
 * Merge object b with object a.
 *
 *     var a = { foo: 'bar' }
 *       , b = { bar: 'baz' };
 *     
 *     utils.merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api private
 */

tools.merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};
module.exports = tools;


