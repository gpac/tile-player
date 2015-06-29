MyPackage.classes.MyMetricsList = function () {
    "use strict";

    return {
        TcpList: [],
        HttpList: [],
        RepSwitchList: [],
        BufferLevel: [],
        PlayList: [],
        DroppedFrames: [],
		Position : []
    };
};

MyPackage.classes.MyMetricsList.prototype = new MediaPlayer.models.MetricsList;
MyPackage.classes.MyMetricsList.prototype.constructor = MyPackage.classes.MyMetricsList;