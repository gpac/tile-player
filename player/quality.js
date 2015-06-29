function computeTileCoverage(tilesDescription) {
	var v1 = tilesDescription.v1;
	var v2 = tilesDescription.v2;
	var v3 = tilesDescription.v3;
	var v4 = tilesDescription.v4;
	for (var i=0; i<tilesDescription.tiles.length; i++) {
		var tile = tilesDescription.tiles[i];
		var w = tile.display.width;
		var h = tile.display.height;			
		var tileDiv = tile.div;
		var y = tileDiv.offsetTop;
		var x = tileDiv.offsetLeft;

		//pourcentages de visibilité de la tuile elle même (ex : 50% de la tuile est visible)
		var pHoriz = 0;
		var pVert = 0;
		
		//pourcentage de la surface occupée par la tuile par rapport à la taille du clipping (ex : la tuile représente 30% de la surface d'affichage globale)
		var pGlobalHoriz = 0;
		var pGlobalVert = 0;
		
		//indique si une valeur de x et de y sont dans le cadre visible
		var yIn = false;
		var xIn = false;
		
		for(var j=y; j<y+h; j++) {
			if (j>v1 && j<v3) {
				// au moins une 'ligne' de la tuile est strictement dans le cadre (pas bord)
				yIn=true;
				break;
			}
		}
		
		for(var k=x; k<x+w; k++) {
			if (k>v4 && k<v2) {
				// au moins une 'colonne' de la tuile est strictement dans le cadre (pas bord)
				xIn=true;
				break;
			}
		}
		
		if (yIn == true && xIn == true) {
			//la tuile est partiellement ou entièrement dans le cadre
			tile.display.inClip = true;
			//pour un y qcq fixé dans le cadre, calcul du pourcentage Horizontal
			if (x<=v4 && x+w<=v2) {
				pHoriz = ((x+w-v4)/w)*100;
				pGlobalHoriz = ((x+w-v4)/(v2-v4))*100;
			} else if (x<=v4 && x+w>v2) {
				pHoriz = ((v2-v4)/w)*100;
				pGlobalHoriz = 100;
			} else if (x>v4 && x+w<=v2) {
				pHoriz = 100;
				pGlobalHoriz = (w/(v2-v4))*100;
			} else if (x>v4 && x+w>v2) {
				pHoriz = ((v2-x)/w)*100;
				pGlobalHoriz = ((v2-x)/(v2-v4))*100;
			}
			
			//pour un x qcq fixé dans le cadre, calcul du pourcentage Vertical
			if (y<=v1 && y+h<=v3) {
				pVert = ((y+h-v1)/h)*100;
				pGlobalVert = ((y+h-v1)/(v3-v1))*100;
			} else if (y<=v1 && y+h>v3) {
				pVert = ((v3-v1)/h)*100;
				pGlobalVert = 100;
			} else if (y>v1 && y+h<=v3) {
				pVert = 100;
				pGlobalVert = (h/(v3-v1))*100;
			} else if (y>v1 && y+h>v3) {
				pVert = ((v3-y)/h)*100;
				pGlobalVert = ((v3-y)/(v3-v1))*100;
			}
		} else {
			//la tuile n'est pas dans le cadre
			tile.display.inClip = false;
			pHoriz =0;
			pVert =0;
			pGlobalHoriz = 0;
			pGlobalVert = 0;
		}
	
		//calcul des pourcentages totaux
		var pTotal = (pHoriz*pVert)/100;
		var pGlobalTotal = (pGlobalHoriz*pGlobalVert)/100; 
		
		//arrondir les résultats 2 chiffres après la virgule
		pHoriz = Math.round(pHoriz*100)/100;
		pVert = Math.round(pVert*100)/100;
		pTotal = Math.round(pTotal*100)/100;
		pGlobalHoriz = Math.round(pGlobalHoriz*100)/100;
		pGlobalVert = Math.round(pGlobalVert*100)/100;
		pGlobalTotal = Math.round(pGlobalTotal*100)/100;
	
		//stockage des pourcentages dans l'objet tuiles
		tile.percentage.pHoriz = pHoriz;
		tile.percentage.pVert = pVert;
		tile.percentage.pTotal = pTotal;
		tile.percentage.pGlobalHoriz = pGlobalHoriz;
		tile.percentage.pGlobalVert = pGlobalVert;
		tile.percentage.pGlobalTotal = pGlobalTotal;
	}
}

function computeTileQualities(tilesDescription) {
	var v1 = tilesDescription.v1;
	var v2 = tilesDescription.v2;
	var v3 = tilesDescription.v3;
	var v4 = tilesDescription.v4;

	var seuil_x =(v2-v4)/6;
	var seuil_y =(v3-v1)/6;
	var priorite = 0;
	var tile;

	for (var i=0; i<tilesDescription.tiles.length;i++) {
		tile = tilesDescription.tiles[i];
		if (tile.display.inClip == false) {
			//la tuile est en dehors du clip
			//priorité mini
			priorite =0;
		} else {
			if ( (tile.display.curCentre_x <= (tilesDescription.centre_clip_x + seuil_x)) && 
				 (tile.display.curCentre_x >= (tilesDescription.centre_clip_x - seuil_x)) &&
				 (tile.display.curCentre_y <= (tilesDescription.centre_clip_y + seuil_y)) &&
				 (tile.display.curCentre_y >= (tilesDescription.centre_clip_y - seuil_y))) {
				//le centre de la tuile est proche du centre du clip priorité maxi
				priorite=100;						
			} else {
				//le centre de la tuile est sur le bord du clip
				if (tile.percentage.pGlobalTotal >= 50) {
					priorite=85;
				} else if (tile.percentage.pGlobalTotal >= 25 && tile.percentage.pGlobalTotal < 50) {
					priorite=60;
				} else if (tile.percentage.pGlobalTotal >= 10 && tile.percentage.pGlobalTotal < 25) {
					priorite=25;
				} else if (tile.percentage.pGlobalTotal > 0 && tile.percentage.pGlobalTotal < 10) {
					priorite=10;
				}
			}	
		}
		tile.player.position(priorite);
		tile.quality = priorite;
	}
}

function getMetrics(tilesDescription, tileInfoUpdateCallback, globalInfoUpdateCallback) {
	var totalBandwidth =0;
	var totalDownloadTime =0;
	var totalMediaDuration = 0;
	var totalRatio =0;
	var tile;
	for(var i=0; i<tilesDescription.tiles.length; i++) {
		tile = tilesDescription.tiles[i];
		//récupération des metrics
		var metrics = tile.player.player.getMetricsFor('video');
		var metricsExt = tile.player.player.getMetricsExt();		
		var lastRequest = metricsExt.getCurrentHttpRequest(metrics);
		
		var bandwidthValue = null;
		var downloadTime = null;
		var downloadRatio = 0;
		var mediaDuration =0;
		
		if(lastRequest != null) {
			//temps de téléchargement et durée du segment en secondes
			downloadTime = (lastRequest.tfinish.getTime() - lastRequest.tresponse.getTime()) / 1000;
			mediaDuration = lastRequest.mediaduration/1000;
			if (downloadTime >0) { 
				downloadRatio = mediaDuration /downloadTime;
				downloadRatio = Math.round(downloadRatio*100)/100;			
			}	
		}
		
		//évalutation de bandwidth à partir de la taille moyenne d'un segment en kb selon la qualité
		if(tile.player.player.getQualityFor('video')==0 && downloadTime >0) {
			bandwidthValue = 785 / downloadTime;
		} else if(tile.player.player.getQualityFor('video') ==1 && downloadTime >0) {
			bandwidthValue = 2456 / downloadTime;
		} else if(tile.player.player.getQualityFor('video') ==2 && downloadTime >0) {
			bandwidthValue = 5136 / downloadTime;
		} else {
			bandwidthValue = 0;
		}
		
		bandwidthValue = Math.round(bandwidthValue);
		
		/*
		//bandwidth théorique récupéré du manifest
		var repSwitch = metricsExt.getCurrentRepresentationSwitch(metrics);
		if(repSwitch != null)
		{
			bandwidthValue= metricsExt.getBandwidthForRepresentation(repSwitch.to);
			bandwidthValue = bandwidthValue / 1000;
			bandwidthValue = Math.round(bandwidthValue);			
		}*/
		
		totalBandwidth+= bandwidthValue;
		totalDownloadTime += downloadTime;
		totalMediaDuration += mediaDuration;
		tileInfoUpdateCallback(i, tile.percentage.pGlobalTotal, tile.player.player.getQualityFor('video'), downloadRatio, bandwidthValue);	
	}
	
	if (totalDownloadTime >0) {
		totalRatio = totalMediaDuration / totalDownloadTime;
		totalRatio = Math.round(totalRatio*100)/100;
	}
	globalInfoUpdateCallback(totalBandwidth, totalRatio);
}
