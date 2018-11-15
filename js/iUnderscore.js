/*
 *作者：luo
 *时间：2018/11/15 0015
 *Email：hubluo@gmail.com
 *功能：
 */
~function(root,factory,name){
    root._=root[name]=factory(root,name);
}(this,function(){
    var _=function(){
        if(!(this instanceof _)){
            return new _();
        }
    };
    _.uniq=function(){
        console.log("静态方法执行数组去重！");
    };
    _.prototype.uniq=function(){
        console.log("动态方法执行数组去重！");
    }
    return _;
},"_");