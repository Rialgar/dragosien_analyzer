//dataStore.js -- background page responsible for storing data sent by the
//injected script (readData.js)

chrome.extension.onMessage.addListener(function(msg,sender,sendResponse){
	if(msg.type == "storeData"){
		chrome.pageAction.show(sender.tab.id);
		
		if(msg.key && msg.value){
			localStorage[msg.key] = JSON.stringify(msg.value);
			refresh = JSON.parse(localStorage.refresh || "{}");
			refresh[msg.key] = new Date();
			localStorage.refresh = JSON.stringify(refresh);
	  }
		sendResponse(true);
	  return true;
	} else if (msg.type == "getData" && msg.key && localStorage[msg.key]){
		sendResponse(
			{
				key: msg.key,
				value: JSON.parse(localStorage[msg.key])
			}
		);
		return true;
	} else {
		sendResponse(false);
		return true;
	}
});