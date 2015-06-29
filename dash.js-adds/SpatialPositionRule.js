MediaPlayer.rules.SpatialPositionRule = function () {
    "use strict";

    return {
		debug: undefined,
		manifestExt : undefined,
		
        checkIndex: function (current, metrics , data){
			var p = MediaPlayer.rules.SwitchRequest.prototype.DEFAULT,
				self =this,
				newQuality = current,
				myposition = metrics.Position[0],
				deferred= Q.defer();

			self.debug.log("Checking Spatial Position rule...");
			self.debug.log("Position length : "+ metrics.Position.length );

            if (myposition === null || myposition === undefined) {
                self.debug.log("Not enough information for rule.");
                return Q.when(new MediaPlayer.rules.SwitchRequest());
            }

            var position = myposition.position;

            if (position === null || position === undefined) {
                self.debug.log("Not enough information for rule.");
                return Q.when(new MediaPlayer.rules.SwitchRequest());
            }
			
			var priority = myposition.priority;

			
			if (priority == 'strong')
			{
				self.debug.log("Spatial Rule priority STRONG.");
				p = MediaPlayer.rules.SwitchRequest.prototype.STRONG;
			}
			else if (priority == 'weak')
			{
				self.debug.log("Spatial Rule priority WEAK.");
				p = MediaPlayer.rules.SwitchRequest.prototype.WEAK;
			}
			else
			{
				self.debug.log("Spatial Rule priority DEFAULT.");
				p = MediaPlayer.rules.SwitchRequest.prototype.DEFAULT;
			}
			
			
			//on récupère le nombre de qualités disponibles
			self.manifestExt.getRepresentationCount(data).then(
				function(nb_qualities)
				{				
					nb_qualities -=1; //quality [0;nb_qualities-1]
					newQuality = Math.round(position*nb_qualities/100);	
					self.debug.log("position : "+position+" - spatial rule potential quality : "+ newQuality + " - current quality : "+current);
					if (newQuality < current && newQuality>=0) 
					{
						self.debug.log("spatial rule switch down.");
						return deferred.resolve(new MediaPlayer.rules.SwitchRequest(newQuality, p));
					} 
					else if (newQuality > current && newQuality<=nb_qualities)
					{
						self.debug.log("spatial rule switch up.");
						return deferred.resolve(new MediaPlayer.rules.SwitchRequest(newQuality, p));
					} 
					else 
					{
						self.debug.log("spatial rule do nothing.");
						return deferred.resolve(new MediaPlayer.rules.SwitchRequest(current, p));
					}
				}
			);
			
			return deferred.promise;
		}
   };
};

MediaPlayer.rules.SpatialPositionRule.prototype = {
    constructor: MediaPlayer.rules.SpatialPositionRule
};