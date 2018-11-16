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
    //减少原型链的查询
    var push = Array.prototype.push;

    var _=function(option){
        if(!(this instanceof _)){
            return new _(option);
        }
        this.wrap=option;
    };

    // （1）.遍历 数组  对象
    _.each = function( target, callback ){
        var key,i = 0;
        if( toString.call(target)=="[object Array]" ){
            var length = target.length;
            for( ;i<length; i++ ){
                /*注意它与对象情况下所传参数顺序是不样，这取决于参数重要性来决定的
                 * 数组时：值要比下标用到的比重要大，而对象时：键名比值的权重大。
                 * */
                callback.call( target, target[i], i );//参数顺序：value值，index下标；
            }
        } else {
            for( key in target ){
                console.log(target.hasOwnProperty(key),key);
                target.hasOwnProperty(key)&&callback.call( target, key, target[key] );//参数顺序：key键，vaule值；
            }
        }

    }

    //mixin   _   遍历  数组
    _.mixin = function( obj ){
        _.each( obj, function( name ){
            //获取静态方法
            var func = obj[name];
            //（2）.扩展原型方法
            _.prototype[name] = function(){
                var args = [this.wrap];
                //（3）.数组合并,拼接静态方法所需参数：参数1-this.wrap，参数2-arguements。
                push.apply( args, arguments );
                //执行静态方法
                return func.apply( this, args );
            }
        });
    };

    ~function(_){
        /*类型检测*/
        _.each(["Function", "String", "Object" , "Number","Array"], function( name ){  //key  value
            _["is"+name] = function( obj ){
                return toString.call( obj ) === "[object "+name+"]";
            }
        });
    }(_);

    ~function(_){
        /*数组操作*/
        _.uniqTest=function(){
            console.log("静态方法去重测试！");
        };
        _.uniq=function(target,callback){
            //简化版去重
            var result = [];
            for( var i=0; i<target.length; i++ ){
                var computed = callback ? callback(target[i]) : target[i];
                if(result.indexOf(computed) === -1 ){
                    result.push(computed)
                }
            }
            return result;
        };

    }(_);
    _.mixin( _ );
    return _;
},"_");