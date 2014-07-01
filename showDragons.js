//showDragons.js -- shows Dragons sorted by most suitable position, suitable to be pasted in guild page 
function getDBP(dragon, position){
	var sum = dragon.kraft
			+ dragon.geschick
			+ dragon.feuerkraft
			+ dragon.willenskraft
			+ dragon.intelligenz;
	var main = [
		dragon[position.skills[0]],
		dragon[position.skills[1]]
	];
	var max = Math.max(main[0], main[1]);
	var min = Math.min(main[0], main[1]);
	return Math.round(max + 2*min - sum/3);
}

function getComparator(position){
	return function(A, B){
		dbpA = getDBP(A, position);
		dbpB = getDBP(B, position);
		if(B.vitalitaet === 0 && A.vitalitaet != 0){
			return -1;
		} else if(B.vitalitaet != 0 && A.vitalitaet === 0){
			return 1;
		}else if(dbpA > dbpB){
			return -1;
		} else if(dbpA < dbpB){
			return 1;
		} else if(A.vitalitaet > B.vitalitaet){
			return -1;
		} else if(A.vitalitaet < B.vitalitaet){
			return 1;
		} else {
			return 0;
		}
	}
}

window.addEventListener("load", function(){
	var guild = getData("guild");
	var team = getData("team");

	if(guild && team){
		var text = "";

		var positions = {
			AA: {
				skills: ["feuerkraft", "geschick"],
				dragons: []
			},
			AM: {
				skills: ["feuerkraft", "kraft"],
				dragons: []
			},
			MA: {
				skills: ["intelligenz", "geschick"],
				dragons: []
			},
			VM: {
				skills: ["willenskraft", "kraft"],
				dragons: []
			},
			VA: {
				skills: ["willenskraft", "intelligenz"],
				dragons: []
			},
			T: {
				skills: ["willenskraft", "geschick"],
				dragons: []
			}
		}

		for(var i = 0; i < team.length; i++){
			var dragon = team[i];
			
			var max = -Infinity;
			var bestPosition;
			for(var key in positions){
				var position = positions[key];
				var dbp = getDBP(dragon, position);
				if(dbp > max){
					max = dbp;
					bestPosition = position;
				}
			}

			bestPosition.dragons.push(dragon);
		}

		for(var key in positions){
			var position = positions[key];
			position.dragons.sort(getComparator(position));
			
			text += "\n[b]";
			text += key;
			text += "[/b]\n";

			for (var i = 0; i < position.dragons.length; i++) {
				var dragon = position.dragons[i]
				
				text += getDBP(dragon, position);
				text += " -- ";
				text += "?",
				text += " -- ";
				text += "[url=" + dragon.url + "]";
				text += dragon.name;
				text += "[/url]";
				text += "/?"
				text += " -- ";
				text += dragon.kraft;
				text += " / ";
				text += dragon.geschick;
				text += " / ";
				text += dragon.feuerkraft;
				text += " / ";
				text += dragon.willenskraft;
				text += " / ";
				text += dragon.intelligenz;
				text += " --- ";
				text += dragon.fitness + "%";
				text += " -- ";
				text += "[user]";
				text += guild.byDragon[dragon.url];
				text += "[/user]";
				text += "\n";

			};
		}

		var markupElement = document.getElementById("markup");
		markupElement.textContent = text;
	}
});