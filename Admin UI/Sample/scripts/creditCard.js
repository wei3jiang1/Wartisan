/*
 * 此文件主要实现为3.1版本信用卡(包括支付宝等相关的支付机构)导帐单的业务逻辑部分
 */

//用户在账单抓取的过程中，先选定的主账户，给js端使用的
var userSelectedAid = "";

//用户选定的主账户id
var selectedAid = "";

var selectedSubAid = [0,0];

//用户选定的金融机构
var selectedBankId = "";

//用户在账单抓取的过程中，先选定的主账户的key，给js端使用的
var userKeyInfo = "";

//用户选定的账户的信用卡的关键字段信息
var keyInfo = "";

//当前获取的账单
var currentBill = "";

//记录用户的记录期限的
var transactionDuration = [];

//记录被选择手工帐的内容
var groupSelectedTransId = [];

//记录账户要match成为转账的业务
var groupToMatchTransId = [];

//记录相关的卡号末四位
var cardNumberLastFour = "";

//记录条数
var recordNumber = "";

//是否是新增账户  true为新增账户；默认为false；
var isNewAccount = false;

/*
 * 需要合并成转账的数据记录
 */
var needMergeData = [];

/*
 * 记录账单中的RMB的记录
 */
var RMBData = [];
//人民币余额
var RMBBalance = "E";
//人民币账号
var RMBKey = "";

/*
 * 记录账单中的第二币种的记录
 */
var secondCurrencyData = [];
//第二币种余额
var secondCurrencyBalance = "E";
//第二币种账号
var secondCurrencyKey = "";
/*
 * 0,银行，1，支付机构；每次抓取账单之后赋值
 */
var billClass = "";

/*
 * 默认要添加的支付对象
 */
var needPayee = ["支付宝","财付通","银联","快钱","易宝","环讯支付"];

/*
 * 需自动添加的支付对象的对应关系；记录name，id
 */
var payeeAbout = [];

/*
 * 记录将要做转账转换的记录，以数组形式保存，下标0位置记录原有记录的transId，下标1位置记录数组编号，1为RMB，2为第二币种，下标2位置 记录在数组内的下标
 */
var need2Trans = [];
/*
 * 发送给C的接口
 * param1:aid,账户id
 * param2:bankId,金融机构编码 
 * classes：抓取类型，1，借记卡；2，信用卡；default值为2；
 * keyInfo：绑定的卡号，卡号末尾四位或账户
 */


/*
 * 用户选择账户
 */
var selectAccount = [0,1];

var alreadyInsert = 0;

//一共有多少个月
var allMonth = [];

var during = [];

function sendGetBillInterface(bankId,classes,aId,aIdKeyInfo){
	//aId,aIdKeyInfo为适应两种接口所需的参数
	//目前情况无借记卡类型classes统一标记为2
	//更新全局变量的值；
	try{
		if( !(aId === undefined) ) userSelectedAid = aId;
		else userSelectedAid = "";
		if( !(aIdKeyInfo === undefined) ) userKeyInfo = aIdKeyInfo;
		else userKeyInfo = null;
		
		selectedBankId = bankId;
		
		MoneyHubJSFuc("sendGetBillInterface",userSelectedAid,selectedBankId,classes,userKeyInfo);	
		//关闭html的这边页面
		cancelAdd('chooseBank');
	} catch(e) {
        logCatch(e.toString());
		debug(e.message);
	}
}

/*
 * 初始化支付对象信息,取得payee相对应的id信息；
 */
function initPayee(){
	try{
	
	pLength = needPayee.length;
	for(var i=0;i<pLength;i++){
		var everyPayee = [];
		var pid = getPayeeId(needPayee[i]);
		if(pid>0){
			everyPayee.push(needPayee[i]);
			everyPayee.push(pid);
			payeeAbout.push(everyPayee);	
		} else {
			everyPayee.push(needPayee[i]);
			everyPayee.push(0);
			payeeAbout.push(everyPayee);
		}
	}
	//debug("payeeAbount="+payeeAbout+"\n");
		
	} catch(e){
        logCatch(e.toString());
		debug(e.message);
	}
}

/*
 * 创建新信用卡，支付用户用户
 */

function createSystemNewAccount(){
	try{
		var accountType="";
		//alert(selectedBankId);
		var bankId = getBankId(selectedBankId);
		if(selectedBankId!=""){
			var classes = selectedBankId.substring(0,1);
			//统一变成大写的进行比较
			switch (classes.toUpperCase()){
				case "A":
				//银行类型，再根据card类型判断是不是信用卡，目前3.1版本不需要
					accountType = 2;
				break;
				case "E":
					accountType = 4;
				break;
				default:
					accountType = 1;
				break;
			}
		}
		//alert(accountType);
		switch (accountType){
			case 2:
				//信用卡类型
				var bankInfo = getBankInfo(0);
				var bankName = "";
				$.each(bankInfo, function(i,n) {
					//4.0修改，采用别名的方式
					if( n.bankId == selectedBankId ){
						bankName = n.name;
						return false;
					} 
				});
				var name = bankName+"信用卡";
				var name1 = ""; 
				var num = getAccountNameNumber(selectedBankId,accountType);
				if(num>0){
					var accountNameList = getAccountName(selectedBankId,accountType);
					//自动生成用户名 逻辑
					var myBreak = false;
					var j=1;
					for(var i=0;i<j;i++){
						myBreak = false;
						if(i==0) name1=name;
						else name1=name+i;
						$.each(accountNameList, function(f, k) {
						  	if(k.aname==name1){
						  		myBreak = true;
						  		j++;
						  		return false;
						  	} 
						});
						if(!myBreak){
							name = name1;
							//alert(name1);
							break;
						}
					}
				}
				var accountId = addAccount(name, accountType, bankId, "", cardNumberLastFour);
				if(RMBData.length>0) var subAccountIdRMB = addAccountSub(accountId, 1, 0, 0, "", "", 201, "人民币","");
				if(secondCurrencyData.length>0) var subAccountIdUSD = addAccountSub(accountId, 2, 0, 0, "", "", 201, "美元","");
				//addAccountSub(accountId, tbCurrency_id, openbalance, balance, days, enddate, tbAccountType_id, subName, comment)
			break;
			case 4:
				//支付宝类型账户处理
				var name = "支付宝";
				var name1 = ""; 
				var num = getAccountNameNumber(selectedBankId,accountType);
				if(num>0){
					var accountNameList = getAccountName(selectedBankId,accountType);
					//自动生成用户名 逻辑
					var myBreak = false;
					var j=1;
					for(var i=0;i<j;i++){
						myBreak = false;
						if(i==0) name1=name;
						else name1=name+i;
						$.each(accountNameList, function(f, k) {
						  	if(k.aname==name1){
						  		myBreak = true;
						  		j++;
						  		return false;
						  	} 
						});
						if(!myBreak){
							name = name1;
							//alert(name1);
							break;
						}
					}
				}
				var accountId = addAccount(name, accountType, bankId, "", cardNumberLastFour);
				var subAccountIdRMB = addAccountSub(accountId, 1, 0, 0, "", "", 304, "人民币","");
			break;
		}
		selectedAid = accountId;
		//新建账户
		isNewAccount = true;
	} catch(e){
        logCatch(e.toString());
	}
}

/*
 * 删除用户特定区间段的手动数据数据
 */
function deleteUserTransList(){
	 //删除操作
	 deleteUserTrans();
	 returnBillXmlStep3();
}

/*
 * C调用接口，获取账单详情
 */
function returnBillXml(xml){
	currentBill = xml;
	debug("xml="+xml+"\n");
	$("#scoverCreditCard").show();
	shadowIsShowListener = setInterval(shadowIsShow,20);
}

function returnBillXmlStep1(){
	showWait("true");

	//进行xml解析，数据分拣存入数组；
	try{
		initPayee();
		getXmlData();
		debug("人民币数据="+RMBData+"\n");
		//生成现有的支付对象的关系数组
		getChangePayee();
		//账户选择,显示选择账户页面
		//根据实际情况，对界面内容进行生成
		changeImport();
		//相应时间里面绑定returnBillXmlStep2()	
	} catch(e){
        logCatch(e.toString());
	}
}

function returnBillXmlStep2(){
	//获取子账户信息
	getSubAccountInfo();
	//处理显示账户
	if(!isNewAccount){
		//显示用户时间段内的的手工列表
		showUserTransView();
	} else {
		returnBillXmlStep3();
	}
}

function returnBillXmlStep3(){
	//进行分拣处理
	isInsertAndTransferAndPayee();
	//需要早执行，要修改need2Trans
	billDataInsert();
	//根据处理的结果，显示转账列表
	if(need2Trans.length>0){
		//要显示列表，则有显示列表的处理事件来调用step4
		transactionViewList();
	} else {
		returnBillXmlStep4();
	}
}

function returnBillXmlStep4(){
	//增加数据记录
	//根据生成的数据源进行转账的生成
	//显示最后的提示框 
	debug("记录"+recordNumber+"::::::::::::"+alreadyInsert);
	if((recordNumber-alreadyInsert)==0) var info = "<br>导入成功，已导入"+alreadyInsert+"条记录。<br>&nbsp;";
	else var info = "<br>导入成功，已导入"+alreadyInsert+"条记录，未导入"+(recordNumber-alreadyInsert)+"条记录<br><br>未导入原因：记录已存在<br>&nbsp;";
	$("#lastMessageInfo").html(info);
	showAdd("lastMessage");
	//每次执行完，做相关的数据操作
	getBillLastAction();
	//关闭信用卡遮盖
	showWait("false");
	$("#scoverCreditCard").hide();
}

/*
 * 读取xml信息
 */
function getXmlData(){
	try{		
		//账单币种类型，用于账单数据时的分拣
		var dataType = 0;
		//总共记录条数
		var allNumber = 0;
		var xmldoc = "";
	    if (document.implementation && document.implementation.createDocument){
	        xmldoc = document.implementation.createDocument("","",null); 
	    } 
		
		//读取当前账单
		
		var oParser=new DOMParser();
		xmldoc=oParser.parseFromString(currentBill,"text/xml");
        
		//读取当前账单
		var data1=xmldoc.getElementsByTagName('OutputInfo')[0].childNodes;
		//账号解析
		accountNumber = data1[2].childNodes[0].nodeValue;
		if(typeof(data1[0].childNodes[0])!="undefined") selectedBankId = data1[0].childNodes[0].nodeValue;
		else selectedBankId = "";
		var tempAid = data1[1].childNodes[0].nodeValue;
		if( tempAid != "0" ) userSelectedAid = tempAid;
		else userSelectedAid = "";
		
		headFirst = getBankClass();
		//alert(accountNumber);
		/*
		if( !(aId === undefined) ) userSelectedAid = aId;
		else userSelectedAid = "";
		if( !(aIdKeyInfo === undefined) ) userKeyInfo = aIdKeyInfo;
		else userKeyInfo = null;
		selectedBankId = bankId;
		*/
		
		switch (headFirst){
			 case "a":
			 //银行类型
			 if(accountNumber.length==4) keyInfo = accountNumber;
			 else keyInfo = accountNumber.substring((accountNumber.length-4),accountNumber.length);
			 cardNumberLastFour = keyInfo;
			 break;
			 case "e":
			 //支付宝类型
			 keyInfo = accountNumber;
			 cardNumberLastFour = keyInfo;
			 break;
		}
		//数据解析
		var data2=xmldoc.getElementsByTagName('BillInfo')[0].childNodes;
		var d2len = data2.length;
		
		for(i=0;i<d2len;i++){
			var obj_billInfo = xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i];
			if(obj_billInfo.nodeType == 1){
				switch (xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[1].childNodes[0].nodeValue){
					//根据分支，确定是将数据那个数组
					case "RMB":
					dataType = 0;
					break;
					case "USD":
					dataType = 1;
					break;	
				}
				
				//余额赋值;
				if(dataType == 0 ){
				if(typeof(xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[0].childNodes[0])!="undefined"){
						RMBBalance = xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[0].childNodes[0].nodeValue;
					} else RMBBalance ="";
				} 
				if(dataType == 1 ){
					if(typeof(xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[0].childNodes[0])!="undefined"){
						secondCurrencyBalance = xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[0].childNodes[0].nodeValue;
					} else secondCurrencyBalance ="";
					
				} 
				l1 = xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes.length;
				
				
				
				for(j=2;j<l1;j++){
					var obj_content = xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[j];
					if(obj_content.nodeType == 1){
						l2 = xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[j].childNodes.length;
						allNumber = allNumber + (l2-1);
						var month = xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[j].childNodes[0].childNodes[0].nodeValue;
						
						//选取月份的长度=6的，进行数据更新
						if(month!=""){
							if( month.length == 6 ) allMonth.push(month);
							else if ( month.length == 16 ){
								during.push(month.substring(0,8));
								during.push(month.substring(8,16));
							} 
						} 
						for( var n = 1; n<l2;n++){
							var obj_content_detail = xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[j].childNodes[n];
							if(obj_content_detail.nodeType == 1){
								var myRecord = [];
								//记录所属的月份
								myRecord.push(month);
								//时间
								myRecord.push(xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[j].childNodes[n].childNodes[0].childNodes[0].nodeValue);
								//金额
								myRecord.push(xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[j].childNodes[n].childNodes[1].childNodes[0].nodeValue);
								//详情
								if( typeof(xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[j].childNodes[n].childNodes[2].childNodes[0]) != "undefined"){
									myRecord.push(xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[j].childNodes[n].childNodes[2].childNodes[0].nodeValue);
								} else myRecord.push("");
								//默认状态是否要插入；
								myRecord.push(0);
								//默认的交易对象的id，初始值为空
								myRecord.push(0);
								//交易对象
								//myRecord.push("");
								if( typeof(xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[j].childNodes[n].childNodes[3].childNodes[0]) != "undefined"){
									myRecord.push(xmldoc.getElementsByTagName('BillInfo')[0].childNodes[i].childNodes[j].childNodes[n].childNodes[3].childNodes[0].nodeValue);
								} else myRecord.push("");
								//根据不同的币种存入不同的数组中
								if(dataType == 0) RMBData.push(myRecord);
								else if(dataType == 1) secondCurrencyData.push(myRecord);
							}
						}
					}	
				}
			}
		}
		//记录条目
		
		recordNumber = RMBData.length+secondCurrencyData.length;
		debug("recordNumber = allNumber"+recordNumber+"::::::"+allNumber);
		//alert(selectedBankId +"::::::::"+ keyInfo+"");	
	} catch(e) {
        logCatch(e.toString());
		debug("1111"+e.message);
	}
	if(allMonth.length>0) allMonth=removeElement(allMonth);
}

/*
 * 根据备注处理交易对象，返回交易对象id，0为空；
 */
function changePayee(content){
	var name = "";
	var pid = 0;
	if(content!=""){
		pLength = payeeAbout.length;
		for( var i = 0; i < pLength; i++ ){
			//判断是否存在关键字,有关键字的数据；
			if(content.indexOf(payeeAbout[i][0])!=-1) {
				//存在关键字
				if( payeeAbout[i][1] > 0 ) {
					//已存在此交易对象
					pid = payeeAbout[i][1];
				} else {
					//添加一个交易对象,更新数组数据
					pid = addNewPayee(payeeAbout[i][0],"","");
					//更新树组数据
					payeeAbout[i].splice(1, 1, pid);
				}
				break;
			} else {
				pid = getPayeeId( content );
				if(pid == -1){
					//添加一个交易对象,更新数组数据
					pid = addNewPayee(content,"","");
				} 
			}
		}
	}
	return pid;
}

function getBankClass(){
	var test = "";
	if(selectedBankId != "") test = selectedBankId.substring(0,1);
	return test;
}

function showUserTransView(){
	try{
		//if(selectedAid=="") selectedAid=33;
		debug("selectedAid="+selectedAid);
		var list = getAllUserTransData(selectedAid);
		var num=0;
		if(list != ""){
			debug("1="+selectedAid);
			var first = '';
			$.each(list, function(i, n) {		
				//数据库查询接口问题未解决，导致逻辑复杂，以后调整好，可以移除
				var isView = false;
				if(allMonth.length>0){
					for(var i=0;i<allMonth.length;i++){
						if((n.TransDate.substring(0,4)+n.TransDate.substring(5,7))==allMonth[i]){
							isView = true;
							num++;
							break;
						}				
					}
				} else { 
					isView = true;
					num=1; 
				}
				if(isView){
					groupSelectedTransId.push(n.aid);
					first += '<tr>';
					first += '<td width=100>'+n.TransDate+'</td>';
					if (n.cname == "未定义收入" || n.cname == "未定义支出") {
						first += '<td width=100></td>';
					} else {
						if (n.bname == "CATA420") {
							//选择的是主分类
							first += '<td width=100><nobr>' + n.cname + '</nobr></td>';
						} else {
							first += '<td width=100><nobr>' + n.cname + ":" + n.bname + '</nobr></td>';	
						}	
					}
					if(n.Type == 0 ) {
						first += '<td width=100></td>';
						first += '<td width=100>'+n.Amount+'</td>';
					} else {
						first += '<td width=100>'+n.Amount+'</td>';
						first += '<td width=100></td>';
					}
					if(n.payeeName === undefined ) first += '<td width=100></td>';
					else first += '<td width=100><nobr>'+n.payeeName+'</nobr></td>';
					first += '<td width=100><nobr>'+n.aname+'</nobr></td>';
					first += '<td><nobr>'+n.acomment+'</nobr></td>';
					first += '</tr>';
				}
			});
			debug("2="+num);
			if(num>0){
				$('#myDeleteManuTable').html(first);
				showWait("false");
				showAdd("deleteManu");	
			} else {
				//流程控制到第三步
				returnBillXmlStep3();
			}
		} else {
			debug("3="+num);
			returnBillXmlStep3();
		}
	} catch(e){
        logCatch(e.toString());
		debug(e.message);
	}
}

/*
 * 处理点击账户确认按钮状态
 */

function submitSubAccount(){
	if(selectedAid==""){
		if($("#importAccountRaido2").hasClass("cur")){
			//新建账户
			createSystemNewAccount();
		} else {
			
			selectedAid=$('#billSaveAccount').val();
			MoneyHubJSFuc("ExecuteSQL","update tbaccount set UT = " + getUT() + ", keyInfo ='"+keyInfo+"' where id="+selectedAid);
		}
	}
	//submit方法点击后
	returnBillXmlStep2();
}

/*
 * 根据业务情况对importAccount进行渲染
 */
function changeImport(){
	try{
	//alert(selectedBankId +"::::::::"+ keyInfo+"");	
	var isContinue = true;
		if( selectedBankId != "" && keyInfo != ""){
			//alert("11111");
			//获取已绑定的账户ID
			//首先进行account和key的判断
			if(fromKeyInfoToAccountId1(keyInfo)>0){
				//优先匹配已绑定卡号
				//alert("222222");
				selectedAid = fromKeyInfoToAccountId(keyInfo)[0];
				//隐藏选择层
				$('#importAccountChoice').hide();
				//为ie6隐藏select
				$('#billSaveAccount').hide();
				$('#importAccount .label').css("background", "none");
				$('#importAccount .button').css("background", "none");
				
				$('#importAccountInfo1').hide();
			} else {
				if( userSelectedAid != "" ){
					//已经选择选定了主账户
					//alert("333333");
					selectedAid = userSelectedAid;
					if( userKeyInfo == "" ||　userKeyInfo != keyInfo ){
						//账号key为空或者不等于抓取的额key时，需要更新账户的keyIn
						//更新账户
						//alert("44444");
						updateAccountKeyInfo(userSelectedAid,keyInfo);
						$('#importAccountInfo1').show();
						$('#importAccountChoice').hide();
						//为ie6隐藏select
						$('#billSaveAccount').hide();
						$('#importAccount .label').css("background", "none");
						$('#importAccount .button').css("background", "none");
						
						var infoText1 = "将为您导入到当前账户："+getMySingleAccountName(selectedAid);
						$('#importAccountInfo1').html(infoText1);
					}
				} else {
					//获取无绑定记录的相关类型的账户
					var test1 = getBillAboutAccount();
					if(test1.length>0){
						//生成账户列表
						//alert("55555");
						$("#importAccount .list").empty();
						for(i=0;i<test1.length;i++){
							addOption("#importAccount", "billSaveAccount", test1[i][0], test1[i][1]);
						}
						selectOption("#importAccount", "billSaveAccount", test1[0][0]);
						$('#importAccountChoice').show();
						//ie6显示select
						$('#billSaveAccount').show();
						$('#importAccount .label').css("background", "url(../images/selectleft.png) no-repeat");
						$('#importAccount .button').css("background", "url(../images/selectarrow.gif) no-repeat");
						$('#importAccountInfo1').hide();
						//此赋值为流程控制
						isContinue = false;
					} else {
							//直接生成新账户
						//alert("6666");
						var infoText = "";
						headFirst = getBankClass();
						switch (headFirst){
							 case "a":
							 //银行类型
							 infoText = "未发现可供选择的信用卡账户，将为您自动新建一个信用卡账户，并导入已下载的交易记录";
							 break;
							 case "e":
							 //支付宝类型
							 infoText = "未发现可供选择的支付账户，将为您自动新建一个支付账户，并导入已下载的交易记录";
							 break;
						}
						$('#importAccountInfo1').html(infoText);
						$('#importAccountInfo1').show();
						$('#importAccountChoice').hide();
						//为ie6隐藏select
						$('#billSaveAccount').hide();
						$('#importAccount .label').css("background", "none");
						$('#importAccount .button').css("background", "none");
						//执行添加新账户;
						//alert("dsfsdgfdsgfdsgfsgfsg");
						createSystemNewAccount();
					}
				}
			}
		}
	}catch(e){
        logCatch(e.toString());
		//debug(e);
	}
	//根据前面的流程处理了流程分支
	if (isContinue) {
		returnBillXmlStep2();
	} else {
		showWait("false");
		showAdd("importAccount");
	}
}

/*
 * 用户提交表单
 */
function submitUserAccount(){
	//取得标记位
	var test = getChangeCheckClass(); 
	if(test==0){
		//选定了系统账户情况
		var accountId = $('#importAccount #account').val();
		selectedAid = accountId;
		//更新账号的keyInfo
		MoneyHubJSFuc("ExecuteSQL","update tbaccount set UT = " + getUT() + ", keyInfo ='" + keyInfo + "' where id="+accountId);
	} else {
		//建立系统账户
		createSystemNewAccount();
	}
}

/*
 * 添加数据记录
 */
function billDataInsert(){
	var tbCategory2_id = "";
	var amount = 0;
	var transactionClasses = 1;
	var transLength = need2Trans.length;
	var rL = 0;
	var sL = 0;
	if(RMBData.length>0){
		var l1 = RMBData.length;
		for(var i=0;i<l1;i++){
			if(RMBData[i][4]==0){
				rL++;
				if(keyInfo.length==4){
					//信用卡类型
					if(RMBData[i][2]>=0){
						//支出
						tbCategory2_id=10065;
						amount=RMBData[i][2];
					} else {
						//收入
						tbCategory2_id=10066;
						amount=Math.abs(RMBData[i][2]);
					}
				} else {
					//支付宝类型
					if(RMBData[i][2]<0){
						//支出
						tbCategory2_id=10065;
						amount=Math.abs(RMBData[i][2]);
					} else {
						//收入
						tbCategory2_id=10066;
						amount=RMBData[i][2];
					}
					
				}
				var myDate = RMBData[i][1].substring(0,4)+"-"+RMBData[i][1].substring(4,6)+"-"+RMBData[i][1].substring(6,8);
				//取得插入记录的id
				//5.0
				//var insertId= addTransaction(myDate, RMBData[i][5], tbCategory2_id, amount, '', selectedSubAid[0], '', specialReplace(RMBData[i][3]), '',transactionClasses, RMBData[i][1]);
				//5.1修改，增加了月份,RMBData[i][0]记录了
				var insertId= addTransaction(myDate, RMBData[i][5], tbCategory2_id, amount, '', selectedSubAid[0], '', specialReplace(RMBData[i][3]), '',transactionClasses, RMBData[i][1],RMBData[i][0]);
				debug("insertId = "+insertId+","+i+","+RMBData[i][2]+"\n");
				if(transLength>0){
					for(var zz=0;zz<transLength;zz++){
						if(need2Trans[zz][2]==i&&need2Trans[zz][1]==1){
							//将要数据的转账记录的数组下标替换为id记录
							//将第二个字段改为0，表示已经插入
							need2Trans[zz].splice(1,1,0);
							need2Trans[zz].splice(2,1,insertId);
							debug("need2Trans = "+need2Trans[zz]+"::::"+i+"\n");
							break;
						}
					}
					
				}	
				//不需进行balance调整，因为最后需要进行余额调整
			}
		}
	}
	debug("need2Trans = "+need2Trans+"\n");
	if(secondCurrencyData.length>0){
		var l1 = secondCurrencyData.length;
		for(var i=0;i<l1;i++){
			if(secondCurrencyData[i][4]==0){
				sL++;
				if(secondCurrencyData[i][2]>=0){
					//支出
					tbCategory2_id=10065;
					amount=secondCurrencyData[i][2];
				} else {
					//收入
					tbCategory2_id=10066;
					amount=Math.abs(secondCurrencyData[i][2]);
				}
				var myDate = secondCurrencyData[i][1].substring(0,4)+"-"+secondCurrencyData[i][1].substring(4,6)+"-"+secondCurrencyData[i][1].substring(6,8);
				//5.0代码
				//addTransaction(myDate, secondCurrencyData[i][5], tbCategory2_id, amount, "", selectedSubAid[1], "", secondCurrencyData[i][3], "",transactionClasses,secondCurrencyData[i][1]);
				//5.1修改，增加了月份,RMBData[i][0]记录了
				addTransaction(myDate, secondCurrencyData[i][5], tbCategory2_id, amount, "", selectedSubAid[1], "", secondCurrencyData[i][3], "",transactionClasses,secondCurrencyData[i][1],secondCurrencyData[i][0]);
				//不需进行balance调整，因为最后需要进行余额调整			
			}
		}
	}
	//取得已经插入的记录条数
	debug("rL+sL="+rL+":::"+sL);
	alreadyInsert = rL+sL;
}

/** 取得用户的子账户信息
 */
function getSubAccountInfo(){
	//人民币必有
	selectedSubAid.splice(0,1,getUniqueSubAccount(selectedAid,1));
	if(keyInfo.length==4) selectedSubAid.splice(1,1,getUniqueSubAccount(selectedAid,2));
}

/** 获取转账记录相关信息
 */
function transactionViewList(){
	//根据业务逻辑显示转账记录
	var tLength = need2Trans.length;
	debug("transactionViewList()="+need2Trans+"\n");
	var myHtml = "";
	if(tLength>0){
		var isView = false;
		for(var i=0;i<tLength;i++){
			//数据id1，id2
			if(need2Trans[i][1]==1){
				//显示时处理
				var sql1 = "SELECT a.id AS aId, tbcategory2_id AS cg2 FROM tbtransaction a, tbcategory1 b, tbcategory2 c, tbAccount d, tbSubAccount e "
					+ " WHERE e.tbAccount_id=d.id AND a.tbsubaccount_id=e.id AND a.tbcategory2_id=c.id AND c.tbcategory1_id=b.id "
					+ " AND sign='" + RMBData[need2Trans[i][2]][1] + "' AND transactionClasses=1 AND e.tbCurrency_id=1 AND d.keyinfo='" + keyInfo + "' "; 
				if (keyInfo.length == 4) {
					if (RMBData[need2Trans[i][2]][2] >= 0) {
						//支出
						sql1 += " AND b.type=0 AND amount=ABS(" + RMBData[need2Trans[i][2]][2] + ")" ;  	
					} else {
						//收入
						sql1 += " AND b.type=1 AND amount=ABS(" + RMBData[need2Trans[i][2]][2] + ")";
					}
				} else { 
					if (RMBData[need2Trans[i][2]][2] <= 0) {
						//支出
						sql1 += " AND b.type=0 AND amount=ABS(" + RMBData[need2Trans[i][2]][2] + ")";  	
					} else {
						//收入
						sql1 += " AND b.type=1 AND amount=ABS(" + RMBData[need2Trans[i][2]][2] + ")";
					}
				}
				try {
					debug("transactionViewList()="+sql1+"\n");
					result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql1));
				} catch(e) {
                    logCatch(e.toString());
				}
				//取得已经存在系统帐的id，存入need2Trans
				if ((result[0].cg2 != 10059) && (result[0].cg2 != 10060) && (result[0].cg2 != 10067)) {
					need2Trans[i].splice(1, 1, 0);
					need2Trans[i].splice(2, 1, result[0].aId);	
				} 
			}
			//已经确认替换成功，且符合条件
			if (need2Trans[i][1] == 0) {
				var list = getFullViewTransaction(need2Trans[i][0], need2Trans[i][2]);
				myHtml+='<div class="dAutoMerge">';
				myHtml+='<span class="sAMCheckBox"><span id="autoMergeCheck_'+i+'" class="sCheckBox"></span></span><span class="sAutoMerge"><div class="dRRBackground"><div class="dRRBLeft"></div><div class="dRRBCenter" style="width: 672px;"></div><div class="dRRBRight"></div></div>';
				myHtml+='<div id="dRTHeader"><table class="dRTTable"><tr><td>&nbsp;</td><td>时间</td><td>分类</td><td>收入金额</td><td>支出金额</td><td>付款/收款方</td><td>账户</td><td>备注</td></tr></table></div>';
				myHtml+='<div id="dRRDetail"><div id="transContent" class="content"><table class="dRightTable">';
				var first = "";
				var second = "";
				if (list != "") {
					
					$.each(list, function(j, n) {
						if (j == 0) {
							if(n.aid == need2Trans[i][2]){
								first += '<tr><td>账单记录</td>';
							} else {
								first += '<tr><td>本地记录</td>';
							}
							first += '<td>' + n.TransDate + '</td>';
							if (n.cname == "未定义收入" || n.cname == "未定义支出") {
								first += '<td></td>';
							} else {
								if (n.bname == "CATA420") {
									//选择的是主分类
									first += '<td>' + n.cname + '</td>';
								} else {
									first += '<td><nobr>' + n.cname + ":" + n.bname + '</nobr></td>';	
								}	
							}
							if(n.Type == 0 ) {
								first += '<td></td>';
								first += '<td>'+n.Amount+'</td>';
							} else {
								first += '<td>'+n.Amount+'</td>';
								first += '<td></td>';
							}
							first += '<td>'+n.aname+'</td>';
							if(n.payeeName === undefined ) first += '<td></td>';
							else first += '<td>'+n.payeeName+'</td>';
							first += '<td>'+n.acomment+'</td>';
							first += '</tr>';
						} else {
							if(n.aid == need2Trans[i][2]){
								second += '<tr><td>账单记录</td>';
							} else {
								second += '<tr><td>本地记录</td>';
							}
							second += '<td>'+n.TransDate+'</td>';
							if (n.cname == "未定义收入" || n.cname == "未定义支出") {
								second += '<td></td>';
							} else {
								if (n.bname == "CATA420") {
									//选择的是主分类
									second += '<td>' + n.cname + '</td>';
								} else {
									second += '<td>' + n.cname + ":" + n.bname + '</td>';	
								}	
							}
							if(n.Type == 0 ) {
								second += '<td></td>';
								second += '<td>'+n.Amount+'</td>';
							} else {
								second += '<td>'+n.Amount+'</td>';
								second += '<td></td>';
							}
							second += '<td>'+n.aname+'</td>';
							if(n.payeeName === undefined ) second += '<td></td>';
							else second += '<td>'+n.payeeName+'</td>';
							second += '<td>'+n.acomment+'</td>';
							second += '</tr>';
						}
					});
					if(list[0].aid == need2Trans[2]) myHtml = myHtml+first+second;
					else myHtml = myHtml+second+first;
					myHtml+='</table></div></div>';
					myHtml+='</span></div>';
					if(i==0){
						debug("myHtml="+myHtml);
					}
				}
				isView = true;	
			}
		}
		if(isView){
			//如果确定显示
			$("#dAutoMergeContainer").html(myHtml);
		//绑定点击操作
			lotIconViewAutoMerge()
			showWait("false");
			showAdd('autoMerge');	
		} else {
			//不显示直接进入第四步
			returnBillXmlStep4();
		}
	}
}

function test(){	
	addOption("#importAccount", "billSaveAccount", 111, "");
	selectOption("#importAccount", "billSaveAccount", 111);
	$('#importAccountChoice').show();
	showWait("false");
	showAdd("importAccount");
}

/** 处理转账逻辑
 */
function handleTransAction(){
	//处理用户的选择
	var selectedTransArray = new Array;
	$("span[id^='autoMergeCheck_']").each(function(index) {
  		if($(this).hasClass('sCheckBox2')){
	  		var indexPosition = $(this).attr("id").substring( ("autoMergeCheck_").length ,$(this).attr("id").length );
	  		if(indexPosition!="") selectedTransArray.push(indexPosition);
	  	}	
	});
	
	var stLength = 0;
	if(selectedTransArray!="") stLength=selectedTransArray.length;
	var transLength = need2Trans.length;
	
	for(var i=0;i<transLength;i++){
		//此循环判断是否选择了
		for(var t=0;t<stLength;t++){
			if(i==selectedTransArray[t]){
				var twoId = [];
				//当前为银行：need2Trans[i][0]为支付宝记录id，need2Trans[i][2]为银行id
				var result = getViewTransaction(need2Trans[i][0],need2Trans[i][2]);
				var myComment = "";
				var myDate = "";
				$.each(result, function(j, n) {
				  	//SELECT id AS aid, transdate as date, tbCategory2_id as ctid, comment as comment,
				  	//时间以银行为准，备注-》支付宝
				  	var temp = [];
					if(selectedBankId.substring(0,1)=="a"){
						if(n.aid == need2Trans[i][0] ) myDate = n.date1;
						else myComment = n.comment;  
					} else {
						//支付宝账户：need2Trans[i][0]为银行记录id，need2Trans[i][2]为支付宝id
						if(n.aid == need2Trans[i][2] ) myDate = n.date1;
						else myComment = n.comment;
					}
					temp.push(n.aid);
					//替换类型
					if(n.ctid == 10065) temp.push(10059);
					else temp.push(10060);
					temp.push(n.subId);
					twoId.push(temp);
				});
				
				for(var z=0;z<twoId.length;z++){
					var secId = -1;
					var mySub = -1;
					if(twoId[z][0] == need2Trans[i][0]){
						secId = need2Trans[i][2];
					} else {
						secId = need2Trans[i][0];
					}
					if( z==0 ) mySub = twoId[1][2];
					else mySub = twoId[0][2];
					var sql = "update tbtransaction set UT = " + getUT() + ", transdate = '"+myDate+"', tbCategory2_id="+twoId[z][1]+", comment = '"+myComment+"', direction ="+secId+", tbsubAccount_id1 = "+mySub+" where id = "+twoId[z][0];
					debug("update="+sql+"\n");
					MoneyHubJSFuc("ExecuteSQL",sql);
				}
			}
		}	
	}
	
	//执行完回归主业务逻辑
	returnBillXmlStep4();
}

/*
 * 处理页面的radio
 */
function changeCheckClass(){
	$("#importAccount li").each(function(i){
		$(this).toggleClass("cur");
	});
}

/*
 * 遍历取得class
 */
function getChangeCheckClass(){
	var myIndex = 0;
	$("#importAccount li").each(function(i){
		if($(this).hasClass("cur")){
			myIndex = i;
			return false;
		}   
	});
	return myIndex;
}

/*
 * 每次流程结束，开始数据重置
 */
function DataEmpty(){	
	userSelectedAid = "";
	//用户选定的主账户id
	selectedAid = "";

	selectedSubAid = [0,0];
	//用户选定的金融机构
	selectedBankId = "";
	//用户选定的账户的信用卡的关键字段信息
	keyInfo = "";

	//当前获取的账单
	currentBill = "";
	//记录用户的记录期限的
	transactionDuration = [];

	//记录被选择手工帐的内容
	groupSelectedTransId = [];

	//记录账户要match成为转账的业务
	groupToMatchTransId = [];

	//记录相关的卡号末四位
	cardNumberLastFour = "";

	//记录条数
	recordNumber = "";

	//是否是新增账户  true为新增账户；默认为false；
	isNewAccount = false;

	//需要合并成转账的数据记录
 	needMergeData = [];

	debug("请空前数据="+RMBData+"\n\n");
	
	RMBData = [];
	
	debug("请空后数据="+RMBData+"\n\n");
//人民币余额
	RMBBalance = 0;
	
//人民币账号
	RMBKey = "";
	
	secondCurrencyData = [];
	
	
//第二币种余额
	secondCurrencyBalance = 0;
	
//第二币种账号
	secondCurrencyKey = "";
	billClass = "";
	
	payeeAbout = [];
	
	debug("请空前数据="+need2Trans+"\n\n");
	
	need2Trans = [];
	
	debug("请空后数据="+need2Trans+"\n\n");
	
	selectAccount = [0,1];

	alreadyInsert = 0;
	
	allMonth = [];
	
	during = [];
	//清空账户选择的下拉框
	
}

//每次抓账单执行的最后一个流程
function getBillLastAction(){
	//更新月份
	handleAccountMonthRecord();
	//调整余额结束
	changeSubAccountBalance();	
	//渲染用户账目树
	createAccountTree();
	
	//渲染用户账目记录;
	//根据黄山需求，显示全部记录
	//viewAll();
	currentAid = selectedAid;
	
	currentsid = "";
 	//赋值给currentAid
 	//以下开始处理显示样式
 	
 	if(today[1] != "")  $('#'+today[1]).removeClass("now");
	today.splice(1, 1, "");
	isDuration = "temp";
	
	//移除批量的checkbox样式
	if($("#dBatchEditAllSelect").hasClass('sCheckBox2')) {
		$("#dBatchEditAllSelect").removeClass('sCheckBox2');
		$("#dBatchEditAllSelect").attr('value',0);
	}
	
	//处理结束
	renderTransView(selectedAid, "", 0, "");
	
	//处理本页面的account和payee
	addCurPageAccountAndPayee();
	//数据清空
	DataEmpty();
	
	//通知设置也面刷新
	MoneyHubJSFuc("SetParameter","AccountAutoCreated", "1");
 	MoneyHubJSFuc("SetParameter","PayeeAutoCreated", "1");	
	showWait("false");
}

/** 进行余额调整
 */
function changeSubAccountBalance(){
	//修改子账户余额
	var a = new Date();
	var month = "";
	var date = "";
	if((( a.getMonth() + 1 )+"").length == 1 ) month = "0" + ( a.getMonth() + 1 );
	else month = a.getMonth() + 1;
	if((a.getDate()+"").length == 1 ) date = "0" + a.getDate();
	else date =  a.getDate();
	var transdate = a.getFullYear()+"-"+month+"-"+date;
	//赋值为余额调整类型
	var tbCategory2_id = 10067;
	debug("人民币余额="+RMBBalance+","+secondCurrencyBalance+","+selectedSubAid[0]+","+selectedSubAid[1]+"\n")
	//系统账目类型
	var classes = 1;
	if(selectedSubAid[0]>0&&RMBBalance!="F"){
		var tempListId = addTransaction(transdate, 0, tbCategory2_id, RMBBalance, 0, selectedSubAid[0], '', '', 0, classes);
		//更新余额
		modifySubAccountBalance(selectedSubAid[0]);
	}
	var comment1 = "";
	if(selectedSubAid[1]>0&&secondCurrencyBalance!="F"){
		var tempListId = addTransaction(transdate, 0, tbCategory2_id, secondCurrencyBalance, 0, selectedSubAid[1], '', '', 0, classes);
		//更新余额
		modifySubAccountBalance(selectedSubAid[1]);
	}
}

/** 调用C显示等待图
 */
function showWait(status){
	//"true" 为显示，"false" 为关闭	
	try{
		MoneyHubJSFuc("ShowWaitWindow",status);	
	} catch(e){
        logCatch(e.toString());
    }
}

/** 执行用户抓账单月份记录
 */
function handleAccountMonthRecord(){
	//取得共有多少个不同的月，插入记录
	try{
		var aLength = 0;
		if( !(allMonth === undefined ) && allMonth!="" ){
			var aLength = allMonth.length; 
			for(var i=0;i<aLength;i++){
				//插入相关的记录
				insertAccountGetBillRecord(selectedAid,allMonth[i],keyInfo);
			}	
		}
	} catch(e){
        logCatch(e.toString());
	}
}

//移除数组内相同的元素
function removeElement(s){  
    var arr = [], map = {}, n, i;  
	for(i=0; i<s.length; i++){  
	    n = s[i];  
	    if(!map.hasOwnProperty(n)){  
	        map[n] = true;  
	        arr.push(n);  
	    }  
	}
	return arr;
} 
/** 账户选择的回调事件
 */
function importAccountCallBack(){
	showWait("true");
	//显示其他窗口的小叉子
	$('.boxClose').show();
	//调用了creditCard.mhs的submitSubAccount()方法
	submitSubAccount();	
}

/** 自动合并转账的回调事件1
 */
function autoMergeCallBack1(){
	//将全选重置
	showWait("true");
	//显示其他窗口的小叉子
	$('.boxClose').show();
	$("#dAMSelectAll").attr("value",0);
	handleTransAction();
}

/*
 * 自动合并转账的回调事件1
 */
function autoMergeCallBack2(){
	//显示其他窗口的小叉子
	$('.boxClose').show();
	$("#dAMSelectAll").attr("value",0);
	showWait("true");
	returnBillXmlStep4();
}

/*
 * 删除手工帐的回调事件1
 */
function deleteManuCallBack1(){
	//显示其他窗口的小叉子
	$('.boxClose').show();
	showWait("true");
	deleteUserTransList();
}

/*
 * 删除手工帐的回调事件2
 */
function deleteManuCallBack2(){
	//显示其他窗口的小叉子
	$('.boxClose').show();
	showWait("true");
	returnBillXmlStep3();
}

function importAccountListener(){
	if(!($("#importAccount").is(":visible"))){
		clearInterval(iAListener);
		importAccountCallBack();
	}
}

function autoMergeListener1(){
	if(!($("#autoMerge").is(":visible"))){
		clearInterval(aMListener1);
		autoMergeCallBack1();
	}
}

function autoMergeListener2(){
	if(!($("#autoMerge").is(":visible"))){
		clearInterval(aMListener2);
		autoMergeCallBack2();
	}
}

function deleteManuListener1(){
	if(!($("#deleteManu").is(":visible"))){
		clearInterval(dMListener1);
		deleteManuCallBack1();
	}
}

function deleteManuListener2(){
	if(!($("#deleteManu").is(":visible"))){
		clearInterval(dMListener2);
		deleteManuCallBack2();
	}
}

function shadowIsShow(){
	if(($("#scoverCreditCard").is(":visible"))){
		clearInterval(shadowIsShowListener);
		returnBillXmlStep1();
	}
}

function addCurPageAccountAndPayee(){
	//此方法调用了TabActivated()方法里面的处理方式
	//刷新account
	listAccount = getAccountList();				
	//刷新payee
	if (!$("#dRIn").is(":visible")) {
		oldPayee = $("#dRIn input[name='sPayee']").val();
	}
	if (!$("#dROut").is(":visible")) {
		oldPayee = $("#dROut input[name='sPayee']").val();
	}
	$("input[name='sPayee']").each(function () {
		$(this).parent().replaceWith("<select name='sPayee'></select>");
	});
	$("select[name='sPayee']").html(renderPayee());
	customizeSelect("#dRIn");
	customizeSelect("#dROut");
	
	if ($("#dRIn").is(":visible")) {
		selectOption("#dRIn", "sPayee", payeeChanged);
	} else {
		selectOption("#dRIn", "sPayee", oldPayee);
	}
	if ($("#dROut").is(":visible")) {
		selectOption("#dROut", "sPayee", payeeChanged);
	} else {
		selectOption("#dROut", "sPayee", oldPayee);
	}
	
	//批量修改时的收付款方下拉框
	$("input[name='lotPayee']").parent().replaceWith('<select id="lotPayee" name="lotPayee"><option value="-1">收付款方修改为</option></select>');
	$("#lotPayee").append(renderPayee());
	$("#lotPayee").attr("value", "-1");
	customizeSelect("#dBatchEdit")
}

/*
 * 系统交易插入数据库进行特殊字符串的处理
 */
//以下的校验规则应同客户端的validate方法一同修改
function specialReplace(str){
	var handleStr = "";
	handleStr = str.replace(/[%&*\\#`\n\t\'\"?\\\<\>\r]+/g," ");
	return handleStr;
}

