
 
(function ($) {
    //format:复合格式字符串
    //parmas:一个json对象或数组，或者其他跟多参数
    $.stringFormat = function (format, parmas) {
        var data, args = arguments, arr = [], i = 0;
        data = (args.length == 2 && args[1] && typeof (args[1]) == "object") ? args[1] : Array.prototype.slice.call(args, 1);
        for (arr[i++] in data);
        return arr.length ? args[0].replace(new RegExp("\\{" + arr.join("\\}|\\{") + "\\}", "img"), function (val) { return data[val.slice(1, -1)]; }) : args[0];
    };
} (jQuery));
        