MyPackage.TilesController = function (tilesDescription){

	console.log('Tiles Controller...');
	
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
		funcsSpatial=[],
		finalQuality=[];
	var tile;
		
	for(var i=0; i<tilesDescription.tiles.length; i++) {
		tile = tilesDescription.tiles[i];
		metrics.push(tile.player.player.getMetricsFor('video'));
		metricsExt.push(tile.player.player.getMetricsExt());
		quality.push(tile.player.player.getQualityFor('video'));
		manifest.push(tile.player.player.abrController.manifestModel.getValue());
		
		//Attention ! periodIndex est codé en dur à 0
		periodIndex.push(0);
		
		finalQuality.push(999);
		rul.push(tile.player.player.abrController.abrRulesCollection.getRules());		
	}
	Q.all(rul).then(
		function(rules){
			for(var i=0; i<tilesDescription.tiles.length; i++) 
			{
				dat.push(metricsExt[i].manifestExt.getVideoData(manifest[i], periodIndex[i]));
			}
			Q.all(dat).then(
				function(data)
				{
					for(var i=0; i<tilesDescription.tiles.length; i++) 
					{
						nbQual.push(metricsExt[i].manifestExt.getRepresentationCount(data[i]));
					}
					Q.all(nbQual).then(
						function(nbQuality)
						{	
							for(var i=0; i<tilesDescription.tiles.length; i++) 
							{
								funcsDownload.push(rules[i][0].checkIndex(quality[i], metrics[i], data[i]));
								funcsBuffer.push(rules[i][1].checkIndex(quality[i], metrics[i], data[i]));
								funcsSpatial.push(rules[i][2].checkIndex(quality[i], metrics[i], data[i]));
							}					
							Q.all(funcsDownload).then(
								function (DownloadResults)
								{
									Q.all(funcsSpatial).then(
										function (SpatialResults)
										{
											Q.all(funcsBuffer).then(
												function (BufferResults)
												{
												//****************************************************
												//Ici valeur des règles DownloadRatio, SpatialPosition et Buffer par tuile : DownloadResults[i], SpatialResults[i] et BufferResults[i] (avec i num de la tuile)
													
													for(var i=0; i<tilesDescription.tiles.length; i++) 
													{
														//décision des qualités finales pour chaque tuile
														
														if(SpatialResults[i].quality == nbQuality[i]-1 && (DownloadResults[i].quality < nbQuality[i]-1 || BufferResults[i].quality<=0 ))
														{
															//spatialPosition rule a déterminé que la tuile i est prioritaire spatialement mais elle est limitée par la bande passante
															// =>garantir la meilleure qualité à cette tuile et baisser celle des autres
															for (var j=0; j<tilesDescription.tiles.length; j++)
															{
																if(j!=i)
																{
																	finalQuality[j]= Math.min(SpatialResults[j].quality,DownloadResults[j].quality, BufferResults[j].quality);
																	if(finalQuality[j]>0 && finalQuality[j]<nbQuality[j]-1)
																	{	
																		finalQuality[j]-=1;
																	}																	
																}
																else
																{
																	//qualité maximale pour cette tuile prioritaire
																	finalQuality[j]= nbQuality[j]-1;
																}
															}
														}
														else if (finalQuality[i] == 999)
														{
															finalQuality[i]= Math.min(SpatialResults[i].quality,DownloadResults[i].quality, BufferResults[i].quality);
														}
														
													
													}
												
													for(var i=0; i<tilesDescription.tiles.length; i++)
													{
														var tile = tilesDescription.tiles[i];
														//vérification de la validité des qualités finales
														if (finalQuality[i] < 0) {
															finalQuality[i] = 0;
														}
														if (finalQuality[i] >= nbQuality[i]) {
															finalQuality[i] = nbQuality[i] - 1;
														}
														
														console.log('tuile '+i+ ' nbQuality : '+nbQuality[i]+' result Spatial : '+SpatialResults[i].quality+ ' result Download : '+DownloadResults[i].quality+ ' result Buffer: '+BufferResults[i].quality+ ' => finalQuality '+ finalQuality[i]);
														
														//mise à jour de la valeur newQual dans l'abrController de chaque tuile
														tile.player.player.abrController.newQual=finalQuality[i];
													}
																								
												//****************************************************	
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
	);

	
	
}

MyPackage.TilesController.prototype = {
    constructor: MyPackage.TilesController
};