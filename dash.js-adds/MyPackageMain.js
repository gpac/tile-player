MyPackage.main = (function() {
		var main = {}; 
		/* MediaController not supported in Chrome ?*/
		//main.mediaController = new MediaController();
		main.context = new MyPackage.classes.MyContext();
		
		//-----------------------------------------------------
		//un objet player et un objet vo et une url par player
		main.player = new MediaPlayer(main.context);
		main.vo = {};
		//source compteur de séquence
		main.url = "http://www.digitalprimates.net/dash/streams/gpac/mp4-main-multi-mpd-AV-NBS.mpd";
		
		//sources tuiles myanmar
		//var url1 = "http://127.0.0.1/projects/dashed_videos/t1/myanmar_1080_t1_dash.mpd";
		
		//source tuile myanmar GOP fixed
		//var url = "http://127.0.0.1/projects/dashed_videos/t1_gopfix/myanmar_1080_t1_gopfix_dash.mpd";
		//-----------------------------------------------------
		
		// setup the video element and attach it to the Dash player
		main.setupPlayer = function(myPlayer, myUrl, positionInit, priorityInit, playerId) {
			myPlayer.startup();			  
			myPlayer.attachView(document.querySelector(playerId));
			myPlayer.setAutoPlay(false);
			myPlayer.attachSource(myUrl);
			myPlayer.setAutoSwitchQuality(true);
			
			//ajouter le valeur de 'priorité' spatiale dans le metrics Position
			main.vo = myPlayer.metricsModel.addPosition('video', positionInit, priorityInit);
			var affich_vo = document.getElementById("affich_vo");
			affich_vo.innerHTML = "Position : "+ main.vo.position+ "<br> Quality : "+ myPlayer.getQualityFor('video') + "<br> Priority : "+ main.vo.priority;	
		}
		
		main.position = function()
		{
			//mise à jour de la valeur de 'priorité' spatiale
			var curseur = parseInt(document.getElementById('position').value);
			main.vo.position = curseur;
			var affich_vo = document.getElementById("affich_vo");
			affich_vo.innerHTML = "Position : "+ main.vo.position+ "<br> Quality : "+ main.player.getQualityFor('video') + "<br> Priority : "+ main.vo.priority;
				
		}
		
		main.priority = function()
		{
			select = document.getElementById("prio");
			choice = select.selectedIndex;
			prio = select.options[choice].value;
			main.vo.priority = prio;
			affich_vo.innerHTML = "Position : "+ main.vo.position+ "<br> Quality : "+ main.player.getQualityFor('video') + "<br> Priority : "+ main.vo.priority;
		}
		
		return main;
	})();