
**如果点进来了，觉得还不错，顺便点个赞吧！**
**本文件夹是九宫格抽奖代码实现。**

### 常见表现形式
常见的抽奖表现有两种，**九宫格**和**转盘**，转盘又有**转动指针**和**转动转盘**两种。
从实现难度上来说， 转盘大于九宫格。

### 一般的实现方式

1. **九宫格**   
   间隔的设置背景色或者蒙层，越往后间隔越大。
2. **转盘**  
      1. **纯脚本控制**：每个一段时间，转动转盘或者指针，越往后，转动越少。
      2. **css动画**： 提前计算旋转角度好，配合css3, 利用好贝塞尔函数，梭哈。


### 一般逻辑处理

1. **动画先行**   
    就是先执行动画，期间去获取结果，然后决定定格在何处。   
2. **结果先行**   
    先获取结果，然后启动动画