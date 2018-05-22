/**
 * @author beytagh
 * @date 20171116
 * @see  引入文件，用于引入css或者js
 */

//cache 缓存，async 异步，callback，回调
//css文件只支持cache参数
//js文件cache 缓存，async 异步参数必传
var links = [
    {file: '/js/jquery.cookie.js', async: false, cache: true, callback: cfunc},
    {file: '/js/vue.min.js', async: false, cache: true},
    {file: '/js/validate.js', async: true, cache: true},
    {file: '/js/md5.js', async: false, cache: true},
    {file: '/js/fingerprint.js', async: false, cache: true},
    {file: '/js/fastclick.js', async: false, cache: true},
    {file: '/js/flexible.js', async: false, cache: true},
    {file: '/js/health.js', async: false, cache: true, callback: pfunc},
    {file: '/js/defined.js', async: false, cache: true},
];

//demo 回调
function cfunc() {
    //console.log('cookie');
}

//demo 回调
function pfunc() {
    //console.log('plat');
}

/**
 * 动态加载js
 * @author beytagh
 * @param url 需要引入的JS的地址
 * @param async 同步或者异步方式
 * @param cache 缓存
 * @param callback 引入成功后的回调方法
 */
var loadJsLink = function (url, async, cache, callback) {
    $.ajax({
        url: url,
        async: async,
        dataType: "script",
        cache: cache,
        success: function () {
            if (typeof callback === 'function') {
                callback();
            }
        }
    });
};

/**
 * 动态加载css
 * @author beytagh
 * @param url css的地址
 */
var loadCssLink = function (url) {
    $('head').append('<link>');
    var css = $('head').children(':last');
    css.attr({
        rel: 'stylesheet',
        type: 'text/css',
        href: url
    });
};

/**
 * 执行加载方法
 * @author beytagh
 */
$.each(links, function (k, v) {
    var name = v.file.replace(/^\s|\s$/g, "");
    var att = name.split('.');
    var ext = att[att.length - 1].toLowerCase();
    var is_css = ext == "css";
    if (is_css) {
        if (v.cache) {
            loadCssLink(v.file);
        } else {
            var timestamp = (new Date()).valueOf();
            var file = v.file + '?_=' + timestamp;
            loadCssLink(file);
        }

    } else {
        loadJsLink(v.file, v.async, v.cache, v.callback);
    }
});



