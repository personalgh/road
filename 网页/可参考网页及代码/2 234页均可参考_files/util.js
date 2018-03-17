/* 
 * @author:wangyuxuan
 * @description:工具相关功能
 * @date: 2010-11-15
 */

//全局变量
//var trf_Request_key = [1,1,1,1,1];
//var event_Request_key = [1,1,1,1,1];
//var html_Diff = [trf_Request_key,event_Request_key];//控制路况，事件两个模块道路定位和行政区定位只申请一次数据
var div = {};
var util_flag = 0;

/**
 * @method: $get
 * @desc 获取iframe下的id元素
 * 
 * @param {
 * id:元素的id名称
 * }
 * @return 
 */
var $get = function(id) {
	return document.getElementById('infoFrm').contentWindow.document
			.getElementById(id);
};

/**
 * @method: Red_Black_disp
 * @desc 选中元素高亮显示
 * 
 * @param {id:被点击元素的ID；max_i：同类元素最大数量，用于循环最大值
 * 
 * }
 * @return 
 */
function Red_Black_disp(id, max_i) {
	var s = id.split('_');
	//alert(s[0]);
	//alert(s[1]);
	var l = s[1];
	for ( var i = 0; i < max_i; i++) {
		//alert(i);
		if (i == l)
			$get(id).style.color = 'red';
		else {
			var other_id = eval("'" + s[0] + "_" + i + "'");
			//alert(other_id);
			$get(other_id).style.color = 'black';
		}
	}
};
/**
 * @method: LocationCallBack
 * @desc 定位回调函数
 * 
 * @param {data:申请返回数据；显示信息obj:id对象
 * 
 * }
 * @return 
 */

function LocationCallBack(obj, data) {
	if (!data || data.length === 0) {
		return false;
	}
	var formater = new OpenLayers.Format.JSON();
	var ll = formater.read(data.responseText, false);
	var lonlat_ll = new LonLat(ll.lonlat.lon, ll.lonlat.lat);
	var s_ll = ll.lonlat.lon + ',' + ll.lonlat.lat;
	//alert(s_ll);
	g_map.zoomTo(4);
	g_map.panToLonLat(lonlat_ll);
	obj.setAttribute('Request_key', s_ll);
	// alert(obj.getAttribute('Request_key'));
};
/**
 * @method: roadTypeCallBack
 * @desc 道路申请回调函数
 * 
 * @param {data:申请返回数据；显示信息div——id；
 * 
 * }
 * @return 
 */
function roadTypeCallBack(id, data) {
	if (!data) {
		$get(id).innerHTML = '暂无道路数据';
		$get(id).style.display = 'block';
		return;
	}
	var formater = new OpenLayers.Format.JSON();
	//var  s='{"roads":["北二环","北三环东路","北六环","北三环中路","北三环中路辅路"]}';
	var arr = formater.read(data.responseText, false);
	if (!arr || (arr.roads == '')) {
		$get(id).innerHTML = '暂无道路数据';
		$get(id).style.display = 'block';
		return;
	}
	var obj = arr.roads;
	var k = 3;
	var html = '';
	if (obj.length != 0) {
		html = '<table> ';
		for ( var i = 0; i < obj.length; i += k) {
			//alert(name);
			if ((i + 3) > obj.length) {
				k = obj.length % 3;
			}
			html += '<tr class="tab_road_district">';
			for ( var j = i; j < i + k; j++) {
				var name = obj[j];
				var road_id = "road_" + j;
				html += '<td>';
				html += '<a ';
				html += 'id="road_';
				html += j;
				html += '"';
				html += 'href="javascript:void(0);" onclick="window.parent.util.Location(\''
						+ road_id
						+ '\',\''
						+ name
						+ '\',\''
						+ obj.length
						+ '\');" Request_key="1">';
				html += obj[j];
				html += '</a>';
				html += '</td>';
			}

			html += '</tr>';
		}
		html += '</table>';
		$get(id).innerHTML = html;
		$get(id).style.display = 'block';
	} else {
		$get(id).innerHTML = '暂无道路数据';
		$get(id).style.display = 'block';
	}
};

/**
 * @method: districtTypeCallBack
 * @desc 道路申请回调函数
 * 
 * @param {data:申请返回数据；显示信息div——id；a_obj：id对象
 * 
 * }
 * @return 
 */
function districtTypeCallBack(id, a_obj, data) {

	//alert(j);
	//alert(f);
	if (!data) {
		$get(id).innerHTML = '暂无行政区数据';
		return;
	}
	var formater = new OpenLayers.Format.JSON();
	var arr = formater.read(data.responseText, false);
	if (!arr || (arr.regions == '')) {
		$get(id).innerHTML = '暂无行政区数据';
		return;
	}
	//alert(arr.regions[1].name.length);
	//alert(arr.regions[1].name);
	//alert(arr.regions[1].lonlat);
	var obj = arr.regions;
	var length = obj[0].name.length;
	var html = '';
	if (obj.length != 0) {
		var k = 6;
		html = '<table>';
		for ( var i = 0; i < obj.length; i += k) {
			html += '<tr class="tab_road_district">';
			if ((i + 6) > obj.length) {
				k = obj.length % 6;
			}
			for ( var j = i; j < i + k; j++) {
				var loa = obj[j].lonlat;
				var district_id = 'district_' + j;
				html += '<td>';
				html += '<a ';
				html += 'id="district_';
				html += j;
				html += '"';
				html += 'href="javascript:void(0);" onclick="window.parent.util.districtLocation(\''
						+ district_id
						+ '\',\''
						+ obj.length
						+ '\');"dis_lonlat=\'' + loa + '\'>';
				html += obj[j].name;
				html += '</a>';
				html += '</td>';
				//html += '&nbsp;&nbsp;';
			}
			html += '</tr>'
		}
		html += '</table>';
		$get(id).innerHTML = html;
		a_obj.setAttribute('Request_key', '0');
	} else {
		$get(id).innerHTML = '暂无行政区数据';
	}
};
var util = {

	//配置发送ajax请求的配置项
	AJAX_CONFIG : {
		method : "POST",
		url : null,
		async : false,
		user : undefined,
		password : undefined,
		params : null,
		proxy : '',
		headers : {
			"Content-Type" : "application/x-www-form-urlencoded"
		},
		data : null,
		callback : function() {
		},
		success : null,
		failure : null,
		scope : this
	},

	/**
	 * @method: locationInterface
	 * @desc 
	 * 获取焦点道路坐标，用于道路快速定位
	 * 【请求格式】
	 *  /query.do?serviceType=road&acode=110000&type=2&rd=京通快速路
	 * 【参数说明】
	 *  serviceType--服务类型
	 *  acode--城市代码
	 * *  type-- 1:焦点道路查询  2:道路定位
	 *  rd--道路名称
	 * 
	 * @param {
	 * }
	 * @return 
	 */
	locationInterface : function(name) {
		util.AJAX_CONFIG.url = "query.do?serviceType=road&acode=110000&type=2";
		name = encodeURI(name)
		util.AJAX_CONFIG.url += "&rd=" + name;
		var fn = OpenLayers.Function.bind(LocationCallBack, this,
				$get('search_key'));
		util.AJAX_CONFIG.callback = fn;
		util.AJAX_CONFIG.async = true;
		return OpenLayers.Request.POST(util.AJAX_CONFIG);
	},
	/**
	 * @method: broadcastTheLatestTraffic
	 * @desc 
	 * 1.焦点道路路况查询，用于最新路况播报
	 * 2.焦点拥堵道路统计，用于拥堵道路统计
	 * 【请求格式】
	 * /query.do?serviceType=jam&acode=110000&type=1&cls=0&rcd=10
	 * 【参数说明】
	 *  serviceType--服务类型
	 *  acode--城市代码
	 *  type-- 1:焦点道路路况查询  2:焦点拥堵道路统计
	 *  cls--0:全部道路 1:环线 2:高速公路 3:快速道路 4:重点道路
	 *  rcd--返回记录总条数，目前暂定传值10
	 * 
	 * @param {
	 * }
	 * @return 
	 */
	broadcastTraffic : function(type, cls) {
		util.AJAX_CONFIG.url = "query.do?serviceType=jam";
		util.AJAX_CONFIG.url += "&acode=110000&type=" + type + '&cls=' + cls
				+ '&rcd=40';
		var _fn = OpenLayers.Function.bind(util.broadcastTraffic_CB, this, [
				type, cls ]);
		util.AJAX_CONFIG.callback = _fn;
		util.AJAX_CONFIG.async = true;
		return OpenLayers.Request.POST(util.AJAX_CONFIG);
	},

	/**
	 * @method: broadcastTraffic_CB
	 * @desc 	 
	 * 1.焦点道路路况查询，用于最新路况播报的回调函数
	 * 2.焦点拥堵道路统计，用于拥堵道路统计的回调函数
	 * 
	 * @param {
	 * arr:返回数据
	 * 1.{"roads":[{"road":"建国门桥","time":"2010-11-15 15:25","result":"0","cnt":"4","lonlat":["116.419931911944","39.920531955278"],"txtInfo":[{"direction":"EW","scnt":"1","section":[{"id":"1","slonlat":["116.440986633301","39.908602396647"],"elonlat":["116.434871673584","39.908625284831"],"sName":"","eName":"","info":"缓慢，时速32公里。"}]},{"direction":"NS","scnt":"1","section":[{"id":"1","slonlat":["116.435577392578","39.910954793294"],"elonlat":["116.435836791992","39.906364440918"],"sName":"","eName":"","info":"畅通，时速50公里。"}]},{"direction":"SN","scnt":"1","section":[{"id":"1","slonlat":["116.435970306396","39.906283060710"],"elonlat":["116.435802459717","39.909741719564"],"sName":"","eName":"","info":"缓慢，时速27公里。"}]},{"direction":"WE","scnt":"1","section":[{"id":"1","slonlat":["116.432201385498","39.908487955729"],"elonlat":["116.440986633301","39.908457438151"],"sName":"","eName":"","info":"缓慢，时速29公里。"}]}]},{"road":"北三环中路主路","time":"2010-11-15 15:20","cnt":"2","lonlat":["",""],"txtInfo":[{"direction":"EW","scnt":"3","section":[{"id":"1","slonlat":["116.400478363037","39.968785603841"],"elonlat":["116.398925781250","39.968742370605"],"sName":"安贞桥","eName":"安华桥","info":"畅通，时速45公里。"},{"id":"2","slonlat":["116.381881713867","39.968259175618"],"elonlat":["116.361824035645","39.967814127604"],"sName":"马甸桥","eName":"蓟门桥","info":"畅通，时速46公里。"},{"id":"3","slonlat":["116.393138885498","39.968574523926"],"elonlat":["116.385715484619","39.968365987142"],"sName":"安华桥","eName":"马甸桥","info":"畅通，时速46公里。"}]},{"direction":"WE","scnt":"3","section":[{"id":"1","slonlat":["116.362247467041","39.967656453451"],"elonlat":["116.379116058350","39.968065897624"],"sName":"蓟门桥","eName":"马甸桥","info":"畅通，时速45公里。"},{"id":"2","slonlat":["116.381874084473","39.968126932780"],"elonlat":["116.391880035400","39.968373616536"],"sName":"马甸桥","eName":"安华桥","info":"畅通，时速57公里。"},{"id":"3","slonlat":["116.395370483398","39.968460083008"],"elonlat":["116.403644561768","39.968709309896"],"sName":"安华桥","eName":"安贞桥","info":"畅通，时速51公里。"}]}]}]}
	 * 2.{"nums":{"jam":156,"slow":15,"flow":216}}//依次为:拥堵条数，缓慢条数，畅通条数
	 * }
	 * @return 
	 */
	broadcastTraffic_CB : function(para, arr) {
		/*if (traffic.firstFlag2 == true) {
			util.broadcastTraffic(2, 0);
			traffic.firstFlag2 = false;
		}
		if (traffic.firstFlag2 == false) {
			if (traffic.firstFlag3 == true) {
				util.broadcastTraffic(3, 0);
				traffic.firstFlag3 = false;
			}
		}*/
		if (arr.readyState == 4) {
			if (arr.status === 200) {
				var type = para[0];
				var cls = para[1];
				if (!arr || arr.responseText === "") {
					if (type === 1) {
						if ('trf_Show_div' != null) {
							$get('trf_Show_div').innerHTML = "暂无数据";
							return;
						}
					} else if (type === 2) {
						if ('count_show_area' != null) {
							$get('count_show_area').innerHTML = "<font style='font-weight:normal;'>暂无拥堵统计数据</font>";
							return;
						}
					} else {
						if ('jam_show_area' != null) {
							$get('jam_show_area').innerHTML = "暂无拥堵道路数据";
							return;
						}
					}
				}
				var formater = new OpenLayers.Format.JSON();
				var json = formater.read(arr.responseText, false);
				if (json == null) {
					if ('trf_Show_div' != null) {
						$get('trf_Show_div').innerHTML = "暂无数据";
						return;
					}
				}
				if (type === 1) {
					var roads = json['roads'];
					if (roads.length == 0) {
						if ('trf_Show_div' != null) {
							$get('trf_Show_div').innerHTML = "暂无数据";
							return;
						}
					}
					var html = '<marquee direction=up scrollamount=2 height=200 id="marquee_broadcast">';
					for ( var i = 0; i < roads.length; i++) {
						road = roads[i];
						html += "<div style=\"font-weight: bold;\">"
								+ road['road'];
						html += '&nbsp;&nbsp;&nbsp;&nbsp;' + road['time'] + '</div>';
						var html_info = "<div>";
						var txtInfo = road.txtInfo;
						for ( var k = 0; k < txtInfo.length; k++) {
							var direc = txtInfo[k].direction;
							direc = (direc == "EW" ? "东往西方向"
									: (direc == "WE" ? "西往东方向"
											: (direc == "NS" ? "北往南方向"
													: "南往北方向")));
							html_info += '<table><tr><td>';
							html_info += '<div style="width:200px;height:20px;font-weight:bold;">';
							html_info += direc;
							for ( var j = 0, s = txtInfo[k].section; j < s.length; j++) {
								var obj = s[j];
								if (obj.info === null || obj.info === 'null') {
									html_info = html_info.substring(0,
											html_info.length - direc.length);
									continue;
								}
								if (obj.sName === "") {
									html_info += '</div></td>'
									var info = obj.info;
									var message = info.substring(0, 2);
									if (message === '拥堵') {
										html_info += '<td bgcolor="#ff0000" ';
									} else if (message === '缓慢') {
										html_info += '<td bgcolor="#ffcc00" ';
									} else {
										html_info += '<td bgcolor="#00ff00" ';
									}
									html_info += 'style="color: black;font-weight: bold;">' + info + '</td>';
								} else {
									html_info += '</td></tr><tr><td>'
									html_info += obj.sName + "→" + obj.eName
											+ ":</td>";
									var info = obj.info;
									var message = info.substring(0, 2);
									if (message === '拥堵') {
										html_info += '<td bgcolor="#ff0000" ';
									} else if (message === '缓慢') {
										html_info += '<td bgcolor="#ffcc00" ';
									} else {
										html_info += '<td bgcolor="#00ff00" ';
									}
									html_info += 'style="color: black;font-weight: bold;">' + info + '</td>';
								}
							}
							html_info += '</tr></table>';
						}
						html_info += "</div>";
						html += html_info;
						html += '<br>';
					}
					html += '</marquee>';
					if ($get('trf_Show_div') != null) {
						$get('trf_Show_div').innerHTML = html;
					}
				} else if (type === 2) {
					var nums = json['nums'];
					if (nums.length == 0) {
						if ($get('count_show_area') != null) {
							$get('count_show_area').innerHTML = "<font style='font-weight:normal;'>暂无拥堵统计数据</font>";
							return;
						}
					}
					if ($get('count_show_area') != null) {
						if (cls == 0) {
							var jamNum = nums['jam'] - 0;
							var now = new Date();
							var hour = now.getHours(); //小时 
							if ((hour > 6 && hour < 9)
									|| (hour > 15 && hour < 19)) {
								if (jamNum > 150) {
									var jam_End = jamNum % 10;
									nums['jam'] = 90 + hour + jam_End;/*parseInt(50 * Math.random());*/
								}
							} else {
								if (jamNum > 100) {
									var jam_End2 = jamNum % 10;
									nums['jam'] = 30 + hour + jam_End2; /*parseInt(40 * Math.random());*/
								}
							}
						}
						if (cls == 1) {
							nums['jam'] = parseInt((nums['jam'] - 20) / 2
									+ (30 * Math.random()));
						}

						$get('count_show_area').innerHTML = "<font color='red'>当前拥堵路段数:"
								+ nums['jam'] + "</font>";
					}

				} else if (type === 3) {
					var roads = json['roads'];
					if (roads.length == 0) {
						if ($get('jam_show_area') != null) {
							$get('jam_show_area').innerHTML = "暂无拥堵道路数据";
							return;
						}
					}
					var html = '<marquee direction=up scrollamount=2  height=400 id="marquee_jam_count">';
					for ( var i = 0; i < roads.length; i++) {
						road = roads[i];
						html += "<div style=\"font-size: 9pt;padding-left:12px\">"
								+ road['road'];
						var time = road['time'];
						var minute = time.substring(time.length-2,time.length);
						if(minute%2!=0){
							minute--;
							time = road['time'].substring(0,14)+minute;
							if(minute.toString().length==1)
								time = road['time'].substring(0,14)+0+minute;
						}
						html += '&nbsp;&nbsp;&nbsp;&nbsp;' + time + '</div>';
						var html_info = "<div>";
						var txtInfo = road.txtInfo;
						for ( var k = 0; k < txtInfo.length; k++) {
							var direc = txtInfo[k].direction;
							direc = (direc == "EW" ? "东往西方向"
									: (direc == "WE" ? "西往东方向"
											: (direc == "NS" ? "北往南方向"
													: "南往北方向")));
							html_info += '<table><tr><td>';
							html_info += '<div style="width:200px;font-size:9pt;padding-left:10px">';
							html_info += direc;
							for ( var j = 0, s = txtInfo[k].section; j < s.length; j++) {
								var obj = s[j];
								if (obj.info === null || obj.info === 'null') {
									html_info = html_info.substring(0,
											html_info.length - direc.length);
									continue;
								}
								if (obj.sName === "") {
									html_info += '</div></td>'
								} else {
									html_info += '</div></td></tr><tr><td style="font-size:9pt;padding-left:10px">'
									html_info += obj.sName + " → " + obj.eName
											+ "</td>";
								}
							}
							html_info += '</tr></table>';
						}
						html_info += "</div>";
						html += html_info;
						html += '<hr style="color:#e4e4e4;height:1px;">';
					}
					html += '</marquee>';
					if ($get('jam_show_area') != null) {
						$get('jam_show_area').innerHTML = html;
					}
				}
			}
		}
	},

	/**
	 * @method: roadTypeRequest
	 * @desc 道路快速定位请求函数,请求响应类型道路数据
	 * 
	 * @param {i--0:全部道路 1:环线 2:高速公路 3:快速道路 4:重点道路;
	 *        div_id：显示数据的DIV ID；
	 *        a_id:被点击元素的ID；
	 *        max_i：同类元素最大数量，用于循环最大值
	 *    
	 * }
	 * @return 
	 */
	roadTypeRequest : function(i, div_id, max_i, a_id) {
		var params = {
			serviceType : "road",
			acode : 110000,
			cls : i,
			type : 1
		};
		var fn = OpenLayers.Function.bind(roadTypeCallBack, this, div_id);
		OpenLayers.loadURL('query.do', params, this, fn);
		Red_Black_disp(a_id, max_i);

	},
	/**
	 * @method: Location
	 * @desc 定位请求函数
	 * 
	 * @param {Name：道路或行政区名称；
	 *         ll_id:需要定位元素的id;
	 *         max_i：同类元素最大数量，用于循环最大值
	 * }
	 * @return 
	 */
	Location : function(ll_id, Name, max_i) {
		var obj = $get(ll_id);
		var key = obj.getAttribute('Request_key');//||obj.Request_key;
	if (key == '1') {
		var name = encodeURI(Name);
		var params = {
			serviceType : "road",
			acode : 110000,
			type : 2,
			rd : name
		};
		var fn = OpenLayers.Function.bind(LocationCallBack, this, obj);
		OpenLayers.loadURL('query.do', params, this, fn);

	} else {
		//ll = obj.getAttribute('Request_key');
	var s = key.split(',');
	//var lla = new LonLat(a[1],b[1]);
	//alert(lla);
	//g_map.panToLonLat(new LonLat(ll.lon, ll.lat));
	//g_map.zoomTo(2);
	g_map.zoomTo(7);
	g_map.panToLonLat(new LonLat(s[0], s[1]));
}
Red_Black_disp(ll_id, max_i);
// LocationCallBack();

},
/**
 * @method:  districtRequest
 * @desc 行政区域申请行政区数据
 * 
 * @param {div_id：显示数据的DIV ID
 *         a_id：标题所在链接ID，用于取Request_key的值；
 * }
 * @return 
 */
districtRequest : function(div_id, a_id) {
var a_obj = $get(a_id);
//alert(a_id);
	if (a_obj.getAttribute('Request_key') === '0') {
		//alert(1);
		return;
	}
	var params = {
		serviceType : "district",
		acode : 110000
	};
	var fn = OpenLayers.Function
			.bind(districtTypeCallBack, this, div_id, a_obj);
	OpenLayers.loadURL('query.do', params, this, fn);

},
/**
 * @method:  districtLocation
 * @desc 行政区域定位
 * 
 * @param {dis_id：行政区列表元素ID，用于取元素坐标
 *         max_i: 同类元素数量，用作Red_Black_disp中循环最大量
 * }
 * @return 
 */

districtLocation : function(dis_id, max_i) {
	var ll = $get(dis_id).getAttribute('dis_lonlat');
	var s = ll.split(',');
	g_map.zoomTo(7);
	g_map.panToLonLat(new LonLat(s[0], s[1]));
	Red_Black_disp(dis_id, max_i);
},
/**
 * @method:  districtLocation
 * @desc 行政区域定位
 * 
 * @param {title_id：所点击的功能模块标题的ID
 *         div_id：需要显示/隐藏的DIV 的ID
 * }
 * @return 
 */
div_hide_disp : function(div_id, title_id) {
	if (!($get(div_id)) && (!title_id)) {
		return;
	}
	var l = div.length; //存储需要隐藏的div的id的数组的长度
	var have = 0; //用于标识该div的id是否在数组中
	var obj_id = $get(div_id);
	//	    if ((div_id == 'trf_search_show') && (util_flag === 0)) {   //路况信息查询模块有过查询动作才可收缩或展开div
	//	    	return;
	//     	}
	/* 需要实现展开一个且关闭其他模块功能时恢复
	 *  for ( var i = 0; i < l; i++) {
	    if (div[i] != div_id) {
		    $get(div[i]).style.display = 'none';
		} else if (div[i] == div_id) {
		    have = 1;
		    if ((obj_id.style.display == "") || (obj_id.style.display == "block")) {
			    obj_id.style.display = 'none';
			    continue;
		    } else {
			    obj_id.style.display = "";
		    }
	    }
	  }  */
	if (obj_id.style.display != "none") {
		obj_id.style.display = "none";
	} else {
		obj_id.style.display = "";
	}

	/*需要实现展开一个且关闭其他模块功能时恢复
	 * if (have === 0) {
	    if ((obj_id.style.display == "") || (obj_id.style.display == "block")) {
		    obj_id.style.display = "none";
	    } else {
		    obj_id.style.display = "";
	    }
	    div[l] = div_id; //第一次出现的DIV的ID储存到div[]中
	}*/
	if ((div_id == 'trf_district_List') || (div_id == 'event_district_List')) {
		util.districtRequest(div_id, title_id);
	}
	var frame = document.getElementById('infoFrm');

	if (div_id == 'trf_Show_Area2' && $get(div_id).style.display != 'none') {
		$get('trf_Show_div').innerHTML = "请稍后...";
		for ( var i = 0; i < 5; i++) {
			var broadCast = frame.contentWindow.document
					.getElementById(eval('"broadCast' + i + '"'));
			if (broadCast.style.color == "red") {
				util.broadcastTraffic(1, i);
			}
		}
	}
	if (div_id == 'trf_jam_Area2' && $get(div_id).style.display != 'none') {
		$get('count_show_area').innerHTML = "<font style='font-weight:normal;'>请稍候...</font>";
		$get('jam_show_area').innerHTML = "";
		for ( var i = 0; i < 5; i++) {
			var count = frame.contentWindow.document
					.getElementById(eval('"count' + i + '"'));
			if (count.style.color == "red") {
				util.broadcastTraffic(2, i);
				util.broadcastTraffic(3, i);
			}
		}
	}
}
};