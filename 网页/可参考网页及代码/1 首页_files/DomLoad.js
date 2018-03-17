//DOM加载完执行
function EventUtil(fn) {
	var readyInterval;
	if (/MSIE/.test(navigator.userAgent)) {
		readyInterval = setInterval(
			function() {
				try {
					document.documentElement.doScroll('left');
					clearInterval(readyInterval);
					readyInterval = null;
					fn();
				} catch (ex) {}
			},
			50
		);
	} else if (!navigator.taintEnabled && !document.querySelector) {
		readyInterval = setInterval(
			function() {
				var rState = document.readyState;
				if (rState == 'complete' || rState == 'loaded') {
					clearInterval(readyInterval);
					readyInterval = null;
					fn();
				}
			},
			50
		);
	} else {
		document.addEventListener('DOMContentLoaded', fn, false);
	}
}

//判断浏览器
var Sys = {};
var ua = navigator.userAgent.toLowerCase();
var s;
(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
(s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
(s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
(s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
(s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

/*if (Sys.ie) document.write('IE: ' + Sys.ie);
if (Sys.firefox) document.write('Firefox: ' + Sys.firefox);
if (Sys.chrome) document.write('Chrome: ' + Sys.chrome);
if (Sys.opera) document.write('Opera: ' + Sys.opera);
if (Sys.safari) document.write('Safari: ' + Sys.safari);*/

//用className选择元素
function getByClass(sClass, parent) { // parent 可选
	var aEles = (parent || document).getElementsByTagName('*');
	var arr = [];
	for (var i = 0; i < aEles.length; i++) {
		var aClass = aEles[i].className.split(' ');
		for (var j = 0; j < aClass.length; j++) {
			if (aClass[j] == sClass) {
				arr.push(aEles[i]);
				break;
			}
		}
	}
	return arr;
}

//获取子节点和兄弟节点
function firstChild(obj) { //第一个子节点
	return obj.firstElementChild || obj.firstChild;
}

function lastChild(obj) { //最后一个子节点
	return obj.lastElementChild || obj.lastChild;
}

function prevSibling(obj) { //上一个兄弟节点
	return obj.previousElementSibling || obj.previousSibling;
}

function nextSibling(obj) { //下一个兄弟节点
	return obj.nextElementSibling || obj.nextSibling;
}

//获取非行间样式
function getStyle(obj, attr)
{
	if(obj.currentStyle)
	{
		return obj.currentStyle[attr];
	}
	return getComputedStyle(obj, false)[attr];
}


//运动框架
function startMove(obj, json, fn) {
	clearInterval(obj.timer);
	obj.timer = setInterval(function() {
		var bStop = true; //这一次运动就结束了——所有的值都到达了
		for (var attr in json) {
			//1.取当前的值
			var iCur = 0;

			if (attr == 'opacity') {
				iCur = parseInt(parseFloat(getStyle(obj, attr)) * 100);
			} else {
				iCur = parseInt(getStyle(obj, attr));
			}

			//2.算速度
			var iSpeed = (json[attr] - iCur) / 8;
			iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);

			//3.检测停止
			if (iCur != json[attr]) {
				bStop = false;
			}

			if (attr == 'opacity') {
				obj.style.filter = 'alpha(opacity:' + (iCur + iSpeed) + ')';
				obj.style.opacity = (iCur + iSpeed) / 100;
			} else {
				obj.style[attr] = iCur + iSpeed + 'px';
			}
		}

		if (bStop) {
			clearInterval(obj.timer);

			if (fn) {
				fn();
			}
		}
	}, 50);

	//获取非行间样式
	function getStyle(obj, attr) {
		if (obj.currentStyle) {
			return obj.currentStyle[attr];
		}
		return getComputedStyle(obj, false)[attr];
	}
}