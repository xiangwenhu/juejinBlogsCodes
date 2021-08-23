---
theme: juejin
highlight: a11y-dark
---


## 前言
`Function.prototype.call` 我想大家都觉得自己很熟悉了，**手写也没问题**！！   
你确认这个问题之前， 首先看看 **[三千文字，也没写好 Function.prototype.call](https://juejin.cn/post/6978744007601946654)**,

看完，你感觉还OK，那么再看一道题：    
请问如下的输出结果
```js
function a(){ 
    console.log(this,'a')
};
function b(){
    console.log(this,'b')
}
a.call.call(b,'b')  
```

如果，你也清晰的知道，结果，对不起，大佬， 打扰了，我错了！


本文起源:  
一个掘友加我微信，私聊问我这个问题，研究后，又请教了 **[阿宝哥](https://juejin.cn/user/764915822103079)**。   
觉得甚有意思，遂与大家分享！

## 结果

结果： 惊喜还是意外，还是淡定呢？
```js
String {"b"} "b"
```

再看看如下的代码：2个，3个，4个，更多个的call，输出都会是`String {"b"} "b"`
```js
function a(){ 
    console.log(this,'a')
};
function b(){
    console.log(this,'b')
}
a.call.call(b,'b')  // String {"b"} "b"
a.call.call.call(b,'b')   // String {"b"} "b"
a.call.call.call.call(b,'b')  // String {"b"} "b"
```

看完上面，应该有三个疑问？
1. 为什么被调用的是`b`函数
2. 为什么`this`是 `String {"b"}`
3. 为什么 2, 3, 4个`call`的结果一样


结论：   
两个以上的call，比如`call.call(b, 'b')`，你就简单理解为用 `b.call('b')`


## 分析

### 为什么 2, 3, 4个`call`的结果一样

`a.call(b)` 最终被执行的是`a`,  
`a.call.call(b)`， 最红被执行的 `a.call`   
`a.call.call.call(b)`， 最红被执行的 `a.call.call`  

看一下引用关系
```js
a.call === Function.protype.call  // true
a.call === a.call.call  // true
a.call === a.call.call.call  // true
```
基于上述**执行**分析:    
`a.call` 被调用的是`a`    
`a.call.call` 和 `a.call.call.call` 本质没啥区别， 被调用的都是`Function.prototype.call`。

为什么 2, 3, 4个`call`的结果一样，到此已经**真相**了

### 为什么被调用的是`b`函数

看本质就要返璞归真，ES 标准对 **[Funtion.prototye.call](https://262.ecma-international.org/6.0/#sec-function.prototype.call)** 的描述
> # Function.prototype.call (thisArg , ...args)
> When the `call` method is called on an object `func` with argument, `thisArg` and zero or more `args`, the following steps are taken:
>
>1.  If [IsCallable](https://262.ecma-international.org/6.0/#sec-iscallable)(*func*) is **false**, throw a **TypeError** exception.
> 1.  Let *argList* be an empty [List](https://262.ecma-international.org/6.0/#sec-list-and-record-specification-type).
> 1.  If this method was called with more than one argument then in left to right order, starting with the second argument, append each argument as the last element of *argList*.
> 1.  Perform [PrepareForTailCall](https://262.ecma-international.org/6.0/#sec-preparefortailcall)().
> 1.  Return [Call](https://262.ecma-international.org/6.0/#sec-call)(*func*, *thisArg*, *argList*).

中文翻译一下
1. 如果不可调用，抛出异常
2. 准备一个argList空数组变量
3. 把第一个之后的变量按照顺序添加到argList
4. 返回 [Call](https://262.ecma-international.org/6.0/#sec-call)(*func*, *thisArg*, *argList*)的结果

这里的`Call`只不是是一个抽象的定义， 实际上是调用函数内部 **[\[\[Call\]\]](https://262.ecma-international.org/6.0/#sec-call)** 的方法, 其也没有暴露更多的有用的信息。

实际上在这里，我已经停止了思考   
**[a is a function, then what `a.call.call` really do?](https://stackoverflow.com/questions/34916477/a-is-a-function-then-what-a-call-call-really-do)** 一文的解释，给了光明。

```js
function a() { console.log(1) }
function b() { console.log(2) }
a.call(b)    // 1
a.call.call(b)    // 2
a.call.call.call(b)    // 2
```
我们知道 `a.call(b)` 表示用`b`作为上下文调用`a`。     
`a.call.call(b)` 用`b`作为上下文调用 `Function.prototype.call`,等同于 `Function.prototype.call.call(b)`.

但是`Function.prototype.call.call(b)`不是一个普通函数对象，他是 **[exotic object](https://262.ecma-international.org/6.0/#sec-exotic-object)**, 更准确的说是 **[Bound Function Exotic Objects](https://262.ecma-international.org/6.0/#sec-bound-function-exotic-objects)** 。 

截取两端重要的说明：
1. A *bound function* is an exotic object that wraps another function object.
2. Calling a bound function generally results in a call of its wrapped function.

翻译一下
1. *bound function* 是一种包裹其他函数的特殊对象。
2. 调用绑定函数通常会导致调用其包装函数。

**以及一些特有的属性**
| Internal Slot           | Type                                                                                          | Description                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [[BoundTargetFunction]] | Callable Object                                                                               | The wrapped function object.                                                                         |
| **[[BoundThis]]**           | Any                                                                                           | **The value that is always passed as the this value when calling the wrapped function.**             |
| [[BoundArguments]]      | [List](https://262.ecma-international.org/6.0/#sec-list-and-record-specification-type) of Any | A list of values whose elements are used as the first arguments to any call to the wrapped function.

注意 **[[BoundThis]]**, 传入的`value`被作为`this`.


所以 `Function.prototype.call.call(a)` = `a()`,  
同理：
```js
a.call.call(b,'b')
// 等于
[[ bound funciton b]]('b') // 'b'会作为this
// 等同于
b.call('b')
```

当然，更多关于 Bound Funciton Exotice Objects的信息，请访问 **[Bound Function Exotic Objects](https://262.ecma-international.org/6.0/#sec-bound-function-exotic-objects)**。

###  为什么`this`是 `String {"b"}`
在上一节的分析中，我故意遗漏了`Function.prototype.call`的两个`note`

> **NOTE 1**:  The thisArg value is passed without modification as the **this** value. This is a change from Edition 3, where an **undefined** or **null** thisArg is replaced with the global object and [ToObject](https://262.ecma-international.org/6.0/#sec-toobject) is applied to all other values and that result is passed as the **this** value. Even though the thisArg is passed without modification, non-strict functions still perform these transformations upon entry to the function.

>**NOTE 2**: If `func` is an arrow function or a [bound function](https://262.ecma-international.org/6.0/#sec-bound-function-exotic-objects) then the `thisArg` will be ignored by the function [[Call]] in step 5.


注意这一句：
> This is a change from Edition 3, where an **undefined** or **null** thisArg is replaced with the global object and [ToObject](https://262.ecma-international.org/6.0/#sec-toobject) is applied to all other values and that result is passed as the **this** value

两点：
1. 如果`thisArg`是`undefined` 或者`null`, 会用global object替换
这里的前提是 **非严格模式**
```js
"use strict"

function a(m){
    console.log(this, m);  // undefined, 1
}

a.call(undefined, 1)
```
2. 其他的所有类型，都会调用 [ToObject](https://262.ecma-international.org/6.0/#sec-toobject)进行转换 
所以**非严格模式**下， `this`肯定是个对象, 看下面的代码：  
```js
Object('b') // String {"b"}
```


 为什么`this`是 `Sting(b)` 这个也真相了！
 
### 万能的函数调用方法

基于`Function.prototype.call.call`的特性，我们可以封装一个万能函数调用方法
```js
var call = Function.prototype.call.call.bind(Function.prototype.call);
```

示例
```js
var person = {
    hello() { 
        console.log('hello', this.name) 
    }
}

call(person.hello, {"name": "tom"})  // hello tom
```



## 写在最后
如果你觉得不错，你的一赞一评就是我前行的最大动力。

技术交流群请到 [这里来](https://juejin.cn/pin/6994350401550024741 "https://juejin.cn/pin/6994350401550024741")。 
或者添加我的微信 dirge-cloud，一起学习。



## 引用

> [sec-function.prototype.call](https://tc39.es/ecma262/#sec-function.prototype.call)   
> [Bound Function Exotic Objects](https://262.ecma-international.org/6.0/#sec-bound-function-exotic-objects)   
> [a is a function, then what `a.call.call` really do?](https://stackoverflow.com/questions/34916477/a-is-a-function-then-what-a-call-call-really-do)      
> [Difference between Function.call, Function.prototype.call, Function.prototype.call.call and Function.prototype.call.call.call](https://stackoverflow.com/questions/43424141/difference-between-function-call-function-prototype-call-function-prototype-ca)   
> [Javascript Function.prototype.call()](https://stackoverflow.com/questions/31074664/javascript-function-prototype-call)   
>[Can't use Function.prototype.call directly](https://stackoverflow.com/questions/44490211/cant-use-function-prototype-call-directly)   
> [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)

