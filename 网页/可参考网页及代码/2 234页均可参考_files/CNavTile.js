var trafficTime;
var initLonlat;
var changeTrafficFlag = 0;
var flag = 0;

/**
 * ������0/1�����Imageͼ�㣬���ݵ�ǰ��ͼ�����ĵ�ͽ����ʻ�ȡͼƬ�Ŀ�ȡ�
 */
CNavTileCache = OpenLayers.Class(CNavTileCache, {
	getURL : function(bounds) {
		var res = this.map.getResolution();
		var bbox = this.map.getMaxExtent();
		var size = this.tileSize;
		var tileX = Math.round((bounds.left - bbox.left) / (res * size.w));
		var tileY = Math.round((bbox.top - bounds.top) / (res * size.h));
		var tileZ = this.map.zoom + this.map.minZoom;
		if (tileZ === this.map.minZoom) {
			if (this.Level1) {//�ж��Ƿ��Ѿ������һ����Imageͼ�㣬����������Ƴ���
				this.map.removeLayer(this.Level1);
				this.Level1 = null;
			}
			if (!this.Level0) {//�жϵ�ǰ�Ƿ��Ѿ���ӵ�0����û�������ϣ�ֻ��һ�Ρ�
				function t1() {
					var graphic = new /**OpenLayers.Layer.Image*/
					CNavImageLayer('VGA', 'img/black.gif', this.getBoundForTOCC(),
							new OpenLayers.Size(870, 870), {
								numZoomLevels : 2,
								alwaysInRange : true,
								isBaseLayer : false,
								level : 0
							});
					this.Level0 = graphic;
					//graphic.setVisibility(true);
					this.map.trafficLayer.stopInterval();
					this.map.addLayers( [ graphic ]);
					graphic.setVisibility(true);
					graphic.createTimer();
				}
				this.Level0 = true;
				var __t1 = OpenLayers.Function.bind(t1, this);
				window.setTimeout(__t1, 5);//�ӳټ���
			}
			return 'img/black.gif';//����ͼ�㷵��һ���ڵ�ͼƬ	
		} else if (tileZ === this.map.minZoom + 1) {//ͬ�ϣ��ȼ�һʱ��Ҫ�������ͼƬ��
			if (this.Level0) {
				this.map.removeLayer(this.Level0);
				this.Level0 = null;
			}
			if (!this.Level1) {
				function t2() {
					var graphic = new /**OpenLayers.Layer.Image*/
					CNavImageLayer('VGA', 'img/black.gif', this.getBoundForTOCC(),
					new OpenLayers.Size(870, 870), {
						numZoomLevels : 2,
						alwaysInRange : true,
						isBaseLayer : false,
						level : 1
					});
					this.Level1 = graphic;
					this.map.trafficLayer.stopInterval();
					this.map.addLayers( [ graphic ]);
					graphic.setVisibility(true);
					graphic.createTimer();
				}
			this.Level1 = true;
			var __t2 = OpenLayers.Function.bind(t2, this);
			window.setTimeout(__t2, 5);
		}
		return 'img/black.gif';
	} else {//�ȼ�2��������Ҫ�Ƴ�Imageͼ�㡣
		if (this.Level1 && this.Level1 !== true) {
			this.map.removeLayer(this.Level1);
			this.Level1 = null;
			if (this.map.trafficLayer) {
				this.map.trafficLayer.refresh();
				this.map.trafficLayer.startInterval();
			}
		}
		if (this.Level0 && this.Level0 !== true) {
			this.map.removeLayer(this.Level0);
			this.Level0 = null;
			if (this.map.trafficLayer) {
				this.map.trafficLayer.refresh();
				this.map.trafficLayer.startInterval();
			}
		}
	}
	if (this.center) {
		this.map.panToLonLat(this.center);
		this.center = null;
	}
	tileZ > MAX_ZOOM ? MAX_ZOOM : tileZ;
	if (tileZ == 3 && tileX > (Math.pow(2, tileZ) - 1)) {
		tileX = tileX - Math.pow(2, tileZ);
	}
	if (tileX < 0) {
		tileX = tileX + Math.round(bbox.getWidth() / bounds.getWidth());
	}
	if (tileY < 0) {
		tileY = tileY + Math.round(bbox.getHeight() / bounds.getHeight());
	}
	return this.getTilePic(tileX, tileY, tileZ);
	},
	
	
	/**
	 * ��ȡImage ͼ��ռ�ݵ�Bounds
	 */
	getBoundForTOCC : function() {
		var c = null;
		c = this.map.getCenter();
		if (!this.center){
			if(!initLonlat){
				initLonlat = this.map.getCenterLonLat();
			}
			this.center = initLonlat;
		}
		var res = this.map.getResolution();
		var w = 870 * res;
		var h = 870 * res;
		return new Bounds(c.lon - w / 2, c.lat - h / 2, c.lon + w / 2, c.lat + h/ 2);
	}
	
});



/**
 * ������0/1��ʱ����ȥȡ·��ͼƬ���⡣
 */
CNavTrafficTileCache = OpenLayers.Class(CNavTrafficTileCache, {
	getURL : function(bounds) {
		var res = this.map.getResolution();
		var bbox = this.map.getMaxExtent();
		var size = this.tileSize;
		var tileX = Math.round((bounds.left - bbox.left) / (res * size.w));
		var tileY = Math.round((bbox.top - bounds.top) / (res * size.h));
		var tileZ = this.map.zoom + this.map.minZoom;
		if (tileZ === this.map.minZoom) {
			return 'img/black.gif';

		} else if (tileZ === this.map.minZoom + 1) {
			return 'img/black.gif';
		}
		tileZ > MAX_ZOOM ? MAX_ZOOM : tileZ;
		if (tileZ == 3 && tileX > (Math.pow(2, tileZ) - 1)) {
			tileX = tileX - Math.pow(2, tileZ);
		}
		if (tileX < 0) {
			tileX = tileX + Math.round(bbox.getWidth() / bounds.getWidth());
		}
		if (tileY < 0) {
			tileY = tileY + Math.round(bbox.getHeight() / bounds.getHeight());
		}
		return this.getTilePic(tileX, tileY, tileZ);
	}
});

CNavImageLayer = OpenLayers.Class(
	OpenLayers.Layer.Image,
	{
		/*��ȡͼƬ�ĵ�ַ�Ķ�ʱ��*/
		timer : null,
		/*��ȡ�ĵȼ�*/
		level : null,

		initialize : function(name, url, extent, size, options) {
			OpenLayers.Layer.Image.prototype.initialize.apply(this,
					arguments);
		},
		destroy : function() {
			OpenLayers.Layer.Image.prototype.destroy.apply(this,
					arguments);
			this.destroyTimer();
		},
		createTimer : function() {
			function t() {//��ȡͼƬ·����ʱ���
				OpenLayers.loadURL('query.do', {
					serviceType : 'traffic',
					acode : '110000',
					cls : this.level,
					type : 0,
					timestamp : Math.random()
				}, this, this.success, this.failure);
			}
			var __t = OpenLayers.Function.bind(t, this);
			__t();
			this.timer = window.setInterval(__t, 60 * 3 * 1000);
		},
		destroyTimer : function(){
			if (this.timer) {
				window.clearInterval(this.timer);
				this.timer = null;
			}
		},
		success : function(resp){
			var txt = resp.responseText;
			if (txt === '') {
				return;
			}
			resp = eval('(' + txt + ')');
			if (resp) {
				var time = resp.sTime+"";
				trafficTime = time;
				//if (timeStamp%2!=0) (timeStamp--).toString();
				if(changeTrafficFlag > 0){
					flag += 1;
					if(time != '' && $get('timeStampD') != null){
						var weekDay = ["������", "����һ", "���ڶ�", "������", "������", "������", "������"];
					  	var dateStr = time.substring(0,4)+"-"+time.substring(4,6)+"-"+time.substring(6,8);
					  	var myDate = new Date(Date.parse(dateStr.replace(/-/g, "/"))); 
					  	//alert(weekDay[myDate.getDay()]);
					  	var minute = time.substring(10,12);
					  	if(minute%2!=0)minute--; 
					  	if(minute.toString().length===1)
					  		minute='0'+minute;
					  	$get('timeStampD').innerHTML = time.substring(0,4)+"��"+time.substring(4,6)+"��"+time.substring(6,8)+"��  "+time.substring(8,10) + " ��" + minute+" "+weekDay[myDate.getDay()];
						//$get('timeStampD').innerHTML = time.substring(8,10) + " ��" + time.substring(10,12);
					}
				}
				
				var url = resp.url;
				if (url && url != this.url) {
					this.setUrl(url);
				}
				util.broadcastTraffic(3,0);
			}
		},
		failure : function(resp) {

		},
		CLASS_NAME : 'CNavImageLayer'
	});