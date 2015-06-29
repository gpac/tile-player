MyPackage.Player = function(context, url) {

		this.player = new MediaPlayer(context);
		this.vo = {};
		this.url = url;
		
		// setup the video element and attach it to the Dash player
		this.setupPlayer = function(positionInit, priorityInit, playerId) {
			this.player.startup();			  
			this.player.attachView(document.querySelector(playerId));
			this.player.setAutoPlay(false);
			this.player.attachSource(this.url);
			this.player.setAutoSwitchQuality(true);
			
			//ajouter le valeur de 'priorité' spatiale dans le metrics Position
			this.vo = this.player.metricsModel.addPosition('video', positionInit, priorityInit);
		}
		
		this.position = function(value)
		{
			this.vo.position = value;				
		}
		
		this.priority = function(prio)
		{
			this.vo.priority = prio;			
		}
		
		this.affich = function(id_affich)
		{
			var affich_vo = document.getElementById(id_affich);
			affich_vo.innerHTML = "Position : "+ this.vo.position+ "<br> Quality : "+ this.player.getQualityFor('video') + "<br> Priority : "+ this.vo.priority;
		}
};
	
MyPackage.Player.prototype = {
    constructor: MyPackage.Player
};