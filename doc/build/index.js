/*
combined files : 

kg/digitalScroll/2.0.0/index

*/
/**
 * @fileoverview 
 * @author 函谷<hangu.mh@taobao.com>
 * @module digitalScroll
 **/
KISSY.add('kg/digitalScroll/2.0.0/index',function (S, DOM, Base, Anim) {
	'use strict';
	
	var isGecko = (S.UA.gecko > 0),   // 判断是否Firefox， Firefox 不支持backgroundPositionY
		EVENT_RESET = 'reset',
    	EVENT_ERROR = 'error',
    	EVENT_END = 'end';
	
	/**
     * 基于Layer-Anim的数字滚动组件
     * @class DigitalScroll
     * @constructor
     * @extends Base
     */
    function DigitalScroll(config) {
        //调用父类构造函数
        DigitalScroll.superclass.constructor.call(this, config);
        this.initializer();
    }

    S.extend(DigitalScroll, Base, /** @lends DigitalScroll.prototype*/{
    	
    	/**
         * 初始化
         * @method initializer
         */
    	initializer: function (){
    		var self = this,
    			data = self.get('data'),
    			nodeList = self.get('nodeList'),
    			durationList = self.get('durationList'),
    			uHeight = self.get('uHeight'),
    			exec = self.get('exec'), msg = [];
    		
    		// 判断必选参数 nodeList，durationList
    		if (nodeList == null) {
    			msg.push('error: missing parameter nodeList');
    		} else if (! S.isArray(nodeList)) {
    			msg.push('error: error parameter nodeList');
    		} 
    		
    		if (durationList == null) {
    			msg.push('error: missing parameter durationList');
    		} else if (! S.isArray(durationList)) {  // 扩展为数组
    			durationList = self._buildArray(durationList);
    			self.set('durationList', durationList);
    		}
    			
    		if (nodeList.length != durationList.length) {
    			msg = 'error: nodeList and durationList must hava same length';
    		}
    		
    		if (msg.length) {
	    		self.fire(EVENT_ERROR, {
					msg: msg
				});
    			return;
    		}
    		
    		if (! uHeight) {
    			self.set('uHeight', DOM.height(nodeList));	
    		}
    		
    		self._oldData = this._buildArray();
    		if (data && exec.auto) {  // 是否自动执行
    			setTimeout(function() {
	            	self.start();   
	            }, exec.delay * 2.0.00);
    		}
    		
    		return self;
        },
        
        destroy: function() {
        	this.stop();
        	this.detach();
          
        	delete this._reverse;
        	delete this._transitionTag;
        	delete this._transitionIndex;
        	delete this._delayStop;
        	delete this._oldData;
              
            this.set('nodeList', null);
            this.set('durationList', null);
            
            return null;
        },
        
        // -- Public Methods -------------------------------------------------------
        /**
    	 * 重设数据
    	 */
    	reset: function(data) {
    		var self = this;
    		
    		if (! data) {   // 无参数时为复位功能
    			data = this._buildArray();
    		}
    		
    		if (
    			self.set('data', data, {
    				error: function() {
    					self.fire(EVENT_ERROR, {
    						msg: 'error: error parameter data, must be array'
    					});
    				}
    			})) {
    			self.fire(EVENT_RESET, {
        			newVal: data,
        			oldVal: self._oldData
        		});
    		}
     		
    		return self;
    	},
    	
    	/**
    	 * 开始动画
    	 * 
    	 */
    	start: function(trend) {
    		this._reverse = (! trend) ? false : true;
    		this.stop()._execTransition();
    		
    		return this;
    	},
    	
    	/**
    	 * 停止动画
    	 * @param end{boolean} 是否马上停止所有动画，默认为false
    	 */
    	stop: function(end) {
    		if (end) {
    			this._stopTransition().end();
    			this.set('status', false);      // 运行中标志
    			this.fire(EVENT_END);
    			return this;
    		}
    		
    		if (this._transitionTag) { // 如果过渡动画在执行中
        		var transition = this.get('transition');
    			if (this._transitionIndex < transition.minRepeat) {  //小于最小循环次数则在执行完之后再终止动画，标记_delayStop = true
    				this._delayStop = true;
				} else {    // 否则立即停止过渡动画
					this._stopTransition();
				}
    		}
    		
    		return this;
    	},
    	
    	/**
    	 * 动画是否执行
    	 */
    	isRunning: function() {
    		return this.get('status');
    	},
        
    	// -- Protected Methods -------------------------------------------------------
    	
    	/**
    	 * 构建一个的数组 
    	 */
    	_buildArray: function(value) {
    		var data = [];
			S.each(this.get('nodeList'), function() {
				data.push(value ? value : 0);
			});
			return data;
    	},
    	
    	/**
    	 * 执行过渡动画
    	 * 如果没有过渡动画配置，则直接执行滚动动画
    	 */
    	_execTransition: function() {
    		var transition = this.get('transition');
    		if (! transition) {   // 无过渡动画配置
    			this._execMain();
    			return;
    		}
    		
    		var anim = this._buildTransition(),   // 构建过渡动画  
    			nodeList = this.get('nodeList'); 
    		this.set('status', true);             // 设置动画状态为运行中
    		if (anim) {
    			this._transitionTag = true;    // 过渡动画标记
    			this._transitionIndex = 1;
    			// 执行过渡动画
    			anim.run();
    		} else {
    			this._execMain();
    		}
    	},
    	
    	/**
    	 * 结束动画循环
    	 */
    	_stopTransition: function() {
    		this.transitionAnim.stop();
    		this._transitionTag = false;
    		this._delayStop = false;
    		this._transitionIndex = 1;
    		return this._execMain();
    	},
    	
    	/**
    	 * 创建过渡动画循环
    	 */
    	_buildTransition: function() {
    		var self = this, 
    			nodeList = this.get('nodeList'), 
    			transition = this.get('transition'), 
    			queue = [],  anim;	
    		
    		if (this.transitionAnim) {
    			return this.transitionAnim;
    		}
    		
    		this._delayStop = true;    // 首次只执行最少循环
    		this.set('mode', 2);       // 有过渡动画则自动设置mode为2
			S.each(nodeList, function(node) {
    			if (! isGecko) {   // for firefox
    				queue.push({
    					node: node,
    	        		from: {
    	        			backgroundPositionY: '-' + transition.minY + 'px'   
    	        		},
    	        		to: {
    	        			backgroundPositionY: '-' + transition.maxY + 'px'   
    	        		},
    	        		duration: transition.duration      // 过渡动画单个循环时间
    				});
    			} else {
    				var posX = DOM.css(node, 'backgroundPosition').split(' ')[0];
    				queue.push({
    					node: node,
    	        		from: {
    	        			backgroundPosition: posX + ' -' + transition.minY + 'px'   
    	        		},
    	        		to: {
    	        			backgroundPosition: posX + ' -' + transition.maxY + 'px'   
    	        		},
    	        		duration: transition.duration      // 过渡动画单个循环时间
    				});
    			}
			});
			anim = this.transitionAnim = new Anim(queue);
        	anim.on('end', function() {
        		if (self._delayStop && self._transitionIndex >= transition.minRepeat) {   // 当_delayStop为true时与minRepeat比较，大于则停止动画
        			self._stopTransition();
        		} else if (self._transitionIndex >= transition.maxRepeat) {    // 否则与maxRepeat比较，大于则停止动画
        			self._stopTransition();
        		} else {                                 // 否则执行动画循环
	        		self._transitionIndex ++;
	        		anim.rerun();   // 重新开始执行
        		}
        	});
        	return anim;
    	},
    	
    	/**
    	 * 执行主流程
    	 */
    	_execMain: function() {
    		var self = this, 
    			mode = this.get('mode'),
    			data = this.get('data'),
    			uHeight = this.get('uHeight'),
    			nodeList = this.get('nodeList'), 
    			durationList = this.get('durationList'), 
    			delayList = this.get('delayList'),
    			easing = this.get('easing'),
    			fixed = this.get('fixed'),
    			queue = [], posY, anim;	
    		// 计算要滚动到的高度
    		if (mode == 1) {    // 循环模式
    			//判断数据变化趋势
    			var rangeList = this.get('rangeList'),
    				oldData = this._oldData,
    				reverse = this._reverse;
    			
    			if (oldData && (oldData.join('-') == data.join('-'))) {  // 若数字未改变，直接返回
    				return;
    			}
    			this._oldData = data;   
    			S.each(nodeList, function(node, i) {
    				var valNew = data[i], valOld = oldData ? oldData[i] : 0, range = rangeList ? rangeList[i] : 10, base = range * uHeight, _posY;
					// 计算位置
					if (reverse) {   // 数字从大变小
						posY = - valNew * uHeight + fixed;                      // 变化后的坐标
						_posY = - valOld * uHeight - ((valOld >= valNew) ? 0 : base)  + fixed;  // 变化前的坐标
					} else {
						posY = - valNew * uHeight - ((valOld <= valNew) ? 0 : base) + fixed;  // 变化后的坐标
						_posY = - valOld * uHeight + fixed;          // 变化前的坐标
					}
    				if (! isGecko) {   // for firefox
    					queue.push({
    						node: node,
    		        		from: {
    		        			backgroundPositionY: _posY + 'px'   
    		        		},
    		        		to: {
    		        			backgroundPositionY: posY + 'px'  
    		        		},
    		        		delay: delayList ? delayList[i] : 0,
    		        		duration: durationList[i],
    	        			easing: easing   
    					});
        			} else {
        				var posX = DOM.css(node, 'backgroundPosition').split(' ')[0];
        				queue.push({
        					node: node,
        	        		from: {
        	        			backgroundPosition: posX + ' ' + _posY + 'px'  
        	        		},
        	        		to: {
        	        			backgroundPosition: posX + ' ' + posY + 'px'  
        	        		},
    		        		delay: delayList ? delayList[i] : 0,
        	        		duration: durationList[i],
                			easing: easing   
        				});
        			}
    			});
    		} else if (mode == 2) {    // 过渡模式
    			S.each(nodeList, function(node, i) {
    				posY = - data[i] * uHeight + fixed;
    				if (! isGecko) {   // for firefox
    					queue.push({
    						node: node,
    		        		from: {
    		        			backgroundPositionY: '0px'   
    		        		},
    		        		to: {
    		        			backgroundPositionY: posY + 'px'  
    		        		},
    		        		delay: delayList ? delayList[i] : 0,
    		        		duration: durationList[i],
    	        			easing: easing   
    					});
        			} else {
        				var posX = DOM.css(node, 'backgroundPosition').split(' ')[0];
        				queue.push({
        					node: node,
        	        		from: {
        	        			backgroundPosition: posX + ' 0px'  
        	        		},
        	        		to: {
        	        			backgroundPosition: posX + ' ' + posY + 'px'  
        	        		},
    		        		delay: delayList ? delayList[i] : 0,
        	        		duration: durationList[i],
                			easing: easing   
        				});
        			}
    			});
    		}
			anim = new Anim(queue);
			anim.on('end', function() {
				self.set('status', false);      // 运行中标志
				self.fire(EVENT_END);
			});
			anim.run(true);
			return anim;
    	}
    }, {
    	ATTRS : /** @lends DigitalScroll*/{
	        /**
	         * @attribute data
	         * @description 数据源
	         * @type Array
	         */
	        data: {
	        	value: null,
	        	validator: function(a) {
	                if (! S.isArray(a)) {
	                    return false;
	                }
	                var d = this.get('data');
	                if (d && a.length != d.length) {
	                	return false;
	                }
	                return true;
	            }
	        },
	        
	        /**
	         * @attribute nodeList
	         * @description 节点列表
	         * @type Array
	         */
	        nodeList: {
	        	value: null
	        },
	        
	        /**
	         * @attribute durationList
	         * @description 动画时间列表
	         * @type Array
	         */
	        durationList: {
	        	value: null
	        },
	
	        /**
	         * @attribute delayList
	         * @description 动画延迟列表
	         * @type Array
	         */
	        delayList: {
	        	value: null
	        },
	
	        /**
	         * @attribute rangeList
	         * @description 范围列表，在循环模式时生效，默认为[10,10,10...]
	         * @type Array
	         */
	        rangeList: {
	        	value: null
	        },
	        
	        /**
	         * @attribute mode
	         * @description 滚动模式：1-循环模式；2-过渡模式。默认为1 
	         * @type Number
	         * @default 1
	         */
	        mode: {
	        	value: 1
	        },
	        
	        /**
	         * @attribute exec
	         * @description 初始化执行配置，只有在data有值时生效（auto：是否自动执行，默认为true；delay：执行延迟时间，默认为2.0.0
	         * @type Object
	         */
	        exec: {
	        	value: {
	        		auto: true,
	        		delay: 0.1
	        	}
	        },
	        
	        /**
	         * @attribute uHeight
	         * @description 滚动单元高度
	         * @type Number
	         * @default nodeList高度
	         */
	        uHeight: {
	        	value: null
	        },
	        
	        /**
	         * @attribute easing
	         * @description 动画效果
	         * @type String
	         * @default Linear.easeNone
	         */
	        easing: {
	        	value: 'Linear.easeNone'
	        },
	        
	        /**
	         * @attribute transition
	         * @description 过渡动画配置
	         * @type Object
	         */
	        transition: {
	        	value: null
	        },
	        
	        /**
	         * @attribute status
	         * @description 动画运行状态
	         * @type Boolean
	         */
	        status: {
	        	value: false
	        },
	        
	        /**
	         * @attribute fixed
	         * @description 数字大小修正，默认为0，即0的坐标为0
	         * @type Boolean
	         */
	        fixed: {
	        	value: 0
	        }
    	}
    });
    
    return DigitalScroll;
    
}, {requires:['dom', 'base', 'kg/layer-anim/2.0.0/']});
