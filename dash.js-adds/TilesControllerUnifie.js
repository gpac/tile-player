MyPackage.TilesController = function (){
	//tiles controller unifié : même qualité pour toutes les tuiles (qualité limitante selon download rule et buffer rule)
	console.log('Unified Tiles Controller...');
	
	var metrics = [],
		metricsExt = [],
		quality = [],
		manifest = [],
		periodIndex = [],
		rul = [],
		dat = [],
		nbQual=[],
		funcsDownload=[],
		funcsBuffer=[],
		min=999,
		minTuile=[],
		finalQuality=[];
		
	for(var i=0; i<nbTuiles; i++)
	{
		metrics.push(player[i].player.getMetricsFor('video'));
		metricsExt.push(player[i].player.getMetricsExt());
		quality.push(player[i].player.getQualityFor('video'));
		manifest.push(player[i].player.abrController.manifestModel.getValue());
		periodIndex.push(0);
		finalQuality.push(999);
		rul.push(player[i].player.abrController.abrRulesCollection.getRules());		
	}
	Q.all(rul).then(
		function(rules){
			for(var i=0; i<nbTuiles; i++)
			{
				dat.push(metricsExt[i].manifestExt.getVideoData(manifest[i], periodIndex[i]));
			}
			Q.all(dat).then(
				function(data)
				{
					for(var i=0; i<nbTuiles; i++)
					{
						nbQual.push(metricsExt[i].manifestExt.getRepresentationCount(data[i]));
					}
					Q.all(nbQual).then(
						function(nbQuality)
						{	
							for(var i=0; i<nbTuiles; i++)
							{
								funcsDownload.push(rules[i][0].checkIndex(quality[i], metrics[i], data[i]));
								funcsBuffer.push(rules[i][1].checkIndex(quality[i], metrics[i], data[i]));
							}					
							Q.all(funcsDownload).then(
								function (DownloadResults)
								{
									Q.all(funcsBuffer).then(
										function (BufferResults)
										{
										//****************************************************
										//Ici valeur des règles DownloadRatio, SpatialPosition et Buffer par tuile : DownloadResults[i], SpatialResults[i] et BufferResults[i] (avec i num de la tuile)
											
											for(var i=0; i<nbTuiles; i++)
											{												
												//qualité limitante pour chaque tuile
												minTuile[i]= Math.min(DownloadResults[i].quality, BufferResults[i].quality);
												min = Math.min(min, minTuile[i]);
											}

											for(var i=0; i<nbTuiles; i++)
											{
												//min est la qualité limitante sur toute les tuiles
												finalQuality[i]=min;
												
												//vérification de la validité des qualités finales
												if (finalQuality[i] < 0) {
													finalQuality[i] = 0;
												}
												if (finalQuality[i] >= nbQuality[i]) {
													finalQuality[i] = nbQuality[i] - 1;
												}
												
												console.log('tuile '+i+ ' nbQuality : '+nbQuality[i]+' result Download : '+DownloadResults[i].quality+ ' result Buffer: '+BufferResults[i].quality+ ' => finalQuality '+ finalQuality[i]);
												
												//mise à jour de la valeur newQual dans chaque mediaPlayer de chaque tuile
												player[i].player.abrController.newQual=finalQuality[i];
											}
																						
										//**************************************************	
										}
									);																	
								}
							);
						}
					);
				}
			);
		}
	);

	
	
}

MyPackage.TilesController.prototype = {
    constructor: MyPackage.TilesController
};