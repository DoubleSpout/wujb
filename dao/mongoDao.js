var mongo = _rrest.mongo;
/*
	生成mongodb _id的方法
*/
var genMongoId =  module.exports.genMongoId = function(db, id){
	try{
		return  db.bson_serializer.ObjectID.createFromHexString(id.toString());
	}
	catch(e){
		return false;
	}
}
/*
	mongodcol 方法，从连接池拿到数据库连接，如果没有错误
	参数colname是集合名，必传
	参数callback是回调函数，必传
	返回callback(err,col,release,genMongoId);err为错误，col为mongodb集合，release为归还连接池,genMongoId为生成mongodb _id的方法，传入id字符串
*/
var mongodcol = module.exports.mongodcol = function(colname, callback){
    mongo(function(err, db, release){//操作mongodb数据库
			if(err) return callback(err);//注意:这里只需return，如果有err，rrestjs会自动执行release()，归还连接至连接池!
			db.collection(colname, function(err, col){
				if(err) return release() || callback(err);//注意：如果出错，这里需要您手动执行release()，归还连接至连接池!
				callback(null, col, release, function(id){return genMongoId(db,id);});//如果没有错误，则返回这个集合，第二个参数是释放连接池
			});//collcetion
	});
}