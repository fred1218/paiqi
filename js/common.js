template.config("compress", true);
template.config("cache", false);
template.helper('setCCLeft', function (beginTime) {
    var _l = time_ruler.getRelativeLeft(beginTime);
    return _l;
});
template.helper('showShortTime', function (iTime) {
    return moment(iTime).format('HH:mm');
});
//设置每个场次的宽度
template.helper('setCCWidth', function (duration) {
    return duration / time_ruler.oriConfig.per_pix;
});
//设置连场的宽度
template.helper('setLCWidth', function (endTime, beginTime) {
    var bg = moment(beginTime),
        eg = moment(endTime);
    var sub_mins = eg.diff(bg, 'minutes');
    var _width = sub_mins / time_ruler.oriConfig.per_pix;
    return _width;
});
/**
 * 将场次中的连场计算出来
 * @param changciData
 */
function calculateLianChang(changciData) {
    _.each(changciData.changcis, function (cc, i) {
        var screening = cc.screening, hallCode = cc.hallCode;
        var _tmpArr = _getLianchangArr(screening, hallCode);
        cc.lcData = _tmpArr;
    })
    return changciData;
}


function _getLianchangArr(screenings, hallCode) {
    var sortedArr = _.sortBy(screenings, function (v) {
        return moment(v.beginTime);
    });
    var _tmpArr = [],
        _obj = {};
    for (var i = 0; i < screenings.length; i++) {
        var tmpObj = screenings[i],
            tmpObjNext = screenings[i + 1];
        if (tmpObj.joinid && tmpObj.joinflag == 'true') {
            if (!_obj.joinid) {
                _obj.joinid = tmpObj.joinid;
                _obj.beginTime = tmpObj.beginTime;
                _obj.selectedPlanCodes = [];
            }
            if (tmpObjNext && tmpObjNext.joinid && tmpObjNext.joinflag == 'true') {
                //不管下一个是还是不是同一个连场，当前的场次都属于同一个连场
                _obj.selectedPlanCodes.push(tmpObj.planCode);
                if (tmpObjNext.joinid !== _obj.joinid) {
                    if (_obj.joinid) {
                        _obj.endTime = tmpObj.endTime;
                        _tmpArr.push(_obj);
                    }
                    _obj = {};
                }

            } else {
                if (_obj.joinid) {
                    _obj.selectedPlanCodes.push(tmpObj.planCode);
                    _obj.endTime = tmpObj.endTime;
                    _tmpArr.push(_obj);
                }
                _obj = {};
            }
        }
    }
    return _tmpArr;
}


/**
 * ajax的一系列
 */
$(document).ajaxStart(function () {
    //console.debug("全局ajax开始发送", arguments);
});
$(document).ajaxSuccess(function () {
})
$(document).ajaxError(function () {
})
$(document).ajaxComplete(function () {
    //	console.debug('ajax完成', arguments);
});
$.ajaxSetup({
    beforeSend: function () {
    },
    cache: false
})


/**
 * ajax获取数据
 * @param {Object} url
 * @param {Object} sucCallback
 */
function getData(url, sucCallback) {
    return $.ajax({
        url: url
    });
}
/**
 * 根据数据渲染模板
 * @param {Object} tplId
 * @param {Object} data
 */

function renderContentByTpl(tplId, data) {
    var html = template(tplId, data);
    return html;
}

/**
 *读取模板文件
 * @param {Object} url
 */
function readTemplate(url) {
    var df = new $.Deferred();
    $.ajax({
        url: url
    }).done(function (data) {
        var render = template.compile(data);
        df.resolve(render);
    }).fail(function () {
        $.error('读取外部模板出错')
    })
    return df.promise();
}