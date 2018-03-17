var trafficTime;
var initLonlat;
var changeTrafficFlag = 0;
var flag = 0;

/**
 * 处理在0/1级添加Image图层，根据当前地图的中心点和解析率获取图片的跨度。
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
			if (this.Level1) {//判断是否已经添加了一级的Image图层，如果是则先移除。
				this.map.removeLayer(this.Level1);
				this.Level1 = null;
			}
			if (!this.Level0) {//判断当前是否已经添加第0级，没添加则加上，只加一次。
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
				window.setTimeout(__t1, 5);//延迟加载
			}
			return 'img/black.gif';//基础图层返回一个黑底图片	
		} else if (tileZ === this.map.minZoom + 1) {//同上，等级一时需要重新添加图片。
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
	} else {//等级2以上是需要移除Image图层。
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
	 * 获取Image 图层占据的Bounds
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
 * 处理在0/1级时还会去取路况图片问题。
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
		/*获取图片的地址的定时器*/
		timer : null,
		/*获取的等级*/
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
			function t() {//获取图片路径与时间戳
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
						var weekDay = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
					  	var dateStr = time.substring(0,4)+"-"+time.substring(4,6)+"-"+time.substring(6,8);
					  	var myDate = new Date(Date.parse(dateStr.replace(/-/g, "/"))); 
					  	//alert(weekDay[myDate.getDay()]);
					  	var minute = time.substring(10,12);
					  	if(minute%2!=0)minute--; 
					  	if(minute.toString().length===1)
					  		minute='0'+minute;
					  	$get('timeStampD').innerHTML = time.substring(0,4)+"年"+time.substring(4,6)+"月"+time.substring(6,8)+"日  "+time.substring(8,10) + " ：" + minute+" "+weekDay[myDate.getDay()];
						//$get('timeStampD').innerHTML = time.substring(8,10) + " ：" + time.substring(10,12);
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