if(window.location.search.match(/t=chat_dragball/)){
	var chat = document.getElementById("chat_content");

	var CIRCLE_CENTERS = [
		{x: 40, y: 175},
		{x: 160, y: 75},
		{x: 130, y: 175},
		{x: 160, y: 275},
		{x: 280, y: 175},
		{x: 360, y: 75},
		{x: 360, y: 275},
		{x: 440, y: 175},
		{x: 560, y: 75},
		{x: 590, y: 175},
		{x: 560, y: 275}
	];

	var BALL_COLOR = "rgb(212,175,55)";

	function Dragon(team, position, name, strength){
		if(this === window){
			return;
		}
		this.team = team;
		this.position = position;
		this.name = name;
		if(name.length > 10){
			this.short = name.substring(0,9) + "\u2026";
		} else {
			this.short = this.name;
		}
		this.strength = strength;
		this.fitness = 100;
		this.hasBall = false;

		this.domElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
		var cx = CIRCLE_CENTERS[position].x;
		var cy = CIRCLE_CENTERS[position].y;
		if(team === "guest"){
			cx = 740 - cx;
			cy = 350 - cy;
		}
		this.cx = cx;
		this.cy = cy;
		this.domElement.setAttribute("transform", "translate("+cx+","+cy+")");

		var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		circle.setAttribute("r", "7");
		circle.setAttribute("fill", team=="home" ? "red" : "blue");
		circle.setAttribute("cx", 0);
		circle.setAttribute("cy", 0);
		circle.setAttribute("stroke", BALL_COLOR);
		circle.setAttribute("stroke-width", 0);

		this.domElement.appendChild(circle);
		this.circle = circle;

		var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		text.textContent = this.short;
		text.setAttribute("font-family", "Georgia");

		var title = document.createElementNS("http://www.w3.org/2000/svg", "title");
		title.textContent = this.name;
		this.domElement.appendChild(title);

		if(this.position === 0){
			if(team === "home"){
				text.setAttribute("dominant-baseline", "text-after-edge");
				text.setAttribute("dy", -15);
				text.setAttribute("dx", -35);
			} else {
				text.setAttribute("text-anchor", "end");
				text.setAttribute("dominant-baseline", "text-before-edge");
				text.setAttribute("dy", 8);
				text.setAttribute("dx", 35);
			}
		} else {
			if(team === "home"){
				text.setAttribute("text-anchor", "end");
				text.setAttribute("dominant-baseline", "text-after-edge");
				text.setAttribute("dy", -15);
			} else {
				text.setAttribute("dominant-baseline", "text-before-edge");
				text.setAttribute("dy", 8);
			}
		}
		this.domElement.appendChild(text);
	}

	Dragon.prototype.getBall = function(){
		this.circle.setAttribute("stroke-width", 3);
		this.hasBall = true;
	};

	Dragon.prototype.looseBall = function(){
		this.circle.setAttribute("stroke-width", 0);	
		this.hasBall = false;
	};

	function Field(lineupElement){
		if(this === window){
			return;
		}

		var teamElements = lineupElement.getElementsByClassName("team");
		this.lineup = {};

		this.lineup.home = [];
		this.lineup.home.name = teamElements[0].textContent.match(/\s*(.*)\s*/)[1];
		this.lineup.home.short = this.lineup.home.name.match(/\((.*)\)/)[1];

		var homeElement = lineupElement.getElementsByClassName("lineupHome")[0];
		this.readTeam("home", this.lineup.home, homeElement);

		this.lineup.guest = [];
		this.lineup.guest.name = teamElements[1].textContent.match(/\s*(.*)\s*/)[1];
		this.lineup.guest.short = this.lineup.guest.name.match(/\((.*)\)/)[1];

		var guestElement = lineupElement.getElementsByClassName("lineupGuest")[0];
		this.readTeam("guest", this.lineup.guest, guestElement);

		this.createDomElement();
	}

	Field.prototype.readTeam = function(team, lineup, teamElement) {
		for(var pos = 0; pos < 11; pos++){
			positionElement = teamElement.getElementsByClassName("pos" + (pos+1))[0];
			var name = positionElement.textContent;
			name = name.substring(0 ,name.length-1);
			if(name != "-"){
				lineup[pos] = new Dragon(team, pos, name,
					parseInt(positionElement.title.split(" ")[1])
				);
			} else {
				lineup[pos] = false;
			}
		};
	};

	function createEllipse(cx, cy, rx, ry, stroke, fill){
		var out = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
		out.setAttribute("cx", cx);
		out.setAttribute("cy", cy);
		out.setAttribute("rx", rx);
		out.setAttribute("ry", ry);
		out.setAttribute("stroke", stroke);
		out.setAttribute("stroke-width", "3");
		out.setAttribute("fill", fill);
		return out;
	}

	function createLine(x1, y1, x2, y2, stroke){
		var out = document.createElementNS("http://www.w3.org/2000/svg", "line");
		out.setAttribute("x1", x1);
		out.setAttribute("y1", y1);
		out.setAttribute("x2", x2);
		out.setAttribute("y2", y2);
		out.setAttribute("stroke", stroke);
		out.setAttribute("stroke-width", "3");
		return out;
	}

	Field.prototype.createDomElement = function(){
		this.domElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.domElement.style.width = "740px";
		this.domElement.style.height = "350px";
		this.domElement.setAttribute("width", 740);
		this.domElement.setAttribute("height", 350);

		var defHome = createEllipse(170, 175, 140, 170, "#CCCCCC", "#EEEEEE");
		this.domElement.appendChild(defHome);
		var defGuest = createEllipse(570, 175, 140, 170, "#CCCCCC", "#EEEEEE");
		this.domElement.appendChild(defGuest);
		
		var mid = createEllipse(370, 175, 140, 170, "#CCCCCC", "#FFFFFF");
		this.domElement.appendChild(mid);

		var penaltyHome = createEllipse(0, 175, 75, 110, "#AAAAAA", "#CCCCCC");
		this.domElement.appendChild(penaltyHome);
		var penaltyGuest = createEllipse(740, 175, 75, 110, "#AAAAAA", "#CCCCCC");
		this.domElement.appendChild(penaltyGuest);

		var midLine = createLine(370, 5, 370, 395, "#CCCCCC");
		this.domElement.appendChild(midLine);

		this.dragonGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.domElement.appendChild(this.dragonGroup);

		for (var i = 0; i < this.lineup.home.length; i++) {
			if(this.lineup.home[i]){
				this.dragonGroup.appendChild(this.lineup.home[i].domElement);
			}
		};
		for (var i = 0; i < this.lineup.guest.length; i++) {
			if(this.lineup.guest[i]){
				this.dragonGroup.appendChild(this.lineup.guest[i].domElement);
			}
		};
	}

	Field.prototype.highlightAt = function(pos){

	};

	Field.prototype.removeHighlight = function(){

	}

	Field.prototype.pass = function(from, to, interceptor, interceptSucess) {
		if(interceptor && interceptSucess){
			this.pass(from, interceptor);
		} else {
			if(from && this.activeDragon != from){
				if(this.activeDragon){
					this.activeDragon.looseBall();
				}
				this.activeDragon = from;
				from.getBall();
			}
			if(this.activeDragon){
				this.activeDragon.looseBall();
				if(this.passElement){
					this.domElement.removeChild(this.passElement);
				}
				this.passElement = createLine(this.activeDragon.cx, this.activeDragon.cy, to.cx, to.cy, BALL_COLOR);
				this.domElement.insertBefore(this.passElement, this.dragonGroup);
			}
			if(to.constructor === Dragon){
				this.activeDragon = to;
				to.getBall();
				this.removeHighlight();
			} else {
				this.activeDragon = false;
				this.highlightAt(to);
			}
		}
	}

	Field.prototype.shoot = function(dragon, result){
		if(!this.activeDragon){
			this.pass(false, dragon);
		}
		var cx, cy, keeper;
		cy = 175;
		if(dragon.team === "home"){
			cx = 740;
			keeper = this.lineup.guest[0];
		} else {
			cx = 0;
			keeper = this.lineup.home[0];
		}
		this.pass(dragon, {cx:cx,cy:cy}, keeper, !result.success);
		this.nextActive = keeper;
	}

	Field.prototype.attack = function(attacker, defender, success){
		if(success){
			this.pass(defender, attacker);
		} else if (this.passElement){
			this.domElement.removeChild(this.passElement);
			this.passElement = false;
		}
	}

	Field.prototype.resetDragons = function(reason) {
		if(this.passElement){
			this.domElement.removeChild(this.passElement);
			this.passElement = false;
		}
		if(reason.end){
			if(this.activeDragon){
				this.activeDragon.looseBall();
			}
		}else if(reason.break_){
			if(this.activeDragon){
				var keeper = this.lineup[this.activeDragon.team][0];
				this.activeDragon.looseBall();
				this.activeDragon = keeper;
			} else if (this.nextActive){
				this.activeDragon = this.nextActive;
			}
			this.activeDragon.getBall();
		}else if(reason.begin){
			this.activeDragon = this.lineup.home[0];
			this.activeDragon.getBall();
		}else if(!this.activeDragon && this.nextActive){
			this.activeDragon = this.nextActive;
			this.activeDragon.getBall();
		}
	};

	Field.prototype.getDragon = function(team, position){
		return this.lineup[team][position];
	}

	Field.prototype.getDragonForSpan = function(span){
		console.assert(span.tagName.toLowerCase() == "span");
		var team;
		var position;
		if(span.classList.contains("team0")){
			team = "home";
		} else {
			team = "guest";
		}
		position = parseInt(span.className.match(/pos([0-9]{1,2})/)[1])-1;
		return this.getDragon(team, position);
	}

	var direction = "("+
						"(direkt |weiter |zurück |weit |ganz )?"+
						"((rechts |links )?(nach (rechts |links |vorn )+)?)?"+
						"(in die Mitte (vor das Tor )?|ins Mittelfeld )?"+
						"| "+
					")";
					
	var luck = "(mit (etwas|viel) Glück|glücklich|souverän|(völlig )?mühelos|ohne (große )?Mühe|gekonnt|geschickt|schnell|verwegen|)";

	function match(pattern){
		var dragons = pattern.dragons;
		var patterns = [
			{
				regex: new RegExp("<DRAGON0> stellt sich <DRAGON1> in den Weg und nimmt ih(m|r) "+luck+" den Ball ab\."),
				func: function(){
					field.attack(dragons[0], dragons[1], true);
				}
			},
			{
				regex: new RegExp("<DRAGON0> läuft auf <DRAGON1> zu und nimmt ih(m|r) "+luck+" den Ball ab\."),
				func: function(){
					field.attack(dragons[0], dragons[1], true);
				}
			},
			{
				regex: new RegExp("<DRAGON0> startet einen Spurt, <DRAGON1> kann ih(m|r) aber folgen und nimmt ih(m|r) "+luck+" den Ball ab\."),
				func: function(){
					field.attack(dragons[1], dragons[0], true);
				}
			},
			{
				regex: /<DRAGON0> schnappt sich den Ball, setzt zum Dribbling an, scheitert aber an eine(m|r) aufmerksamen <DRAGON1>\./,
				func: function(){
					field.attack(dragons[1], dragons[0], true);
				}
			},
			{
				regex: new RegExp("<DRAGON0> läuft auf <DRAGON1> zu, dieser? dribbelt aber "+luck+" um <DRAGON0> herum und passt "+direction+"zu <DRAGON2>\\."),
				func: function(){
					field.attack(dragons[0], dragons[1], false);
					field.pass(dragons[1], dragons[2]);
				}
			},
			{
				regex: new RegExp("<DRAGON0> startet einen Spurt, weicht <DRAGON1> aus und wirft den Ball "+direction+"zu <DRAGON2>\\."),
				func: function(){
					field.attack(dragons[1], dragons[0], false);
					field.pass(dragons[0], dragons[2]);	
				}
			},
			{
				regex: new RegExp("<DRAGON0> schnappt sich den Ball, umdribbelt "+luck+" <DRAGON1> und schießt ihn mit dem Fuß "+direction+"zu <DRAGON2>\\."),
				func: function(){
					field.attack(dragons[1], dragons[0], false);
					field.pass(dragons[0], dragons[2]);	
				}
			},
			{
				regex: /<DRAGON0> fängt den Ball, holt schnell aus, wirft ihn  zu <DRAGON1> und damit (dem|der)  <DRAGON2> direkt in die Arme\./,
				func: function(){
					field.pass(dragons[0], dragons[1], dragons[2], true);
				}
			},
			{
				regex: /<DRAGON0> nimmt den Ball und wirft ihn in hohem Bogen Richtung <DRAGON1>, <DRAGON2> geht jedoch dazwischen und fängt ihn noch während des Fluges ab\./,
				func: function(){
					field.pass(dragons[0], dragons[1], dragons[2], true);
				}
			},
			{	regex: new RegExp("<DRAGON0> fängt den Ball, holt schnell aus und wirft ihn über <DRAGON1> "+direction+"zu <DRAGON2>\\."),
				func: function(){
					field.pass(dragons[0], dragons[2], dragons[1], false);
				}
			},
			{
				regex: /<DRAGON0> nimmt den Ball und wirft ihn in hohem Bogen Richtung <DRAGON1>\./,
				func: function(){
					field.pass(dragons[0], dragons[1]);
				}
			},
			{
				regex: new RegExp("<DRAGON0> nimmt den Ball nur kurz an und schießt ihn mit dem Fuß "+direction+"zu <DRAGON1>\\."),
				func: function(){
					field.pass(dragons[0], dragons[1]);
				}
			},
			{
				regex: /<DRAGON0> nimmt den Ball und holt weit aus\. Der Ball trifft die Latte, fällt vor <DRAGON1> auf das Spielfeld und mit einem gezielten Sprung fängt <DRAGON1> den Ball\./,
				func: function(){
					field.shoot(dragons[0], {bar: true});
				}
			},
			{
				regex: /<DRAGON0> nimmt den Ball und holt weit aus\. <DRAGON1> sieht den Ball, streckt sich und lenkt ihn über die Latte\./,
				func: function(){
					field.shoot(dragons[0], {redirect: true});
				}
			},
			{
				regex: /<DRAGON0> nimmt den Ball und holt weit aus\. <DRAGON1> hechtet mit großen Augen in Richtung Ball und kann ihn gerade noch am Tor vorbei lenken\./,
				func: function(){
					field.shoot(dragons[0], {redirect: true});
				}
			},
			{
				regex: /<DRAGON0> nimmt den Ball und holt weit aus\. <DRAGON1> läuft aus dem Tor heraus, verkürzt geschickt den Winkel, <DRAGON0> springt, schlägt mit den Flügeln und wirft den Ball (am Tor vorbei|über das Tor)\./,
				func: function(){
					field.shoot(dragons[0], {leave: true, miss: true});
				}
			},
			{
				regex:/<DRAGON0> nimmt den Ball und holt weit aus\. <DRAGON1> läuft aus dem Tor heraus, verkürzt geschickt den Winkel, <DRAGON0> springt, schlägt mit den Flügeln und wirft den Ball\.\. in die Arme von <DRAGON1>\./,
				func: function(){
					field.shoot(dragons[0], {leave: true, caught: true});
				}
			},
			{
				regex: /<DRAGON0> nimmt den Ball und holt weit aus.*\. <GOAL> Die Menge jubelt,/,
				func: function(){
					field.shoot(dragons[0], {success: true});
				}
			},
			{
				regex: /<SCORE><TEAM(0|1)> greift an:/,
				func: function(){
					field.resetDragons({});
				}
			},
			{
				regex: /<BREAK>/,
				func: function(){
					field.resetDragons({break_: true});
				}
			},
			{
				regex: /<END>/,
				func: function(){
					field.resetDragons({end: true});
				}
			},
			{
				regex: /Endstand: <SCORE>/,
				func: function(){
					field.resetDragons({end: true});
				}
			},
			{
				regex: /von <TEAM0> und <TEAM1> stehen sich.*gegenüber\./,
				func: function(){
					field.resetDragons({begin: true});
				}
			}
		]
		for(var i = 0 ; i < patterns.length; i++){
			if(pattern.string.match(patterns[i].regex)){
				return patterns[i].func();
			}
		}
		console.log("unkown pattern", '"'+pattern.string+'"');
	}

	function patternize(elements){
		var string = "";
		var dragons = [];
		for(var i = 2; i < elements.length; i++){
			var e = elements[i];
			if(e.nodeType === Element.TEXT_NODE){
				if(e.textContent.match(/ [0-9]{1,2}(min)? - \([0-9]+:[0-9]+\) - /)){
					string += "<SCORE>";
				} else {
					string += e.textContent;
				}
			} else if(e.tagName.toLowerCase() === "span"){
				if (e.className.match(/team[01] pos[0-9]{1,2}/)) {
					var dragon = field.getDragonForSpan(e);
					var id = dragons.indexOf(dragon);
					if(id < 0){
						id = dragons.push(dragon) - 1;
					}
					string += "<DRAGON" + id + ">";
				} else if(e.className.match(/team[01]/)){
					string += "<"+e.className.match(/team[01]/)[0].toUpperCase()+">";
				} else if (e.textContent.match("Pausenpfiff")) {
					string = "<BREAK>";
					break;
				} else if (e.textContent.match("Abpfiff")) {
					string = "<END>";
					break;
				}
			} else if(e.tagName.toLowerCase() == "i" && e.hasAttribute("res")){
			} else if(e.tagName.toLowerCase() == "b"){
				if(e.textContent.match(/TO+R!+/)){
					string += "<GOAL>";
				} else if(e.textContent.match(/[0-9]+:[0-9]+/)){
					string += "<SCORE>";
				} else {
					debugger;
				}
			} else {
				debugger;
			}
		}
		return {string:string, dragons:dragons};
	}

	function processMessage(text, elements, field){
		if(elements.length > 2 && elements[1].textContent == "Kommentator:"){
			var pattern = patternize(elements);
			match(pattern);
		}
	}

	var mo;
	function startListener(field){
		var last = "";
		mo = new MutationObserver(function(e){
			var brs = e[0].target.getElementsByTagName("br");
			if(brs.length == 0){
				return;
			}
			var index = 0;
			var br = brs[index];
			var el = e[0].target.firstChild;
			var text = "";
			while(text != last){
				text = "";
				for(; el && el != br; el = el.nextSibling){
					text += el.textContent;
				}
				index++;
				br = brs[index];
				el = el.nextSibling;
			}
			while(index < brs.length){
				text = "";
				var elements = [];
				for(; el && el != br; el = el.nextSibling){
					text += el.textContent;
					elements.push(el);
				}
				last = text;
				processMessage(text, elements, field);
				index++;
				br = brs[index];
				el = el.nextSibling;
			}
		});

		mo.observe(chat, {childList:true});
	}

	function stopListener(){
		if(mo){
			mo.disconnect();
		}
		mo = false;
	}

	var button = document.createElement("button");
	var field = false;

	function activate(){
		if(!field){
			field = new Field(document.getElementsByClassName("lineup")[0]);
			chat.parentElement.insertBefore(field.domElement, button);
			startListener(field);
		}
	}

	function deactivate(){
		if(field){
			field.domElement.parentElement.removeChild(field.domElement);
			field = false;
		}
	}

	button.addEventListener("click", function(e){
		if(!field){
			activate();
		} else {
			deactivate();
		}
	})

	button.textContent = "Live Grafik an/aus";
	button.style.width ="740px";
	button.style.height = "30px";
	button.style.borderStyle = "solid";
	button.style.borderWidth = "1px";
	button.style.borderColor = "#3C1E00";
	button.style.color = "#3D342B";
	button.style.backgroundColor = "#C9B9AC";
	button.style.marginTop = "10px";
	button.style.marginBottom = "10px";

	chat.parentElement.insertBefore(button, chat.parentElement.getElementsByTagName("h1")[1]);
}