var searchRC = null;

var traffic = {
	map : g_map,
	suggest : null,
	firstFlag2 : true,
	firstFlag3 : true,
	/**
	 * @method:  init
	 * @desc 初始化
	 * 
	 * @param {
	 * }
	 * @return 
	 */
	init : function() {
		searchRC = new CNavSearchRoadCondition( {
			map : g_map
		});
		searchRC.registerListenerSecond(traffic.setCondition);
	},
	
	clearAll : function(){
		g_map.clearAllElements();
	},
	
	/**
	 * @method:  searchCondition
	 * @desc 查询路况中查询某条道路的路况
	 * 
	 * @param {
	 * }
	 * @return 
	 */
	searchCondition : function() {
		var key = $get('search_key').value;
		$get("tipImg").style.display = "none";
		$get("tipMsg").style.display = "none";
		if (key === '请输入关键字') {
			$get("tipImg").style.display = "block";
			$get("tipMsg").style.display = "block";
			$get('tipMsg').innerHTML = '请输入关键字进行查询';
			$get("condition").style.display = "none";
			return;
		}
		if (key === '') {
			$get("tipImg").style.display = "block";
			$get("tipMsg").style.display = "block";
			$get('tipMsg').innerHTML = '关键字不能为空';
			$get("condition").style.display = "none";
			return;
		}
		$get("tipImg").style.display = "none";
		$get("tipMsg").style.display = "none";
		searchRC.searchSecond(key, '北京市', true);
	},

	/**
	 * @method:  setRoad
	 * @desc 查找路况回调数据转递给suggest
	 * 
	 * @param {
	 * arr：回调数据
	 * }
	 * @return 
	 */
	setRoad : function(arr) {
		document.getElementById('infoFrm').contentWindow.SugCallBack(arr);
	},

	/**
	 * @method:  setCondition
	 * @desc 路况信息回调函数
	 * 
	 * @param {
	 * json：回调数据
	 * }
	 * @return 
	 */
	setCondition : function(json) {
		var response = util.locationInterface($get('search_key').value);
		/*$get("tipImg").style.display = "none";
		$get("tipMsg").style.display = "none";
		if (!json || json.type === '1' || json === "" || json.roads.length == 0) {
			$get("tipImg").style.display = "block";
			$get("tipMsg").style.display = "block";
			$get('tipMsg').innerHTML = '不存在此路况，请重新输入！';
			$get("condition").style.display = "none";
			return;
		}
		$get("tipImg").style.display = "none";
		$get("tipMsg").style.display = "none";
		$get("condition").style.display = "block";
		var div = $get('condition');
		var txtInfo = json.roads[0].txtInfo;
		var html = "";
		html += "<div style=\"font-weight: bold;font-size:9pt;text-align:left;padding-left:15px\">" + json.roads[0].road
				+ "&nbsp;&nbsp;&nbsp;&nbsp;" + json.roads[0].time + "</div>";
		html += '<table>';
		if (txtInfo.length === 0) {
			$get("tipImg").style.display = "block";
			$get("tipMsg").style.display = "block";
			$get('tipMsg').innerHTML = '不存在此路况，请重新输入！';
			$get("condition").style.display = "none";
			return;
		}
		for ( var i = 0; i < txtInfo.length; i++) {
			html += '<tr><td align="left">';
			var direc = txtInfo[i].direction;
			direc = (direc == "EW" ? "东往西方向" : (direc == "WE" ? "西往东方向"
					: (direc == "NS" ? "北往南方向" : "南往北方向")));

			html += '<div style="width:190px;height:20px;font-weight:bold;font-size:9pt;">';
			html += direc;
			for ( var j = 0, s = txtInfo[i].section; j < s.length; j++) {
				var obj = s[j];
				if (obj.info === null || obj.info === 'null') {
					html = html.substring(0, html.length - direc.length);
					continue;
				}
				if (obj.sName === "") {
					html += '</div></td>'
					var info = obj.info;
					var message = info.substring(0, 2);
					if (message === '拥堵') {
						html += '<td bgcolor="#ff0000" ';
					} else if (message === '缓慢') {
						html += '<td bgcolor="#ffcc00" ';
					} else {
						html += '<td bgcolor="#00ff00" ';
					}
					html += 'style="color: white;font-weight: bold;font-size:9pt;">' + info + '</td>';
				} else {
					html += '</div></td></tr><tr><td style="font-size:9pt;" align="left">'
					html += obj.sName + "→" + obj.eName + "：</td>";
					var info = obj.info;
					var message = info.substring(0, 2);
					if (message === '拥堵') {
						html += '<td bgcolor="#ff0000" ';
					} else if (message === '缓慢') {
						html += '<td bgcolor="#ffcc00" ';
					} else {
						html += '<td bgcolor="#00ff00" ';
					}
					html += 'style="color: white;font-weight: bold;font-size:9pt;">' + info + '</td>';
				}
			}
		}
		html += '</tr></table>'
		div.innerHTML = html;*/
	},

	showPop : function(str,popLonlat){
		var hotAreaPopup = new CNavPopup("pop",popLonlat,str,true,null);
		hotAreaPopup.maxSize = new Size(600,600);
		//将中心点的坐标稍做偏移，使泡泡窗口能够显示完整
		popLonlat.lon = popLonlat.lon*1 + 0.025;
		
		g_map.panToLonLat(popLonlat);
		g_map.addPopup(hotAreaPopup);
	},
	
	showMapToZoom : function(){
		g_map.zoomTo(1);
	},

//------------------------------以下方法暂时未用到--------------------------

	/**
	 * @method:  changebroadcastTraffic
	 * @desc 点击最新播报
	 * 
	 * @param {
	 * obj：点击的对象
	 * type：1：最近播报 2：阻塞情况
	 * cls：点击的类型顺序（高速公路等）
	 * }
	 * @return 
	 */
	changebroadcastTraffic : function(obj, type, cls) {
		var other = null;
		for ( var i = 0; i < 5; i++) {
			if (type === 1) {
				other = $get(eval("'" + "broadCast" + i + "'"));
				$get('trf_Show_div').innerHTML = "请稍后...";
			} else {
				other = $get(eval("'" + "count" + i + "'"));
				$get('count_show_area').innerHTML = "<font style='font-weight:normal;'>请稍候...</font>";
				$get('jam_show_area').innerHTML = "";
			}
			if (obj === other) {
				obj.style.color = 'red';
			} else {
				other.style.color = 'black';
			}
		}
		if (type === 1) {
			util.broadcastTraffic(1, cls);
		} else {
			util.broadcastTraffic(2, cls);
			util.broadcastTraffic(3, cls);
		}
	},
	/**
	 * @method:  searchRoad
	 * @desc 查询路况查询道路名
	 * 
	 * @param {
	 * }
	 * @return 
	 */
	searchRoad : function() {
		var key = $get('search_key').value;
		key = key.replace(/(^\s*)/g, '');
		key = key.replace(/(\s*$)/g, '');
		$get('search_key').value = key;
		searchRC.searchFirst(key, '北京市', traffic.setRoad);
	}
};


traffic.init();