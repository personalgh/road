EventUtil(function(){
	(function(){
		var oBanner = getByClass('banner')[0];
		var aImg = oBanner.getElementsByTagName('img');//图片的个数
		var oNum = getByClass('num',oBanner)[0];
		var aDiv = oNum.getElementsByTagName('div');
		//定义变量
		var iLen = aImg.length;
		var iCur = 0;
		var iTimer = null;
		var speed = 3000;

		//初始化-初始数字为1
		for(var i=1; i<=iLen; i++){
			oNum.innerHTML += '<div>'+i+'</div>';
		}
		aDiv[0].className = 'active';
		aImg[0].style.opacity = '100';
		aImg[0].style.filter = 'alpha(opacity=100);';

		//移入数字切换
		for(var i=0; i<iLen; i++){
			aDiv[i].index = i;
			aDiv[i].onmouseover = function(){
				iCur = this.index;
				show();
			}
		}
		//播放函数
		function show(){
			for(var j=0; j<iLen; j++){
				clearInterval(aImg[j].timer);
				aDiv[j].className = '';
				aImg[j].style.opacity = '0';
				aImg[j].style.filter = 'alpha(opacity=0);';
			}
			aDiv[iCur].className = 'active';
			startMove(aImg[iCur],{opacity : 100});
		}
		//自动播放
		iTimer = setInterval(function(){
			iCur = iCur == iLen-1 ? 0 : iCur+1;
			show();
		},speed);
		//移入暂停
		oBanner.onmouseover = function(){
			clearInterval(iTimer);
		}
		oBanner.onmouseout = function(){
			iTimer = setInterval(function(){
				iCur = iCur == iLen-1 ? 0 : iCur+1;
				show();
			},speed);
		}

	})();
});