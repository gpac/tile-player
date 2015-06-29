//largeur et hauteur totale et origine (tilesDisplayX, tilesDisplayY) de l'affichage
//largeur et hauteur d'affichage de la miniature
function init(tilesDisplayWidth, tilesDisplayHeight, tilesDisplayX, tilesDisplayY, thumbnailDisplayWidth, thumbnailDisplayHeight, tilesDescription) {
	var tile;
	//valeurs du clipping en fonction de la taille d'affichage choisie
	// Attention v4<v2 et v1<v3
	tilesDescription.display = {};
	tilesDescription.display.w = tilesDisplayWidth;
	tilesDescription.display.h = tilesDisplayHeight;
	tilesDescription.display.x = tilesDisplayX;
	tilesDescription.display.y = tilesDisplayY;

	var v1 = tilesDescription.display.y + tilesDescription.display.h/4;
	tilesDescription.v1 = v1;
	var v4 = tilesDescription.display.x + tilesDescription.display.w/4;
	tilesDescription.v4 = v4;
	var v2 = v4 + tilesDescription.display.w/2 ;
	tilesDescription.v2 = v2;
	var v3 = v1 + tilesDescription.display.h/2 ;
	tilesDescription.v3 = v3;

	tilesDescription.clip = true;
	tilesDescription.centre_clip_x = (v2-v4)/2;
	tilesDescription.centre_clip_y = (v3-v1)/2;

	tilesDescription.thumbnail = {};
	tilesDescription.thumbnail.display = {};
	tilesDescription.thumbnail.display.w = thumbnailDisplayWidth;
	tilesDescription.thumbnail.display.h = thumbnailDisplayHeight;

	for (var i=0; i<tilesDescription.tiles.length; i++)	{
		tile = tilesDescription.tiles[i];
		var w = (tile.width * tilesDescription.display.w)/ tilesDescription.width;
		var h = (tile.height * tilesDescription.display.h)/ tilesDescription.height;	
		var positiony_affich = tilesDescription.display.y + (tile.y * tilesDescription.display.w)/ tilesDescription.width;
		var positionx_affich = tilesDescription.display.x + (tile.x * tilesDescription.display.h)/ tilesDescription.height;
		var currentCentre_x = positionx_affich + (w/2);
		var currentCentre_y = positiony_affich + (h/2);
		tile.percentage = {};
		tile.percentage.pHoriz = 0;
		tile.percentage.pVert = 0;
		tile.percentage.pTotal = 0;
		tile.percentage.pGlobalHoriz = 0;
		tile.percentage.pGlobalVert = 0;
		tile.percentage.pGlobalTotal = 0;
		tile.display = {};
		tile.display.width = w;
		tile.display.height = h;
		tile.display.x = positionx_affich;
		tile.display.y = positiony_affich;
		tile.display.curCentre_x = currentCentre_x;
		tile.display.curCentre_y = currentCentre_y;
		tile.display.inClip = false;
		tile.quality = 0;
	}
}

function createPlayers(tilesDescription) {
	var tile;
	//MediaController + création des players
	//	var mediaController = new MediaController();

	tilesDescription.context = new MyPackage.classes.MyContext();
	for (var i=0; i<tilesDescription.tiles.length; i++)	{	
		tile = tilesDescription.tiles[i];
		tile.player = new MyPackage.Player(tilesDescription.context, tilesDescription.baseUrl + tile.src);
	}
	tilesDescription.thumbnail.player = new MyPackage.Player(tilesDescription.context, tilesDescription.baseUrl + tilesDescription.src);

	tilesDescription.play = false;
	tilesDescription.firstPlay = false;

	//contient le setInterval (appel du Tiles Controler et de l'affichage des metrics toutes les x secondes quand la vidéo est sur play dans la fonction play_pause() de commande.js)
	tilesDescription.interval = null;
	tilesDescription.intervalAffich =null;
}

function updateTileAndThumbnailView(tilesDescription) {
	var tile;
	var frame = tilesDescription.thumbnail.frame;
	var newFrameTop = parseInt(frame.offsetTop);
	var newFrameLeft = parseInt(frame.offsetLeft);

	var newTop = -(newFrameTop*(tilesDescription.display.h/tilesDescription.thumbnail.display.h))+(tilesDescription.display.h/4);
	var newLeft = -(newFrameLeft*(tilesDescription.display.w/tilesDescription.thumbnail.display.w))+(tilesDescription.display.w/4);

	// récupération des div tuiles et modification des valeurs left et top
	for (var i=0; i<tilesDescription.tiles.length; i++)	{
		tile = tilesDescription.tiles[i];
		tile.div.style.left = newLeft + tile.display.x;
		tile.div.style.top = newTop + tile.display.y;
		tile.display.curCentre_x = newLeft + (tile.display.width/2) - tilesDescription.v4;	
		tile.display.curCentre_y = newTop + (tile.display.height/2) - tilesDescription.v1;
	}
	
	//calcul des pourcentages et de priorité spatiale
	computeTileCoverage(tilesDescription);
	computeTileQualities(tilesDescription);
	for (var i=0; i<tilesDescription.tiles.length; i++)	{
		tile = tilesDescription.tiles[i];
		updateTileInfo(i, tile.percentage.pGlobalTotal);
	}
}

function createThumbnailVideoView(tilesDescription, thumbVideoId) {
	//mise à jour de la taille de la miniature 
	var thumbDiv = document.getElementById(thumbVideoId);
	thumbDiv.innerHTML = "<video id=\"thumb_video\" width=\""+ tilesDescription.thumbnail.display.w +"px\" height=\""+ tilesDescription.thumbnail.display.h +"px\" muted=\"muted\">";
	tilesDescription.thumbnail.video = thumbDiv.firstElementChild;

	//mise à jour de la taille du cadre rouge en fonction de la taille d'affichage de miniature choisie
	var frame = document.createElement("div");
	frame.id ="frame";
	var borderWidth = 3;
	frame.style.border = ""+borderWidth+"px solid red";
	frame.style.position = "absolute";
	var widthCadre = (tilesDescription.thumbnail.display.w/2) - 2*borderWidth;
	var heightCadre = (tilesDescription.thumbnail.display.h/2) - 2*borderWidth;
	var xCadre = (tilesDescription.thumbnail.display.w/4);
	var yCadre = (tilesDescription.thumbnail.display.h/4);
	frame.style.width =  widthCadre + 'px';
	frame.style.height = heightCadre + 'px';
	frame.style.top = yCadre + 'px' ;
	frame.style.left = xCadre + 'px' ;
	thumbDiv.appendChild(frame);
	tilesDescription.thumbnail.frame = frame;

	$(frame).draggable({ 
		containment: "parent",
		drag: function() {
			updateTileAndThumbnailView(tilesDescription);
		}
	});
    $(thumbDiv).droppable();
}

function createTilesVideoView(tilesDescription, tiledVideosDivId) {
	var tile;
	//ajout de la taille d'affichage du clip en fonction de la taille d'affichage vidéo choisie
	var tiledVideosDiv = document.getElementById(tiledVideosDivId);
	tiledVideosDiv.style.position = "absolute";
	tiledVideosDiv.style.top = (tilesDescription.tiles[0].display.y)+"px";
	tiledVideosDiv.style.left = (tilesDescription.tiles[0].display.x)+"px";
	tiledVideosDiv.style.clip = "rect("+tilesDescription.v1+"px, "+tilesDescription.v2+"px, "+tilesDescription.v3+"px, "+tilesDescription.v4+"px)";
	for (var i=0; i<tilesDescription.tiles.length; i++) {
		tile = tilesDescription.tiles[i];
		//création des tuiles (div et video)
		tile.div = document.createElement("div");
		tile.div.style.position = "absolute";			
		tile.div.style.top = tile.display.y + 'px' ;
		tile.div.style.left = tile.display.x + 'px' ;
		tile.div.innerHTML = "<video id=\"video_"+ i +"\" width=\""+ tile.display.width +"px\" height=\""+ tile.display.height +"px\" muted=\"muted\">";
		tile.video = tile.div.firstElementChild;
		tiledVideosDiv.appendChild(tile.div);				
	}
}

function createTileInfoView(tilesDescription, InfoDivId) {
	var tile;
	var string;
	string = "<table>";
	string += "<thead>";
	string += "<tr>";
	string += "<th>Tile Number</th>";
	string += "<th>Coverage</th>";	
	string += "<th>Quality Index</th>";
	string += "<th>Download Ratio (segment duration/download duration)</th>";	
	string += "<th>Bandwidth (segment size/download duration, kbps)</th>";	
	string += "</tr>";
	string += "</thead>";
	string += "<tbody>";
	//ajout de la taille d'affichage du clip en fonction de la taille d'affichage vidéo choisie
	var infoDiv = document.getElementById(InfoDivId);
	for (var i=0; i<tilesDescription.tiles.length; i++) {
		tile = tilesDescription.tiles[i];
		string += "<tr>";
		string += "<td>"+i+"</td>";
		string += "<td id='tile_"+i+"_coverage'>"+0+"</td>";
		string += "<td id='tile_"+i+"_quality'>"+0+"</td>";
		string += "<td id='tile_"+i+"_downloadratio'>"+0+"</td>";
		string += "<td id='tile_"+i+"_downloadbitrate'>"+0+"</td>";
		string += "</tr>";
	}
	string += "</tbody>";
	string += "<tfoot>";
	string += "<td>Total</td>";
	string += "<td></td>";
	string += "<td></td>";
	string += "<td id='total_downloadratio'>"+0+"</td>";
	string += "<td id='total_downloadbitrate'>"+0+"</td>";
	string += "</tfoot>";
	string += "<table>";
	infoDiv.innerHTML = string;				
}

function setupDashPlayers(tilesDescription) {
	var tile;
	for (var i=0; i<tilesDescription.tiles.length;i++) {
		tile = tilesDescription.tiles[i];
		tile.player.setupPlayer(0, 'default', '#video_'+i);
	}
	tilesDescription.thumbnail.player.setupPlayer(100, 'default', '#thumb_video');	
}
/*	//min et max pour les curseurs top et left en fonction de la taille de clipping choisie
	var curseurTop = document.getElementById("top");
	var curseurLeft = document.getElementById("left");
	curseurTop.min =-((tilesDescription.v3-tilesDescription.v1)/2);
	curseurTop.max = (tilesDescription.v3-tilesDescription.v1)/2;
	curseurLeft.min = -((tilesDescription.v2-tilesDescription.v4)/2);
	curseurLeft.max = (tilesDescription.v2-tilesDescription.v4)/2;
*/	

function getTileDescription(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onload = callback
	xhr.send();
}

var descriptionTuiles;
var tiledVideosDivId, thumbVideoId, infoDivId;

function setup(_tiledVideosDivId, _thumbVideoId, _infoDivId) {
	tiledVideosDivId = _tiledVideosDivId;
	thumbVideoId = _thumbVideoId;
	infoDivId = _infoDivId;
}

function openTiles(url) {
	getTileDescription(url, function() {
		var tilesDescription = JSON.parse(this.responseText);
		descriptionTuiles = tilesDescription;
		var tile;

		init(1280, 720, 0, 0, 256, 144, tilesDescription);
		
		createThumbnailVideoView(tilesDescription, thumbVideoId);
		createTilesVideoView(tilesDescription, tiledVideosDivId);
		createTileInfoView(tilesDescription, infoDivId);

		createPlayers(tilesDescription);
		setupDashPlayers(tilesDescription);

		//calcul des pourcentages initiaux, de la priorité spatiale et affichage des metrics
		computeTileCoverage(tilesDescription);
		computeTileQualities(tilesDescription);
		getMetrics(tilesDescription, updateTileInfo, updateGlobalInfo);
	});
}

function updateTileInfo(tileIndex, coverage, qualityIndex, downloadRatio, bandwidth) {
	var elt;
	if (coverage !== undefined) {
		elt = document.getElementById("tile_"+tileIndex+"_coverage");
		elt.innerHTML = coverage;
	}
	if (qualityIndex !== undefined) {
		elt = document.getElementById("tile_"+tileIndex+"_quality");
		elt.innerHTML = qualityIndex;
	}
	if (downloadRatio !== undefined) {
		elt = document.getElementById("tile_"+tileIndex+"_downloadratio");
		elt.innerHTML = downloadRatio;
	}
	if (bandwidth !== undefined) {
		elt = document.getElementById("tile_"+tileIndex+"_downloadbitrate");
		elt.innerHTML = bandwidth;
	}
	console.log("[SRD] Tile Info for tile #"+tileIndex+": quality: "+ qualityIndex+ " downloadRatio: "+downloadRatio+" display coverage: "+coverage + " bandwidth: "+bandwidth+" kbps");
}

function updateGlobalInfo(totalBandwidth, totalRatio) {
	var elt;
	elt = document.getElementById("total_downloadratio");
	elt.innerHTML = totalRatio;
	elt = document.getElementById("total_downloadbitrate");
	elt.innerHTML = totalBandwidth;
	console.log("[SRD] totalBandwidth "+totalBandwidth+" kbps totalRatio: "+ totalRatio);
}

