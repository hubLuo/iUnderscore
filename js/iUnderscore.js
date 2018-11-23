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
                //console.log(target.hasOwnProperty(key),key);
                target.hasOwnProperty(key)&&callback.call( target, key, target[key] );//参数顺序：key键，vaule值；
            }
        }

    }

    //（4.2）创建一个带有链式调用属性的新实例
    _.chain = function( obj ){
        //var instance = _( obj );
        var instance = (this instanceof _) ?this:_( obj );
        //var instance = this;
        //instance._chain = true;   //_chain 标识当前的实例对象支持链接式的调用
        return instance;
    }

    //（4.1）中间辅助函数  result(实例对象, 处理好数据最终的结果 )
    var result = function( instance, obj ){
        //不调用链式则返回结果，否则返回由结果为参数的新实例_(obj),且带有_chain属性为true的新实例_(obj).chain()。
        //我们可以看到当链式调用时，实际上是创建了2次新实例，一次为了传结果，一次是为了设置_chain属性为true;
        //return instance._chain ?_(obj).chain() : obj;
        instance !==obj&&(instance.wrap=obj);
        return instance;
    }
    //返回结果
    _.prototype.value = function(){
        return this.wrap;
    }
    //mixin   _   遍历  数组
    _.mixin = function( obj ){
        _.each( obj, function( name ){
            //获取静态方法
            var func =_[name]=obj[name];
            //（2）.扩展原型方法
            _.prototype[name] = function(){
                var args = [this.wrap];
                //（3）.数组合并,拼接静态方法所需参数：参数1-this.wrap，参数2-arguements。
                push.apply( args, arguments );
                //执行静态方法
                /*this.wrap=func.apply( this, args )
                return this;*/
                return result(this,func.apply(this,args));//（4）.中间函数来处理实例对象和执行结果
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
        /*迭代器*/
        _.forEach=function(tar,cb,star,dir){
            //增强数据源遍历:1循环控制,2循环起点控制,3循环方向和递增大小控制,4统一对象和数组遍历
            var keys= toString.call(tar)!=="[object Array]" &&tar.length===void 0&& _.keys(tar);
            var execute=true,cb=cb||function(){},star=star||0,dir=dir||1;
            var length=keys?keys.length:tar.length,star=Math.min(Math.max(0,star),length-1);//star是0到length-1的值
            var index=dir>0?star:(length-1)-star;
            var curValue,curKey;
            for(;execute!==false&&index>=0&&index<length;index+=dir){
                curKey=keys?keys[index]:index;
                curValue=tar[curKey];
                execute=cb(curValue,curKey,tar);
            }
        };
        //获取对象键
        _.keys=function(obj){
            //允许错误
            var type=toString.call(obj),nativeKeys=Object.keys;
            if( type!=="[object Object]"&& type!=="[object Function]"  ){ return [] };
            //获取对象键
            if(nativeKeys){
                return nativeKeys(obj);
            }
            var keys=[];
            for(var i in obj){
                keys.push(i);
            }
            // IE9 兼容性的问题   不可枚举属性的集合
            collect( obj, keys );
            return keys;
        };
        function collect( obj, keys ){
            // hasEnumBug   true IE9>
            var hasEnumBug = {valueOf: null}.propertyIsEnumerable('valueOf');
            if(hasEnumBug){return keys};
            var noEnumProps = ["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"];
            var nElen =  noEnumProps.length,
                constructor = obj.constructor,   //构造函数
                proto = constructor.prototype || Object.prototype;;   //原型对象
            while( nElen-- ){
                var key = noEnumProps[nElen];
                if( key in obj &&obj[key] !== proto[key] ){
                    keys.push(key);
                }
            }
        }

        _.iterate=function(cb, context, args){
            var type=toString.call(cb);
            //1.类型迭代器类型判断,执行相应操作；
            if(cb==null){
                //注意包括了undefined，隐式转换后它们相同。
                return function( value ){return value;}
            }
            switch(type){
                case "[object Function]":
                    //2.优化迭代器传参和上下文
                    return _.optimizeCb( cb, context, args);
                    break;
                case "[object String]":
                    //字符串作为属性名在数据源中查询该属性名的值，并放入新数组，最后返回该数组。
                    break;
                case "[object Object]":
                    //对象作为值，与数据源(对象,数组)中每项值进行比较，相同的返回true,反之为false, 并将结果放入新数组，最后返回该数组。
                    break;
                case "[object Array]":
                    break;
            }
        };
        _.optimizeCb=function( func, context, args){
            //优化迭代器传参和上下文
            //context 是否有值  上下文对象是否设置
            var context=context == void 0?null:context;
            return function(){
                return func.apply(context,arguments);
            }
        };
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
        _.map = function( obj, iterator, context ){
            //生成不同功能迭代器   函数
            var iterator = _.iterate(iterator,context);   //return function(){}
            var result=[];
            _.forEach(obj,function(value,i,tar){
                result.push(iterator(value,i,tar));
            });
            return result;
        }
        /*
         createReduce  工厂函数生成reduce
         */
        var createReduce = function( dir ){
            //缩减遍历
            var reduce = function( obj, iteratee, memo, init ){
                var start= 0,obj=obj||[];
                if(!init){
                    //如果没有传memo则使用数据源第一项
                    var keys= toString.call(obj)!=="[object Array]" &&obj.length===void 0&& _.keys(obj);
                    var firstKey = dir>0 ? 0 : length-1;   //确定累加的方向
                    memo = obj[keys ? keys[firstKey] : firstKey];
                    start+=Math.abs(dir);   //1
                };
                _.forEach(obj,function(curValue,curKey,tar){
                    memo = iteratee(memo, curValue, curKey, tar )
                },start,dir);
                return memo;
            }
            //memo  最终能累加的结果     每一次累加的过程
            return function( obj, iteratee , memo, context ){
                //init    初始化了memo
                var init = arguments.length>= 3;
                return reduce( obj, _.optimizeCb(iteratee, context, 4), memo, init );
            }
        }
        _.mixin({
            times:function(n,iteratee,context){
                var result = Array(Math.max(0,n));
                iteratee = _.optimizeCb( iteratee, context, 1 );   //itertee
                for(var i=0;i<n;i++){
                    result[i]=iteratee(i);
                }
                return result;
            },
            reduce:createReduce( 1 )   //1 || -1    dir
        });
    }(_);

    ~function(_){
        /*
         包装器  包装函数fn  使他支持rest参数
         */
        _.restArgs = function( fn ){  //fn  add 源函数
            return function(){    //参数传递  arguments  实参
                // arguments  ?
                var argsLen = fn.length;   //3
                var startIndex = argsLen-1;  //2  rest 位置
                //为rest 参数开辟数组存储实参
                var args = Array(argsLen);
                //rest 参数
                var rest = Array.prototype.slice.call(arguments,startIndex);
                //单一参数的处理
                for(var i=0; i<startIndex; i++ ){  //2
                    args[i] = arguments[i];
                }
                //["zs","ls",["wlw", "lmz"]]  ["形参","形参",["rest[0]", "rest[1]"]]
                args[startIndex] = rest;
                return fn.apply(this, args );   //this  window
            }
        }
    }(_);

    ~function(_){
        //需要逃逸字符
        var escapeMap = {   //对象.属性
            "<" : "&lt;",
            ">" : "&gt;",
            "&" : "&amp;",
            '"' : "&quot;",
            "'" : "&#39;"
        }

        var createEscaper = function(map){
            //逃逸
            var escaper = function(match){
                return map[match];
            }

            //创建正则表达式    _.keys(Map).join('|')
            //| 逻辑或
            //["<",">"]   "<"|">"|...
            var exp = '(?:' + _.keys(map).join('|') + ')';
            console.log(exp)
            var testExp = new RegExp(exp);
            var replaceExp = new RegExp(exp, "g");

            return function( string ){
                console.log( string )
                string = string == null ? '' : ''+string;
                console.log(testExp.test( string ))   //？
                return testExp.test( string ) ? string.replace(replaceExp,escaper) : string;
            }
        };

        _.escape = createEscaper(escapeMap);

    }(_);
    _.mixin( _ );
    return _;
},"_");