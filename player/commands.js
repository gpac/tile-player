var REFRESH_PERIOD = 500;

function play_pause(tilesDescription) {
	var i;
	var tile;
	//appel du Tiles Controller et d'affich_metrics toutes les 2 secondes quand la vidéo est sur play
	if (tilesDescription.firstPlay == false) {
		//mediaController.play(); 
		tilesDescription.firstPlay = true;
		tilesDescription.play = true;
		tilesDescription.interval = setInterval(function() {
			MyPackage.TilesController(tilesDescription);
		},REFRESH_PERIOD);
		tilesDescription.intervalAffich = setInterval(function () {
			getMetrics(tilesDescription, updateTileInfo, updateGlobalInfo);
		},REFRESH_PERIOD);
		for (i = 0; i < tilesDescription.tiles.length; i++) {
			tile = tilesDescription.tiles[i];
			tile.video.play();
		}
		tilesDescription.thumbnail.video.play();
	} else {
		if (tilesDescription.play == true) {
			//mediaController.pause();
			tilesDescription.play = false;
			clearInterval(tilesDescription.interval);
			clearInterval(tilesDescription.intervalAffich);
			for (i = 0; i < tilesDescription.tiles.length; i++) {
				tile = tilesDescription.tiles[i];
				tile.video.pause();
			}
			tilesDescription.thumbnail.video.pause();
		} else {
			//mediaController.unpause();
			tilesDescription.play = true;
			tilesDescription.interval = setInterval(function() {
				MyPackage.TilesController(tilesDescription);
			},REFRESH_PERIOD);
			tilesDescription.intervalAffich = setInterval(function () {
				getMetrics(tilesDescription, updateTileInfo, updateGlobalInfo);
			},REFRESH_PERIOD);
			for (i = 0; i < tilesDescription.tiles.length; i++) {
				tile = tilesDescription.tiles[i];
				tile.video.play();
			}
			tilesDescription.thumbnail.video.play();
		}
	}
}

function clip_unclip(tilesDescription, tiledVideosDivId) {
	var conteneur = document.getElementById(tiledVideosDivId);
	if (tilesDescription.clip ==true) {
		conteneur.style.old_clip = conteneur.style.clip;
		conteneur.style.clip = "";
		tilesDescription.clip = false;
	} else {
		//modification de la taille d'affichage du clip en fonction de la taille d'affichage vidéo choisie		
		conteneur.style.clip = conteneur.style.old_clip;
		tilesDescription.clip = true;
	}
}
