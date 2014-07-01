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

function createInteraction(el, name, field, values, valuesString){
	el.addEventListener('click', function(event){
		event.preventDefault();
		event.cancelBubble = true;
		event.stopPropagation();
		var value = false;
		do{
			value = prompt('Bitte '+name+' von '+this.getAttribute('data-name')+' eingeben ('+valuesString+')');
			if(value === null){
				console.log('interaction abortet');
				return;
			}
		}while(values.length > 0 && values.indexOf(value) < 0);

		var dragonData = getData('dragonData');
		dragonData[this.getAttribute('data-url')][field] = value;
		storeData('dragonData', dragonData);
		printDragons();
	});
}

function getHighlightStart(highlight){
	switch(highlight) {
		case 'b':
		case 'bold':
			return '[b]';
		case 'i':
		case 'italics':
			return '[i]';
		default:
			if(highlight && highlight.match(/^[0-9A-F]{6}$/)){
				return '[color='+highlight+']';
			} else {
				return '';
			}
	}
}

function getHighlightEnd(highlight){
	switch(highlight) {
		case 'b':
		case 'bold':
			return '[/b]';
		case 'i':
		case 'italics':
			return '[/i]';
		default:
			if(highlight && highlight.match(/^[0-9A-F]{6}$/)){
				return '[/color]';
			} else {
				return '';
			}
	}
}

function printDragons(){
	var guild = getData('guild');
	var team = getData('team');
	var dragonData = getData('dragonData') || {};

	if(guild && team){
		var text = '';

		var positions = {
			AA: {
				skills: ['feuerkraft', 'geschick'],
				dragons: [],
				positions: '(Pos. 9+11)'
			},
			AM: {
				skills: ['feuerkraft', 'kraft'],
				dragons: [],
				positions: '(Pos. 8+10)'
			},
			MA: {
				skills: ['intelligenz', 'geschick'],
				dragons: [],
				positions: '(Pos. 6+7)'
			},
			VM: {
				skills: ['willenskraft', 'kraft'],
				dragons: [],
				positions: '(Pos. 3+5)'
			},
			VA: {
				skills: ['willenskraft', 'intelligenz'],
				dragons: [],
				positions: '(Pos. 2+4)'
			},
			T: {
				skills: ['willenskraft', 'geschick'],
				dragons: [],
				positions: '(Pos. 1)'
			}
		}

		var hiddenList = document.getElementById("hidden");
		var first = hiddenList.firstElementChild;
		hiddenList.removeAllChildren();
		hiddenList.appendChild(first);
		var displayedList = document.getElementById("displayed");
		var first = displayedList.firstElementChild;
		displayedList.removeAllChildren();
		displayedList.appendChild(first);

		team.sort(function(A,B){
			return A.name < B.name ? -1 : (A.name > B.name ? 1 : 0);
		});

		for(var i = 0; i < team.length; i++){
			var dragon = team[i];

			if(!dragonData[dragon.url]){
				dragonData[dragon.url] = {};
			}

			var hideDiv = document.createElement("div");
			hideDiv.textContent = dragon.name;
			hideDiv.setAttribute("data-url", dragon.url);
			hideDiv.addEventListener("click", function(){
				var url = this.getAttribute("data-url");
				var dragonData = getData("dragonData");
				dragonData[url].hidden = !dragonData[url].hidden;
				storeData("dragonData", dragonData);
				printDragons();
			});

			if(dragonData[dragon.url].hidden){
				hiddenList.appendChild(hideDiv);
			} else {
				displayedList.appendChild(hideDiv);
			}

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
		storeData('dragonData', dragonData);

		for(var key in positions){
			var position = positions[key];
			position.dragons.sort(getComparator(position));
			
			text += '\n';
			text += '[b]';
			text += key;
			text += '[/b]';
			text += ' ' + position.positions;
			text += '\n';

			for (var i = 0; i < position.dragons.length; i++) {
				var dragon = position.dragons[i]
				var addIn = dragonData[dragon.url];

				if(!addIn.hidden){
					text += '<span class="highlight" ';
					text += 'data-url="'+dragon.url+'" ';
					text += 'data-name="'+dragon.name+'" ';
					text += '>';

					text += getHighlightStart(addIn.highlight);
					text += getDBP(dragon, position);
					text += ' -- ';
					text += '<span class="level" ';
					text += 'data-url="'+dragon.url+'" ';
					text += 'data-name="'+dragon.name+'" ';
					text += '>';
					if(addIn.level){
						text += addIn.level;
					} else {
						text += '?';
					}
					text += '</span>'
					text += ' -- ';
					text += '[url=' + dragon.url + ']';
					text += dragon.name;
					text += '[/url]/';
					if(addIn.gender){
						text += addIn.gender;
					} else {
						text += '<span class="gender" '
						text += 'data-url="'+dragon.url+'" '
						text += 'data-name="'+dragon.name+'" '
						text += '>?</span>';
					}
					text += ' -- ';
					text += dragon.kraft;
					text += ' / ';
					text += dragon.geschick;
					text += ' / ';
					text += dragon.feuerkraft;
					text += ' / ';
					text += dragon.willenskraft;
					text += ' / ';
					text += dragon.intelligenz;
					text += ' --- ';
					text += dragon.fitness + '%';
					text += ' -- ';
					text += '[user]';
					text += guild.byDragon[dragon.url];
					text += '[/user]';
					text += getHighlightEnd(addIn.highlight);
					text += '</span>';
					text += '\n';
				}
			};
		}

		var markupElement = document.getElementById('markup');
		markupElement.innerHTML = text;

		var spans = markupElement.getElementsByClassName('gender');
		for (var i = 0; i < spans.length; i++) {
			createInteraction(spans[i], 'Geschlecht', 'gender', ['m','w'], 'm/w');
		};

		var spans = markupElement.getElementsByClassName('level');
		for (var i = 0; i < spans.length; i++) {
			createInteraction(spans[i], 'Level', 'level', ['0','1','2','3','4','5'], '0-5');
		};

		var spans = markupElement.getElementsByClassName('highlight');
		for (var i = 0; i < spans.length; i++) {
			createInteraction(spans[i], 'Hervorhebung', 'highlight', [], 'b(old), i(talics), hex-color(z.B.: FF0000), none, empty');
		};
	}	
}

window.addEventListener('load', function(){
	printDragons();
	document.getElementById('copy').addEventListener('click', function(){
		window.getSelection().selectAllChildren(document.getElementById("markup"));
	});
});