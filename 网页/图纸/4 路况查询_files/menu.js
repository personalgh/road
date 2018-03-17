var pageFlag = 0;

var pageFlag = document.getElementById("flag").value;
var mainWin = window.parent.document.getElementById('mainFrame').contentWindow;
function changePage(page){
	if(page == 0){
		window.open('http://www.bjjtw.gov.cn/');
	}else if(page == 1 && pageFlag != 1){
		window.open("Main.html");
	}else if(page == 2 && pageFlag != 2){
		window.open("RouteMain.html");
	}else if(page == 3 && pageFlag != 3){
		window.open("AutoMain.html");
	}else if(page == 4 && pageFlag != 4){
		window.open("DownLoadMain.html");
	}else if(page == 5){
		window.open("http://www.bjbus.com/map/index.php?uSec=00000160&uSub=00000161#c=12956000,4824875,10&hb=0,1");
	}else if(page == 6 && pageFlag != 6){
		window.open("TaxiMain.html");
	}
}

function showTraffic(){
	if(document.getElementById("trafficFlage").checked){
		mainWin.showTraffic(1);
	}else{
		mainWin.showTraffic(0);
	}
}

var init = function(){
	var myDate = new Date();
	var year = myDate.getFullYear();
	var month = myDate.getMonth()+1;
	var day = myDate.getDate();
	var weekDay = myDate.getDay();
	
	switch (weekDay){
		case 0: weekDay = "������"; break;
		case 1: weekDay = "����һ"; break;
		case 2: weekDay = "���ڶ�"; break;
		case 3: weekDay = "������"; break;
		case 4: weekDay = "������"; break;
		case 5: weekDay = "������"; break;
		case 6: weekDay = "������"; break;
	}
	
	document.getElementById("timeDiv").innerHTML = year + "��" + month + "��" + day + "�� " + weekDay
	
}();