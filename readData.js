//readData.js -- analyzes opened dragosien pages and sends data to extension

//some utility functions and changes to data interface, as localStorage of
//extension is not accesible
function storeData(key, value){
	chrome.extension.sendMessage(
		{
			type: "storeData",
			key: key,
			value: value
		},
		function(response){
			if(response === true){
				console.log("Data stored: " + key);
			}
		}
	);
}

function getData(key, callback) {
	chrome.extension.sendMessage(
		{
			type: "getData",
			key: key
		},
		callback
	);
}

var getTableHeader = function(table, row, collumn, getNode){
	var r = table.getElementsByTagName("tr")[row];
	if(r){
		var d = r.getElementsByTagName("th")[collumn];
		if(d){
			if(getNode){
				return d;
			} else {
				return d.textContent;
			}
		}
	}
}

var getTableData = function(table, row, collumn, getNode){
	var r = table.getElementsByTagName("tr")[row];
	if(r){
		var d = r.getElementsByTagName("td")[collumn];
		if(d){
			if(getNode){
				return d;
			} else {
				return d.textContent;
			}
		}
	}
} 


storeData("lastPage", window.location.toString());

//Read and store current amount of gold
var userinfo = document.getElementById("userinfo");
if(userinfo){
	storeData("gold", userinfo.textContent.match(/Gold: ([0-9\.]+)/)[1].replace(".",""));
}

//----------------------------------FIND TABLES---------------------------------
console.log("searching tables");

var market_price_table = document.getElementById("market_price");

var store_table;
var building_state;
var table = document.getElementById("store");
if(table){
	if(table.getElementsByTagName("b")[0].textContent.match("Lager")){
		store_table = table;
	}else if(table.getElementsByTagName("b")[0].textContent.match("Zustand")){
		building_state = table;
	}
}

var production_table;
var building_levels;
var tables = document.getElementsByClassName("overview");
for (var i = 0; i < tables.length; i++){
	if(
		tables[i] &&
		tables[i].getElementsByTagName("b")[0]
	){ 
		if(tables[i].getElementsByTagName("b")[0].textContent.match("Produktion")){
			production_table = tables[i];
		}else if(tables[i].getElementsByTagName("b")[0].textContent.match("Gebäudestufen")){
			building_levels = tables[i];
		}else if(tables[i].getElementsByTagName("b")[0].textContent.match("Zustand")){
			building_state = tables[i];
		}
	}
}

var building_info = {};
tables = document.getElementsByClassName("table numbers");
for (var i = 0; i < tables.length; i++){
	if(tables[i]){
		var headers = tables[i].getElementsByTagName("th");
		if(
			headers.length > 10 && 
			headers[0].textContent.match("Stufe") &&
			headers[1].textContent.match("Produktion") &&
			(
				headers[2].textContent.match("Baukosten") || 
			  (
					headers[2].textContent.match("Material") &&
					headers[3].textContent.match("Baukosten")
				)
			)
		){
			building_info.table = tables[i];
			building_info.name = document.getElementsByTagName("h1")[0].textContent;
			break;
		}
	}
}
//-------------------------------END FIND TABLES--------------------------------

if(market_price_table && market_price_table.nodeName.toLowerCase() === "table"){
	//read price and store information 
	console.log("found market overview table");
		
	var store = {};
	var prices = {};
				
	var rows = market_price.getElementsByTagName("tr");
	for(var i = 0; i<rows.length; i++){
		var data = rows[i].getElementsByTagName("td");
		if(data.length >= 3){
			store[data[0].title] = parseInt(data[1].textContent.replace(/-/,"0"));
		  prices[data[0].title] = parseInt(data[2].textContent.match(/[0-9]+/)[0]);
		}		
	}	
	prices.Gold = 1;			
	storeData("store", store);
	storeData("prices", prices);
}

else if(store_table && store_table.nodeName.toLowerCase() === "table"){
	//read store information
	console.log("found store table");
		
	var store = {};
				
	var rows = store_table.getElementsByTagName("tr");
	for(var i = 0; i<rows.length; i++){
		var data = rows[i].getElementsByTagName("td");
		if(data.length >= 2){
			var key = data[0].getElementsByTagName("a")[0].textContent;
			key = key.substring(0,key.length-1);
			store[key] = parseInt(data[1].textContent.replace(/\./,""));
		}		
	}				
	storeData("store", store);		
}		

if(production_table && production_table.nodeName.toLowerCase() === "table"){
	//read current production and consumption information
	//redundant to level and base production for each building
	console.log("found production table");

	var production = {};
				
	var rows = production_table.getElementsByTagName("tr");
	for(var i = 0; i<rows.length; i++){
		var data = rows[i].getElementsByTagName("td");
		if(data.length >= 2){
			var key = data[0].getElementsByTagName("a")[0].textContent;
			key = key.substring(0,key.length-1);
			var prod = data[1].textContent.match(/([0-9]+)\/(-?[0-9]+)/);
			production[key] = {
				plus: parseInt(prod[1]),
				minus: parseInt(prod[2])
			};
		}		
	}				
	storeData("production", production);	
} 

if(building_levels && building_levels.nodeName.toLowerCase() === "table"){
	//read crrently build buildings levels
	console.log("found building levels");
	
	var levels = {};
				
	var rows = building_levels.getElementsByTagName("tr");
	for(var i = 0; i<rows.length; i++){
		var data = rows[i].getElementsByTagName("td");
		if(data.length >= 2){
			var key = data[0].textContent.match(/[a-zA-ZäöüÄÖÜß]+/)[0];
			var lvl = data[1].textContent.match(/\(([0-9]+)\)/)[1];
			levels[key] = parseInt(lvl);
		}		
	}				
	storeData("levels", levels);
}

if(building_state && building_state.nodeName.toLowerCase() === "table"){
	//read the state of buildings, stored as integer in percent
	console.log("found building state table");
	
	var states = {};
				
	var rows = building_state.getElementsByTagName("tr");
	for(var i = 0; i<rows.length; i++){
		var data = rows[i].getElementsByTagName("td");
		if(data.length >= 2){
			var key = data[0].getElementsByTagName("a")[0].textContent;
			key = key.substring(0,key.length-1);
			var state = data[1].textContent.match(/[0-9]+/)[0];
			states[key] = parseInt(state);
		}		
	}				
	storeData("states", states);
}

if(building_info.table && building_info.name){
	//read building info, consisting of production, consumption and building costs
	//per level
	//will propably not change that often and require an opening of the dragopedia
	//consider hardcoding them
	console.log("found building info for " + building_info.name)
	
	var costOffset = 2;
	var colspan = 0;
	
	//find out how many types of ressources are consumed	
	if(getTableHeader(building_info.table, 0, 2).match("Material")){
	 	colspan = getTableHeader(building_info.table, 0, 2, true).getAttribute("colspan") || 1;
	 	colspan = parseInt(colspan);
		costOffset += colspan;				
	}
	
	getData("buildingCosts_"+building_info.name, function(response){
		//read and update building costs per level
		var building_costs = response.value || {};
		var rows = building_info.table.getElementsByTagName("tr");
		for(var i = 2; i < rows.length-1; i++){
			var data = rows[i].getElementsByTagName("td");
			var costs = building_costs[data[0].textContent];
			if(!costs){
				costs = building_costs[data[0].textContent] = {};
				for(var j = costOffset; j<data.length; j++){
					costs[getTableHeader(building_info.table,1,j)] = parseInt(data[j].textContent || 0);
				}								
			}
		} 
		
		storeData("buildingCosts_"+building_info.name, building_costs);
	});
	
	//read production amount, stored as a base value
	//production on level n is then (n+1)*base
	var ressourceName = getTableHeader(building_info.table, 1, 1); 
	var production =
		parseInt(getTableData(building_info.table, 2, 1).match(/[0-9]+/)[0])/2;
	
	getData("buildingProduction", function(response){
		//update production values
		var building_production = response.value || {}		
	  var prod = building_production[building_info.name];
	  if(!prod){
		  prod = building_production[building_info.name] = {};
		  prod.name = ressourceName;			  
			prod.amount = production;			  
		
			storeData("buildingProduction", building_production);
		}
	}); 
	
	//is tehre consumption?
	if(colspan){
		//read consumption, stored as a base value
		//consumption on level n is then (n+1)*base
		var consumption = {};
		for(var i = 2; i < costOffset; i++){
			consumption[getTableHeader(building_info.table, 1, i)] =
				parseFloat(getTableData(building_info.table, 2, i).match(/[0-9]*\.?[0-9]*/)[0])/2;	
		}
	
		getData("buildingConsumption", function(response){
			//update consumption per building
			var building_consumption = response.value || {}		
		  var cons = building_consumption[building_info.name];
		  if(!cons){
				cons = building_consumption[building_info.name] = {};			
				for(var key in consumption){
					if(consumption.hasOwnProperty(key)){
						cons[key] = consumption[key];
					}
				}			
				storeData("buildingConsumption", building_consumption);
			}
		}); 
		
		if(ressourceName !== "Gold"){
			//update consumption per resource, does not apply to gold produced by 
			//Wirtshaus and Gasthaus, redundant to above but organized differently	
			getData("ressourceCosts", function(response){
				var ressource_costs = response.value || {}		
			  var costs = ressource_costs[ressourceName];
			  if(!costs){
					costs = ressource_costs[ressourceName] = {};
					for(var key in consumption){
						if(consumption.hasOwnProperty(key)){
							costs[key] = consumption[key]/production;
						}
					}
				}
				
				storeData("ressourceCosts", ressource_costs);
			});
		}
	}
}