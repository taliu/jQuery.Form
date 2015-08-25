/// <reference path="jquery-1.10.0.js" />
 
(function ($) {
    var defaults = {
        //Properties
        url: "",
        dataType: "text", //提交成功后返回的数据类型
        type: "GET", //请求方式 ("POST" 或 "GET")， 默认为 "GET"。
        //Events
        onSubmit: function (requestFormData) { }, //Fires before submit, return false to prevent submit action.
        success: function (resultData) { }, //Fires when the form is submitted successfuly.
        onBeforeLoad: function (formData) { }, //Fires before a request is made to load data. Return false to cancel this action.
        onLoad: function (formData) { }, //Fires when the form data is load.
        onLoadError: function (errorMessage) {}, //Fires when some errors occur while loading form data.
        validateRules: {}, //表单的验证规则
        mappingRules: {}//表单域名称fieldName和它的验证规则validtype的对应关系如：{"age":"minLength[2]"}
    };

    var methods = {
        init: function (options) {//初始化
            return this.each(function () {
                var $form = $(this);
                var hasInit = methods.getOptions.call($form); //是否已经初始化过了。
                methods.setOptions.call($form, options);
                hasInit || $form.submit(function () {
                        event.preventDefault();//防止触发浏览器的默认行为。
                        var settings = methods.getOptions.call($form);
                        var formData = methods.getFormData.call($form); //获取表单数据
                        if (settings.onSubmit(formData) !== false) {
                            settings.data = formData;
                            $.ajax(settings);
                        }
                });
            });
        },
        submit: function (options) {//提交表单
            return this.each(function () {
                var $form = $(this);
                $form.form(options).submit();
            });
        },
        load: function (dataOrUrl, type) {//加载数据（json格式）来填充表单 
            type = (type || "post").toLowerCase();
            return this.each(function () {
                var $form = $(this);
                var settings = methods.getOptions.call($form);
                if (typeof (dataOrUrl) == "string") {
                    var data = {};
                    if (settings.onBeforeLoad(data) !== false) {
                        var url = dataOrUrl;
                        var loadData = type == "get" ? $.get : $.post;
                        loadData(url, data, function (formData) {
                            settings.onLoad && settings.onLoad(formData);
                            methods.setFormData.call($form, formData);
                        }, "json").error(function () {
                            settings.onLoadError("加载数据出错：数据格式要为json格式。来自：" + dataOrUrl);
                        });
                    }
                } else if (typeof (dataOrUrl) == "object") {
                    var formData = $.extend({}, dataOrUrl);
                    if (settings.onBeforeLoad() !== false) {
                        settings.onLoad && settings.onLoad(formData);
                        methods.setFormData.call($form, formData);
                    }
                } else {
                    settings.onLoadError("参数不是一个json对象或URL");
                }
            });
        },
        clear: function (defaultValues) {
            defaultValues = defaultValues || {};
            return this.each(function () {
                var $form = $(this);
                $form.find("input[type!='submit'][type!='reset'][type!='button'],textarea,select").each(function () {
                    var o = this;
                    switch (o.type.toLocaleLowerCase()) {
                        case "checkbox":
                        case "radio":
                            if (defaultValues.hasOwnProperty(o.name)) {
                                var arr = defaultValues[o.name].split(',');
                                if (arr.indexOf(o.value) != -1) {
                                    o.checked = true;
                                }
                            } else if (o.checked) {
                                o.checked = false;
                            }
                            break;
                        default:
                            if (defaultValues.hasOwnProperty(o.name)) {
                                $(o).val(defaultValues[o.name]);
                            } else {
                                $(o).val("");
                            }
                            break;
                    }
                });
            });
        },
        reset: function () { //重置表单
            return this.each(function () {
                this.reset();
            });
        },
        validate: function (showAllError) { //Do the form fields validation, return true when all fields is valid.
            var result = true;
            var $form = this;
            var settings = methods.getOptions.call($form);
            $form.find("[name][validType]").each(function () {
                var $input = $(this);
                var typeStr = $input.attr("validType");
                if (typeStr) {
                    var rules = typeStr.split("|");
                    for (var i = 0; i < rules.length; i++) {
                        var params, rule = $.trim(rules[i]);
                        if (rule) {
                            var j = rule.indexOf("[");
                            if (j != -1) {//有参数
                                try {
                                    params = Function("return " + rule.slice(j))();
                                    rule = rule.slice(0, j);
                                } catch (e) {
                                    $.error("验证规则有误:" + rule);
                                }
                            }
                            if (settings.validateRules.hasOwnProperty(rule)) {
                                var vRule = settings.validateRules[rule];
                                var valid = vRule.validator($input.val(), params, $input);
                                !valid && ($.type(vRule.message) === "function") && vRule.message($input.val(), params, $input);
                                result = valid && result;
                            } else {
                                result = false;
                                $.error("不存在名称为 " + rule + " 的验证规则");
                            }
                        }
                        if (!result && !showAllError) {
                            return false; //退出each
                        }
                    }
                }
            });
            return result;
        },
        getFormData: function () {//get the form data.
            var $form = this;
            var formData = {};
            $form.find("[name]").each(function () {
                var name = ""; //同一个name对应多个值，则用逗号，分割
                var val;
                var o = this;
                switch (o.type.toLocaleLowerCase()) {
                    case "select-multiple":
                        name = o.name;
                        val = $(o).val().join(',');
                        break;
                    case "checkbox":
                    case "radio":
                        if (o.checked) {
                            name = o.name;
                            val = $(o).val();
                        }
                        break;
                    default:
                        name = o.name;
                        val = $(o).val();
                        break;
                }
                if (name) {
                    if (formData.hasOwnProperty(name)) {
                        formData[name] += "," + val;
                    } else {
                        formData[name] = val;
                    }
                }
            });
            return formData;
        },
        setFormData: function (formData) {//set the form data.
            return this.each(function () {
                var $form = $(this);
                formData && $form.find("[name]").each(function () {
                    var o = this;
                    if (formData.hasOwnProperty(o.name)) {
                        var val = formData[o.name];
                        switch (o.type.toLocaleLowerCase()) {
                            case "select-multiple":
                                val&&$(o).val(val.split(","));
                                break;
                            case "checkbox":
                            case "radio":
                                var arr = val ? val.split(',') : [];
                                if (arr.indexOf(o.value) != -1) {
                                    o.checked = true;
                                }
                                break;
                            default:
                                $(o).val(val);
                                break;
                        }
                    }
                });
            });
        },
        setOptions: function (options) {//set the form options.
            return this.each(function () {
                var $form = $(this);
                var settings = methods.getOptions.call($form);
                if (settings) {
                    settings = $.extend(true, {}, settings, options);
                } else {
                    //使用url，type优先级：手动代码设置options》表单设置》默认设置defaults
                    var _defaults = $.extend({}, defaults, { url: $form.attr("action") || location.href, type: $form.attr("method") || defaults.type });
                    settings = $.extend(true, {}, _defaults, options);
                }
                for (var name in settings.mappingRules) {
                    $form.find("[name='" + name + "']").attr("validtype", settings.mappingRules[name]);
                }
                $form.data("_form_settings", settings);
            });
        },
        getOptions: function () {//get the form options.
            return this.data("_form_settings");
        }
    };

    $.fn.form = function (OptionsOrMethodName, args) {
        var method = arguments[0];
        if (methods[method]) {
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if (typeof (method) == 'function') {
            return this.form({ success: method });
        } else if (typeof (method) == 'object' || !method) {
            method = methods.init;
        } else {
            $.error('$.form上不存在' + method + '方法 ');
            return this;
        }
        if (method != methods.init && !methods.getOptions.call(this)) {
            methods.init.call(this);
        }
        return method.apply(this, arguments);
    };
    $.fn.form.defaults = defaults;
} (jQuery));
        