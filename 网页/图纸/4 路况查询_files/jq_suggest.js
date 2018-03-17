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
			containerClassName : "suggest_container", //��ʾ����ʽ
			sugKeyClassName : "suggest_key",
			sugResultClassName : "suggest_result",
			selectedItemClassName : "selected_item",
			offsetLeft : 5, //ƫ�ƣ�Ĭ�ϵ��ı�������룬����ͨ����ֵ������
			timerDelay : 200,
			resultFormat : "",
			closeBtnAlt : "�ر���ʾ��",
			showCloseBtn : true, //�Ƿ���ʾ�رհ�ť
			autoSubmit : false
		//���ѡ��ʱ���Ƿ��Զ��ύ
		};

		this.CONFIG = $.extend(defaultConfig, config);

		var _self = this;
		var $container = null; //������
		var $divIframe = null; //�ڵ�iframe
		var ie = navigator.userAgent.indexOf("MSIE") > 0;//ie=1;
		var mouseDownItem = null;

		this.script = null; //���ؽű�
		this.scriptLastestTime = ""; //�ű�������ʱ��
		this.scriptTimeout = false; //�ű��ǹ���
		this.selectedItem; //��ǰѡ��������
		this.dataCache = {}; //�����ѯ����
		this.queryStr = ""; //������ֵ
		this.timer = null; //��ʱ��
		this.isRunning = false; //��ʱ���Ƿ�������״̬
		this.pressingCount = 0; //��ס��������������keydown�¼�

		this.cLft = cLft;
		this.cTop = cTop;
		this.cWid = cWid;
		this.nxt = nxt;

		//��ʼ��
		this._init = function() {
			_self.createSuggest(this.cLft, this.cTop, this.cWid); //������ʾ��
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
				case 27: //ESC�������ز㲢��ԭԭ����ֵ
						_self.hide();
						_self.setQueryStr();
						break;
					case 38:
					case 40:
						//��ס��������ʱ����
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
				//ʹ����򲻻�ʧȥ����
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
		//�����ʾ��
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
		//������ʾ������
		this.fillEleContainer = function(content) {
			if (content.length == 1) {
				$container.html("");
				$container.prepend(content)
			} else {
				$container.html(content);
			}
			_self.selectedItem = null;
		};
		//������ʱ���������û�����
		this.start = function() {
			focusInstance = _self;
			_self.timer = setInterval(function() {
				_self.updateInput();
			}, _self.CONFIG.timerDelay);
			_self.isRunning = true;
		};
		//ֹͣ��ʱ��
		this.stop = function() {
			focusInstance = null;
			clearInterval(_self.timer);
			_self.isRunning = false;
		};
		//�Ƿ���Ҫ������Ϣ
		this.needUpdate = function() {
			return $(_self).val() != _self.queryStr;
		};
		//���µ�ǰ�ı���
		this.updateInput = function() {
			if (!_self.needUpdate())
				return;
			//��ѯ�����²����ݣ����滺�棬
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
			//				//ʹ�û�������
			//				_self.fillEleContainer(_self.dataCache[q]);
			//				_self.displayContainer();
			//			} else {
			_self.requestData();
			//			}

		};
		//����������ʾ��������ʾ��
		this.displayContainer = function() {
			if ($container.children("ol").length == 0) {
				_self.hide();
			} else {
				_self.show();
			}
		};
		//����Զ������
		this.requestData = function() {
			if (gSertype === 'traffic') {
				window.parent.traffic.searchRoad();
			}else if(gSertype === 'routeStart'){
				window.parent.route.getStart();
			}else if(gSertype === 'routeEnd'){
				window.parent.route.getEnd();
			}
		};
		//�����ȡ��������
		this.handleResponse = function(data) {//alert(data);
			//if(_self.scriptTimeout) return ;
			if (!$.isArray(data))
				return;
			//var result = data.length == 2 ? data[1] : data[0];
			//��ʽ������
			var result = _self.formatData(data);
			var len = result.length;
			var content = "";
			var _id = document.getElementById(this[0].id);
			var textValue = _id.value;
			var sameFlag = true;
			if (len > 0) {
				var $list = $("<ol>");
				for (i = 0; i < len; i++) {
					//�����ʾ10��
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
		//��ʽ���������
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
		//��ʽ�������
		this.formatItem = function(key, result) {

			var $li = $("<li></li>").append(
					$('<span></span>').addClass(_self.CONFIG.sugKeyClassName)
							.html(key));
			$li.attr("key", key);
			$li.attr("lonlat", result);
			//��ʾ��γ��
			if (typeof result != "undefined") {
				var resultText = result;//_self.CONFIG.resultFormat.replace("$result$",result);
				$li.append($('<span></span>').addClass(
						_self.CONFIG.sugResultClassName).html(resultText));
			}
			return $li[0];
		};
		//���µ�ǰ�ı���Ϊѡ�е�key,ͬʱ���¾�γ����Ϣ(for poi)
		this.updateInputFromKey = function() {
			$(_self).val(_self.getSelectedItemKey());
			//alert($(_self.selectedItem).attr("result"));
			//������������(poi �ľ�γ��)�������֮
			if($(_self.selectedItem).attr("result")){
				//alert($(_self.selectedItem).attr("result"));
			}
		};
		this.appendCloseBtn = function() {
			var text = (window.parent.DEFAULT_LANGUAGE === 'EN_US') ? 'close'
					: '�ر�';
			if (_self.CONFIG.showCloseBtn) {
				$('<div class="suggest_close"></div>').append(
						$('<a href="javascript:void(0);">' + text + '</a>')
								.attr("title", _self.CONFIG.closeBtnAlt))
						.appendTo($container);
			}
		};
		//�ü���ѡ��key
		this.selectItem = function(down) {
			//���������������ֱ�ӷ���
			_self.stop();
			var items = $container.find("li");
			if (items.length == 0)
				return;
			//��ESc�����ˣ���ʾ���ؾͿ���
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
				//�ظ�ԭ�ı���ֵ
				_self.setQueryStr();
				return;
			}
			_self.updateInputFromKey();
		};
		this.isVisible = function() {
			return $container.css("display") == "none";
		};
		//�Ƴ�ѡ����
		this.removeSelectedItem = function() {
			$(_self.selectedItem).removeClass(
					_self.CONFIG.selectedItemClassName);
			_self.selectedItme = null;
		};
		//����ѡ����
		this.setSelecedItem = function(target) {
			$(target).addClass(_self.CONFIG.selectedItemClassName);
			_self.selectedItem = target;
			//alert(target);
		};
		//�ظ�ԭ�ı���ֵ
		this.setQueryStr = function() {
			$(_self).val(_self.queryStr);
		};
		//��ȡѡ�����key
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
		//��ʾ��ʾ��
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
		//������ʾ��
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

			//ѡ��item��Ļص�����	
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