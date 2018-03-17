var searchRC = null;

var traffic = {
	map : g_map,
	suggest : null,
	firstFlag2 : true,
	firstFlag3 : true,
	/**
	 * @method:  init
	 * @desc ��ʼ��
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
	 * @desc ��ѯ·���в�ѯĳ����·��·��
	 * 
	 * @param {
	 * }
	 * @return 
	 */
	searchCondition : function() {
		var key = $get('search_key').value;
		$get("tipImg").style.display = "none";
		$get("tipMsg").style.display = "none";
		if (key === '������ؼ���') {
			$get("tipImg").style.display = "block";
			$get("tipMsg").style.display = "block";
			$get('tipMsg').innerHTML = '������ؼ��ֽ��в�ѯ';
			$get("condition").style.display = "none";
			return;
		}
		if (key === '') {
			$get("tipImg").style.display = "block";
			$get("tipMsg").style.display = "block";
			$get('tipMsg').innerHTML = '�ؼ��ֲ���Ϊ��';
			$get("condition").style.display = "none";
			return;
		}
		$get("tipImg").style.display = "none";
		$get("tipMsg").style.display = "none";
		searchRC.searchSecond(key, '������', true);
	},

	/**
	 * @method:  setRoad
	 * @desc ����·���ص�����ת�ݸ�suggest
	 * 
	 * @param {
	 * arr���ص�����
	 * }
	 * @return 
	 */
	setRoad : function(arr) {
		document.getElementById('infoFrm').contentWindow.SugCallBack(arr);
	},

	/**
	 * @method:  setCondition
	 * @desc ·����Ϣ�ص�����
	 * 
	 * @param {
	 * json���ص�����
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
			$get('tipMsg').innerHTML = '�����ڴ�·�������������룡';
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
			$get('tipMsg').innerHTML = '�����ڴ�·�������������룡';
			$get("condition").style.display = "none";
			return;
		}
		for ( var i = 0; i < txtInfo.length; i++) {
			html += '<tr><td align="left">';
			var direc = txtInfo[i].direction;
			direc = (direc == "EW" ? "����������" : (direc == "WE" ? "����������"
					: (direc == "NS" ? "�����Ϸ���" : "����������")));

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
					if (message === 'ӵ��') {
						html += '<td bgcolor="#ff0000" ';
					} else if (message === '����') {
						html += '<td bgcolor="#ffcc00" ';
					} else {
						html += '<td bgcolor="#00ff00" ';
					}
					html += 'style="color: white;font-weight: bold;font-size:9pt;">' + info + '</td>';
				} else {
					html += '</div></td></tr><tr><td style="font-size:9pt;" align="left">'
					html += obj.sName + "��" + obj.eName + "��</td>";
					var info = obj.info;
					var message = info.substring(0, 2);
					if (message === 'ӵ��') {
						html += '<td bgcolor="#ff0000" ';
					} else if (message === '����') {
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
		//�����ĵ����������ƫ�ƣ�ʹ���ݴ����ܹ���ʾ����
		popLonlat.lon = popLonlat.lon*1 + 0.025;
		
		g_map.panToLonLat(popLonlat);
		g_map.addPopup(hotAreaPopup);
	},
	
	showMapToZoom : function(){
		g_map.zoomTo(1);
	},

//------------------------------���·�����ʱδ�õ�--------------------------

	/**
	 * @method:  changebroadcastTraffic
	 * @desc ������²���
	 * 
	 * @param {
	 * obj������Ķ���
	 * type��1��������� 2���������
	 * cls�����������˳�򣨸��ٹ�·�ȣ�
	 * }
	 * @return 
	 */
	changebroadcastTraffic : function(obj, type, cls) {
		var other = null;
		for ( var i = 0; i < 5; i++) {
			if (type === 1) {
				other = $get(eval("'" + "broadCast" + i + "'"));
				$get('trf_Show_div').innerHTML = "���Ժ�...";
			} else {
				other = $get(eval("'" + "count" + i + "'"));
				$get('count_show_area').innerHTML = "<font style='font-weight:normal;'>���Ժ�...</font>";
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
	 * @desc ��ѯ·����ѯ��·��
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
		searchRC.searchFirst(key, '������', traffic.setRoad);
	}
};


traffic.init();