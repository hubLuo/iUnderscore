/*
 *作者：luo
 *时间：2018/11/15 0015
 *Email：hubluo@gmail.com
 *功能：
 */
~function(root,factory,name){
    // 服务端模块化---commonjs标准---模块入口module.exports
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        //客户端模块化---seajs(CMD)/Requirejs(AMD)---模块入口define()
        typeof define === 'function' && define.amd ? define(factory) :
            //非模块化客户端
            (root._=root[name]=factory());
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