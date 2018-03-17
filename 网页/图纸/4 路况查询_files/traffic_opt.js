/**
 * @method: $id
 * @desc ��ȡԪ��
 * @param:Ԫ��id
 * @return 
 */
var $id = function(id) {
	return document.getElementById(id);
};

var curHotArea = '';

var suggest = {
	/**
	 * @method: activateSug
	 * @desc ����suggestion����
	 * 
	 * @param {
	 * 
	 * }
	 * @return 
	 */
	activateSug : function() {
		var txtWidth = 240;
		var lft = -2;
		var Sys = {};
		var ua = navigator.userAgent.toLowerCase();

		var c = $id('search_key');
		var offlft = c.offsetLeft + lft;
		var offtop = c.offsetTop + 135;
		if (window.ActiveXObject) {
			Sys.ie = ua.match(/msie ([\d.]+)/)[1];
		}
		if (Sys.ie) {
			txtWidth = 200;
			offtop = offtop - 3;
		}
		JQ("#search_key").setSerType('traffic');
		JQ("#search_key").Suggest(offlft, offtop, txtWidth);
	}
}

var g_map = window.parent.g_map;
var popLonlat;
var showHotPop = function(lon,lat,flag){
	showRedImage(flag);
	//return;
	//���������Ѿ���ʾ�����ݴ���
	for(var i=0;i<g_map.popups.length;i++){
		g_map.popups[i].hide();						
	}
	popLonlat = new LonLat(lon,lat);
	var params = {
		serviceType : "traffic",
		type : "1",
		picType:flag+'Pic'
	};
	OpenLayers.loadURL('query.do', params, this, showPhotoCallBack);
}

var showPhotoCallBack = function(resp){
	var txt = resp.responseText;
	if (txt === '') {
		return;
	}
	resp = eval('(' + txt + ')');
	if (resp) {
		var url = resp.url;
		var str = "<div style='width:500px;height:200px'><img src="+ url +" width='500px' height='200px'></div>";
		if(g_map.getZoom() <= 1){
			g_map.zoomTo(2);
		}
		window.parent.traffic.showPop(str,popLonlat);
	}
}

var showHotMap = function(image,mapLev){
	showRedImage(image);
	//���������Ѿ���ʾ�����ݴ���
	for(var i=0;i<g_map.popups.length;i++){
		g_map.popups[i].hide();						
	}
	g_map.zoomTo(mapLev);
}

var showRedImage = function(flag){
	var imageId = flag+'Image';
	$id('zgcImage').src = 'images/zgc.png';
	$id('wjImage').src = 'images/wj.png';
	$id('cbdImage').src = 'images/cbd.png';
	$id('sylwImage').src = 'images/sylw.png';
	$id('sqlwImage').src = 'images/sqlw.png';
	$id('sdjcImage').src = 'images/sdjc.png';
	$id(imageId).src = 'images/'+flag+'_red.png';
	curHotArea = flag;
}

//��ʾ������·����ѯ����
var showHideTraffic = function(){
	if($id('condition').style.display == 'none'){
		$id('condition').style.display = '';
	}else{
		$id('condition').style.display = 'none'
	}
}

var showOverRed = function(image){
	var imageId = image+'Image';
	$id(imageId).src = 'images/'+image+'_red.png';
}

var showOutRed = function(image){
	if(curHotArea == image){
		return;
	}
	var imageId = image+'Image';
	$id(imageId).src = 'images/'+image+'.png';
}

//��ʼҳ��ʱ����ӵ��·����Ϣ
var init_traffic = function() {
	//��ѯӵ������
	window.parent.util.broadcastTraffic(3, 0);
	window.parent.traffic.clearAll();
	window.parent.traffic.showMapToZoom();
	OpenLayers.Event.observe($id('search_btn'), 'click',
			window.parent.traffic.searchCondition);
	OpenLayers.Event.observe($id('search_key'), 'focus', function() {
		if ($id('search_key').value === '������ؼ���') {
			$id('search_key').value = '';
		}
		$id('search_key').focus;
		$id("tipImg").style.display = "none";
		$id("tipMsg").style.display = "none";
	});
	OpenLayers.Event.observe($id('search_key'), 'change', function() {
		var key = $id('search_key').value;
		key = key.replace(/(^\s*)/g, '');
		key = key.replace(/(\s*$)/g, '');
		$id('search_key').value = key;
	});
	suggest.activateSug();
	window.parent.div = {};
	window.parent.div = [ 'trf_jam_Area2' ];
	window.parent.changeTrafficFlag = 1;
	
	var timeStamp = window.parent.trafficTime;
	//if (timeStamp%2!=0) (timeStamp--).toString();
	if(timeStamp){
		var weekDay = ["������", "����һ", "���ڶ�", "������", "������", "������", "������"];
	  	var dateStr = timeStamp.substring(0,4)+"-"+timeStamp.substring(4,6)+"-"+timeStamp.substring(6,8);
	  	var myDate = new Date(Date.parse(dateStr.replace(/-/g, "/"))); 
	  	//alert(weekDay[myDate.getDay()]);
	  	var minute = timeStamp.substring(10,12); 
	  	if(minute%2!=0)minute--;  
	  	if(minute.toString().length===1)
	  		minute='0'+minute;
		$id('timeStampD').innerHTML = timeStamp.substring(0,4)+"��"+timeStamp.substring(4,6)+"��"+timeStamp.substring(6,8)+"��  "+timeStamp.substring(8,10) + " ��" + minute+" "+weekDay[myDate.getDay()];
	}
}();