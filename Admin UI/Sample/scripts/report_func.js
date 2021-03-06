var WeekFirstDay;
var WeekLastDay;
var MonthFirstDay;
var MonthLastDay;
var SeasonFirstDay;
var YearFirstDay;

var myDateRangeLeft="thismonth";
var myDateRangeRight="thisyear";

var myEndDate="";
var myStartDate="";
var	myDuring="";
var mychart="";
var resWidth = 0;
var resHeight = 0;

//解决统计报表页面未及时更新数据的问题
var tab_startDate = "";
var tab_endDate = "";
var tab_during = "";

/*
 * 记录当前的日期状况,下标0位置，记录during参数，下标1位置，记录从今天位移的位置
 * 
 * 初始默认为"week",0;
 */
var dateStatus = ["week", 0];

$(function() {
	//渲染上方的两个按钮
	$("#bank_tabs_title li").each( function (index) {
		$(this).unbind().click( function () {
			$("#bank_tabs_title li").removeClass("click");
			$(this).addClass("click");
			switch (index) {
				case 0:
					$("#tabs-1").show();
					$("#tabs-2").hide();
					$("#tabs-3").hide();
					GeneratePies(myDateRangeLeft, 'pie');
    				//$("#tabs-1 .dLeft div").removeClass("dSelectTab");
    				//$("#tabs-1 .dLeft :first").addClass("dSelectTab");
					break;

				case 1:
					$("#tabs-1").hide();
					$("#tabs-2").show();
					$("#tabs-3").hide();
					GeneratePies('thismonth', 'newPie');
					break;

				default:
					$("#tabs-1").hide();
					$("#tabs-2").hide();
					$("#tabs-3").show();
					GeneratePies(myDateRangeRight, 'bar');;
    				if(myDateRangeRight=="thisyear"){
    					$("#tabs-3 .dLeft div").removeClass("dSelectTab");
    					$("#tabs-3 .dLeft :first").addClass("dSelectTab");
    				}
					break;
			}
		});
	});

	//设定点左侧时的事件
    $(".dMainTab").each(function () {
	    $(this).click(function(){
		    $(this).addClass("dSelectTab");
			$(this).prevAll().removeClass("dSelectTab");
			$(this).nextAll().removeClass("dSelectTab");
		})
    });
    $(".dLeft :first").addClass("dSelectTab");

	initSize();
	$("body").css("top", "0px");
});

/** 窗口大小发生变化时调用此函数
 */
function initSize() {
	try {
		screenSize = MoneyHubJSFuc("GetScreenSize").split("x");
		resWidth = screenSize[0];
		resHeight = screenSize[1] - 30;
	} catch (e) {
        logCatch(e.toString());
		resWidth = 1324;
		resHeight = 468;
	}

	$(".dLeft").height(resHeight - $("#dReportButtons").height() - 6);
	$(".dRight").height($(".dLeft").height());
	$("#in").empty();
	$("#out").empty();
	$("#in2").empty();
	$("#out2").empty();
	$(".rvcharts").height($(".dLeft").height() - 165);
	$(".rvchart").height($(".dLeft").height() - 165);

	$(".dLeft").width(210);
	$(".dRight").width(resWidth - 220);

	$(".rvchart").width($(".dRight").width() * 0.49);
	if (!$('#tabs-1').is(':hidden')) { 
		if ((myStartDate == "") || (myEndDate == "")) {
			GeneratePies(myDateRangeLeft, "pie");
		} else {
			GeneratePies(myDateRangeLeft, "pie", myStartDate, myEndDate, "resize");	
		}
	} else if (!$('#tabs-3').is(':hidden')) {
		GeneratePies("", "newPie");
	}

    $("#tabs-2").width(resWidth);
	$("#rv1bottombar").css("padding-left", $(".dRight").width() / 2 - $("#rv1numincome").width() - $("#rv1barincome").width() - 20 + "px");
	$("#rv2bottombar").css("padding-left", $("#tabs-2").width() / 2 - $("#rv2numincome").width() - $("#rv2barincome").width() - 20 + "px");
}

Date.prototype.pattern=function(fmt) {     
    var o = {     
	    "M+" : this.getMonth()+1,     
	    "d+" : this.getDate(),     
	    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12,     
	    "H+" : this.getHours(),     
	    "m+" : this.getMinutes(),     
	    "s+" : this.getSeconds(),     
	    "q+" : Math.floor((this.getMonth()+3)/3),     
	    "S" : this.getMilliseconds()     
    };     
    var week = {     
	    "0" : "\u65e5",     
	    "1" : "\u4e00",     
	    "2" : "\u4e8c",     
	    "3" : "\u4e09",     
	    "4" : "\u56db",     
	    "5" : "\u4e94",     
	    "6" : "\u516d"    
    };     
    if(/(y+)/.test(fmt)){     
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));     
    }     
    if(/(E+)/.test(fmt)){     
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[this.getDay()+""]);     
    }     
    for(var k in o){     
        if(new RegExp("("+ k +")").test(fmt)){     
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));     
        }     
    }     
    return fmt;     
}   

/** 生成时间单位
 * @param dataRange 时间范围，可以为本周、上一周、下一周、本月等
 * @param charttype 图表类型，可以为bar, pie等
 * @param startDate1 指定时间时，指定的开始时间
 * @param endDate1 指定时间时，指定的结束时间
 * @param handleType "resize"
 */
function GeneratePies(dataRange, charttype, startDate1, endDate1, handleType) {
	if ( charttype == "pie" ) myDateRangeLeft=dataRange;
	if ( charttype == "bar" ) myDateRangeRight=dataRange;
	var startDate = "";
	var endDate = "";
	if ((handleType === undefined) || (handleType!="resize")) {
		var startDate = "";
		var endDate = "";
		var curDate = new Date();
		var during = "month";
		if (!MonthFirstDay) 
			dataRange = "thismonth";
		switch (dataRange) {
			case "thisweek":
				WeekFirstDay = new Date(curDate - (curDate.getDay() - 1) * 86400000);
				WeekLastDay = new Date((WeekFirstDay / 1000 + 6 * 86400) * 1000);
				startDate = WeekFirstDay.pattern("yyyy-MM-dd");
				endDate = WeekLastDay.pattern("yyyy-MM-dd");
				during = "week";
				break;
				
			case "prevweek":
				WeekFirstDay = new Date((WeekFirstDay / 1000 - 7 * 86400) * 1000);
				WeekLastDay = new Date((WeekLastDay / 1000 - 7 * 86400) * 1000);
				startDate = WeekFirstDay.pattern("yyyy-MM-dd");
				endDate = WeekLastDay.pattern("yyyy-MM-dd");
				during = "week";
				break;
				
			case "nextweek":
				WeekFirstDay = new Date((WeekFirstDay / 1000 + 7 * 86400) * 1000);
				WeekLastDay = new Date((WeekLastDay / 1000 + 7 * 86400) * 1000);
				startDate = WeekFirstDay.pattern("yyyy-MM-dd");
				endDate = WeekLastDay.pattern("yyyy-MM-dd");
				during = "week";
				break;
				
			case "thismonth":
				MonthFirstDay = new Date(curDate.getFullYear(), curDate.getMonth() + 1, 1);
				var MonthNextFirstDay;
				if (curDate.getMonth() == "12") {
					MonthNextFirstDay = new Date(curDate.getFullYear() + 1, 1, 1);
				} else {
					MonthNextFirstDay = new Date(curDate.getFullYear(), curDate.getMonth() + 1, 1);
				}
				MonthLastDay = new Date(MonthNextFirstDay - 86400000);
				startDate = MonthFirstDay.pattern("yyyy-MM-dd");
				endDate = MonthLastDay.pattern("yyyy-MM-dd");
				during = "month";
				
			case "prevmonth":
				MonthLastDay = new Date(MonthFirstDay - 86400000);
				if (MonthFirstDay.getMonth() == "1") {
					MonthFirstDay = new Date(MonthFirstDay.getFullYear() - 1, 12, 1);
				} else {
					MonthFirstDay = new Date(MonthFirstDay.getFullYear(), MonthFirstDay.getMonth() - 1, 1);
				}
				startDate = MonthFirstDay.pattern("yyyy-MM-dd");
				endDate = MonthLastDay.pattern("yyyy-MM-dd");
				during = "month";
				break;
				
			case "nextmonth":
				if (MonthFirstDay.getMonth() == "12") {
					MonthFirstDay = new Date(MonthFirstDay.getFullYear() + 1, 1, 1);
				} else {
					MonthFirstDay = new Date(MonthFirstDay.getFullYear(), MonthFirstDay.getMonth() + 1, 1);
				}
				var MonthNextFirstDay = new Date(MonthFirstDay.getFullYear(), MonthFirstDay.getMonth() + 1, 1);
				MonthLastDay = new Date(MonthNextFirstDay - 86400000);
				startDate = MonthFirstDay.pattern("yyyy-MM-dd");
				endDate = MonthLastDay.pattern("yyyy-MM-dd");
				during = "month";
				break;
				
			case "thisseason":
				var curMonth = curDate.getMonth() + 1;
				SeasonFirstDay = curDate;
				if(curMonth==1||curMonth==2||curMonth==3){
					startDate=curDate.getFullYear()+"-01-01";
					endDate=curDate.getFullYear()+"-03-31";
				}
				if(curMonth==4||curMonth==5||curMonth==6){
					startDate=curDate.getFullYear()+"-04-01";
					endDate=curDate.getFullYear()+"-06-30";
				}
				if(curMonth==7||curMonth==8||curMonth==9){
					startDate=curDate.getFullYear()+"-07-01";
					endDate=curDate.getFullYear()+"-09-30";
				}
				if(curMonth==10||curMonth==11||curMonth==12){
					startDate=curDate.getFullYear()+"-10-01";
					endDate=curDate.getFullYear()+"-12-31";
				}
				during = "season";
				break;
				
			case "prevseason":
				var curMonth=SeasonFirstDay.getMonth() + 1;
				if (curMonth == 1 || curMonth == 2 || curMonth == 3) {
					startDate = SeasonFirstDay.getFullYear() - 1 + "-10-01";
					endDate = SeasonFirstDay.getFullYear() - 1 + "-12-31";
					SeasonFirstDay = new Date(SeasonFirstDay.getFullYear() - 1, 10, 1);
				}
				if(curMonth==4||curMonth==5||curMonth==6){
					startDate=SeasonFirstDay.getFullYear()+"-01-01";
					endDate=SeasonFirstDay.getFullYear()+"-03-31";
					SeasonFirstDay = new Date(SeasonFirstDay.getFullYear(), 1, 1);
				}
				if(curMonth==7||curMonth==8||curMonth==9){
					startDate=SeasonFirstDay.getFullYear()+"-04-01";
					endDate=SeasonFirstDay.getFullYear()+"-06-30";
					SeasonFirstDay = new Date(SeasonFirstDay.getFullYear(), 4, 1);
				}
				if(curMonth==10||curMonth==11||curMonth==12){
					startDate=SeasonFirstDay.getFullYear()+"-07-01";
					endDate=SeasonFirstDay.getFullYear()+"-09-30";
					SeasonFirstDay = new Date(SeasonFirstDay.getFullYear(), 7, 1);
				}
				during = "season";
				break;
				
			case "nextseason":
				var curMonth = SeasonFirstDay.getMonth() + 1;
				if (curMonth == 1 || curMonth == 2 || curMonth == 3) {
					startDate = SeasonFirstDay.getFullYear()+"-04-01";
					endDate = SeasonFirstDay.getFullYear()+"-06-30";
					SeasonFirstDay = new Date(SeasonFirstDay.getFullYear(), 4, 1);
				}
				if (curMonth == 4 || curMonth == 5 || curMonth == 6) {
					startDate = SeasonFirstDay.getFullYear() + "-07-01";
					endDate = SeasonFirstDay.getFullYear() + "-09-30";
					SeasonFirstDay = new Date(SeasonFirstDay.getFullYear(), 7, 1);
				}
				if (curMonth == 7 || curMonth == 8 || curMonth == 9) {
					startDate = SeasonFirstDay.getFullYear() + "-10-01";
					endDate = SeasonFirstDay.getFullYear() + "-12-31";
					SeasonFirstDay = new Date(SeasonFirstDay.getFullYear(), 10, 1);
				}
				if (curMonth == 10 || curMonth == 11 || curMonth == 12) {
					startDate = SeasonFirstDay.getFullYear() + 1 + "-01-01";
					endDate = SeasonFirstDay.getFullYear() + 1 + "-03-31";
					SeasonFirstDay = new Date(SeasonFirstDay.getFullYear() + 1, 1, 1);
				}
				during = "season";
				break;		
				
			case "thisyear":
				YearFirstDay = curDate;
				startDate = curDate.getFullYear()+"-01-01";
				endDate = curDate.getFullYear()+"-12-31";
				during = "year";
				break;
			
			case "prevyear":
				YearFirstDay = new Date(YearFirstDay.getFullYear() - 1, 1, 1);
				startDate = YearFirstDay.getFullYear() + "-01-01";
				endDate = YearFirstDay.getFullYear() + "-12-31";
				during = "year";
				break;	
			
			case "nextyear":
				YearFirstDay = new Date(YearFirstDay.getFullYear() + 1, 1, 1);
				startDate = YearFirstDay.getFullYear() + "-01-01";
				endDate = YearFirstDay.getFullYear() + "-12-31";
				during = "year";
				break;
					
			case "specify":
				startDate = startDate1;
				endDate = endDate1;
				during = "month";
				break;
				
			case "all":
				startDate = "1900-01-01";
				endDate = "2200-01-01";
				during = "all";
				break;
		
			default:
				startDate = MonthFirstDay.pattern("yyyy-MM-dd");
				EndDate = MonthLastDay.pattern("yyyy-MM-dd");
				if (charttype == "bar") {
					during = "year";
				} else {
					during = "month";
				}
				break;
		}
		
		myEndDate = endDate;
		myStartDate = startDate;
		myDuring = during;
		mychart = charttype;
	} else {
		endDate = myEndDate;
		startDate = myStartDate;
		during = myDuring;
	}

	//更新当前日期状态
	if (charttype == "pie") {
		//生成收支饼图数据
		//渲染标题
		var tempTile="";
		$("#dprev").css({"visibility":"visible"});
		$("#dnext").css({"visibility":"visible"});
		$("#headertext").html(startDate + "至" + endDate + "的收支状况");	
		switch (during){
			case "week":
				$("#dprev").html("上周");
				$("#dnext").html("下周");
				break;

			case "month":
				$("#dprev").html("上个月");
				$("#dnext").html("下个月");
				break;

			case "season":
				$("#dprev").html("上个季度");
				$("#dnext").html("下个季度");
				break;

			case "year":
				$("#dprev").html("上一年");
				$("#dnext").html("下一年");
				break;
				
			case "all":
				$("#dprev").css({"visibility":"hidden"});
				$("#dnext").css({"visibility":"hidden"});
				$("#headertext").html("所有日期的收支状况");	
				
			default:
				break;
		}
		$("#dprev").unbind("click");	
		$("#dprev").click(function() {
			GeneratePies('prev' + during, 'pie');
		});
		$("#dnext").unbind("click");	
		$("#dnext").click(function() {
			GeneratePies('next' + during, 'pie');
		});
		tab_startDate = startDate;
		tab_endDate = endDate;
		tab_during = during;
		RenderPie(getXML(startDate, endDate, during, "Pie"));
	} else if (charttype == "bar") {
		//生成柱图数据
		$("#tabs-3-headertext").html(startDate + "至" + endDate + "的收支趋势");	
		switch (during){
			case "year":
				$("#tabs-3-dprev").html("上一年");
				$("#tabs-3-dnext").html("下一年");
				$("#tabs-3-dprev").css({"visibility":"visible"});
				$("#tabs-3-dnext").css({"visibility":"visible"});
				break;
				
			case "all":
				$("#tabs-3-dprev").css({"visibility":"hidden"});
				$("#tabs-3-dnext").css({"visibility":"hidden"});
				$("#tabs-3-headertext").html("所有日期的收支趋势");	
				
			default:
				break;
		}
		$("#tabs-3-dprev").unbind("click");	
		$("#tabs-3-dprev").click(function() {
			GeneratePies('prev' + during, 'bar');
		});
		$("#tabs-3-dnext").unbind("click");	
		$("#tabs-3-dnext").click(function() {
			GeneratePies('next' + during, 'bar');
		});
		tab_startDate = startDate;
		tab_endDate = endDate;
		RenderBar(getBarXml(startDate, endDate, "month"));
	} else {
		//生成资产
		tab_startDate = startDate;
		tab_endDate = endDate;
		tab_during = during;
		RenderNewPie(getXML(startDate, endDate, during, "newPie"));
	}
	$("#rv1bottombar").css("padding-left", $(".dRight").width() / 2 - $("#rv1numincome").width() - $("#rv1barincome").width() - 15 + "px");
	$("#rv2bottombar").css("padding-left", $("#tabs-2").width() / 2 - $("#rv2numincome").width() - $("#rv2barincome").width() - 15 + "px");
}

/** 生成收支饼图
 * @param xml 饼图数据
 */ 
function RenderPie(xml){
	var slideXml = "";
	dataPie = handlePieXmlData(xml);
	var result = "";
	var xmlIn = "";
	var xmlOut = "";
	for (var i=0; i<dataPie.length; i++) {
		if (i == 0) {
			//支出比例
			if (dataPie[i].length > 8) {
				//判断是否为空数据
				xmlOut = createXmlData(dataPie[i], "pie", 0);	
			} else {
				//错误数据
				emptyXMLTips("out");				
			}
		} else if (i == 1) {
			//收入比例
			if (dataPie[i].length > 8) {
				//判断是否为空数据,目前空数据格式:<chart>
				//不为空，处理数据，生成格式
				xmlIn = createXmlData(dataPie[i], "pie", 1);	
			} else {
				//数据为空
				emptyXMLTips("in");
			}
		} else if ((i == 2) || (i == 5)) {
			//底部数据和比例
			slideXml += dataPie[i];
		}
	}
	
	var getPercent = 0;
	var outPercent = 0;
	var getValue = 0;
	var outValue = 0;
	slideXml = slideXml.replace(/<chart>/g,"");
	slideXml = '<?xml version="1.0" encoding="utf-8" ?><test>' + slideXml + '</test>';
	slideXml = getXMLInstance(slideXml);
	$(slideXml).find("set").each(function(i){
		if (i == 0) outPercent = Math.abs($(this).attr("value"));
		if (i == 1) getPercent = Math.abs($(this).attr("value"));
		if (i == 2) {
			outValue = $(this).attr("value");
			//保留两位
			outValue = outValue.substring(0,outValue.indexOf(".")+3);  
		}
		if (i == 3) {
			getValue = $(this).attr("value");
			getValue = getValue.substring(0,getValue.indexOf(".")+3);
		} 
	});

	$("#rv1barincome").width(getPercent);
	$("#rv1baroutcome").width(outPercent);
	$("#rv1numincome").html(getValue + "元");
	$("#rv1numoutcome").html(outValue + "元");
	$("#sRVIncome").html(getValue);
	$("#sRVOutcome").html(outValue);

	//进行底部渲染
	var chartwidth = $("#rv1chartleft").width();
	var chartheight = $(".rvchart").height() - 22;
	if (chartheight > chartwidth) {
		chartheight = chartwidth;
	}
	$("#in").width(chartwidth);
	$("#in").height(chartheight);
	$("#out").width(chartwidth);
	$("#out").height(chartheight);
	if (xmlOut != "") {
		FusionCharts.setCurrentRenderer('javascript');
		var chart = new FusionCharts("./swf/Pie2D.swf", "ChartId", chartwidth, chartheight);
		chart.setDataXML(xmlOut);
		//chart.addParam("wmode", "Opaque");
		chart.render("out");
	}
	if (xmlIn != "") {
		FusionCharts.setCurrentRenderer('javascript');
		var chart1 = new FusionCharts("./swf/Pie2D.swf", "ChartId", chartwidth, chartheight);
		chart1.setDataXML(xmlIn);
		chart1.render("in");
	}
}

/** 生成资产饼图
 * @param xml 饼图数据
 */ 
function RenderNewPie(xml){
	var slideXml = "";
	dataPie=handlePieXmlData(xml);
	var result="";
	var xmlIn="";
	var xmlOut="";
	for (var i=0; i<dataPie.length; i++) {
		if (i == 1) {
			//判断是否为空数据
			if(dataPie[i].length>8){
				xmlOut=dataPie[i];
			} else { //错误数据
				emptyXMLTips("out");				
			}
		} 
		if (i == 0) {
			//判断是否为空数据,目前空数据格式:<chart>
			if (dataPie[i].length > 8) {
				//不为空，处理数据，生成格式
				xmlIn = dataPie[i];
			} else {
				//数据为空
				emptyXMLTips("in");
			}
		}
		if (i==2 || i==5) {
			slideXml+=dataPie[i];
		}
	}
	
	var getPercent=0;
	var outPercent=0;
	var getValue=0;
	var outValue=0;
	slideXml = slideXml.replace(/<chart>/g,"");
	slideXml = '<?xml version="1.0" encoding="utf-8" ?><test>'+slideXml+'</test>';
	slideXml = getXMLInstance(slideXml);
	$(slideXml).find("set").each(function(i){
		if(i==1) outPercent = Math.abs($(this).attr("value"));
		if(i==0) getPercent = Math.abs($(this).attr("value"));
		if (i == 3) {
			outValue = $(this).attr("value");
			//保留两位
			outValue = outValue.substring(0,outValue.indexOf(".")+3);  
		}
		if (i == 2) {
			getValue = $(this).attr("value");
			getValue = getValue.substring(0,getValue.indexOf(".")+3);
		} 
	});
	
	//将生成饼图逻辑后置，将收入支出值赋给xml文件
	if(xmlOut.length>8){
		xmlOut = createXmlData(xmlOut, "newPie", 0, outValue);
	}	
	if(xmlIn.length>8){
		xmlIn = createXmlData(xmlIn, "newPie", 1, getValue);
	}
	
	$("#rv2barincome").width(getPercent);
	$("#rv2baroutcome").width(outPercent);
	$("#rv2numincome").html(getValue + "元");
	$("#rv2numoutcome").html(outValue + "元");
	$("#sRV2Income").html(getValue);
	$("#sRV2Outcome").html(outValue);

	$("#rv2chartleft").width(resWidth * 0.49);
	$("#rv2chartright").width(resWidth * 0.49);
	var chartwidth = $("#rv2chartleft").width();
	var chartheight = $("#rv2chartleft").height() - 22;

	if (xmlOut != "") {
		FusionCharts.setCurrentRenderer('javascript');
		var chart = new FusionCharts("./swf/Pie2D.swf", "ChartId", chartwidth, chartheight);
		chart.setDataXML(xmlOut);
		chart.render("out2");
	}
	
	if (xmlIn != "") {
		FusionCharts.setCurrentRenderer('javascript');
		var chart1 = new FusionCharts("./swf/Pie2D.swf", "ChartId", chartwidth, chartheight);
		chart1.setDataXML(xmlIn);
		chart1.render("in2");
	}
}

/** 生成柱图
 * @param xml 数据源
 */
function RenderBar(xml) {
	var searchString = "<categories />";
	if(xml.indexOf(searchString)<0){
		xmlBar = createXmlData(xml, "bar");
		var chartwidth = $(".dRight").width();
		var chartheight = $(".dRight").height() - 50;
		FusionCharts.setCurrentRenderer('javascript');
		var chartBar = new FusionCharts("./swf/ScrollStackedColumn2D.swf", "ChartId", chartwidth, chartheight);
		chartBar.setDataXML(xmlBar);
		chartBar.render("bar");	
	} else {
		emptyXMLTips("bar");
	}
	
}

//解决建立了新账户或收入、支出之后未刷新的问题
function TabActivated(){
	var BalanceChangedR = "-1";
	var Report_Changed = "-1";
	reloadReport = "-1";
	try {
		BalanceChangedR = MoneyHubJSFuc("GetParameter","BalanceChangedR");
		MoneyHubJSFuc("SetParameter","BalanceChangedR", "-1");
		Report_Changed = MoneyHubJSFuc("GetParameter","Report_Changed");
		MoneyHubJSFuc("SetParameter","Report_Changed", "-1");
		reloadReport = MoneyHubJSFuc("GetParameter","ReloadReport");
		MoneyHubJSFuc("SetParameter","ReloadReport", "-1");
	} catch (e) {
	} 
	if (reloadReport != "-1") {
	   window.location.reload();
	}
	if ((BalanceChangedR == "1") || (Report_Changed == "1")) {
		var tab_current = " ";
		var tab_currentXml = " ";
		$("#bank_tabs_title li").each(function(){
			if($(this).hasClass("click")){
				tab_current = $(this).html();
				if(tab_current == "收支统计"){
					RenderPie(getXML(tab_startDate,tab_endDate,tab_during,"Pie"));
				}
				if(tab_current == "资产统计"){
					RenderNewPie(getXML(tab_startDate,tab_endDate,tab_during,"newPie"));
				}
				if(tab_current == "收支趋势"){
					RenderBar(getBarXml(tab_startDate, tab_endDate, "month"));
				}
			}
		});
	}
} 

function emptyXMLTips(divId) {
	var content = "<div class='dEmptyData'>此时间段无数据</div>";
	$("#" + divId).html(content);
}

function chkFlash() {
    var hasFlash = true;
    try{
        var objFlash = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
    } catch(e) {
        hasFlash = false;
    }
    return hasFlash;
}


//未有flash 播放器处理
function noFlashPlayerView(){
	if(!chkFlash()){
		var content="因您未安装flash播放器，统计图无法显示，请您安装flash player播放器";
		$("#in").empty().append(content);
		$("#in2").empty().append(content);
		$("#out").empty().append(content);
		$("#out2").empty().append(content);
	}
}
/*
 * 根据用户操作更新当前日期
 * param during 
 * param p1 "+" 为下一,"-" 为上一
 */

function setNewCurrentDay(during,p1){
	if(during==dateStatus[0]){
		//相同标签，更新状态值即可
		if(p1=="+"){
			result = dateStatus.splice(1,1,dateStatus[1]+1);	
		}else{
			result = dateStatus.splice(1,1,dateStatus[1]-1);
		}
		 
	}
}

