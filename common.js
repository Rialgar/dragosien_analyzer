//functionality reused by severall scripts

function storeData(key, value){
	if(key){
		localStorage[key] = JSON.stringify(value)
	}
}

function getData(key) {
	if(localStorage[key]){
		return JSON.parse(localStorage[key]);
	}
}

function formatNumber(number){
	var input = number.toString();
	var output = "";
	for (var i = 3; i<input.length; i+=3) {
		output = "." + input.substr(input.length-i,3) + output;
	}	
	output = input.substr(0,input.length-i+3) + output;
	//return output;
	return input; 
}

console.origlog = console.log;
console.log = function(message){
	console.origlog("Dragosien Analyzer: " + message);
}

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