## 综述

（作者：函谷，版本：2.0.0）

digitalScroll是利用改变背景的图片位置实现的数字滚动组件，主要用来展示一些数字的动态效果。

digitalScroll的动画效果是基于[LayerAnim](http://kg.kissyui.com/layer-anim/2.0.0/guide/index.html)实现的。


## 演示

[查看Demo](http://kg.kissyui.com/digitalScroll/2.0.0/demo/index.html)


## 浏览器兼容性（Broswer Support）

兼容所有主流浏览器：

* Chrome
* InternetExplorer 6-9
* Firefox
* Safari

## 实现原理

digitalScroll是通过改变背景图片的backgroundPositionY的值来实现数字的滚动动画效果的。目前支持两种模式：循环模式和过渡模式。

* 循环模式：原理很简单，就不赘述了。
* 过渡模式：通过循环播放一段模糊效果的图片实现过渡的效果。可以设置最少循环次数。保证过渡动画的持续时间，让用户一定能看到过渡的效果。也可以设置最大的循环次数，执行完毕后自动停止。开发者也可调用stop方法主动停止过渡动画，显示最终结果。例如[Demo](http://kg.kissyui.com/digitalScroll/2.0.0/demo/index.html)中的双色球摇奖器。

**需要注意的是：**

* 所有数字的背景图片必须有相同的backgroundPostionX，即在图片中必须排成一列
* 在循环模式中为了不出现跳帧的现象，需要将图片循环一遍。查看[实例图片](http://img01.taobaocdn.com/tps/i1/T1u2ioXpJhXXbYQlri-18-480.png)
* 在过渡模式中，过渡的图片需要与数字保持相同的backgroundPostionX。查看[实例图片](http://img03.taobaocdn.com/tps/i3/T17.4mFdVhXXaynojr-2.0.0-3198.png)

## 使用手册

```javascript
S.use('kg/digitalScroll/2.0.0/index', function (S, DigitalScroll) {
{
    ds = new DigitalScroll({
		data: [1,2,3,4,5,6],                          // 初始化数据
		nodeList: nodeList,                           // 动画节点列表
		durationList: 0.3                             // 动画时间列表
	});
});
```

上述例子是一个最简单的实现，会在0.3秒内让nodeList的数字从 000000 滚动到 123456 。

## API手册

### 配置参数说明

- nodeList {HTMLNodeList}

	动画DOM节点数组，必选。

- durationList {Number|Array}

	动画时间（秒）。必选。为Number时表示所有的节点会在相同的时间内执行完毕。如果设置不同的时间，需要设置为数组，数组长度与nodeList保持一致。
  	
- data {Array}
	
	初始化数据。可选。必须为数组，数组长度与nodeList保持一致。

- exec {Object}
	
	初始化执行配置。可选。可设置是否自动执行以及延时时间，在data不为空时有效。
	
	- auto：是否自动执行。默认为true 
	- delay：延时时间（秒）。默认为0.1
	
- mode {Number}
	
	动画模式。可选。1为循环模式，2为过渡模式。默认为1。在transition参数存在是会自动设为2。
	
- uHeight {Number}

	滚动单元高度。可选。默认为nodeList每个node的高度。

- easing {String}

	动画效果。可选。默认为"Linear.easeNone"。支持的动画效果请参考 [LayerAim开发接口](http://kg.kissyui.com/layer-anim/2.0.0/guide/index.html#开发接口（API）)
	
- fixed {Number}

	backgroundPositionY高度修正。可选。默认为0。 当 i 的backgroundPositionY 为 i * uHeight 时可以不设置此值，否则需要进行修正。

- delayList {Array}
			
	节点动画延时列表。可选。默认为0。当需要让各个节点不同时开始动画时设置，必须为数组，数组长度与nodeList保持一致。
			
- rangeList {Array}	

	节点动画范围列表。可选。默认为10。当数字滚动的范围不是10时设置，必须为数组，数组长度与nodeList保持一致。只在循环模式有效。例如时间节点需要设置为[6, 10]
	
- transition {Object}
	
	过渡动画对象，可选。
	
	- minY：过渡动画图片backgroundPositionY最小高度
	- maxY：过渡动画图片backgroundPositionY最大高度
	- minRepeat：过渡动画最少循环个数
	- maxRepeat：过渡动画最大循环个数
	- duration：过渡动画单次执行时间
	
### 方法

- destroy()

   销毁对象

   * 返回值：

      {null} 
   
- reset(data)

   重新设置数据。
   
   * 参数：
   
      data {Array}：新的数据数组。【可选参数，为空时为复位功能】
   
   * 返回值：

      {DigitalScroll} this对象，以支持链式调用。

- start(trend)

   开始播放动画。从当前显示的值滚动到数据所设置的值。
   
   * 参数：
   
      trend {Boolean}：是否反向播放。【可选参数，默认为false】

   * 返回值：

      {DigitalScroll} this对象，以支持链式调用。

- stop(end)

   停止（过渡）动画。
   
   * 参数：
   
      end {Boolean}：是否停止所有动画，直接显示最终结果。【可选参数，默认为false】

   * 返回值：

      {DigitalScroll} this对象，以支持链式调用。

- isRunning()

   返回当前动画播放状态。

   * 返回值：

      {Boolean} 是否正在播放。
      
### 事件

- error()

   当参数或数据格式设置错误时，触发该事件。
   
- reset()

   当源数据被修改时触发该事件。
   	
   - newVal: 新值
   - oldVal: 旧值
   
- end()
	
   当动画结束时触发该事件。   	   

