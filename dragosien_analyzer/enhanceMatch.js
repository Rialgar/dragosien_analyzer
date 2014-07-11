if(window.location.search.match(/t=chat_dragball/)){
	var chat = document.getElementById("chat_content");

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
		this.readTeam(this.lineup.home, homeElement);

		this.lineup.guest = [];
		this.lineup.guest.name = teamElements[1].textContent.match(/\s*(.*)\s*/)[1];
		this.lineup.guest.short = this.lineup.guest.name.match(/\((.*)\)/)[1];

		var guestElement = lineupElement.getElementsByClassName("lineupGuest")[0];
		this.readTeam(this.lineup.guest, guestElement);

		this.createDomElement();
	}

	Field.prototype.readTeam = function(team, teamElement) {
		for(var pos = 0; pos < 11; pos++){
			positionElement = teamElement.getElementsByClassName("pos" + (pos+1))[0];
			var name = positionElement.textContent;
			name = name.substring(0 ,name.length-1);
			if(name != "-"){
				team[pos] = {
					name: name,
					strength: parseInt(positionElement.title.split(" ")[1]),
					fitness: 100
				}
			} else {
				team[pos] = false;
			}
		};
	};

	Field.prototype.createDomElement = function(){
		this.domElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.domElement.style.width = "740px";
		this.domElement.style.height = "300px";
		this.domElement.setAttribute("width", "740");
		this.domElement.setAttribute("height", "300");
	}

	function processMessage(text, elements, field){
		console.log(text);
	}

	var mo;
	function startListener(field){
		console.log("adding MutationObserver");

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
		console.log("removing MutationObserver");
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