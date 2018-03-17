var RIGHT_AREA_WIDTH = 340;

var $get = function(id) {
	return document.getElementById('infoFrm').contentWindow.document
			.getElementById(id);
};

var $id = function(id) {
	return document.getElementById(id);
};

var pageFlag = $id('flag').value;
var mapZoom = 1;

//根据弹出的不同页面，控制地图初始显示级别
switch(pageFlag){
	case '1' : mapZoom = 1; break;
	case '2' : mapZoom = 0; break;
	case '3' : mapZoom = 0; break;
}
//加载地图信息
var g_map = new CNavMap('map',
	{
		initZoom : mapZoom,
		maxZoom : 16,
		minZoom : 11,
		initCity : '北京',
		showLogo : false,
		eventListeners : {
			'zoomend':function(){
				if(g_map){
					var zoom = g_map.getZoom();
					if(zoom <= 1){
						//隐藏所有已经显示的泡泡窗口
						for(var i=0;i<g_map.popups.length;i++){
							g_map.popups[i].hide();						
						}
					}
				}
			}
		}
	}
)

/**
 *隐藏/显示右侧面板
 */
function frm_hide_disp() {
	var chg_map = document.getElementById('chg_map');
	var pz = layout.getPageSize();
	if ($id('rightArea').style.width === 0 + 'px') {
		layout.setMapArea();
		chg_map.src = "img/rBar.png";
	} else {
		$id('rightArea').style.width = 0 + 'px';
		$id('rightArea').style.display = 'none';
		$id('lftArea').style.width = (pz.WinW) + 'px';
		g_map.div.style.width = (pz.WinW - 15) + 'px';
		$id('map').style.width = (pz.WinW - 15) + 'px';
		g_map.updateSize();
		chg_map.src = "img/lBar.png";
	}
};

//控制显示，隐藏路况
function showTraffic(type){
	if(type == 0){
		g_map.closeTrafficLayer(function() {});
	}else{
		g_map.openTrafficLayer(function() {});
	}
	
}

var layout = {

	//获取页面与窗口大小
	getPageSize : function() {
		var scrW, scrH;
		if (window.innerHeight && window.scrollMaxY) {
			// Mozilla
			scrW = window.innerWidth + window.scrollMaxX;
			scrH = window.innerHeight + window.scrollMaxY;
		} else if (document.body.scrollHeight > document.body.offsetHeight) {
			// all but IE Mac
			scrW = document.body.scrollWidth;
			scrH = document.body.scrollHeight;
		} else if (document.body) { // IE Mac
			scrW = document.body.offsetWidth;
			scrH = document.body.offsetHeight;
		}

		var winW, winH;
		if (window.innerHeight) { // all except IE
			winW = window.innerWidth;
			winH = window.innerHeight;
		} else if (document.documentElement
				&& document.documentElement.clientHeight) {
			// IE 6 Strict Mode
			winW = document.documentElement.clientWidth;
			winH = document.documentElement.clientHeight;
		} else if (document.body) { // other
			winW = document.body.clientWidth;
			winH = document.body.clientHeight;
		}

		// for small pages with total size less then the viewport
		var pageW =  winW ;
		var pageH =  winH ;
		
		return {
			PageW : pageW,
			PageH : pageH,
			WinW : winW,
			WinH : winH
		};
	},
	//调整地图大小
	setMapArea : function() {
		var pz = this.getPageSize();
		$id('chg_map').style.height = pz.WinH + 'px';
		$id('chg_map').style.width = 12 + 'px';
		var offset = 1;
		if (pz.WinH - offset > 0) {
			g_map.div.style.height = (pz.WinH - offset) + 'px';
			$id('map').style.height = (pz.WinH - offset) + 'px';
		}
		if (pz.PageW - RIGHT_AREA_WIDTH - 12 > 0) {
			$id('lftArea').style.width = (pz.PageW - RIGHT_AREA_WIDTH) + 'px';
			g_map.div.style.width = (pz.PageW - RIGHT_AREA_WIDTH - 15) + 'px';
			$id('map').style.width = (pz.PageW - RIGHT_AREA_WIDTH - 15) + 'px';
		}
		$id('rightArea').style.display = 'block';
		$id('frm_none').style.display = 'block';
		$id('rightArea').style.width = (RIGHT_AREA_WIDTH - 3) + 'px';
		//alert($id('rightArea').style.width)
		//$id('infoFrm').style.height = (pz.WinH - 70) + 'px';
		g_map.updateSize();
	}
};
layout.setMapArea();

var init = function(){
	g_map.addControl(new CNavPanZoombar());
	searchRC = new CNavSearchRoadCondition( {
			map : g_map
	});
	searchRC.registerListenerSecond(this.setCondition);
	
	var pageFlag = $id('flag').value;
	if(pageFlag == 1){
		g_map.openTrafficLayer(function() {});
	}
	/*if(pageFlag == 2){
		g_map.zoomTo(2);
	}
	
	if(pageFlag == 3){
		g_map.zoomTo(3);
	}*/
}();