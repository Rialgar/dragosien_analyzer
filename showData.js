window.addEventListener("load",function(){
	data = {};
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
	
		var storeValueNode = document.getElementById("storeValue"); 
	  storeValueNode.removeAllChildren();
		storeValueNode.appendChild(
			document.createTextNode(formatNumber(store_value))
		);
		
		var productionValueNode = document.getElementById("productionValue"); 
	  productionValueNode.removeAllChildren();
		productionValueNode.appendChild(
			document.createTextNode(formatNumber(production_value))
		);
	}
	
	data.states = getData("states");
	data.levels = getData("levels");
	
	if(data.states && data.levels && data.prices){
		var renovation_costs = 0;
		var renovation_base = 0;
		for(var key in data.states){
			if(data.states.hasOwnProperty(key)){
				var state = data.states[key];
				var level = data.levels[key];
				var costs = getData("buildingCosts_" + key);
				console.log(key+" "+level+" "+state);
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
		}
		console.log(renovation_costs)
		if(renovation_costs >= 0){
			var renovationCostsNode = document.getElementById("renovationCosts"); 
	  	renovationCostsNode.removeAllChildren();
			renovationCostsNode.appendChild(
				document.createTextNode(formatNumber(renovation_costs))
			);
			
			var renovationBaseNode = document.getElementById("renovationBase"); 
	  	renovationBaseNode.removeAllChildren();
			renovationBaseNode.appendChild(
				document.createTextNode(formatNumber(Math.round(renovation_base / 72)))
			);
		}
	}
	
});