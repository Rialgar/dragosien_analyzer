//functionality reused by severall scripts

function storeData(key, value){
	if(key){
		localStorage[key] = JSON.stringify(value)
	}
}

function getData(key) {
	if(localStorage[key]){
		return JSON.parse(localStorage[key]);
	} else if(key == "allBuildingNames") {
		return ["Akademie", "Alchemiehütte", "Arena", "Bauherr", "Böttcher", "Drachenzucht", "Eisengießerei", "Eisenmine", "Garten", "Gasthaus", "Gerber", "Getreideanbau", "Hanfplantage", "Holzfäller", "Imkerei", "Kaufmann", "Kerzengießerei", "Köhlerei", "Kräutergarten", "Lager", "Lehmbrennerei", "Lehmstecherei", "Metzger", "Mühle", "Nagelschmiede", "Obstplantage", "Papiermühle", "Sägewerk", "Sattelmacher", "Seilerei", "Steinbruch", "Steinmetz", "Töpferei", "Viehzucht", "Weberei", "Zeugschmiede"];
	}
}

function formatNumber(number){
	var input = Math.abs(number).toString();
	var parts = input.split(".");
	var output = "";
	if(parts[0].length > 0){
		for (var i = 3; i<parts[0].length; i+=3) {
			output = "." + parts[0].substr(parts[0].length-i,3) + output;
		}	
		output = parts[0].substr(0,parts[0].length-i+3) + output;
	} else {
		output = "0"
	}
	if(parts[1]){
		output = output + "," + parts[1].substr(0,3);
	}
	if(number < 0){
		output = "-" + output;
	}
	return output;
	//return input; 
}

/*console.origlog = console.log;
console.log = function(message){
	console.origlog("Dragosien Analyzer: " + message);
}*/

HTMLElement.prototype.removeAllChildren = function(){
	while(this.firstChild){
		this.removeChild(this.firstChild);
	}
}

function createTableRow(data){
	var row = document.createElement("tr");
	if(data.constructor === Array){
		data.forEach(function(ea){
		  var field = document.createElement("td");
			field.appendChild(document.createTextNode(ea));
			row.appendChild(field); 
		});
	}
	return row;
}