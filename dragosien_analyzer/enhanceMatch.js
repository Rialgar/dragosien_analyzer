if(window.location.search.match(/t=chat_dragball/)){
	var chat = document.getElementById("chat_content");

	var circleCenters = [
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
	]

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

		this.domElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
		var cx = circleCenters[position].x;
		var cy = circleCenters[position].y;
		if(team === "guest"){
			cx = 740 - cx;
			cy = 350 - cy;
		}
		this.domElement.setAttribute("transform", "translate("+cx+","+cy+")");

		var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		circle.setAttribute("r", "7");
		circle.setAttribute("fill", team=="home" ? "red" : "blue");
		circle.setAttribute("cx", 0);
		circle.setAttribute("cy", 0);
		this.domElement.appendChild(circle);

		var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		text.textContent = this.short;
		text.setAttribute("font-family", "Georgia");

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

		for (var i = 0; i < this.lineup.home.length; i++) {
			if(this.lineup.home[i]){
				this.domElement.appendChild(this.lineup.home[i].domElement);
			}
		};
		for (var i = 0; i < this.lineup.guest.length; i++) {
			if(this.lineup.guest[i]){
				this.domElement.appendChild(this.lineup.guest[i].domElement);
			}
		};
	}

	function processMessage(text, elements, field){
		console.log(text);
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
			var elements = [];
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
			stopListener();
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