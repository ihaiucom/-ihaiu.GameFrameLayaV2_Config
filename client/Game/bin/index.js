/**
 * 设置LayaNative屏幕方向，可设置以下值
 * landscape           横屏
 * portrait            竖屏
 * sensor_landscape    横屏(双方向)
 * sensor_portrait     竖屏(双方向)
 */
window.screenOrientation = "sensor_landscape";

//-----libs-begin-----
loadLib("libs/laya.core.js");
loadLib("libs/laya.ui.js");
loadLib("libs/laya.d3.js")
//-----libs-end-------


// 扩展
loadLib("libs/game/GameCommonLib.js");
// loadLib("libs/game/StringExtend.js");
// loadLib("libs/game/engine-adapter-laya.js");
// loadLib("libs/game/LayaExtend.js");
// loadLib("libs/game/FguiExtend.js");


// 协议
loadLib("libs/AntFrame/Net/protobuf.js")


// Excel PB配置
loadLib("libs/pbconfig/excelconfig.js");

loadLib("js/bundle.js");
