/*
 * sql中的变量统一使用单引号"'"
 */

/** 取得所有账户
 */
 
var deleteStatus = " set mark = 1 "; //标记为1，删除 

/*设置参数*/
String.prototype.setP = function(value){
	return this.replace(/\?/, value);
}

String.prototype.trim = function(){
    return this.replace(/^\s*(.*?)\s*$/, "$1");
}

function getAccountList() {
    var result = [];
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT a.id AS aid, a.name AS aname, b.name AS bname, b.id AS bid, tbBank_id, a.tbAccountType_id AS tid, b.tbAccountType_id AS tid2, "
			+ "tbCurrency_id, b.Balance AS Balance, b.Days AS Days, b.EndDate AS EndDate, a.Comment AS acomment, b.Comment AS bcomment, keyInfo, BankID as bankId FROM tbAccount a, tbSubAccount b LEFT JOIN tbbank c ON c.id=tbBank_id WHERE a.id=b.tbAccount_id and a.mark = 0 and b.mark = 0 ORDER BY a.id DESC, tid2, bid"));//new
	} catch (e) {
        logCatch(e.toString());
		result = [{
			"aid": 1,
			"aname": "aaa",
			"bname": "bbb",
			"bid": 123456789123456789,
			"tid": 3,
			"tid2": 100
		}];
	}
	return result;
}

function getBytes(chrList) {
    var bytes = [];
    for (var i=0; i<chrList.length; i++) {
        c = "";
        ch = chrList.charAt(i);
        execScript("c = Hex(Asc(ch))", "vbscript");
        bytes.push(c);
    }
    return bytes;
}

/** 取得某一类型的所有金融机构
 * @param classId 金融机构类型编号
 */
function getBankInfo(classId) {
    var result = [];
	try {
		 result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT id AS id, name AS name, bankId AS bankId, classId AS classId, Website AS Website FROM tbBank WHERE classId=" + classId + " AND mark = 0 ORDER BY CASE WHEN id<10000 THEN id ELSE name END"));//new
    } catch (e) {
        logCatch(e.toString());
    	result = [{
    		"id": 1,
    		"name": "支付宝",
    		"bankId": "e001",
    		"classId": 1,
    		"Website": "www.boc.cn"
		}];
    }
    return result;
}

/** 取得某金融机构的所有信息
 * @param id 金融机构编号
 */
function getSingleBankInfo(id){
	var result = [];
	try {
        result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT id, name, bankId, classId FROM tbbank WHERE mark = 0 and id=" + id));//new
    } 
    catch (e) {
        logCatch(e.toString());
    }
    return result;
}

/** 添加用户金融机构
 * @param name 金融机构名称
 * @param classes 金融机构类型
 */  
function insertBank(name, classes, website) {
	//用户初始基准
	//var result = false;
	//var initPre = 10000;
	//var bankId = -1;
    /*
	try {
        result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT MAX(id) AS id FROM tbBank"));
    } catch (e) {
        logCatch(e.toString());
        var result = [{
            "id": 100
        }];
    }
	$.each(result, function(i, n){
		if (n.id >= initPre) {
			bankId = n.id + 1;
		} else{
			bankId = initPre;
		}
	});
	*/
	var bankId;
	try {
	    bankId = getMyId();
		name = replaceSQLStr(name).trim();
		if (MoneyHubJSFuc("ExecuteSQL","INSERT INTO tbBank(id, name, classId, Website, UT) VALUES(" + bankId + ", '" + name + "', "+ classes + ",'" + website + "', " + getUT() + ")") > 0);//new
    } catch (e) {
        logCatch(e.toString());
	    bankId = -1;
    }
	return bankId;
}

/** 更改金融机构名称
 * @param id 金融机构编号
 * @param name 金融机构名称
 */  
function updateBank(id, name, website) {
	name = replaceSQLStr(name);
	var result = false;
	var UT = getUT();
	try {
		if (MoneyHubJSFuc("ExecuteSQL","UPDATE tbBank SET name='" + name + "', website='" + website + "', UT = " + UT + " WHERE id=" + id) > 0) {//new
			result = true;
		}
    } catch (e) {
        logCatch(e.toString());
    }
	return result;
}

/** 删除金融机构
 * @param id 金融机构编号
 */ 
function deleteBank(id){
	// var sql1="delete from tbBank where id = "+id;
	var sql1 = "update tbBank" + deleteStatus + ", UT = " + getUT() + " where mark = 0 and id =" + id;
	var sql2 = "update tbAccount set tbBank_id ='' where tbBank_id = " + id;
	try {
		MoneyHubJSFuc("ExecuteSQL",sql2);
		MoneyHubJSFuc("ExecuteSQL",sql1);
    }catch (e) {
        logCatch(e.toString());
    }
}

/** 取得分类相关信息
 */
function getCategoryInfo() {
	var result = [];
	try {
        //result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT a.id AS id1, b.id AS id2, a.name AS name1, b.name AS name2, type FROM tbCategory1 a, tbCategory2 b WHERE a.id=b.tbCategory1_id AND (a.id<10000 OR a.id>10025) AND a.mark = 0 AND b.mark = 0 ORDER BY a.id ASC, CASE WHEN name2='CATA420' THEN 0 ELSE 1 END, b.id"));//new
    	//4.0根据seq进行排序
    	result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT a.id AS id1, b.id AS id2, a.name AS name1, b.name AS name2, type,a.seq FROM tbCategory1 a, tbCategory2 b WHERE a.id=b.tbCategory1_id AND (a.id<10000 OR a.id>10025) AND a.mark = 0 AND b.mark = 0 ORDER BY a.seq, a.id asc, CASE WHEN name2='CATA420' THEN 0 ELSE 1 END, b.id"));//new
    } catch (e) {
        logCatch(e.toString());
    	//alert(e.message);
    }
    return result;
}

/** 获取所有二级分类
 */ 
function getCategory1Default(type){
	var result = [];
	try{
        var sql= "select a.id as id1, b.id as id2, a.name as name1, b.name as name2, type from tbCategory1 a, tbCategory2 b where a.id=b.tbCategory1_id and a.mark = 0 and b.mark = 0 and a.id not in (10018,10019,10020,10021,10023,10024) and b.name='CATA420'"; //new
        if(!(type === undefined )) sql+=" and type= "+type+" ";
        //sql+=" order by a.id asc "; 
        sql+=" order by a.seq,a.id asc "; //排序根据seq升序进行排序 
        result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql));
    } catch (e) {
        logCatch(e.toString());
    	//alert(e.message);
    }
    return result;
}

/** 获取所有一级分类
 */ 
function getCategory1Info(){
    var result = [];
	try {
        //result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT id, Name, Type FROM tbCategory1 WHERE mark=0 AND (id<10000 OR id>10025)"  ));//new
        //4.0根据seq进行排序
        result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT id, Name, Type FROM tbCategory1 WHERE mark=0 AND (id<10000 OR id>10025) order by seq,id asc"));//new
        //alert("SELECT id, Name, Type FROM tbCategory1 WHERE mark=0 AND (id<10000 OR id>10025) order by seq asc");
    } catch (e) {
        logCatch(e.toString());
    	debug(e.message);
    }
    return result;
}

/** 添加一级分类
 * @param name1 一级分类名称
 * @param type 收入还是支出
 */  
function addCategory1(name1, type) {
	var id1 = 0;
	name1 = replaceSQLStr(name1).trim();
	try {
	    var tempId = getMyId(),
	    UT = getUT();
	    //4.0添加了手工分类的默认序mySeq
	    var mySeq = 1000;
		MoneyHubJSFuc("ExecuteSQL","INSERT INTO tbCategory1(id, name, type, UT, seq) VALUES(" + tempId + ",'" + name1 + "', " + type + ", " + UT + ",  " + mySeq + ")");//new
		id1 = tempId;
	} catch(e) {
        logCatch(e.toString());
		id1 = 3;
	}
	return id1;
}

/** 添加二级分类
 * @param id 一级分类编号
 * @param name1 二级分类名称
 */  
function addCategory2(id, name) {
	name = replaceSQLStr(name).trim();
	var id1 = 0;
	try {
	    var tempId = getMyId(),
	    UT = getUT();
		MoneyHubJSFuc("ExecuteSQL","INSERT INTO tbCategory2(id, name, tbCategory1_id, UT) VALUES(" + tempId + ",'" + name + "', " + id + ", " + UT + ")");//new
		id1 = tempId;
	} catch(e) {
        logCatch(e.toString());
	}
	return id1;
}

/** 更改分类信息
 * @param classId 1表示修改一级分类，2表示修改二级分类
 * @param name 分类名称
 * @param id 分类编号
 * @param parentId 父分类编号 
 */   
function updateCategory(classId, name, id, parentId) {
	var result = false;
	var table = "tbCategory2";
	name = replaceSQLStr(name).trim();
	var strParent = "";
	if (classId == 1) {
		table = "tbCategory1";
	} else {
		strParent = ", tbCategory1_id=" + parentId;
	}
	try {
	    var UT = getUT();
		if (MoneyHubJSFuc("ExecuteSQL","UPDATE " + table + " SET name='" + name + "'" + strParent + ", UT = " + UT + " WHERE id=" + id) > 0)//new
			result = true;
			try {
				MoneyHubJSFuc("SetParameter","Report_Changed", "1");
			} catch (e) {
                logCatch(e.toString());
			}
    } catch(e) {
        logCatch(e.toString());
    }
	return result;
}

/** 删除分类
 * @param classId 1表示删除一级分类，2表示删除二级分类
 * @param id 分类编号
 */  
function deleteCategory(classId, id) {   
	var result = false;
	var table = "tbCategory2";
	if (classId == 1)
		table = "tbCategory1";
	try {
		if (MoneyHubJSFuc("ExecuteSQL","UPDATE " + table + deleteStatus + ", UT = " + getUT() + " WHERE mark = 0 and id=" + id) > 0)//new
			result = true;
			try {
				MoneyHubJSFuc("SetParameter","Report_Changed", "1");
			} catch (e) {
                logCatch(e.toString());
			}
    } catch(e) {
        logCatch(e.toString());
    }
	return result;
}

/** 取得所有币种
 */
function getCurrencyInfo(){
	var result = [];
    try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT id, Name FROM tbCurrency ORDER BY id ASC"));
    } catch(e) {
        logCatch(e.toString());
    }
    return result;
}

/** 取得币种内容
 * @param id 币种编号
 */
function getCurrencyDesc(id) {
	var result = "";
	$.each(listCurrency, function(i, n) {
		if(id == n.id) {
			result = n.Name;
			return false;
		}
	});
	return result;
}

/** 取得支付对象相关信息
 * @param id 支付对象编号
 * @return 支付对象列表 
 */ 
function getPayeeInfo(id){
	var result = [];
	try {
        var queryString = "";
        if(id === undefined )
			queryString= "SELECT id, name, email, tel FROM tbPayee WHERE mark = 0 ORDER BY name ASC";//new
        else
			queryString = "SELECT id, name, email, tel FROM tbPayee WHERE mark = 0 and id=" + id;//new
		 result = JSON.parse(MoneyHubJSFuc("QuerySQL",queryString));
    } catch (e) {
        logCatch(e.toString());
    }
    return result;
}

/** 获取支付对象名称
 * @param id 支付对象编号
 * @return 支付对象名称 
 */
function getSinglePayeeName(id) {
    var temp = "";
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT name as pName FROM tbPayee where mark = 0 and id = " + id));//new
        $.each(result, function(i,n) {
           	temp = n.pName;
           	return false;
        });
    } catch (e) {
        logCatch(e.toString());
    }
    return temp;
}

/** 添加支付对象
 * @param name 姓名
 * @param email 邮件
 * @param tel 电话
 */   
function addNewPayee(name, email, tel) {
	//用户初始基准
	name = replaceSQLStr(name).trim();
	email = replaceSQLStr(email).trim();
	tel = replaceSQLStr(tel).trim();
	var test = -1;
	try {
	    var tempId = getMyId(),
		    UT = getUT();
		if (MoneyHubJSFuc("ExecuteSQL","INSERT INTO tbPayee(id, name, email, tel, UT) VALUES(" + tempId + ",'" + name + "', '" + email + "', '" + tel + "'," + UT + ")") > 0)
		   test = tempId; //new
    } catch (e) {
        logCatch(e.toString());
    	//test = -1;
    }
	return test;
}

/** 编辑支付对象
 * @param id 编号
 * @param name 姓名
 * @param email 邮件
 * @param tel 电话
 */   
function updatePayee(id, name, email, tel) {
	name = replaceSQLStr(name);
	email = replaceSQLStr(email);
	tel = replaceSQLStr(tel);
	var result = false;
	try {
	    var UT = getUT();
		if(MoneyHubJSFuc("ExecuteSQL","UPDATE tbPayee SET name='" + name + "', email='" + email + "', tel='" + tel + "', UT=" + UT + " WHERE id=" + id) > 0)//new
			result = true;
    } catch (e) {
        logCatch(e.toString());
    }
	return result;
}

/** 删除支付对象
 * @param id 支付对象编号
 */ 
function deletePayee(id) {
	var result = false;
	try {
		if (MoneyHubJSFuc("ExecuteSQL","UPDATE tbPayee" + deleteStatus + ", UT = " + getUT() + " WHERE mark = 0 and id=" + id) > 0)//new
			result = true;
    } catch (e) {      
        logCatch(e.toString());
    }
	return result;
}

/** 取得账户种类相关信息
 */
function getAccountTypeInfo(){
    var result = [];
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT id,name FROM tbAccountType where id < 100 ORDER BY id ASC"));
    } catch (e) {
        logCatch(e.toString());
    }
    return result;
}

/** 取得账户子账户相关信息
 * @param id 主账户编号
 */
function getAccountSubInfo(id){
    var result = [];
	try {
        if(id!=0){
			debug("\ngetAccountSubInfo=============SELECT b.id as bid, balance, c.name as cname, b.name as bname, b.tbCurrency_id as curId, a.keyInfo as myKey  FROM tbAccount a, tbSubAccount b, tbCurrency c where b.tbAccount_id = a.id and c.id = b.tbCurrency_id and a.mark = 0 and b.mark = 0 and a.id = "+id+"  ORDER BY b.id ASC"+"\n");
			result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT b.id as bid, balance, c.name as cname, b.name as bname, b.tbCurrency_id as curId, a.keyInfo as myKey  FROM tbAccount a, tbSubAccount b, tbCurrency c where b.tbAccount_id = a.id and c.id = b.tbCurrency_id and a.mark = 0 and b.mark = 0 and a.id = "+id+"  ORDER BY b.id ASC"));//new
		} 
    } catch (e) {
        logCatch(e.toString());
    }
    return result;
}

/**
 *编辑转账记录时，得到账户名
 */
function getSubAccountName(id){
    var result = "";
    try{
	   if (id != 0){
       	   result = JSON.parse(MoneyHubJSFuc("QuerySQL","select a.name as aname, b.name as bname from tbAccount a, tbSubAccount b where a.id = b.tbAccount_id and a.mark = 0 and b.mark = 0 and b.id = " + id)); 
	   }
	}catch(e){
        logCatch(e.toString());
	}
    return result[0].aname + "->" + result[0].bname;
}


/** 添加主账户
 * @param name 账户名称
 * @param accountTypeId 账户类型
 * @param bankId 银行
 * @param content 备注   
 */
function addAccount(name, accountTypeId, bankId, content, keyInfo) {
	debug("开始创建账户:\n");
	name = replaceSQLStr(name).trim();
	content = replaceSQLStr(content).trim();
	if (bankId == null) bankId = "";
	var tempId = getMyId();
	var UT = getUT();
    var newId = -1;
	
	try {
		if(keyInfo === undefined ){
			result = MoneyHubJSFuc("ExecuteSQL","INSERT INTO tbAccount(id, name, tbAccountType_id, tbBank_id, comment, UT) VALUES(" + tempId + ", '" + name + "', '" + accountTypeId + "', '" + bankId + "', '" + content + "'," + UT + ")");//new
			debug("INSERT INTO tbAccount(id, name, tbAccountType_id, tbBank_id, comment, UT) VALUES(" + tempId + ", '" + name + "', '" + accountTypeId + "', '" + bankId + "', '" + content + "'," + UT + ")\n");
		}else {
			result = MoneyHubJSFuc("ExecuteSQL","INSERT INTO tbAccount(id, name, tbAccountType_id, tbBank_id, comment, keyInfo, UT) VALUES(" + tempId + ", '" + name + "', '" + accountTypeId + "', '" + bankId + "', '" + content + "', '" + keyInfo + "'," + UT + ")");//new
			debug("INSERT INTO tbAccount(id, name, tbAccountType_id, tbBank_id, comment, keyInfo, UT) VALUES(" + tempId + ", '" + name + "', '" + accountTypeId + "', '" + bankId + "', '" + content + "', '" + keyInfo + "'," + UT + ")\n");
		}
		if (result > 0) newId = tempId; 
		try {
			MoneyHubJSFuc("SetParameter","Report_Changed", "1");
			MoneyHubJSFuc("SetParameter","Start_Changed", "1");
		} catch (e) {
            logCatch(e.toString());
		}
    } catch(e) {
        logCatch(e.toString());
    	//result = -1;
    }	
	return newId;
}

/** 添加子账户
 * @param accountId 主账户
 * @param tbCurrency_id 币种
 * @param openbalance 开户余额
 * @param balance 余额
 * @param days 存期
 * @param enddate 到期日
 * @param tbAccountType_id 子账户类型
 * @param subName 子账户名称
 * @return 子账户编号        
 */
function addAccountSub(accountId, tbCurrency_id, openbalance, balance, days, enddate, tbAccountType_id, subName, comment) {
	subName = replaceSQLStr(subName).trim();
	var result = -1;
	if ((tbAccountType_id == "") || (tbAccountType_id == null))
		tbAccountType_id = 8756;
	
	try {
	    var tempId = getMyId(),
		UT = getUT();
		MoneyHubJSFuc("ExecuteSQL","INSERT INTO tbSubAccount(id, tbAccount_id, tbCurrency_id, openbalance, balance, days, enddate, name, tbAccountType_id, comment, UT) VALUES(" + tempId + ",'" + accountId + "', '" + tbCurrency_id + "', '" + openbalance + "', '" + balance + "', '" + days + "', '" + enddate + "', '" + subName + "', '" + tbAccountType_id + "', '" + comment + "'," + UT + ")");//new
		result = tempId;
		try {
			MoneyHubJSFuc("SetParameter","Report_Changed", "1");
			MoneyHubJSFuc("SetParameter","Start_Changed", "1");
		} catch (e) {
            logCatch(e.toString());
		}
    } catch(e) {
        logCatch(e.toString());
	    debug(e);
    }

	//获取今天的日期
	var a = new Date();
	if ((( a.getMonth() + 1 ) + "").length == 1 )
		month = "0" + ( a.getMonth() + 1 );
	else
		month = a.getMonth() + 1;
	if ((a.getDate() + "").length == 1)
		date = "0" + a.getDate();
	else
		date =  a.getDate();
	transdate = a.getFullYear() + "-" + month + "-" + date;
	if (balance != 0) {
		//添加一笔调整余额交易
		addTransaction(transdate, 0, 10067, balance, 0, result, 0, "", 0, 0);
	}
	return result;
}

/** 编辑账户
 * @param id
 * @param accountTypeId
 * @param name
 * @param bankId
 * @param content
 */     
function editAccount(id, accountTypeId, name, bankId, content) {
	var result = 0;
	name = replaceSQLStr(name).trim();
	content = replaceSQLStr(content);
	var sql1 = "";
    var UT = getUT();
	if ((accountTypeId == 1) || (accountTypeId == 6) || (accountTypeId == 7) || (accountTypeId == 8) || (accountTypeId == 9)) {
		//以上分类不涉及金融机构
		if ((bankId == "") || (bankId == null)) {
			bankId = "";
		}
		sql1 = "UPDATE tbAccount SET name='" + name + "', comment='" + content + "', UT = " + UT + " WHERE id=" + id;//new
	} else {
		sql1 = "UPDATE tbAccount SET name='" + name + "', comment='" + content + "', UT = " + UT + ", tbBank_id='" + bankId + "' WHERE id=" + id;//new
	}
	try {
		result = MoneyHubJSFuc("ExecuteSQL",sql1);
    } catch (e) {
        logCatch(e.toString());
    }
    try {
		MoneyHubJSFuc("SetParameter","Report_Changed", "1");
	} catch (e) {
        logCatch(e.toString());
	}
	return result;	
}

/** 编辑子账户
 * @param id 子账户编号
 * @param days 存期
 * @param enddate 到期日
 * @param tbAccountType_id 子账户类型
 * @param subName 子账户名
 * @param myTid 主账户类型
 */        
function editAccountSub(id, days, enddate, tbAccountType_id, subName, comment, myTid) {
	var result = -1;
	subName = replaceSQLStr(subName).trim();
	try {
	    var UT = getUT();
		var sql = "UPDATE tbSubAccount SET days='" + days + "', enddate='" + enddate + "', comment='" + comment + "'";
		if (myTid == 3) {
			sql += " , name='" + subName + "' ";
		} 
		sql += ", tbAccountType_id='" + tbAccountType_id + "', UT = " + UT + " WHERE id=" + id;//new
		result = MoneyHubJSFuc("ExecuteSQL",sql);
		try {
			MoneyHubJSFuc("SetParameter","Report_Changed", "1");
		} catch (e) {
            logCatch(e.toString());
		}
    } catch (e) {
        logCatch(e.toString());
    }
	return result;
}

/** 添加交易
 * @param transdate 交易日期
 * @param payee_id 收付款方
 * @param tbCategory2_id 分类
 * @param amount 金额
 * @param direction 方向（用于转账）
 * @param tbSubaccount_id 子账户
 * @param exchangerate 汇率
 * @param comment 备注
 * @param tbSubaccount_id1 转入子账户
 * @param transactionClasses 手工账或余额调整        
 * @param sign 导账单的记录的原始标记       
 * @param month 导账单的记录的所属的月份
 * * */
//5.1需求，增加了month字段，为了判断记录所属月份
function addTransaction(transdate, payee_id, tbCategory2_id, amount, direction, tbSubaccount_id, exchangerate, comment, tbSubaccount_id1, transactionClasses, sign, month) {
	var result = -1;
	comment = replaceSQLStr(comment).trim();
	//用户未选择分类，则定义为未分类处理
	if (tbCategory2_id == 10000) {
		//支出
		tbCategory2_id = 10065;
	} else if (tbCategory2_id == 10001) {
		//收入
		tbCategory2_id = 10066;
	}
	try {
	    var tempId = getMyId(),
		UT = getUT();
		//根据3.1需求，添加参数transactionClasses,sign进来
		var sql = "INSERT INTO tbTransaction(id, UT, transdate, tbPayee_id, tbCategory2_id, amount, direction, tbSubaccount_id, exchangerate, comment, tbSubaccount_id1";
		if( !(transactionClasses === undefined ) ) sql+= ", transactionClasses ";
		if( !(sign === undefined ) ) sql+= ", sign ";
		if( !(month === undefined ) ) sql+= ", add1 ";
		
		sql += " ) VALUES(" + tempId + ", " + UT + ", '" +transdate + "', " + payee_id + ", " + tbCategory2_id + ", " + amount + ", '" + direction + "', " + tbSubaccount_id + ", '" + exchangerate + "', '" + comment + "', '" + tbSubaccount_id1 + "'";
		if( !(transactionClasses === undefined ) ) sql+=" ,"+transactionClasses;
		if( !(sign === undefined ) ) sql+=" ,'"+sign+"'";
		if( !(month === undefined ) ) sql+= ",'"+month+"'";
		sql += " )";//new
		//debug("记账"+sql+"\n");
		if (MoneyHubJSFuc("ExecuteSQL",sql) > 0){
		   result = tempId;
		};
    } catch (e) {
        logCatch(e.toString());
    }
	return result;
}

/** 编辑交易
 * @param transdate 交易日期
 * @param payee_id 收付款方
 * @param tbCategory2_id 分类
 * @param amount 金额
 * @param direction 方向（用于转账）
 * @param tbSubaccount_id 子账户
 * @param exchangerate 汇率
 * @param comment 备注
 * @param tbSubaccount_id1 转入子账户        
 */ 
function editTrans(transdate, payee_id, tbCategory2_id, amount, direction, exchangerate, comment, id) {
	var result = false;
	comment = replaceSQLStr(comment).trim();
	if(tbCategory2_id == 10000){
		//支出
		tbCategory2_id = 10065;
	} else if(tbCategory2_id == 10001){
		tbCategory2_id = 10066;
	}
	try {
		result1 = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT transdate, amount, transactionclasses FROM tbtransaction WHERE mark = 0 and id=" + id));//new
		transactionclasses = result1[0].transactionClasses;
		if (result1[0].transactionClasses == 1) {
			//如果原来是系统账，改动金额和日期后变为手工账
			if ((result1[0].TransDate != transdate) || (parseFloat(result1[0].Amount) != parseFloat(amount))) transactionclasses = 0;
		}
	    var UT = getUT();
		if (MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction SET transactionclasses=" + transactionclasses + ", transdate='" + transdate + "', tbPayee_id=" + payee_id + ", tbCategory2_id=" + tbCategory2_id + ", amount=" + amount + ", direction='"+direction + "', exchangerate='" + exchangerate + "', comment='" + comment + "', UT = " + UT + " where id=" + id) > 0)//new
			result = true;
    } catch (e) {
        logCatch(e.toString());
    }
	return result;
}

//删除交易
function delTransaction(id){
	var result = false;
	try {
	    var UT = getUT();
		if(MoneyHubJSFuc("ExecuteSQL","update tbTransaction" + deleteStatus + ", UT = " + UT + " where mark = 0 and id = " + id) > 0)//new
			result=true;
    } catch (e) {
        logCatch(e.toString());
    }
	return result;
}

/** 获取全部交易
 * @param aid 主账户
 * @param sid 子账户
 * @param type 未定义则为添加时间条件，有值则为按时间条件筛选
 */
function getTransaction(aid, sid, type) {
	var result = "";
	var sql1 = "SELECT e.id AS eid, a.id AS aid, d.tbaccounttype_id as tid, TransDate, tbPayee_id, tbCategory2_id, type, c.name AS cname, Amount, direction, tbSubAccount_id, tbSubAccount_id1, a.tbPayee_id AS pid, "
		+ "direction AS deric, a.comment AS acomment, Type, e.name AS dname, d.name AS aname, b.name AS bname, f.name AS fname, c.name AS cname, g.name as payeeName, transactionClasses "
		+ "FROM tbTransaction a, tbCategory2 b, tbCategory1 c, tbAccount d, tbSubAccount e, tbCurrency f LEFT JOIN tbPayee g ON a.tbpayee_id=g.id ";
	sql1 += "WHERE b.tbCategory1_id=c.id AND a.tbCategory2_id=b.id AND a.tbSubAccount_id=e.id AND e.tbAccount_id=d.id AND f.id=e.tbCurrency_id ";
	sql1 += "AND a.mark = 0 AND b.mark = 0 AND c.mark = 0 AND d.mark = 0 AND e.mark = 0 ";//new
	if (type === undefined) {
		//type未定义则执行时间的检索条件
		var year = (today[0] == "") ? new Date().getFullYear : today[0];
		var month = (today[1] == "") ? new Date().getMonth() + 1 : today[1];
		month = /^[0-9][0-9]$/.test(month) ? month : "0" + month; 
		
		if (today[1] == "") { 
		    //$("#" + month).addClass("now");
			//today.splice(1, 1, new Date().getMonth() + 1);
		} else {
			var startDate = year + "-" + month + "-01";
			var endDate = year + "-" + month + "-31";
			sql1 += "AND transdate >= '" + startDate + "' AND transdate <= '" + endDate + "' ";
            //sql1 += "AND substr(transdate, 6, 2) = '" + month + "' ";	//3.1历史遗留问题		
		} 	
	}
	//modified by liuchang;
	//将账户选择移出上面的业务逻辑，修改bug1998
	if (!(aid === undefined) && (aid != "")) {
		sql1 += " AND d.id=" + aid;
	}
	if (!(sid === undefined) && (sid != "")) {
		sql1 += " AND e.id=" + sid;
	}
	switch (conditionSelected[0]) {
		case "con1":
			//按照时间排序
			if( conditionSelected[1] == 0 ) sql1 += " ORDER BY transDate ASC";
			else sql1 += " ORDER BY transDate DESC";
			break;
		case "con2":
			//按照大分类排序
			if( conditionSelected[1] == 0 ) sql1 += " ORDER BY cname ASC";
			else sql1 += " ORDER BY cname DESC";
			break;
		case "con3":
			//按照收入排序
			if (conditionSelected[1] == 0) sql1 += " ORDER BY c.type asc, a.amount ASC";
			else sql1 += " ORDER BY c.type asc, a.amount DESC";
			break;
		case "con4":
			//按照支出排序
			if (conditionSelected[1] == 0) sql1 += " ORDER BY c.type desc, a.amount ASC";
			else sql1 += " ORDER BY c.type desc, a.amount DESC";
			break;
		case "con6":
			//按照支付对象排序
			if (conditionSelected[1] == 0) sql1 += " ORDER BY payeeName ASC";
			else sql1 += " ORDER BY payeeName DESC";
			break;
		case "con7":
			//按照备注排序
			if (conditionSelected[1] == 0) sql1 += " ORDER BY acomment ASC";
			else sql1 += " ORDER BY acomment DESC";
			break;
		default:
			//默认为时间升序
			sql1 += " ORDER BY transDate ASC";
			break;
	}
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql1).replace(/\r\n/g, "<m> </m>").replace(/\n/g, "<m> </m>"));
	} catch (e) {
        logCatch(e.toString());
	}
	return result;
}

//获取单个交易记录
function getSingleTransaction(id) {
	var result = "";
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL","select transDate, a.id as aid, c.id as cid, tbPayee_id,tbCategory2_id,amount,direction,tbSubAccount_id,tbSubAccount_id1,a.comment as acomment from tbTransaction a, tbSubAccount b, tbAccount c  where a.tbSubAccount_id=b.id and c.id = b.tbAccount_id and a.mark = 0 and b.mark = 0 and c.mark = 0 and a.id="+id));//new
	} catch(e) {
        logCatch(e.toString());
	}
	return result;
}

//获取子分类的accountType;
function getSubAccountType(){
	var result = new Array();
	result['100'] = "活期存款";
	result['101'] = "定期存款";
	result['102'] = "理财产品";
    return result;
}

//获取用户存款期限
function getAccountSubDuringData(){
	var result = [{
            "id": 90,
            "Name":"3个月"
        }, {
			"id": 180,
            "Name":"6个月"
        }, {
			"id": 365,
            "Name":"1年"
        }, {
			"id": 730,
            "Name":"2年"
        }, {
            "id": 1095,
            "Name":"3年"
        }, {
            "id": 1825,
            "Name":"5年"
        },{
            "id": 0,
            "Name":"(空)"
        }];
	return result;
}

/** 获取饼图数据
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param during 按周还是按月
 * @param curStyle   
 */
function getXML(startDate, endDate, during, curStyle){
	var xmlStr = "";
	try {
		xmlStr = MoneyHubJSFuc("GetXMLData",startDate, endDate, during, curStyle);
	} catch (e) {
        logCatch(e.toString());
		xmlStr="";
		xmlStr += '<chart>';
			xmlStr += '<set seriesName="保险费" value="25" />';
		  	xmlStr += '<set seriesName="待报销" value="75" />';
		xmlStr += '</chart>';
		xmlStr += '<chart>';
		    xmlStr += '<set seriesName="其它收入" value="100" />';
		xmlStr += '</chart>';
		xmlStr += '<chart>';
		if (during != "month") {
		    xmlStr += '<set seriesName="支出" value="67" />';
		    xmlStr += '<set seriesName="收入" value="33" />';
		} else {
		    xmlStr += '<set seriesName="支出" value="20" />';
		    xmlStr += '<set seriesName="收入" value="80" />';
		}
		xmlStr += '</chart>';
		xmlStr += '<chart>';
		    xmlStr += '<set seriesName="保险费" value="1000.00" />';
		    xmlStr += '<set seriesName="待报销" value="3000.00" />';
		xmlStr += '</chart>';
		xmlStr += '<chart>';
		    xmlStr += '<set seriesName="其它收入" value="2000.00" />';
		xmlStr += '</chart>';
		xmlStr += '<chart>';
		    xmlStr += '<set seriesName="支出" value="4000.00" />';
		    xmlStr += '<set seriesName="收入" value="2000.00" />';
		xmlStr += '</chart>';
	}
	return xmlStr;
}

/** bar图数据生成
 * @param startDate
 * @param endDate
 * @param during
 */   
function getBarXml(startDate, endDate, during){
	var xmlStr = "";
	try {
		xmlStr = MoneyHubJSFuc("GetXMLData",startDate, endDate, during, "bar");
	} catch(e) {
        logCatch(e.toString());
	}
	return xmlStr;
}


/** 生成随机颜色
 */
function randomColor() {
	//16进制方式表示颜色0-F
	var arrHex = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
	var strHex = "#";
	var index;
	for(var i = 0; i < 6; i++) {
		//取得0-15之间的随机整数
		index = Math.round(Math.random() * 15);
		strHex += arrHex[index];
	}
	return strHex;
}

/** 处理饼图数据
 * @param xml 原始数据
 */ 
function handlePieXmlData(xml){
	var result;
	try {
		result = xml.split("</chart>");	
	} catch(e){
        logCatch(e.toString());
	}
	return result;
}

var renderData = "";

/** 生成下方收支比例图的XML
 * @param str 原始XML
 * @param style 图表类型
 * @param classId 0表示支出，1表示收入
 * @param myValue 金额
 */    
function createXmlData(str, style, classId, myValue) {
	var result = "";	
	var styAnimation = '<styles>\n'
					 + '<definition>\n'
					 + '<style name="Animation_1" type="ANIMATION" duration="1" start="0" param="none"/>\n' 
					 + '</definition>\n'
					 + '<application>\n'
					 + '<apply toObject="DATAPLOT" styles="Animation_1" easing="Regulation"/>\n'
					 + '</application>\n'
					 + '</styles>\n';
	if(style == "pie"){
		var result1 ="";
		if (classId == 0) {
			//支出
			result1 = '<graph enableRotation="0" startingAngle="89.98" showZeroPies="1" isSliced="1" showLabels="0" showShadow="0" animation="1" radius3D="0" lineThickness="1" showNames="0" alpha="100" showLimits="1"  formatNumberScale="0" numberSuffix="%" numDivLines="3" limitsDecimalPrecision="0" showValues="0" showPercentageValues="0" hoverCapSepChar="，" baseFont="宋体" baseFontSize="12" showCanvasBase="1" showLegend="0">\n';
		} else {
			//收入
			result1 = '<graph startingAngle="89.98" animation="1" bgImageDisplayMode="fit" showZeroPies="1" isSliced="1" showLabels="0" showShadow="0" radius3D="0" lineThickness="1" showNames="0" alpha="100" showLimits="1"  formatNumberScale="0" numberSuffix="%" numDivLines="3" limitsDecimalPrecision="0" showValues="0" showPercentageValues="0" hoverCapSepChar="，" baseFont="宋体" baseFontSize="12" showCanvasBase="1" showLegend="0">';
		}
		result = str.replace(/<chart>/g, result1) + "</graph>";
		result = getColor(result,style);
		result = renderData;
	} else if (style == "newPie") {
		if (classId == 0) {
			//支出
			result1='<graph animation="1" startingAngle="89.98" showLabels="0" showShadow="0" radius3D="0" lineThickness="1"  showNames="0" alpha="100" showLimits="1"  formatNumberScale="0" numberSuffix="%" numDivLines="3" limitsDecimalPrecision="0" showValues="0" showPercentageValues="1" hoverCapSepChar="，" baseFont="宋体" baseFontSize="12" showCanvasBase="1" showLegend="0">';
		} else {
			//收入
			result1='<graph animation="1" startingAngle="89.98" showLabels="0" showShadow="0" radius3D="0" lineThickness="1"  showNames="0" alpha="100" showLimits="1"  formatNumberScale="0" numberSuffix="%" numDivLines="3" limitsDecimalPrecision="0" showValues="0" showPercentageValues="1" hoverCapSepChar="，" baseFont="宋体" baseFontSize="12" showCanvasBase="1" showLegend="0">';
		}
		result=str.replace(/<chart>/g,result1) + "</graph>";
		result=getColor(result,style);
		result=renderData;
	} else if(style == "bar") {
		var result1='<graph anchorRadius="100" plotgradientcolor="" radius3D="0" showPlotBorder="1" plotBorderColor="eeeeee" caption="" lineThickness="1" animation="1" showNames="1" alpha="100" showLimits="1"  formatNumberScale="0"  numberPrefix="￥"  numberSuffix="元"  numDivLines="3"  limitsDecimalPrecision="0" showValues="0" baseFont="宋体" baseFontSize="12"  showCanvasBase="0" showLegend="0">';
		result=str.replace(/<chart>/g,result1);
		result=result.replace("</chart>","</graph>");
		getColor(result,style);
		result=renderData;
	}	
	return result;
}

var colorIndex = 0;

//颜色数组
var colorDesc = ["#f75556",  "#bf9bd1",  "#f8cf4d",  "#78cc8f",  "#73cfe1",  "#ff72aa",  "#e99b31",  "#a4b3f1",  "#65bbbf",  "#ffc4f9",  "#7eb7df",  "#a68064",  "#a23737",  "#6b6bb4",  "#6b8323",  "#db7093",  "#527f76",  "#448bc3",  "#9eb2ba",  "#dfb597"];

/** 获取颜色
 * @param str 数据
 * @param style 图表类型 
 */
function getColor(str, style) {
	var result1 = "";
	
	if (style == "pie") {
		if (str.indexOf('<set seriesName=') != -1) {
			result1 = str.replace('<set seriesName=', '<set color="' + colorDesc[colorIndex] + '" name=');
			if (colorIndex<19) colorIndex++;
			else colorIndex=0;
			this.getColor(result1, style);
		} else {
			if (result1 == "") {
				renderData = str;		
			}
		}	
	} else if(style == "newPie") {
		if(str.indexOf('<set seriesName=')!=-1){
			result1=str.replace('<set seriesName=', '<set color="' + colorDesc[colorIndex] + '" name=');
			if(colorIndex<19) colorIndex++;
			else colorIndex = 0;
			this.getColor(result1,style);
		}else{
			if (result1 == "") {
				renderData = str;		
			}
		}	
	} else {
		if (str.indexOf('<dataset seriesName=') != -1) {
			result1 = str.replace('<dataset seriesName=', '<dataset color="' + colorDesc[colorIndex] + '" seriesName=');
			if (colorIndex<19) colorIndex++;
			else colorIndex = 0;
			this.getColor(result1,style);
		} else {
			if (result1 == "") {
				renderData = str;		
			}
		}	
	}
	colorIndex = 0;
	return result1;
}

/** 从xml字符串得到xml对象
 * @param {} data 传入的xml字符串
 * @return {} xml 得到的xml对象
 */
function getXMLInstance(data)   
{
    var xml;
    if($.browser.msie){
        xml = new ActiveXObject("Microsoft.XMLDOM");
        xml.async = false;
        xml.loadXML(data);
    }else{
        xml = new DOMParser().parseFromString(data, "text/xml");
    }
    return xml;
}

/** 根据币种id，账户id取得相应的子账户信息
 * @param aid
 * @param cid 
 */
function getSubAccount(aid, cid) {
    try{
		result = JSON.parse(MoneyHubJSFuc("QuerySQL","select id from tbsubAccount where tbAccount_id = " + aid +  " and mark = 0 and tbCurrency_id = " + cid));//new
	} catch(e) {
        logCatch(e.toString());
		var result = [{
            "id": 1
		}];
	}
	return result;
}

/** 取得所有外币与人民币的兑换结果
 * @param id 外币币种id
 * @return 数组 
 */
function getRMBExchangeInfo(id){
    var result = [];
    try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL","select sysCurrency_id1 as id,exchangeRate as rate from datExchangeRate where sysCurrency_id="+id, "DataDB"));
	} catch(e) {
        logCatch(e.toString());
	}
	return result;
}

/** 取得两种不同币种间的兑换结果
 * @param id1 币种1
 * @param id2 币种2
 * @return 结果  
 */
function getRMBExchangeInfo1(id1, id2){
	var sql1="";
	if (id2 === undefined) {
		sql1 = "SELECT exchangeRate AS rate FROM datExchangeRate WHERE sysCurrency_id1=" + id1;
	} else {
		sql1 = "SELECT round((SELECT exchangerate FROM datExchangeRate WHERE sysCurrency_id1=" + id1 + ")/(SELECT exchangerate FROM datExchangeRate WHERE sysCurrency_id1=" + id2 + ")*100, 2) AS rate";
	}
	
	//此结果为每100外币与人民币的兑换结果
    try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql1, "DataDB"));
	} catch(e) {
        logCatch(e.toString());
		if (id1 == 2) {
			var result = [{
				"rate": 647.90
			}];
		} else {
			var result = [{
				"rate": 916.69
			}];
		}
	}
	$.each(result, function(i, n){
		result11 = n.rate;
	});
	return result11;
}

/** 取得某一外币与人民币的兑换结果
 * @param id 外币币种id
 * @return 数组 
 */
function getRMBExchangeInfo2(id){
	result = 0;
    try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL","select exchangeRate as rate from datExchangeRate where sysCurrency_id1="+id, "DataDB"));
		if (result.length > 0) {
			result = result[0].rate;
		}
	} catch(e) {
        logCatch(e.toString());
	}
	return result;
}

/** 更新子账户余额
 * @param id 子账户编号
 */
function modifySubAccountBalance(id) {
	var result = false;
	try {
		//获得最后一笔调整余额
		//modified by liuchang
		//余额调整的二级分类编号
		var changeBalanceClasses = 10067;
		result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT id, TransDate, Amount FROM tbtransaction WHERE tbsubaccount_id=" + id + " AND mark = 0 AND tbcategory2_id="+ changeBalanceClasses + " ORDER BY transdate DESC, id DESC LIMIT 1"));//new
		if (result.length > 0) {
			lastBalanceId = result[0].id;
			lastBalanceDate = result[0].TransDate;
			lastBalanceAmount = result[0].Amount;
		} else {
			lastBalanceId = 0;
			lastBalanceDate = "1900-01-01";
			lastBalanceAmount = 0;
		}
		result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT Type, SUM(Amount) sumamount FROM tbtransaction t, tbcategory2 a, tbcategory1 b WHERE t.mark = 0 AND a.mark = 0 AND b.mark = 0 AND t.tbsubaccount_id=" + id + " AND t.tbcategory2_id = a.id AND a.tbcategory1_id = b.id AND ((t.transdate>'" + lastBalanceDate + "') OR ((t.transdate='" + lastBalanceDate + "') AND (t.id>" + lastBalanceId + "))) AND t.tbcategory2_id<>10067 GROUP BY Type"));//new
		totalSpend = 0;
		totalIncome = 0;
		$.each(result, function(i, n){
			if (n.Type == "0") totalSpend = n.sumamount;
			if (n.Type == "1") totalIncome = n.sumamount;
		});
		
		var UT = getUT();
		lastBalanceAmount = parseFloat(lastBalanceAmount) + parseFloat(totalIncome) - parseFloat(totalSpend);
		debug(lastBalanceAmount+"\n");
		if (MoneyHubJSFuc("ExecuteSQL","UPDATE tbSubAccount SET balance = " + lastBalanceAmount + ", UT = " + UT + " WHERE id = " + id) > 0)//new
			result = true;
    } catch (e) {
        logCatch(e.toString());
    	debug("modifySubAccountBalance="+e.message+"\n");
    }
	return result;
}

/** 获取账户类型内容
 * @param id 账户类型编号
 */ 
function getAccountType(id){
	var result = "";
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT id, Name FROM tbAccountType mark = 0 and WHERE id=" + id));//new
    } catch (e) {
        logCatch(e.toString());
		var result = [{
            "id": 1,
            "Name": "美元"
        }, {
            "id": 2,
            "Name":"人民币"
        }, {
            "id": 3,
            "Name":"人民币"
        }];
    }
    return result;
}

/** 删除主账户
 * @param id 为主账户id
 */
function deleteAccount(id) {
	//删除子账户
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT id FROM tbsubaccount WHERE mark = 0 and tbAccount_id = '" + id + "'"));
		$.each(result, function(i, n) {
			deleteSubAccount(id, n.id);
		});
		 //删除账户 
		 MoneyHubJSFuc("ExecuteSQL","UPDATE tbAccount" + deleteStatus + ", UT = " + getUT() + " WHERE mark = 0 and id=" + id);//new

		 try {
			MoneyHubJSFuc("SetParameter","Report_Changed", "1");
			MoneyHubJSFuc("SetParameter","Start_Changed", "1");
		} catch (e) {
            logCatch(e.toString());
		}
	} catch (e) {
        logCatch(e.toString());
	}
}

/* 处理子账户删除操作
 * id 子账户ID
 */
function deleteSubAccount(aid, bid) {
	 try {
		 //将转账的类型修改为未定义收入，未定义支出
		var UT = getUT();
		MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction SET direction='', tbcategory2_id=10065, tbsubaccount_id1='', UT = " + UT + " WHERE tbcategory2_id=10059 AND tbsubaccount_id1=" + bid);//new
		MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction SET direction='', tbcategory2_id=10066, tbsubaccount_id1='', UT = " + UT + " WHERE tbcategory2_id=10060 AND tbsubaccount_id1=" + bid);//new
		 //删除交易
		MoneyHubJSFuc("ExecuteSQL","UPDATE tbTransaction" + deleteStatus + ", UT = " + UT + " WHERE mark = 0 and tbSubAccount_id=" + bid);//new
		 //删除子账户
		MoneyHubJSFuc("ExecuteSQL","UPDATE tbSubAccount" + deleteStatus + ", UT = " + UT + " WHERE mark = 0 and id=" + bid);//new	
		result = JSON.parse(MoneyHubJSFuc("QuerySQL","SELECT id FROM tbsubaccount WHERE mark = 0 and tbAccount_id='" + aid + "'"));//new
		if (result.length == 0) {
			//如果该主账户下已经没有任何子账户，则连同主账户一并删除
		 	MoneyHubJSFuc("ExecuteSQL","UPDATE tbAccount" + deleteStatus + ", UT = " + UT + " WHERE mark = 0 and id=" + aid);//new
		}
		try {
			MoneyHubJSFuc("SetParameter","Report_Changed", "1");
			MoneyHubJSFuc("SetParameter","Start_Changed", "1");
		} catch (e) {
        logCatch(e.toString());
		}
	 } catch(e) {
        logCatch(e.toString());
	 }
}

/** 检查有没有相同值
 * @param classes 校验的类型
 * @param checkValue 校验值
 * @param id
 * @param parentid
 * @return 有false，没true
 */
function checkUnique(classes, checkValue, id, parentid) {
	var sql = "";
	var rs = false;
	switch (classes){
		case "PayeeName":
			sql = "SELECT count(a.id) AS myCount FROM tbPayee a WHERE a.mark=0 AND a.name='" + checkValue + "'";//new
			break;
			
		case "AccountName":
			sql = "SELECT count(a.id) AS myCount FROM tbAccount a WHERE a.mark=0 AND a.name='" + checkValue + "'";//new
			break;
			
		case "CategoryName":
			classLevel = $("#Newpayout2").find("#classlevel").attr("status");
			parentClass = $("#Newpayout2").find("#classout").val();
			if (classLevel == 0) {
				sql = "SELECT count(a.id) AS myCount FROM tbCategory1 a WHERE a.mark=0 AND a.name='" + checkValue + "'";//new
			} else {
				sql = "SELECT count(a.id) AS myCount FROM tbCategory2 a, tbCategory1 b WHERE a.mark = 0 and b.mark = 0 and tbCategory1_id=b.id AND b.id=" + parentClass + " AND a.name='" + checkValue + "'";//new
			}
			break;

		case "BankName":
			sql = "SELECT count(a.id) AS myCount FROM tbBank a WHERE a.mark=0 AND a.name='" + checkValue + "' AND classId=" + parentid;//new
			break;
		
		case "subName":
			if (currentEditType == "add") {
				//此为子账户时校验，子账户校验只需要从subAccount校验即可
				rs = true;
				var arrayLength = subAccount.length;
				if (arrayLength > 0) {			
					for (var i=0; i<arrayLength; i++) {
						if (id === undefined) {
							if (subAccount[i][5] == checkValue) {
								rs = false;
								break;
							}
						} else {
							//编辑校验
							if ((subAccount[i][5] == checkValue) && (id != subAccount[i][6])) {
								rs = false;
								break;			
							}
						}	
					}
				}
			} else {
				sql = "SELECT count(a.id) AS myCount FROM tbAccount b, tbSubAccount a WHERE a.mark = 0 and b.mark = 0 and tbAccount_id=b.id AND b.id=" + parentid + " AND a.name='" + checkValue + "'";//new
			}
			break;
			
		default:
			break;
	}

	//子账户名校验无需进入数据库校验；
	if ((classes != "subName") || ((classes == "subName") && (currentEditType != "add"))) {
		var temp = "";
		if (classes == "BankName") {
			temp = currentBankEditType;
		} else if (classes == "PayeeName") {
			temp = currentPayeeEditType;
		} else {
			temp = currentEditType;
		} 
		//下面是编辑模式下的sql组装
		if ((temp != "add") && (id > 0)) {
			sql += " AND a.id!=" + id;
		}
		try {
			result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql));
		} catch (e) {
            logCatch(e.toString());
			result = [{
				"myCount": 0
			}]
		}
		$.each(result, function(i,n) {
			if (n.myCount == 0) {
				rs = true;
			}
		});
	}
	return rs;
}

/*
 * 
 */
function getEditTrans(category2, transArray){
	var sql1="";
	if (id2 === undefined) {
		sql1 = "SELECT exchangeRate AS rate FROM datExchangeRate WHERE sysCurrency_id1=" + id1;
	} else {
		sql1 = "SELECT round((SELECT exchangerate FROM datExchangeRate WHERE sysCurrency_id1=" + id1 + ")/(SELECT exchangerate FROM datExchangeRate WHERE sysCurrency_id1=" + id2 + ")*100, 2) AS rate";
	}
	
	//此结果为每100外币与人民币的兑换结果
    try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql1, "DataDB"));
	} catch(e) {
        logCatch(e.toString());
		if (id1 == 2) {
			var result = [{
				"rate": 647.90
			}];
		} else {
			var result = [{
				"rate": 916.69
			}];
		}
	}
	$.each(result, function(i, n){
		result1 = n.rate;
	});
	return result1;
}

/*
 * 批量修改交易记录
 * transArray，需要修改的结果集；category2，分类2； payee，交易记录；
 */

function multipleEditTransAction(transArray,category2,payee){
	var sql = "";
	var cc = transArray.length;
	if( category2 != -1 ){
		sql+= "update tbtransaction set ";
		if( payee != -1 ) sql+=" tbpayee_id = "+payee+", "; 
		sql+=" tbcategory2_id = " + category2 + ", UT = " + getUT() + " where id in (select a.id from tbtransaction a, tbcategory1 b, tbcategory2 c where a.tbcategory2_id = c.id and c.tbCategory1_id = b.id and type = ( select type from tbCategory1 a,tbcategory2 b where a.mark = 0 and b.mark = 0 and a.id = b.tbcategory1_id and b.id="+category2+" ) and a.id in (";
		for(var i = 0; i<cc; i++){
			if( i==(cc-1) ) sql+=transArray[i];
			else sql+=transArray[i]+", ";
		}
		sql+=" ) and a.tbcategory2_id not in (10059,10060,10067 ) )";
	} else if( payee != -1 ) {
		sql+= "update tbtransaction set tbpayee_id = " + payee + ", UT = " + getUT() + " where id in (";
		for(var i = 0; i<cc; i++){
			if( i==(cc-1) ) sql+=transArray[i];
			else sql+=transArray[i]+", ";
		}
		sql+=") and tbcategory2_id not in (10059,10060,10067 )";//new
	}
	//debug("batch="+sql);
	//根据黄山需求 
	
	if(sql!="") MoneyHubJSFuc("ExecuteSQL",sql);
	sql = "";
	//根据huangshan意见
	if( payee != -1 ) {
		sql+= "update tbtransaction set tbpayee_id = " + payee + ", UT = " + getUT() + " where id in (";
		for(var i = 0; i<cc; i++){
			if( i==(cc-1) ) sql+=transArray[i];
			else sql+=transArray[i]+", ";
		}
		sql+=") and tbcategory2_id not in (10059,10060,10067 )";//new
	}
	//debug("sql="+sql);
	if(sql!="") MoneyHubJSFuc("ExecuteSQL",sql);
	
}

/*
 * 添加日期提醒事件到tbEvent表中
 * name 账户名称
 * event_date 为到期提醒日
 * status 1 默认为提醒
 * repeat 0 默认为不重复提醒
 * alarm  提前几天提醒
 * description 事件描述
 */
function addInvestEvent(name, subName, event_date, alarm, tbAccount_id, tbSubAccount_id, type, id){
   var result = -1;
   var obj = {};  //创建序列化对象
   obj.id = (id == undefined) ? 0 : parseInt(id, 10);
   obj.status = 1;
   obj.description = (name + " " + subName + "提醒").trim()
   obj.repeat = 2;
   obj.event_date = event_date;
   obj.alarm = (alarm == "") ? 0 : parseInt(alarm, 10);
   obj.tbAccount_id = tbAccount_id;
   obj.tbSubAccount_id = (tbSubAccount_id == undefined) ? 0 : tbSubAccount_id;
   obj.type = type;

   
   var string = '{"id":"' + obj.id + '", "status":' + obj.status + ', "description":"' + obj.description + '", "repeat":' + obj.repeat 
                 + ', "event_date":"' + obj.event_date + '", "alarm":' + obj.alarm + ', "tbAccount_id":"' + obj.tbAccount_id 
				 + '", "tbSubAccount_id":"' + obj.tbSubAccount_id + '", "type":' + obj.type + '}';
	
   /**	
   var id = getMyId(),
	   UT = getUT();//由C生成
   
   
   插入假数据测试用
	 MoneyHubJSFuc("ExecuteSQL","insert into tbEvent(id, UT, event_date, description, repeat, alarm, status, datestring, tbAccount_id," +
								"tbSubAccount_id, type) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
								.setP(id)
								.setP(UT)
								.setP(new Date().getTime() - 1900 * 360 * 24 * 60 * 60)
								.setP("'test event table'")
								.setP(obj.repeat)
								.setP(obj.alarm)
								.setP(obj.status)
								.setP("'2011-09-20 4'")
								.setP(obj.tbAccount_id)
								.setP(obj.tbSubAccount_id)
								.setP(obj.type));
   }catch(e){
        logCatch(e.toString());
	  //alert(e);
   }
   **/
   
   try{
      result = MoneyHubJSFuc("AddEvent",string);
	  if (result >= 0){
	     MoneyHubJSFuc("SetParameter","eventAlarm", "1");//事件添加成功，通知工具页面刷新
	  }else{
	     MoneyHubJSFuc("SetParameter","eventAlarm", "0");
	  }
   }catch(e){
        logCatch(e.toString());
      
   }
   return result;
}


/*向账户表中添加到期日*/
function addEnddate(TypeId, enddate, accountId, subaccountId){
   var sql = "update ? set enddate = '?' where id = ?";
   
   if(enddate != undefined && TypeId != undefined){
        if (TypeId == 2){
			sql = sql.setP("tbAccount").setP(enddate).setP(accountId);
		}else{
			sql = sql.setP("tbsubAccount").setP(enddate).setP(subaccountId);
		} 
   }
   try{
        MoneyHubJSFuc("ExecuteSQL",sql);     			
   }catch(e){
        logCatch(e.toString());
	   //TODO
   }
}

/*4.2修改，tbAccount, tbSubAccount中新添字段， 建立账户时需要更新这几个字段*/
//`dqbalarm` INT(2) NULL DEFAULT '0',
//`dqalarm` INT(4) NULL DEFAULT '3',
//`dqalarmtime` DATETIME NULL,
//`hkbalarm` INT(2) NULL DEFAULT '0',
//`hkalarm` INT(4) NULL DEFAULT '3', 
//`hkalarmtime` DATETIME NULL 

function addNewFeatureForSync(accountId, subaccountId, type, balarm, alarm){
    if (!accountId || !subaccountId || !type){
       throw new Error("Can't not update table");
       return false;
    } 

    var table = ["tbAccount", "tbSubAccount"],
        id    = [accountId, subaccountId];

    for (var i = 0, len = table.length; i < len; i ++){
       try{
           var sql = "update ? set {0}balarm = ?, {0}alarm = ? where id = ?";
           sql = sql.replace(/\{0\}/g, type);
           sql = sql.setP(table[i])
                    .setP(balarm ? balarm : "")
                    .setP(alarm ? alarm : "")
                    .setP(id[i]);  

           MoneyHubJSFuc("ExecuteSQL", sql);     			
       }catch(e){
           logCatch(e.toString());
       }
    }
}

function updateNewFeatureForSync(accountId, subaccountId, balarm){
    var table = ["tbAccount", "tbSubAccount"],
        id    = [accountId, subaccountId];

    for (var i = 0, len = table.length; i < len; i ++){
       try{
           var sql = "update ? set {0}balarm = ? where id = ?";
           sql = sql.replace(/\{0\}/g, type);
           sql = sql.setP(table[i])
                    .setP(balarm ? balarm : "")
                    .setP(id[i]);  

           MoneyHubJSFuc("ExecuteSQL", sql);     			
       }catch(e){
           logCatch(e.toString());
       }
    }

}


/*得到到期日时间*/
function getEnddate(TypeId, accountId, subaccountId){
    var enddate = "",
	    sql = "select enddate as enddate from ? where mark = 0 and ? = ?";
	switch(TypeId){
	    case  2:
		   sql = sql.setP("tbaccount").setP("id").setP(accountId);
		   break;
		case  5:
		   sql = sql.setP("tbsubaccount").setP("tbaccount_id").setP(accountId);
		   break;
		default:
		   sql = sql.setP("tbsubaccount").setP("id").setP(subaccountId);
		   break;
	}
	try{
	   var result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql));
	   if (result instanceof Array){
		   if (result[0].hasOwnProperty("enddate")){
			   enddate = result[0].enddate == 'undefined' ? "" : result[0].enddate;
		   }
	   }
	}catch(e){
        logCatch(e.toString());
    }
	return enddate;
}

/**得到事件ID
*/
function getEvent(accountId, subAccountId, type){ 
    var sql = "select a.id as id from tbEvent a where (a.tbaccount_id = '" 
            + accountId
            + "' or a.tbsubaccount_id = '"
            + subAccountId
            + "') and a.type = "
            + type;

    var id = 0;
	try {
	   var result = JSON.parse(MoneyHubJSFuc("QuerySQL", sql));
       id = result[0].id;
	}catch(e){
        logCatch(e.toString());
	   //TODO
	}
	return id;
}

/**根据事件名称删除事件
*/
function deleteEventByName(name){
    var sql = "delete from tbEvent where description = '" + name + "'";
    try {
	   if (name != 'undefined')
	      MoneyHubJSFuc("ExecuteSQL",sql);
	   MoneyHubJSFuc("SetParameter","eventAlarm", "1");
	}catch(e){
        logCatch(e.toString());
       //TODO	
	}
}

/*根据事件类型删除提醒事件*/
function deleteEvent(tbAccountId, tbSubAccountId){
    var UT = getUT();
    var sql = "update tbEvent set mark = 1, UT = ? where tbAccount_id = ?";
	sql = sql.setP(UT).setP(tbAccountId);
	if (tbSubAccountId != undefined){
	   sql += " and tbSubAccount_id = ?";
	   sql = sql.setP(tbSubAccountId);
	}
	try{
	   MoneyHubJSFuc("ExecuteSQL",sql);
	   MoneyHubJSFuc("SetParameter","eventAlarm", "1");
	}catch(e){
        logCatch(e.toString());
	   //TODO
	   //alert(e);
	}
}

/**根据事件名得到到期日
*/
function getEventDateAlarm(account_id, subAccount_id, type){
    var sql = "select a.alarm as alarm, a.datestring as datestring from tbEvent a " + 
	          " where a.tbaccount_id = ? and type = ? and mark = 0";
    switch(type){
	   case 21: case 22: 
	       sql = sql.setP(account_id).setP(type);
		   break;
	   case 3:
           sql += " and tbsubAccount_id = ? ";
           sql = sql.setP(account_id).setP(type).setP(subAccount_id);		   
	       break;
       case 5://投资类账户时没有维护账户数组，在没有刷新的情况下，无法使用子账户ID从数据库中取得
           sql = "select a.alarm as alarm, a.datestring as datestring from tbEvent a where (a.tbaccount_id = " 
                 + account_id
                 + " or a.tbsubAccount_id = "
                 + subAccount_id
                 + ") and type = "
                 + type
                 + " and mark = 0";
	   default:
	       break;
	}
	var result = {};
    try {
	    var queryResult = JSON.parse(MoneyHubJSFuc("QuerySQL", sql));
		if (typeof queryResult === 'object'){
		    result["alarm"] = queryResult[0].alarm;
	        result["enddate"] = queryResult[0].datestring.toString().substring(0, 10);
		}
	}catch(e){
        logCatch(e.toString());
	   //TODO
	}
	return result;
}


/** 获取用户区间段内的手动账，生成用户要操作的列表列表；
 */
function getUserTransactionList(){
	//groupSelectedTransId 
	var myLength = transactionDuration.length;
	var sql1 = "SELECT e.id AS eid, a.id AS aid, transdate, tbPayee_id, tbCategory2_id, c.type as ctype, c.name as cname, amount, direction, tbSubAccount_id, tbSubAccount_id1, a.tbPayee_id AS pid,direction AS deric, a.comment AS acomment, type, e.name AS dname, d.name AS aname, b.name AS bname, f.name AS fname, c.name AS cname, g.name as payeeName FROM tbTransaction a, tbCategory2 b, tbCategory1 c, tbAccount d, tbSubAccount e, tbCurrency f left join tbPayee g on a.tbpayee_id = g.id ";
		sql1 += "WHERE b.tbCategory1_id=c.id AND a.tbCategory2_id=b.id AND a.tbSubAccount_id=e.id AND e.tbAccount_id=d.id AND f.id=e.tbCurrency_id"; 
		sql1 += " and d.id =" + selectedAid + " and a.transactionClasses = 0 ";
		sql1 += " and a.mark = 0 and b.mark = 0 and c.mark = 0 and d.mark = 0 and e.mark = 0 "; //new
	if(myLength>0){
		for( var i=0; i<myLength; i++){
			if(1%2==0 ) sql+= " and transdate >= "+transactionDuration[i];
			else sql+= " and transdate <= "+transactionDuration[i];
		}
	}
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql));
	} catch(e) {
        logCatch(e.toString());
		$.each(result, function(i, n){
			result1 = n.rate;
		});
	}
	return result1;
}

/** 删除用户手动账操作
 */
function deleteUserTrans(){
	var temp=groupSelectedTransId.length;



	if(temp>0){
		var sql1 = "select direction as dir, tbsubaccount_id1 as sub1 from tbtransaction where mark = 0 and direction > 0 and tbsubaccount_id1 >0 and id in (";//new
		for(var j=0;j<temp;j++){
			if (j == ( temp - 1 ) ) sql1+= groupSelectedTransId[j];
			else sql1+= groupSelectedTransId[j]+", ";
		}
		sql1+=")";

		var list = JSON.parse(MoneyHubJSFuc("QuerySQL",sql1));
		if(list!=""){
			//有相关的转账记录
			$.each(list, function(a, t) {
				//删除相关的交易记录
			  	MoneyHubJSFuc("ExecuteSQL","update tbtransaction" + deleteStatus + ", UT = " + getUT() + " where mark = 0 and id =" + t.dir);//new
			  	//更新其他子账户余额
			  	modifySubAccountBalance(t.sub1);
			});
		}
		var sql = "update tbtransaction" + deleteStatus + ", UT = " + getUT() + " where id in ("
		for(var i=0;i<temp;i++){
			if (i == ( temp - 1 ) ) sql += groupSelectedTransId[i];
			else sql+= groupSelectedTransId[i]+", ";
		}
		sql+=")";

		}
	MoneyHubJSFuc("ExecuteSQL",sql);
}

function getMatchTransaction(){	
}

/** 取得子账户余额计算的截止时间
 * @return 数组,记录id，transdate；
 */
function getBalaceEndTime(){
	var sql = "select id, date as transDate from tbtransaction where mark = 0 and transactionclass = 2 order by transdate desc, id desc limit 0,1";//new
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql));
	} catch(e) {
        logCatch(e.toString());
		var result1 = [];
		if(result!=""){
			$.each(result, function(i, n){
				result1.push(n.id);
				result1.push(n.transDate);
			});	
		}
	}
	return result1;
}

function getPayeeId( name ){
	var sql = "select id as pid from tbPayee where mark = 0 and name = '" + name + "'";//new
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql));
		var result1 = -1;
		if(result!=""){
			$.each(result, function(i, n){
				result1 = n.pid;
			});	
		}
	} catch(e) {
        logCatch(e.toString());
	}
	return result1;
}

/*
 * 取得绑定的用户数据
 */
function fromKeyInfoToAccountId(keyInfo){
	try{
		var result1 = new Array;
		var t1 = MoneyHubJSFuc("QuerySQL","select id as aid, name as aName from tbAccount where mark = 0 and keyInfo = '" + keyInfo + "' ");//new
		result = JSON.parse(t1);
		$.each(result, function(i, n){
			result1.push(n.aid);
			result1.push(n.aName);
		});	
		return result1;	
	} catch(e){
        logCatch(e.toString());
	}
}

function fromKeyInfoToAccountId1(keyInfo){
	try{
		var result1 = "";
		var rs = 0;
		var t1 = MoneyHubJSFuc("QuerySQL","select count(id) as myNum from tbAccount where mark = 0 and keyInfo = '" + keyInfo + "' ");//new

		result1 = JSON.parse(t1);
		rs = result1[0].myNum;
		return rs;

		} catch(e){
        logCatch(e.toString());
	}
}

function getBillAboutAccount(mYtype){
	//判断账户时不用参数;
	//判断用户名时带参数;
	var result1 = [];
	if(selectedBankId != ""){
		headFirst = getBankClass();
		var sql = "select a.id as aid, a.name as aName from tbAccount a, tbBank b where a.mark = 0 and b.mark = 0 and a.tbBank_id = b.id and bankId = '" + selectedBankId + "' ";//new
		switch (headFirst){
			 case "a":
			 //银行类型
			 sql+=" and a.tbaccountType_id = 2 ";
			 break;
			 case "e":
			 //支付宝类型
			 sql+=" and a.tbaccountType_id = 4 ";
			 break;
		}
		if(mYtype === undefined ) sql+=" and ( keyinfo is null or keyinfo = '' )";
		
		result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql));
		if(result!=""){
			$.each(result, function(i, n){
				var temp = [];
				temp.push(n.aid);
				temp.push(n.aName);
				result1.push(temp);
			});	
		} 
	}
	return result1;
}

/** 判断一条记录是否要被更新，转账和更改交易对象
 */
function isInsertAndTransferAndPayee(){
	//判断业务类型；
	headFirst = getBankClass();
	switch (headFirst.toLowerCase()){
		case "a":
		 //银行类型，信用卡类型，注意：信用卡类型的金额>=0为支出，信用卡类型的金额<0为收入，
		rLength = RMBData.length;
		var cond2 = "";
		if(rLength>0){
			var RMBSameAsIdArray = []; 
			for(var a = 0;a<rLength;a++){
				/***************先处理替换支付对象操作****************************/
				var payeeId = changePayee(RMBData[a][6]);
				RMBData[a].splice(5,1,payeeId);
				/**************比对是否存在操作************************/
				//新建账户则不做此步骤
				if(!isNewAccount){
					var sql1 = " select count(a.id) as myNum, a.id as aId from tbtransaction a, tbcategory1 b, tbcategory2 c, tbAccount d, tbSubAccount e ";
					//sign编辑为用户的实际时间
					sql1 += " where e.tbAccount_id = d.id and a.tbsubaccount_id = e.id and a.tbcategory2_id = c.id and c.tbcategory1_id = b.id ";
					//4.0修改
					sql1 += " and a.mark = 0 and b.mark = 0 and c.mark = 0 and d.mark = 0 and e.mark = 0 ";//new
					//sql1 += " and sign = '" + RMBData[a][1] + "' and transactionClasses = 1 and e.tbCurrency_id = 1 and d.keyinfo = '"+keyInfo +"' ";
					//5.1 增加判断 add1，所属月份，RMBData[a][0]为月份
					sql1 += " and sign = '" + RMBData[a][1] + "' and a.add1 = '" + RMBData[a][0] + "' and transactionClasses = 1 and e.tbCurrency_id = 1 and d.keyinfo = '"+keyInfo +"' "; 
					if( RMBData[a][2] >= 0 ){
						//支出
						sql1+= " and b.type = 0 and amount ="+RMBData[a][2] ;  	
					} else {
						//收入
						sql1+= " and b.type = 1 and amount = abs("+RMBData[a][2]+")";
					}
					if(RMBSameAsIdArray.length>0){
						sql1+= " and a.id not in ( ";
						for(var rsa=0;rsa<RMBSameAsIdArray.length;rsa++){
							if(rsa == 0) sql1+= RMBSameAsIdArray[rsa];
							else sql1+= ", "+RMBSameAsIdArray[rsa];
						}
						sql1+= " )";
					}
					sql1+=" limit 1 ";
					debug("sql1="+sql1+"\n");
					try {
						result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql1));
					} catch(e) {
                        logCatch(e.toString());
					}
					if ( result[0].myNum > 0 ){
						//保留原来的
						RMBData[a].splice(4,1,1);
						RMBSameAsIdArray.push(result[0].aId);
					}		
					
				}
				/**************是否要变化为转账操作************************/
				//1，时间，2，金额，3，详情， 4，是否插入
				//找出想匹配的支付宝账单
				// 此业务逻辑存在可能准确的问题
				var cond1 = " and a.id not in (";
				var cond2 = "";
				var cond3 = ")";
				var aT = 4;
				var bankId = 'e001';
				//处理时间格式
				var myDate = RMBData[a][1].substring(0,4)+"-"+RMBData[a][1].substring(4,6)+"-"+RMBData[a][1].substring(6,8);
				var sql = "select a.id as aid from tbtransaction a, tbcategory1 b, tbcategory2 c, tbsubaccount d, tbaccount e, tbbank f ";
				sql += " where a.tbsubaccount_id = d.id and d.tbAccount_id = e.id and a.tbcategory2_id = c.id and c.tbcategory1_id = b.id and transactionClasses = 1 and f.id  = e.tbBank_id ";
				sql += " and a.mark = 0 and b.mark = 0 and c.mark = 0 and d.mark = 0 and e.mark = 0 and f.mark = 0 ";//new
				sql += " and transdate in ( '"+myDate+"',date('"+myDate+"','-1 day') ) and f.bankid = '"+bankId+"' and a.tbcategory2_id not in (10059,10060,10067) ";
				sql += " and e.tbAccountType_id = "+aT;
				sql += " and direction = ''";
				//这部分根据类型不一样要调整
				if( RMBData[a][2] <= 0 ){
					//支出
					sql+= " and b.type = 0 and amount = abs("+RMBData[a][2]+")";  	
				} else {
					//收入
					sql+= " and b.type = 1 and amount = abs("+RMBData[a][2]+")";
				}
				sql=sql+cond1+cond2+cond3; 
				
				sql+= " order by transdate asc limit 1";
				try {
					result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql));
				} catch(e) {
                    logCatch(e.toString());
				}

				//以下为业务处理具体的
				try{
					if(result!=""){
						$.each(result, function(j, m){
							//存入数据集合中
							var tempArray = [];
							tempArray.push(m.aid);
							tempArray.push(1);
							//数组内的位置
							tempArray.push(a);
							need2Trans.push(tempArray);
							//将已经选出的id排除在下次筛选之外
							if(need2Trans.length == 1) cond2+= m.aid;
							else cond2+= ", "+m.aid;
						});
					}
				}catch(e){
                   logCatch(e.toString());
				}
			}
		}
		//处理外币的业务逻辑
		var i=0;
		var rLength1 = secondCurrencyData.length;
		if(rLength1>0){
			var SecondSameAsIdArray = []; 
			for(var i = 0;i<rLength1;i++){
				/***************先处理替换支付对象操作****************************/
				var payeeId = changePayee(secondCurrencyData[i][6]);
				if( payeeId>0 ) secondCurrencyData[i].splice(5,1,payeeId);
				//新建账户则不做此步骤
				if(!isNewAccount){
					//目前默认是美元
					var sql1 = " select count(a.id) as myNum, a.id as aId from tbtransaction a, tbcategory1 b, tbcategory2 c, tbAccount d, tbSubAccount e ";
					//sign编辑为用户的实际时间
					
					sql1 += " where e.tbAccount_id = d.id and a.tbsubaccount_id = e.id and a.tbcategory2_id = c.id and c.tbcategory1_id = b.id ";
					sql1 += " and a.mark = 0 and b.mark = 0 and c.mark = 0 and d.mark = 0 and e.mark = 0 ";//new
					//5.0
					//sql1 += " and sign = '" + secondCurrencyData[i][1] + "' and transactionClasses = 1 and e.tbCurrency_id = 2 and d.keyinfo = '"+keyInfo +"' ";
					//5.1 增加判断 add1，所属月份，econdCurrencyData[a][0]为月份 
					sql1 += " and sign = '" + secondCurrencyData[i][1] + "' and a.add1 = '" + secondCurrencyData[i][0] + "' and transactionClasses = 1 and e.tbCurrency_id = 2 and d.keyinfo = '"+keyInfo +"' ";
					if( secondCurrencyData[i][2] >= 0 ){
						//支出
						sql1+= " and b.type = 0 and amount ="+secondCurrencyData[i][2] ;  	
					} else {
						//收入
						sql1+= " and b.type = 1 and amount = abs("+secondCurrencyData[i][2]+")";
					}
					if(SecondSameAsIdArray.length>0){
						sql1+= " and a.id not in ( ";
						for(var rsa=0;rsa<SecondSameAsIdArray.length;rsa++){
							if(rsa == 0) sql1+= SecondSameAsIdArray[rsa];
							else sql1+= ", "+SecondSameAsIdArray[rsa];
						}
						sql1+= " ) ";
					}
					sql1+=" limit 1 ";
					if(i==0) debug(sql1);
					try {
						result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql1));
					} catch(e) {
                        logCatch(e.toString());
                    }
					if(result[0].myNum > 0 ){
						SecondSameAsIdArray.push(result[0].aId);
						secondCurrencyData[i].splice(4,1,1);
					}		
					
				} else {
					break;
				}
			}
			//支付宝类型，支付宝类型无美元账户，不涉及转账记录
		}
		break;
		
		case "e":
		//支付宝类型，支付宝类型无美元账户
		rLength = RMBData.length;
		var cond2 = "";
		if(rLength>0){
			var RMBSameAsIdArray = [];
			for(var i=0;i<rLength;i++){
				//3.1版本先不做支付宝支付对象问题


				//新建账户则不做此步骤
				if(!isNewAccount){
					var sql1 = " select count(a.id) as myNum, a.id as aId from tbtransaction a, tbcategory1 b, tbcategory2 c, tbAccount d, tbSubAccount e ";
					//sign编辑为用户的实际时间
					sql1 += " where e.tbAccount_id = d.id and a.tbsubaccount_id = e.id and a.tbcategory2_id = c.id and c.tbcategory1_id = b.id ";
					sql1 += " and a.mark = 0 and b.mark = 0 and c.mark = 0 and d.mark = 0 and e.mark = 0 ";//new
					sql1 += " and sign = '" + RMBData[i][1] + "' and transactionClasses = 1 and e.tbCurrency_id = 1 and d.keyinfo = '"+keyInfo +"' "; 
					if( RMBData[i][2] >= 0 ){
						//支出
						sql1+= " and b.type = 1 and amount ="+RMBData[i][2] ;  	
					} else {
						//收入
						sql1+= " and b.type = 0 and amount = abs("+RMBData[i][2]+")";
					}
					if(RMBSameAsIdArray.length>0){
						sql1+= " and a.id not in ( ";
						for(var rsa=0;rsa<RMBSameAsIdArray.length;rsa++){
							if(rsa == 0) sql1+= RMBSameAsIdArray[rsa];
							else sql1+= ", "+RMBSameAsIdArray[rsa];
						}
						sql1+= " )";
					}
					sql1+=" limit 1 "; 
					try {
						result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql1));
					} catch(e) {
                        logCatch(e.toString());
					}
					debug(sql1+":::::\n");
					if ( result[0].myNum > 0 ){
						//保留原来的
						RMBData[i].splice(4,1,1);
						RMBSameAsIdArray.push(result[0].aId);
					}
				}
				//1，时间，2，金额，3，详情， 4，是否插入
				//找出想匹配的支付宝账单
				// 此业务逻辑存在可能准确的问题
				var cond1 = " and a.id not in (";
				
				var cond3 = ")";
				var aT = 2;
				//处理时间格式
				var myDate = RMBData[i][1].substring(0,4)+"-"+RMBData[i][1].substring(4,6)+"-"+RMBData[i][1].substring(6,8);
				var sql = "select a.id as aid from tbtransaction a, tbcategory1 b, tbcategory2 c, tbsubaccount d, tbaccount e ";
				sql += " where a.tbsubaccount_id = d.id and d.tbAccount_id = e.id and a.tbcategory2_id = c.id and c.tbcategory1_id = b.id and transactionClasses = 1";
				sql += " and a.mark = 0 and b.mark = 0 and c.mark = 0 and d.mark = 0 and e.mark = 0 ";//new
				sql += " and transdate in ( '" + myDate + "',date('" + myDate + "','+1 day') ) and a.tbcategory2_id not in (10059,10060,10067) ";
				sql += " and e.tbAccountType_id = " + aT;
				sql += " and direction = ''";
				//这部分根据类型不一样要调整
				if( RMBData[i][2] >= 0 ){
					//对应支出
					sql+= " and b.type = 0 and amount ="+RMBData[i][2] ;  	
				} else {
					//对应收入
					sql+= " and b.type = 1 and amount = abs("+RMBData[i][2]+")";
				}
				sql=sql+cond1+cond2+cond3; 
				sql+= " order by transdate asc limit 1";
				debug("transdebug="+sql+"\n");
				try {
					result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql));
				} catch(e) {
                        logCatch(e.toString());
				}
				
				//以下为业务处理具体的
				if(result!=""){
					$.each(result, function(d, n){
						//存入数据集合中
						var tempArray = [];
						debug("aid="+n.aid+"\n");
						tempArray.push(n.aid);
						tempArray.push(1);
						tempArray.push(i);
						need2Trans.push(tempArray);
						//将已经选出的id排除在下次筛选之外
						if(need2Trans.length == 1) cond2+= n.aid;
						else cond2+= ", "+n.aid;
						debug("need2Trans="+need2Trans+"\n");
					});
				}
			}
		}	
		break;
	}
	debug("合并完成后need2Trans="+need2Trans+"\n")
}

/*
 * 
 */
function getChangePayee(){
	//获取payee
	var sql="select id as aid, name as aname from tbPayee where mark = 0 and name  in ( ";//new
	var bpl= needPayee.length;
	for(var a=0;a<bpl;a++){
		if(a==0) sql+="'"+needPayee[a];
		else sql+="', '"+needPayee[a];
	}
	sql+="' )";
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql));
	} catch(e) {
        logCatch(e.toString());
    }
					
	//以下为业务处理具体的
	if(result!=""){
		for(var b=0;b<bpl;b++){
			var tempArray = [];
			tempArray.push(needPayee[b]);
			tempArray.push(0);
			$.each(result, function(i, n){
				//存入数据集合中
				if(needPayee[b] == n.aname){
					tempArray.splice(1,1,1);
					return false;
				}
			});
			payeeAbout.push(tempArray);
		}
	} else {
		//全部不存在，直接置为0;
		for(var b=0;b<bpl;b++){
				//存入数据集合中
			var tempArray = [];
			tempArray.push(needPayee[b]);
			tempArray.push(0);
			payeeAbout.push(tempArray);
		}
	}
}

function getUniqueSubAccount(aid,cid){
	var subAccountId=0;
	var result = "";
	var sql = "select id as sid from tbsubAccount where mark = 0 and tbaccount_id =" + aid + " and tbCurrency_id = " + cid;//new
	debug("getUniqueSubAccount="+sql+"\n");
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql));
	} catch(e) {
        logCatch(e.toString());
	}
	//以下为业务处理具体的
	if(result!=""){
		$.each(result, function(i, n){
			subAccountId = n.sid;
		});
	} else {
		//不存在，此种情况应只会出现在信用账户的情况中
		switch (cid){
			case 1:
				subAccountId = addAccountSub(aid, 1, 0, 0, "", "", 201, "人民币", "");
			break;
			case 2:
				subAccountId = addAccountSub(aid, 2, 0, 0, "", "", 201, "美元", "");
			break;
		}
	}
	return subAccountId;
}

/** 生成交易对象的参数对
 */
function getViewTransaction( id1,id2 ){
	var result = "";
	var sql1= "SELECT id AS aid, transdate as date1, tbCategory2_id as ctid, comment as comment, tbsubaccount_id as subId from tbTransaction ";
	sql1+= "WHERE mark = 0 and id in ( " + id1 + ", " + id2 + " ) ";//new
	debug("getViewTransaction=" + sql1);
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql1));
	} catch(e) {
        logCatch(e.toString());
	}
	return result;
}

function getFullViewTransaction(id1,id2){
	var result = "";
	try {
		var sql1 = "SELECT e.id AS eid, a.id AS aid, transdate, tbPayee_id, tbCategory2_id, type, c.name as cname, amount, direction, tbSubAccount_id, tbSubAccount_id1, a.tbPayee_id AS pid,direction AS deric, a.comment AS acomment, type, e.name AS dname, d.name AS aname, b.name AS bname, f.name AS fname, c.name AS cname, g.name as payeeName FROM tbTransaction a, tbCategory2 b, tbCategory1 c, tbAccount d, tbSubAccount e, tbCurrency f LEFT JOIN tbPayee g ON a.tbpayee_id=g.id ";
           
		sql1 += " WHERE b.tbCategory1_id=c.id AND a.tbCategory2_id=b.id AND a.tbSubAccount_id=e.id AND e.tbAccount_id=d.id AND f.id=e.tbCurrency_id ";
		sql1 += " and a.mark = 0 and b.mark = 0 and c.mark = 0 and d.mark = 0 and e.mark = 0 "//new
		sql1 += " and a.id in (" + id1 + ", " + id2 + ")";
		result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql1));
	} catch (e) {
        logCatch(e.toString());
	}
	return result;
}

function createSystemTransaction( id1, id2 ){
	var result = "";
	result = getViewTransaction( id1,id2 );
	$.each(result, function(i, n) {
	  	
	});
}

function getBankId(info){
	var id = -1;
	sql =  "select id as bid from tbBank where mark = 0 and bankid = '"+info+"'";
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql));
	} catch(e) {
        logCatch(e.toString());
	}
	$.each(result, function(i, n) {
	  	id = n.bid;
	});
	return id;
}

/*
 * 
 */
function getAllUserTransData(aid){
	try{
		var result = "";
		
		var sql1 = "SELECT substr(transdate,0,4) as myYear, substr(transdate,6,2) as myMonth, e.id AS eid, a.id AS aid, transdate, tbPayee_id, tbCategory2_id, type, c.name as cname, amount, direction, tbSubAccount_id, tbSubAccount_id1, a.tbPayee_id AS pid,direction AS deric, a.comment AS acomment, type, e.name AS dname, d.name AS aname, b.name AS bname, f.name AS fname, c.name AS cname, g.name as payeeName FROM tbTransaction a, tbCategory2 b, tbCategory1 c, tbAccount d, tbSubAccount e, tbCurrency f LEFT JOIN tbPayee g ON a.tbpayee_id=g.id ";
		sql1 += " WHERE b.tbCategory1_id=c.id AND a.tbCategory2_id=b.id AND a.tbSubAccount_id=e.id AND e.tbAccount_id=d.id AND f.id=e.tbCurrency_id ";
		sql1 += " and a.mark = 0 and b.mark = 0 and c.mark = 0 and d.mark = 0 and e.mark = 0 "//new
		sql1 += " and d.id = " + aid + " and transactionClasses = 0 ";
		if(allMonth.length>0){
			/* 因为sqlite处理的问题，此逻辑目前实现有改进的余地
			sql1 += " and substr(transdate,0,7) in ( ";
			for(var i=0;i<allMonth.length;i++){
				if(i==0) sql1 += "'" + allMonth[i].substring(0,4)+"-"+allMonth[i].substring(4,6)+"'";
				sql1 += ",'" + allMonth[i].substring(0,4)+"-"+allMonth[i].substring(4,6)+"'";				
			}
			sql1 += " ) ";
			*/
		} else if( during.length > 0 ){
			sql1 += " and transdate >= '" + during[0].substring(0,4)+"-"+during[0].substring(4,6)+"-"+during[0].substring(6,8)+"'";
			sql1 += " and transdate <= '" + during[1].substring(0,4)+"-"+during[1].substring(4,6)+"-"+during[1].substring(6,8)+"'";
		}
		result = MoneyHubJSFuc("QuerySQL",sql1);
		result = JSON.parse(result);
	} catch(e){
        logCatch(e.toString());
	}
	return result;
}

/** 生成不分收支类的类别
 */
function renderNoTypeCategory() {
	var Rs="";
	//取得分类；
	var list = getCategoryInfo();
	var list1 = getCategory1Default();
	var class1 = "";
	var currentCate="";
	$.each(list, function(i, n) {
		
		//当前的主分类名和现在的不一样，新开始
		if(currentCate!=n.name1){
			//这个是要加黑体的
			$.each(list1, function(j, m) {
				if(n.name1==m.name1){
					Rs += "<option value='" + m.id2 + "' mhvalue='"+m.name1+"'";                                                                                                                                                                                                                                                                                                                       
					Rs += " son='"+m.name2+"'>" + m.name1 + "</option>";
					currentCate=n.name1;
					return false;			
				}
			});	
		}
		if(!( n.name2 == "CATA420" )){
			Rs += "<option value='" + n.id2 + "' mhvalue='" + n.name1 + " : " + n.name2 + "'";
			Rs += ">" + n.name2 + "</option>";	
		}
	});
	return Rs;
}

/** 更新用户的卡号
 */
function updateAccountKeyInfo(accounid,keyInfo){
	var sql = "update tbaccount set keyinfo = '"+keyInfo+"' where id = "+accounid;
	MoneyHubJSFuc("ExecuteSQL",sql);
}

/** 插入用户导账单的数据记录月份
 */
function insertAccountGetBillRecord(tbaccount_id,tbmonth,tbkeyInfo){
	//先清除记录
	var sql1 = "update tbAccountGetBillMonth" + deleteStatus + ", UT = " + getUT() + " where mark = 0 and tbaccount_id = " + tbaccount_id + " and tbmonth = '" + tbmonth + "' and tbkeyinfo = '" + tbkeyInfo + "'";//new
	MoneyHubJSFuc("ExecuteSQL",sql1);
    var tempId = getMyId(),
    UT = getUT();	
	var sql = "insert into tbAccountGetBillMonth (id, UT, tbaccount_id, tbmonth, tbkeyInfo) values ("+ tempId + "," + UT + "," +  tbaccount_id + ", '" + tbmonth + "','" + tbkeyInfo + "')";//new
	MoneyHubJSFuc("ExecuteSQL",sql);
}

/** 取得用绑定账号等号的相关信息
 * @param aid 主账户编号
 * @param sid 子账户编号 
 */
function getAccountKeyInfo(aid, sid) {
	var result = "";
	if ((!(aid === undefined)) && (aid != "")) {
		var sql = "SELECT keyInfo AS key, b.name AS bankName, tbaccounttype_id AS tid FROM tbAccount a LEFT JOIN tbBank b ON a.tbBank_id=b.id WHERE a.mark = 0 AND b.mark = 0 AND a.id=" + aid + " AND a.tbaccountType_id IN (2, 4)";//new
	} else if ((!(sid === undefined)) && (sid != "")) {
		var sql = "SELECT keyInfo AS key, b.name AS bankName, a.tbaccounttype_id AS tid FROM tbAccount a, tbsubaccount c LEFT JOIN tbBank b ON a.tbBank_id=b.id WHERE a.mark = 0 AND b.mark = 0 AND c.mark = 0 AND a.id=c.tbaccount_id AND a.tbaccountType_id IN (2, 4) AND c.id=" + sid;//new
	}
	try {
		result = JSON.parse(MoneyHubJSFuc("QuerySQL",sql));
	} catch (e) {
        logCatch(e.toString());
	}
	return result;
}

function getAccountName(bankid,accountType_id){
	var sql = "select a.name as aname, a.id as aid from tbAccount a, tbbank b where a.mark = 0 and b.mark = 0 and a.tbbank_id = b.id and a.tbBank_id and b.bankid  = '" + bankid + "' and tbaccounttype_id = " + accountType_id;//new
	var result = "";
	result = MoneyHubJSFuc("QuerySQL",sql);
	result = JSON.parse(result);
	return result;
}

function getAccountNameNumber(bankid,accountType_id){
	var sql = "select count(a.name) as myNum from tbAccount a, tbbank b where a.mark = 0 and b.mark = 0 and a.tbbank_id = b.id and a.tbBank_id and b.bankid  = '"+bankid+"' and tbaccounttype_id = " + accountType_id;//new
	var result = "";
	result = MoneyHubJSFuc("QuerySQL",sql);
	result = JSON.parse(result);
	return result[0].myNum;
}

function removeAccountKeyInfo(aid){
    var UT = getUT();
	var sql = "update tbAccount set keyInfo = '', UT = " + UT + " where id =" + aid;//new
	MoneyHubJSFuc("ExecuteSQL",sql);
}

function getMySingleAccountName(id){
	var result = "";
	var sql = "select name as aname from tbaccount where mark = 0 and id = " + id;//new
	result = MoneyHubJSFuc("QuerySQL",sql);
	result = JSON.parse(result);
	if(result!="") result=result[0].aname;
	else result = "";
	return result;
}

/**
 * 获取相同类型的账户的相关信息
 */
function getSameTypeAccountInfo(tid){
	var result = "";
	var sql = "select a.id as aid, a.name as aname, a.keyInfo as keyinfo, b.id as bid, b.name as bname, tbCurrency_id as curId from tbAccount a,tbSubAccount b where a.id = b.tbaccount_id and a.tbaccountType_id = '"+tid+"' and a.mark = 0 and b.mark = 0";
	//alert(sql);
	result = MoneyHubJSFuc("QuerySQL",sql);
	//alert(result);
	result = JSON.parse(result);
 	return result;
}

//合并子账户
function mergeSubAccount(tid,oldAid,oldSid,newAid,newSid){
	try{
		var balanceCate2 = "10067";
		var UT =  getUT();
		//删除原子账户的相关的余额调整
		sql = "update tbtransaction set mark=1, UT = '"+UT+"' where mark = 0 and tbcategory2_id = '"+balanceCate2+"' and tbsubaccount_id = "+oldSid;
		MoneyHubJSFuc("ExecuteSQL",sql);
		//删除合并两账户之间的转账
		var sql = "update tbtransaction set mark = 1, UT = '"+UT+"' where tbsubaccount_id = "+oldSid+" and tbsubaccount_id1 = "+newSid;
		MoneyHubJSFuc("ExecuteSQL",sql);
		sql = "update tbtransaction set mark = 1, UT = '"+UT+"' where tbsubaccount_id = "+newSid+" and tbsubaccount_id1 = "+oldSid;
		MoneyHubJSFuc("ExecuteSQL",sql);
		
		//更新原子账户对应的转账
		sql = "update tbtransaction set tbsubaccount_id1 = "+newSid+", UT = '"+UT+"' where mark = 0 and tbcategory2_id != '"+balanceCate2+"' and tbsubaccount_id1 = "+oldSid;
		MoneyHubJSFuc("ExecuteSQL",sql);
		//更新原子账户的相关的手工帐
		sql = "update tbtransaction set tbsubaccount_id = "+newSid+", UT = '"+UT+"' where mark = 0  and tbcategory2_id != '"+balanceCate2+"' and tbsubaccount_id = "+oldSid;
		MoneyHubJSFuc("ExecuteSQL",sql);
		
		//step2,删除子账户的event
		//sql = "update tbevent set mark = 1, UT = '"+UT+"' where mark = 0 and tbsubaccount_id = "+oldSid;
		//MoneyHubJSFuc("ExecuteSQL",sql);
		//step3,删除原子账户
		sql = "update tbsubaccount set mark = 1, UT = '"+UT+"' where mark = 0 and id = "+oldSid;
		//alert(sql);
		//debug("mergeSubAccount="+sql+"\n");
		MoneyHubJSFuc("ExecuteSQL",sql);
	} catch(e){
        logCatch(e.toString());
		debug("mergeSubAccount="+e.message+"\n");
	}
}

//子账户迁移
function moveSubAccount(tid,oldAid,oldSid,newAid,newSid){
	try{
		var UT =  getUT();
		//var sql = "update tbevent set tbAccount_id = "+newAid+", UT = '"+UT+"' where mark = 0 and tbsubaccount_id = "+oldSid;
		//MoneyHubJSFuc("ExecuteSQL",sql);
		var sql = "update tbsubaccount set tbaccount_id = "+newAid+", UT = '"+UT+"' where mark = 0 and id = "+oldSid;
		MoneyHubJSFuc("ExecuteSQL",sql);
	} catch(e){
        logCatch(e.toString());
		debug("moveSubAccount="+e.message+"\n");
	}
}

//账户合并时移除掉原来的主账户
function removeAccount( aid ){
	
	var UT =  getUT();
	//var sql = "update tbevent set mark=1, UT = '"+UT+"' where mark = 0 and tbAccount_id = "+aid;
	//MoneyHubJSFuc("ExecuteSQL",sql);
	var sql = "update tbaccount set mark=1, UT = '"+UT+"' where mark = 0 and id = "+aid;
	MoneyHubJSFuc("ExecuteSQL",sql);
}

/*
 * 取得子账户的余额
 */
function getSubAccountBalance( sid ){
	var sql = "select balance as myBalance from tbsubaccount where id = "+sid;
	MoneyHubJSFuc("ExecuteSQL",sql);
	result = MoneyHubJSFuc("QuerySQL",sql);
	result = JSON.parse(result);
	return result[0].myBalance;
}

function getMySubAccountId( aid ){
	var sql = "select id as sid from tbsubaccount where mark = 0 and tbaccount_id = "+aid;
	debug("getMySubAccountId="+sql+"\n");
	result = MoneyHubJSFuc("QuerySQL",sql);
	result = JSON.parse(result);
	return result[0].sid;
}

/*
*判断当前是否存在账户
*/
function isExistAccount(){
    var re = [];
    re = JSON.parse(MoneyHubJSFuc("QuerySQL","select count(id) as count from tbAccount where mark = 0"));
    return re[0].count == 0 ? false : true;
}





