if(window.location.search.match(/t=chat_dragball/)){
	var chat = document.getElementById("chat_content");

	var circleCenters = [
		{x: 40, y: 150},
		{x: 160, y: 50},
		{x: 110, y: 150},
		{x: 160, y: 250},
		{x: 260, y: 150},
		{x: 360, y: 50},
		{x: 360, y: 250},
		{x: 460, y: 150},
		{x: 560, y: 50},
		{x: 610, y: 150},
		{x: 560, y: 250}
	]

	function Dragon(team, position, name, strength){
		if(this === window){
			return;
		}
		this.team = team;
		this.position = position;
		this.name = name;
		this.strength = strength;
		this.fitness = 100;

		var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		circle.setAttribute("r", "7");
		circle.setAttribute("fill", team=="home" ? "red" : "blue");
		var cx = circleCenters[position].x;
		var cy = circleCenters[position].y;
		if(team === "guest"){
			cx = 740 - cx;
			cy = 300 - cy;
		}
		circle.setAttribute("cx", cx);
		circle.setAttribute("cy", cy);
		title = document.createElementNS("http://www.w3.org/2000/svg", "title");
		title.textContent = name;
		circle.appendChild(title);
		this.domElement = circle;
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
		this.domElement.style.height = "300px";
		this.domElement.setAttribute("width", 740);
		this.domElement.setAttribute("height", 300);

		var defHome = createEllipse(170, 150, 140, 145, "#CCCCCC", "#EEEEEE");
		this.domElement.appendChild(defHome);
		var defGuest = createEllipse(570, 150, 140, 145, "#CCCCCC", "#EEEEEE");
		this.domElement.appendChild(defGuest);
		
		var mid = createEllipse(370, 150, 140, 145, "#CCCCCC", "#FFFFFF");
		this.domElement.appendChild(mid);

		var penaltyHome = createEllipse(0, 150, 70, 100, "gray", "#CCCCCC");
		this.domElement.appendChild(penaltyHome);
		var penaltyGuest = createEllipse(740, 150, 70, 100, "gray", "#CCCCCC");
		this.domElement.appendChild(penaltyGuest);

		var midLine = createLine(370, 5, 370, 295, "#CCCCCC");
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
		var last;
		mo = new MutationObserver(function(e){
			var brs = e[0].target.getElementsByTagName("br");
			var el;
			if(brs.length == 0){
				return;
			}
			if(brs.length >= 2){
				var el = brs[brs.length-2].nextSibling;
			} else {
				el = e[0].target.firstChild;
			}
			var text = "";
			var elements = [];
			if(el.nextSibling.textContent == "Kommentator:"){
				for(; el && el != brs[brs.length-1]; el = el.nextSibling){
					text += el.textContent;
					elements.push(el);
				}
				if(text != last){
					last = text;
					processMessage(text, elements, field);
				}
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