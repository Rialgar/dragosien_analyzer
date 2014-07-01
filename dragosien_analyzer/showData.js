//showData.js -- aggregates read Data and displays results in popup.xhtml
window.addEventListener("load",function(){
	var storeValueNode = document.getElementById("storeValue");
	var productionValueNode = document.getElementById("productionValue"); 
	var renovationCostsNode = document.getElementById("renovationCosts"); 
	var renovationBaseNode = document.getElementById("renovationBase");

	var data = {};
	data.production =  getData("production");
	data.store =  getData("store");
	data.prices =  getData("prices");
	
	if(data.store && data.production && data.prices){
		var store_value = 0;
		var production_value = 0;

		for(var key in data.store){
			if(data.store.hasOwnProperty(key)){
				store_value += data.store[key] * data.prices[key];
				production_value += (data.production[key].plus + data.production[key].minus) * data.prices[key];
			}
		}

		storeValueNode.removeAllChildren();
		storeValueNode.appendChild(
			document.createTextNode(formatNumber(store_value))
		);
		
		productionValueNode.removeAllChildren();
		productionValueNode.appendChild(
			document.createTextNode(formatNumber(production_value))
		);
	}
	
	data.states = getData("states");
	data.buildings = getData("buildings");
	data.storeLevel = getData("storeLevel");


	var renovation_costs = 0;
	var renovation_base = 0;
	if(data.states && data.buildings && data.storeLevel && data.prices){
		for(var i = 0; i < data.states.length; i++){
			var name, level;
			if(i < data.buildings.length){
				name = data.buildings[i].name;
				level = data.buildings[i].level;
			} else {
				name = "Lager";
				level = data.storeLevel;
			}
			var state = data.states[i];
			var costs = getData("buildingCosts_" + name);
			if(costs && costs[level]){
				for(var resource in costs[level]){
					if(costs[level].hasOwnProperty(resource)){
						var baseAmount = costs[level][resource] / 100; 
						var amount = Math.ceil(baseAmount * (100 - state));
						renovation_costs += amount * data.prices[resource];
						renovation_base += baseAmount * data.prices[resource];
					}
				}			
			}else if(state != 100){
				renovation_costs = -1;
				break;
			}			
		}
		if(renovation_costs >= 0){
			renovationCostsNode.removeAllChildren();
			renovationCostsNode.appendChild(
				document.createTextNode(formatNumber(renovation_costs))
			);

			renovationBaseNode.removeAllChildren();
			renovationBaseNode.appendChild(
				document.createTextNode(formatNumber(Math.round(renovation_base / 72)))
			);
		}
	}
	
	//set the details-button script
	if(data.states && data.buildings && data.storeLevel && data.prices && data.renovation_costs >= 0){
		document.getElementById("details").addEventListener("click",function(){
			chrome.tabs.create({
				url: "details.xhtml",
				openerTabId: parseInt(localStorage.lastTab)
			});
		});
	} else {
		document.getElementById("details").disabled = "disabled";
	}
	
	data.team = getData("team");
	data.guild = getData("guild");

	//set the team button script
	if( data.team && data.guild ){
		document.getElementById("team").addEventListener("click",function(){
			chrome.tabs.create({
				url: "team.xhtml",
				openerTabId: parseInt(localStorage.lastTab)
			});
		});
	}else{
		document.getElementById("team").disabled = "disabled";
	}
});