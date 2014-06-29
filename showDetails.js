//showData.js -- aggregates read Data and displays results in popup.xhtml
window.addEventListener("load",function(){
	var resourceNode = document.getElementById("resource");
	var buildingNode = document.getElementById("building");

	var data = {};
	data.production =  getData("production");
	data.store =  getData("store");
	data.prices =  getData("prices");
	
	if(data.store && data.production && data.prices){
		var store_value_sum = 0;
		var production_value_sum = 0;
		var consumption_value_sum = 0;

		for(var key in data.store){
			if(data.store.hasOwnProperty(key)){

				var store_value = data.store[key] * data.prices[key];
				var production_value = data.production[key].plus * data.prices[key];
				var consumption_value = data.production[key].minus * data.prices[key];

				store_value_sum += store_value;				
				production_value_sum += production_value;
				consumption_value_sum += consumption_value;

				resourceNode.appendChild(createTableRow([
					key,
					formatNumber(data.prices[key]),
					formatNumber(data.store[key]),
					formatNumber(store_value),
					formatNumber(data.production[key].plus),
					formatNumber(production_value),
					formatNumber(data.production[key].minus),
					formatNumber(consumption_value),
					formatNumber(data.production[key].plus + data.production[key].minus),					
					formatNumber(production_value + consumption_value)								
					]));
			}
		}
		resourceNode.appendChild(createTableRow([
			"",
			"",
			"",
			formatNumber(store_value_sum),
			"",
			formatNumber(production_value_sum),
			"",
			formatNumber(consumption_value_sum),
			"",					
			formatNumber(production_value_sum + consumption_value_sum)								
			]));
	}
	
	data.states = getData("states");
	data.levels = getData("levels");
	data.buildingProduction = getData("buildingProduction")
	data.buildingConsumption = getData("buildingConsumption")
	
	if(data.states && data.levels && data.prices){
		var renovation_costs_sum = 0;
		var renovation_base_sum = 0;
		var production_sum = 0;
		var consumption_sum = [0,0];
		var profit_sum = 0;
		
		for(var key in data.levels){
			if(data.levels.hasOwnProperty(key)){
				var state = data.states[key];
				var level = data.levels[key];
				var bProd = data.buildingProduction[key];
				var bCons = data.buildingConsumption[key];
				
				var costs = getData("buildingCosts_" + key);
				var renovation_costs = 0;
				var renovation_base = 0;
				var renovation_base_next = 0;
				var expansion_costs = 0;

				if(level>0 && costs && costs[level]){
					for(var resource in costs[level]){
						if(costs[level].hasOwnProperty(resource)){
							var baseAmount = costs[level][resource] / 100; 
							var amount = Math.ceil(baseAmount * (100 - state));
							renovation_costs += amount * data.prices[resource];
							renovation_base += baseAmount * data.prices[resource] / 72;

						}
					}
					for(var resource in costs[level+1]){
						if(costs[level+1].hasOwnProperty(resource)){
							expansion_costs += costs[level+1][resource] *  data.prices[resource];
							var baseAmount = costs[level+1][resource] / 100; 
							var amount = Math.ceil(baseAmount * (100 - state));
							renovation_base_next += baseAmount * data.prices[resource] / 72;

						}
					}			
				}
				var baseProduction = 0;
				var lvlProduction = 0;
				var nextProduction = 0;
				
				if(bProd && data.prices[bProd.name]){
					baseProduction = bProd.amount * data.prices[bProd.name];
					lvlProduction = level === 0 ? 0 : baseProduction * (level+1);
					nextProduction = baseProduction * (level+2);
				}

				consumption = [{name:"",base:0, lvl:0, next:0},{name:"", base:0, lvl:0, next:0}];
				var c = 0;
				
				if(bCons){
					for(var resource in bCons){
						if(bCons.hasOwnProperty(resource)){
							consumption[c].name = resource;
							consumption[c].base = bCons[resource] * data.prices[resource];
							consumption[c].lvl = level === 0 ? 0 : consumption[c].base * (level+1);
							consumption[c].next = consumption[c].base * (level+2);
							c++;
						}
					}
				}													 
				
				//var base_profit = baseProduction - consumption[0].base - consumption[1].base;
				var profit = lvlProduction - consumption[0].lvl - consumption[1].lvl;
				var nextProfit = nextProduction - consumption[0].next - consumption[1].next;

				var breakEven = expansion_costs / (nextProfit - profit - renovation_base_next + renovation_base);

				renovation_costs_sum += renovation_costs;
				//renovation_base_sum += renovation_base;
				if(lvlProduction > 0){
					production_sum += lvlProduction;
					consumption_sum[0] += consumption[0].lvl;
					consumption_sum[1] += consumption[1].lvl; 
					profit_sum += profit;	
				}			                               
				
				buildingNode.appendChild(createTableRow([
					key,
					bProd ? bProd.name : "",
					consumption[0].name,
					consumption[1].name,
					//formatNumber(baseProduction),
					//formatNumber(consumption[0].base),
					//formatNumber(consumption[1].base),
					//formatNumber(base_profit),
					formatNumber(level),
					formatNumber(lvlProduction),
					formatNumber(consumption[0].lvl),
					formatNumber(consumption[1].lvl),
					formatNumber(profit),
					formatNumber(renovation_costs),
					formatNumber(renovation_base),
					formatNumber(breakEven)
					]));				
			}
		}
		buildingNode.appendChild(createTableRow([
			"",
			"",
			"",
			"",
			//"",
			//"",
			//"",
			//"",
			"",
			formatNumber(production_sum),
			formatNumber(consumption_sum[0]),
			formatNumber(consumption_sum[1]),
			formatNumber(profit_sum),
			formatNumber(renovation_costs_sum),
			formatNumber(renovation_base_sum)
			]));
	}
	
});