var yunba_demo;
var CHATROOM_TOPIC = 'linkltone';
var map;
var poly;
var ctrls;
var marker;

var displays = {};
displays.latitude    = document.getElementById('car-stat-latitude');
displays.longitude   = document.getElementById('car-stat-longitude');

function waypoint( lat, long ) {
    poly.addLatLng(L.latLng( lat, long ));
    marker.setLatLng(L.latLng( lat, long ));
    map.fitBounds(poly.getBounds());
    console.log(lat);
    displays.latitude.innerHTML  = Math.floor(lat*1000)/1000;
    displays.longitude.innerHTML = Math.floor(long*1000)/1000;
}

function initialize() {
    initYunbaSDK();
}

// 初始化 Yunba SDK 并连接到服务器
function initYunbaSDK() {
    logMessage('正在初始化...');
    yunba_demo.init(function (success) {
        if (success) {
            logMessage('初始化成功...');
            connect();
        } else {
            logMessage('初始化失败或服务断线，若长时间无响应请尝试刷新页面');
            connect();
        }
    }, function () {
        logMessage('服务断线，正在尝试重新连接...');
        connect();
    });
}

// 输出提示信息
function logMessage(data) {
//    addMessageElement({log: data}, true);
    console.log(data);
}

// 连接服务器
function connect() {
    logMessage('正在尝试连接...');
    yunba_demo.connect(function (success, msg) {
        if (success) {
            logMessage('连接成功...');
            setMessageCallback();
            setAlias(function () {
                subscribe(CHATROOM_TOPIC);
            });
        } else {
            logMessage(msg);
        }
    });
}

// 设置别名
function setAlias(callback) {
    var alias = 'Visitor_' + Math.floor(Math.random() * 100000);

    yunba_demo.get_alias(function (data) {
        if (!data.alias) {
            yunba_demo.set_alias({'alias': alias}, function (data) {
                if (!data.success) {
                    console.log(data.msg);
                } else {
                    username = alias;
                }

                callback && callback();
            });
        } else {
            username = data.alias;
            callback && callback();
        }
    });
}

// 订阅消息
function subscribe(topic) {
    logMessage('正在尝试加入房间...');
    yunba_demo.subscribe({'topic': topic}, function (success, msg) {
        if (success) {
            yunba_demo.subscribe_presence({'topic': topic}, function (success, msg) {
                if (success) {
                    logMessage('加入房间成功...');
                } else {
                    logMessage(msg);
                }
            });
        } else {
            logMessage(msg);
        }
    });
}

// 发布消息
function publish(topic, message) {
    yunba_demo.publish({'topic': topic, 'msg': message}, function (success, msg) {
        if (success) {
            console.log('消息发布成功');
        } else {
        //    logMessage(msg);
            console.log('消息发布失败');
        }
    });
}

// 设置接收到 message 的回调处理方法
function setMessageCallback() {
    yunba_demo.set_message_cb(function (data) {
       logMessage(data.msg);
     //   if (data.topic == CHATROOM_TOPIC) {
            dataController(data.msg);
       // }
    });
}

function is_valid_json(para) {
    var ret = { 'e': 0 };

    try  {
        JSON.parse(para);
    } catch (ex) {
        ret.e = 2;
    }

    return ret;
}

var latlong = [22.5269627, 113.9189107];
// 接收到消息后处理消息内容
function dataController(data) {
    ret = is_valid_json(data);
    if (ret['e'] === 0) {
        var msg = JSON.parse(data);
        if (msg.lat !== undefined && msg.log !== undefined) {
            waypoint(parseFloat(msg.lat), parseFloat(msg.log));
        }
    }
    console.log(data);
}

function init_mapbox() {
    var access_token = 'pk.eyJ1IjoieXVuYmEiLCJhIjoiY2luaW5wenVtMDAzd3Z4bTJ6OXR5azkzcCJ9.ZEn_n7U0TDKn0vvDJr2cIg';
    L.mapbox.accessToken = access_token;

    map    = L.mapbox.map('mapbox', 'yunba.ppmjeh7g');
    poly   = L.polyline([]).addTo(map);
    ctrls  = document.getElementsByClassName("leaflet-control-container")[0];
    marker = L.marker( [0,0], {
        icon : L.mapbox.marker.icon({
            'marker-color': '#f86767'
        })
    }).addTo(map);

    ctrls.parentNode.removeChild(ctrls);
}

function init_yunba() {
    yunba_demo = new Yunba({
	    appkey: '563c4afef085fc471efdf803'
    });
    initialize();
}

$(document).ready(function () {
   init_mapbox();
   init_yunba();
});
