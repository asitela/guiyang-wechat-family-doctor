/**
 * 表单验证插件
 * @author beytagh
 * @date 20180309
 * @eg <form class="caseInfo_box" id="addCase_form" method="post" enctype="multipart/form-data" name="fileinfo">
 *     <lable id="v_title">病例标题</lable>
 *      <input type="text" name="title" placeholder="请输入病历标题" maxlength="100" vname="v_title" validator="notNull" vtype="name"/>
 *
 *       <input type="text" name="auth_number" v-model="auth_number" placeholder="请输入证件号码" maxlength="20" vname="card_num" validator="notNull"/>
 *  </form>
 *
 *   if (validateForm(addCase_form)){
 *      验证成功
 *   }else{
 *      验证失败
 *   }
 */

function StrLenthByByte(str) {
    return str.replace(/[^\x00-\xff]/g, "**").length;
}

//输出错误信息
var showError = function (_errMsg) {
    $('.errorText').html('<div class="alert alert-danger">' +
        '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true">' +
        '</span><span class="sr-only">错误：</span>' + _errMsg + '</div>');
};

//输出成功信息
var showSuccess = function (_succMsg, _func) {
    $('.meminfotips').html(_succMsg);
    $('.meminfotips').show(0, _func);
};

//验证form
function validateForm(theForm) {  // return true if all is well
    var elArr = theForm.elements;  // get all elements of the form into array
    var val;
    for (var i = 0; i < elArr.length; i++) {
        with (elArr[i]) {  // for each element of the form...
            var v = elArr[i].getAttribute('validator');  // get validator, if any
            var vname = elArr[i].getAttribute('vname');
            var ml = elArr[i].getAttribute('maxlen');//验证最大长度
            var vt = elArr[i].getAttribute('vtype'); //验证类型
            if (!v) {
                continue;  // no validator property, skip
            }
            if (!vname) {
                continue;
            }

            var n_str = document.getElementById(vname).innerHTML;

            if (v == "notNull") {  //如果是非空的字符串,要单独处理,通过判断他的长度来判断是否有效
                val = value;

                if (elArr[i].tagName == "SELECT")//下拉框单独处理
                {
                    if (elArr[i].selectedIndex == 0) {
                        elArr[i].focus();
                        showError("请选择“" + n_str + "”！");
                        return false;
                    }
                }
                else {
                    if ($.trim(value).length == 0)//是否必须填写验证
                    {
                        elArr[i].focus();
                        var vel_type = elArr[i].getAttribute('vel-type');
                        if (vel_type == 'select') {
                            showError("请选择“" + n_str + "”！");
                        } else {
                            showError("请在“" + n_str + "”项内填入数据！");
                        }
                        return false;
                    }
                }
            }

            if (vt && $.trim(value).length > 0)//验证类型
            {
                var thePat = PatternsDict[vt];  // 根据v的值选择所需的正则表达式
                var gotIt = thePat.exec(value);  // run it on value of elArr[i]
                if (!gotIt) {
                    elArr[i].focus();
                    showError("请输入正确的“" + n_str + "”！");
                    return false;
                }
            }

            if (ml) {
                if (StrLenthByByte($.trim(value)) > ml) {
                    elArr[i].focus();
                    showError("“" + n_str + "”的最大长度为：" + ml);
                    return false;
                }
            }

            if (v == "need_all")//验证所有指定控件
            {
                var vids = elArr[i].nv;
                var ids = vids.split(",");


                //判断是否全部未填写
                var all_false = true;
                for (j = 0; j < ids.length; j++) {
                    var obj = document.getElementById(ids[j]);
                    if (validateElement(obj, false)) {
                        all_false = false;
                        break;
                    }
                }

                //全部未填写，不处理
                if (all_false) {
                    continue;
                }

                for (j = 0; j < ids.length; j++) {
                    var obj = document.getElementById(ids[j]);
                    if (!validateElement(obj, true)) {
                        return false;
                    }
                }
            }

            if (v == "date") {  // 对于date型的数据做专门处理
                var checkdate = elArr[i].getAttribute('checkdate');
                if (!checkdate) {
                    continue;
                }

                var d = new Date();
                var d_y = d.getFullYear();
                var d_m = (d.getMonth() + 1).toString();
                var d_d = d.getDate().toString();
                var d_now = "" + d_y + ((d_m.length == 1) ? ("0" + d_m) : d_m) + ((d_d.length == 1) ? ("0" + d_d) : d_d);

                val = value;
                var d_val = val.replace(/-/g, "");

                if (checkdate == "now") {
                    if (d_val <= d_now) {
                        showError("“" + n_str + "”必须大于当前日期！");
                        return false;
                    }
                } else {
                    var d_val_c = document.getElementById(checkdate).value.replace(/-/g, "");
                    var n_str_c = document.getElementById(document.getElementById(checkdate).cnname).innerHTML;
                    if (d_val < d_val_c) {
                        showError("“" + n_str + "”不能小于“" + n_str_c + "”！");
                        return false;
                    }
                }
            }

        }  // end with
    }  // end for

    return true;
}

/* 验证用正则表达式 */
var PatternsDict = new Object();

//非空 - notNull
PatternsDict.notNull = /^(.+\n*)+$/;  // 匹配必须有数据输入

//（必须填的）ASCII字符 - ascii
PatternsDict.ascii = /^[ -\.\(\)\'\"\`a-zA-Z0-9]+$/;  // 匹配所有可见ASCII码
//（可为空的）ASCII字符 - asciiNull
PatternsDict.asciiNull = /(^[ -\.\(\)\'\"\`a-zA-Z0-9]+$)|(^$)/;  // 匹配所有可见ASCII码

//（必须填的）非负整数 - posInt
PatternsDict.posInt = /^\d+$/;  //匹配正整数和“0”
//（可为空的）非负整数 - posIntNull
PatternsDict.posIntNull = /(^\d+$)|(^$)/;  //匹配正整数和“0”

//（必须填的）正整数 - posIntP
PatternsDict.posIntP = /^[1-9]\d*$/;  //匹配正整数，不包括“0”
//（可为空的）正整数 - posIntPNull
PatternsDict.posIntPNull = /(^[1-9]\d*$)|(^$)/;  //匹配正整数，不包括“0”

//（必须填的）非负数（整数和浮点数） - posNum
PatternsDict.posNum = /^\d+\.?\d+$/;  // 匹配如 123 或 123.334
//（可为空的）非负数（整数和浮点数） - posNumNull
PatternsDict.posNumNull = /(^\d+\.?\d+$)|(^$)/;  // 匹配如 123 或 123.334

//（必须填的）货币价格 - currency
PatternsDict.currency = /(^\d+\.?\d+$)|(^\d{1,3}(,\d{3})*(\.\d+)?$)/;  // 匹配如 123 或 123.334 或 12,123,123.123
//（可为空的）货币价格 - currencyNull
PatternsDict.currencyNull = /((^\d+\.?\d+$)|(^\d{1,3}(,\d{3})*(\.\d+)?$))|(^$)/;  // 匹配如 123 或 123.334 或 12,123,123.123

//（必须填的）时间 - time
PatternsDict.time = /^([0-1]?\d|2[0-3])[:][0-5]\d$/;  // 匹配如 03:00 或 3:00 或 23:59
//（可为空的）时间 - timeNull
PatternsDict.timeNull = /(^([0-1]?\d|2[0-3])[:][0-5]\d$)|(^$)/;  // 匹配如 03:00 或 3:00 或 23:59

//（必须填的）日期 - date
PatternsDict.date = /^[1-2]\d{3}-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[0-1])$/;  // 匹配如 2006-11-23 或 2006-1-1 或 2006-01-01
//（可为空的）日期 - dateNull
PatternsDict.dateNull = /(^[1-2]\d{3}-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[0-1])$)|(^$)/;  // 匹配如 2006-11-23 或 2006-1-1 或 2006-01-01

//下拉框不能为0 - dropDown
PatternsDict.dropDown = /[^0]/;  //验证是否没有选择列表内容

//（必须填的）姓名 - name
PatternsDict.name = /^.+$/; //匹配所有数据，但不包括换行符
//（可为空的）姓名 - nameNull
PatternsDict.nameNull = /(^.+$)|(^$)/; //匹配所有数据，但不包括换行符

//（必须填的）登录名 - loginName
PatternsDict.loginName = /^[a-zA-Z0-9_]{5,20}$/; // 匹配帐号是否合法(字母开头，允许6-15字节，允许字母数字下划线)-
//（可为空的）登录名 - loginNameNull
PatternsDict.loginNameNull = /(^[a-zA-Z0-9_]{5,20}$)|(^$)/; // 匹配帐号是否合法(字母开头，允许6-15字节，允许字母数字下划线)

//（必须填的）电子邮箱 - email
PatternsDict.email = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;  //匹配电子邮箱
//（可为空的）电子邮箱 - emailNull
PatternsDict.emailNull = /(^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$)|(^$)/;  //匹配电子邮箱

//（必须填的）固定电话 - tel
PatternsDict.tel = /(^\d+-?\d+$)|(^\(\d{1,4}\) ?\d+$)/; //目前匹配所有电话，如：13812345678 或 010-12345678 或 (010)12345678 或 (010) 12345678
//（可为空的）固定电话 - telNull
PatternsDict.telNull = /((^\d+-?\d+$)|(^\(\d{1,4}\) ?\d+$))|(^$)/; //目前匹配所有电话，如：13812345678 或 010-12345678 或 (010)12345678 或 (010) 12345678

//（必须填的）所有电话 - phone
PatternsDict.phone = /(^\d+-?\d+$)|(^\(\d{1,4}\) ?\d+$)/; //匹配所有电话，如：13812345678 或 010-12345678 或 (010)12345678 或 (010) 12345678
//（可为空的）所有电话 - phoneNull
PatternsDict.phoneNull = /((^\d+-?\d+$)|(^\(\d{1,4}\) ?\d+$))|(^$)/; //匹配所有电话，如：13812345678 或 010-12345678 或 (010)12345678 或 (010) 12345678

//（必须填的）手机 - mobilePhone
PatternsDict.mobilePhone = /^13[\d]{9}$|^14[5,7]{1}\d{8}$|^15[^4]{1}\d{8}$|^17[0,6,7,8]{1}\d{8}$|^18[\d]{9}$/; //匹配国内手机，如：13812345678 或 15912345678
//（可为空的）手机 - mobilePhoneNull
PatternsDict.mobilePhoneNull = /^(13[\d]{9}$|^14[5,7]{1}\d{8}$|^15[^4]{1}\d{8}$|^17[0,6,7,8]{1}\d{8}$|^18[\d]{9}$)|(^$)/; //匹配国内手机，如：13812345678 或 15912345678

// （必须填的）只验证座机的
PatternsDict.fixedTelephone=/^0\d{2,3}-[1-9]\d{6,7}$/;  //如 010-5555555588888888,(010)55555555
// （可为空的）只验证座机的
PatternsDict.fixedTelephoneNull=/^0\d{2,3}-[1-9]\d{6,7}$|(^$)/;


//（必须填的）邮政编码 - zip
PatternsDict.zip = /^\d{6}$/;  // 匹配邮政编码如： 100086
//（可为空的）邮政编码 - zipNull
PatternsDict.zipNull = /(^\d{6}$)|(^$)/;  // 匹配邮政编码如： 100086

//（必须填的）身份证件 - IDNo
PatternsDict.IDNo = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|x)$)/; // 匹配所有数据，但不包括换行符
//（可为空的）身份证件 - IDNoNull
PatternsDict.IDNoNull = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|x)$)|(^$)/; // 匹配所有数据，但不包括换行符

//（必须填的）网址 - URL
PatternsDict.URL = /^[a-zA-z]+:\/\/[^\s]*$/;  // 匹配网址URL
//（可为空的）网址 - URLNull
PatternsDict.URLNull = /(^[a-zA-z]+:\/\/[^\s]*$)|(^$)/;  // 匹配网址URL

//（必须填的）搜索关键字
PatternsDict.keyWord = /^[\w\u4E00-\u9FA5\s　]+$/;  // 匹配网址URL
// 只匹配 字母或数字或汉字
PatternsDict.NumLetterChin = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;

// 区号
PatternsDict.AreaCode = /0[1-9]{2,3}/;
//（必须填的）非js
PatternsDict.noJs = /^[^<>]+$/;  // noJs

//（必须填的）非js2
PatternsDict.noJs2 = /^[^<]+$/;  // noJs

// 网关号 必填
PatternsDict.gateway = /^[A-Fa-f0-9]{0,20}$/;

// 网关号 可为空
PatternsDict.gatewayNull = /^[A-Fa-f0-9]{0,20}$|(^$)/;

//出生证 必填
PatternsDict.BirthCertificate = /[A-Za-z]{1}\d{3,}/;
//出生证 可为空
PatternsDict.BirthCertificateNull = /[A-Za-z]{1}\d{3,}|(^$)/;
