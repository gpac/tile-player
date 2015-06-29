MyPackage.classes.MyContext = function () {
	"use strict";

	return {
		system : undefined,
		setup : function () {
			MyPackage.classes.MyContext.prototype.setup.call(this);

			this.system.mapClass('spatialPositionRule', MediaPlayer.rules.SpatialPositionRule);
			this.system.mapClass('abrRulesCollection', MyPackage.classes.MyBaseRulesCollection);
			this.system.mapSingleton('abrController', MyPackage.classes.MyAbrController);
			this.system.mapClass('metrics', MyPackage.classes.MyMetricsList);
			this.system.mapSingleton('metricsModel', MediaPlayer.models.MyMetricsModel);	
			this.system.mapClass('downloadRatioRule', MediaPlayer.rules.MyDownloadRatioRule);
		}
	};
};

MyPackage.classes.MyContext.prototype = new Dash.di.DashContext();
MyPackage.classes.MyContext.prototype.constructor = MyPackage.classes.MyContext;
