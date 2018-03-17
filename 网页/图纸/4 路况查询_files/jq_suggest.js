(function($) {
	var focusInstance = null;
	var gSertype = null;
	var gRtnBack = null;
	var routeStartObj = null;
	var routeEndObj = null;
	var segmentObj = null;

	$.fn.setSerType = function(sertype) {
		gSertype = sertype;
	};
	$.fn.setRtnCb = function(cb) {
		gRtnBack = cb;
	};
	
	var gHide = null;

	$.fn.Suggest = function(cLft, cTop, cWid, nxt, config) {
		var defaultConfig = {
			containerClassName : "suggest_container", //提示层样式
			sugKeyClassName : "suggest_key",
			sugResultClassName : "suggest_result",
			selectedItemClassName : "selected_item",
			offsetLeft : 5, //偏移，默认到文本框左对齐，可以通过该值做调整
			timerDelay : 200,
			resultFormat : "",
			closeBtnAlt : "关闭提示层",
			showCloseBtn : true, //是否显示关闭按钮
			autoSubmit : false
		//点击选项时，是否自动提交
		};

		this.CONFIG = $.extend(defaultConfig, config);

		var _self = this;
		var $container = null; //主容器
		var $divIframe = null; //遮挡iframe
		var ie = navigator.userAgent.indexOf("MSIE") > 0;//ie=1;
		var mouseDownItem = null;

		this.script = null; //加载脚本
		this.scriptLastestTime = ""; //脚本最后加载时间
		this.scriptTimeout = false; //脚本是过期
		this.selectedItem; //当前选中项索引
		this.dataCache = {}; //缓存查询数据
		this.queryStr = ""; //输入框的值
		this.timer = null; //计时器
		this.isRunning = false; //计时器是否处于运行状态
		this.pressingCount = 0; //按住按键，连续触发keydown事件

		this.cLft = cLft;
		this.cTop = cTop;
		this.cWid = cWid;
		this.nxt = nxt;

		//初始化
		this._init = function() {
			_self.createSuggest(this.cLft, this.cTop, this.cWid); //创建提示层
			var $liItems = $("#suggest_container");

			$(_self).blur(function() {
				_self.stop();
				_self.hide();
			}).keydown(function(event) {
				var keyCode = event.keyCode;
				switch (keyCode) {
				case 13:
					_self.submitForm();
					return;
				case 27: //ESC键，隐藏层并还原原输入值
						_self.hide();
						_self.setQueryStr();
						break;
					case 38:
					case 40:
						//按住按键，延时处理
						if (_self.pressingCount++ == 0) {
							if (_self.isRunning)
								_self.stop();
							_self.selectItem(keyCode == 40);
						} else if (_self.pressingCount >= 3) {
							_self.pressingCount = 0;
						}
						break;
					}
					if (keyCode != 38 && keyCode != 40) {
						if (!_self.isRunning) {
							_self.start();
						}
					}
				}).keyup(function() {
				_self.pressingCount = 0;
			}).attr("autocomplete", "off");

			$container.mousemove(function(event) {
				var target = event.target;
				if (target.nodeName != "LI") {
					target = $(target).parent("li")
				}
				_self.removeSelectedItem();
				//event.cancelBubble=true;
					_self.setSelecedItem(target);

				}).mousedown(function(e) {
				mouseDownItem = e.target;
				//使输入框不会失去焦点
					//for IE
					_self[0].onbeforedeactivate = function() {
						window.event.returnValue = false;
						_self[0].onbeforedeactivate = null;
					};
					return false;
				}).mouseup(function(event) {
				if (mouseDownItem != event.target)
					return;
				_self.submitForm();
			});
		};
		//添加提示层
		this.createSuggest = function(cLft, cTop, cWid) {
			$container = $('<div id="suggest_container" >' + '</div>').bind(
					"selectstart", function() {
						return false;
					});
			$("body").append($container);

			if (ie) {//alert(1);
				$divIframe = $("<iframe />");
				$divIframe.attr("id", cLft + "_" + cTop + "_" + cWid + "_"
						+ "hidefrm");
				$divIframe.css("position", "absolute");
				$divIframe.css("display", "none");
				//divIframe.css("display", "");
				$divIframe.css("z-index", 1000);
				$divIframe.css("border", "0");
				$divIframe.css("top", cTop);
				$divIframe.css("width", cWid);
				$divIframe.css("left", cLft + _self.CONFIG.offsetLeft);
				$divIframe.css("filter", "alpha(opacity=0)");
				$("body").append($divIframe);
				//alert(2);
			}

			$container.css( {
				position : "absolute",
				zIndex : 3000,
				left : cLft + _self.CONFIG.offsetLeft,//$(_self).offset().left + _self.CONFIG.offsetLeft,
				top : cTop
			//$(_self).offset().top + $(_self).outerHeight() + 5
					})
			//if($container.width() == 0){
			$container.css("width", cWid);//$(_self).outerWidth() - 2);
			//}
			//alert(cTop);
		};
		//更新提示层数据
		this.fillEleContainer = function(content) {
			if (content.length == 1) {
				$container.html("");
				$container.prepend(content)
			} else {
				$container.html(content);
			}
			_self.selectedItem = null;
		};
		//启动计时器，监听用户输入
		this.start = function() {
			focusInstance = _self;
			_self.timer = setInterval(function() {
				_self.updateInput();
			}, _self.CONFIG.timerDelay);
			_self.isRunning = true;
		};
		//停止计时器
		this.stop = function() {
			focusInstance = null;
			clearInterval(_self.timer);
			_self.isRunning = false;
		};
		//是否需要更新信息
		this.needUpdate = function() {
			return $(_self).val() != _self.queryStr;
		};
		//更新当前文本框
		this.updateInput = function() {
			if (!_self.needUpdate())
				return;
			//查询，更新层内容，保存缓存，
			//_self.dataCache[]
			_self.queryStr = $(_self).val();
			var q = _self.queryStr;

			if (!$.trim(q).length) {
				_self.fillEleContainer("");
				_self.hide();
				return;
			}
			var content = "";
			//			if (typeof _self.dataCache[q] != "undefined") {
			//				//使用缓存数据
			//				_self.fillEleContainer(_self.dataCache[q]);
			//				_self.displayContainer();
			//			} else {
			_self.requestData();
			//			}

		};
		//根据内容显示或隐藏提示层
		this.displayContainer = function() {
			if ($container.children("ol").length == 0) {
				_self.hide();
			} else {
				_self.show();
			}
		};
		//加载远程数据
		this.requestData = function() {
			if (gSertype === 'traffic') {
				window.parent.traffic.searchRoad();
			}else if(gSertype === 'routeStart'){
				window.parent.route.getStart();
			}else if(gSertype === 'routeEnd'){
				window.parent.route.getEnd();
			}
		};
		//处理获取到的数据
		this.handleResponse = function(data) {//alert(data);
			//if(_self.scriptTimeout) return ;
			if (!$.isArray(data))
				return;
			//var result = data.length == 2 ? data[1] : data[0];
			//格式化数据
			var result = _self.formatData(data);
			var len = result.length;
			var content = "";
			var _id = document.getElementById(this[0].id);
			var textValue = _id.value;
			var sameFlag = true;
			if (len > 0) {
				var $list = $("<ol>");
				for (i = 0; i < len; i++) {
					//最多显示10条
					if (i > 9) {
						break;
					}
					if (i + 1 != len) {
						if (result[i]["key"] != result[i + 1]["key"]) {
							sameFlag = false;
						}
					}
					$list.append(_self.formatItem(result[i]["key"],
							result[i]["result"]));

				}
				content = $list;
			}
//			if (sameFlag == true) {
//				if (this[0].id === 'search_key') {
//					document.getElementById('search_key').value = result[0]["key"];
//				}
//			}
			sameFlag = false;
			_self.fillEleContainer(content);
			_self.appendCloseBtn();
			_self.dataCache[_self.queryStr] = $container.html();
			_self.displayContainer();
		}
		//格式化结果数组
		this.formatData = function(data) {
			if (!data)
				return arr;
			var arr = [];
			var len = data.length;
			var item;
			var idx = -1;
			
			if(gSertype === 'traffic'){
				for (i = 0; i < len; i++) {
					item = data[i];
					arr[i] = {
						"key" : item
					};
				}
			}else if(gSertype === 'routeStart' || gSertype === 'routeEnd'){
				for (i = 0; i < len; i++) {
					item = data[i];
					arr[i] = {
						"key" : item.name,
						"result":item.lonlat.lon +","+ item.lonlat.lat
					};
				}
			}
			
			return arr;
		};
		//格式化输出项
		this.formatItem = function(key, result) {

			var $li = $("<li></li>").append(
					$('<span></span>').addClass(_self.CONFIG.sugKeyClassName)
							.html(key));
			$li.attr("key", key);
			$li.attr("lonlat", result);
			//显示经纬度
			if (typeof result != "undefined") {
				var resultText = result;//_self.CONFIG.resultFormat.replace("$result$",result);
				$li.append($('<span></span>').addClass(
						_self.CONFIG.sugResultClassName).html(resultText));
			}
			return $li[0];
		};
		//更新当前文本框为选中的key,同时更新经纬度信息(for poi)
		this.updateInputFromKey = function() {
			$(_self).val(_self.getSelectedItemKey());
			//alert($(_self.selectedItem).attr("result"));
			//若存在新属性(poi 的经纬度)，则更新之
			if($(_self.selectedItem).attr("result")){
				//alert($(_self.selectedItem).attr("result"));
			}
		};
		this.appendCloseBtn = function() {
			var text = (window.parent.DEFAULT_LANGUAGE === 'EN_US') ? 'close'
					: '关闭';
			if (_self.CONFIG.showCloseBtn) {
				$('<div class="suggest_close"></div>').append(
						$('<a href="javascript:void(0);">' + text + '</a>')
								.attr("title", _self.CONFIG.closeBtnAlt))
						.appendTo($container);
			}
		};
		//用键盘选择key
		this.selectItem = function(down) {
			//不存在搜索结果，直接返回
			_self.stop();
			var items = $container.find("li");
			if (items.length == 0)
				return;
			//按ESc隐藏了，显示返回就可以
			if (_self.isVisible()) {
				_self.show();
				return;
			}
			var newSelectedItem;
			if (_self.selectedItem) {
				newSelectedItem = down ? $(_self.selectedItem).next() : $(
						_self.selectedItem).prev();
			} else {
				newSelectedItem = items.eq(down ? 0 : items.length - 1);
			}
			newSelectedItem = newSelectedItem[0]
			_self.removeSelectedItem();
			_self.setSelecedItem(newSelectedItem);
			if (!newSelectedItem) {
				//回复原文本框值
				_self.setQueryStr();
				return;
			}
			_self.updateInputFromKey();
		};
		this.isVisible = function() {
			return $container.css("display") == "none";
		};
		//移除选中项
		this.removeSelectedItem = function() {
			$(_self.selectedItem).removeClass(
					_self.CONFIG.selectedItemClassName);
			_self.selectedItme = null;
		};
		//设置选中项
		this.setSelecedItem = function(target) {
			$(target).addClass(_self.CONFIG.selectedItemClassName);
			_self.selectedItem = target;
			//alert(target);
		};
		//回复原文本框值
		this.setQueryStr = function() {
			$(_self).val(_self.queryStr);
		};
		//获取选中项的key
		this.getSelectedItemKey = function() {
			if (!_self.selectedItem)
				return "";
			return $(_self.selectedItem).attr("key");
		};
		
		this.getSelectedItemValue = function(){
			if (!_self.selectedItem)
				return "";
			return $(_self.selectedItem).attr("lonlat");
		};
		//显示提示层
		this.show = function() {
			if (ie) {
				$divIframe.css("height", $container.height());
				$divIframe.show();
				if (gHide && document.getElementById(gHide))
					document.getElementById(gHide).style.display = 'none';
			}
			$container.show();
			//alert('show:');

			/*var items = $container.find("li");
			if(items.length == 0) return ;
			
			
			var obj = {};
			obj.name = items[0].attr("key");
			var ll = items[0].attr("result");
			if(ll){
				ll = ll.split(',');
				obj.lonlat = {lon:ll[0],lat:ll[1]};			
			}
			alert('show:'+obj.name);
			uiDispatch.setCenterPoi(gSertype, obj);*/

		};
		//隐藏提示层
		this.hide = function() {
			if (ie) {
				$divIframe.hide();
				if (gHide && document.getElementById(gHide))
					document.getElementById(gHide).style.display = '';
			}
			$container.hide();
		};
		this.submitForm = function() {
			if (_self.selectedItem != null) {
				_self.updateInputFromKey();
			}
			$(_self).blur();

			var obj = {};
			obj.name = _self.getSelectedItemKey();
			obj.value = _self.getSelectedItemValue();
			var ll = $(_self.selectedItem).attr("lonlat");
			if (ll) {
				ll = ll.split(',');
				//			obj = {name:_self.getSelectedItemKey(),lonlat:{lon:ll[0],lat:ll[1]}};
				obj.lonlat = {
					lon : ll[0],
					lat : ll[1]
				};
			}

			//选择item后的回调函数	
			if (gRtnBack) {
				gRtnBack(obj);
			}

			if (this.nxt)
				document.getElementById(this.nxt).focus();
			var form = $(_self)[0].form;
			//$("#tt2").html("");
			if (!form || !_self.CONFIG.autoSubmit)
				return false;
			form.submit();

		};
		this._init();
	};
	SugCallBack = function(data) {
		if (!focusInstance)
			return;
		focusInstance.handleResponse(data);
	}
	
	
})(jQuery);