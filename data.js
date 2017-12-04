mock = false;

function loadData(type,callback,arg) {

	if (!arg) arg="";
	var mockJson,parsedJson;
	if (mock) {
		if (type=="userList") {
			mockJson = '[' +
				'{"id":"Fred", "email":"fred.snyder@accuity.com", "manager":"Fred" },' +
				'{"id":"Brian", "email":"fredsnyder@gmail.com", "manager":"Fred" }' +
				']';
		}
		if (type=="user") {
			mockJson = '[' +
				'{"date":"10/10/10", "state":"pending" },' +
				'{"date":"12/12/12", "state":"approved" }' +
				']';
		}
		parsedJson=JSON.parse(mockJson);
		callback(mockJson);
	}
	else //for real
		fetchData(type+'.php?'+arg,callback);
	
}


function postData(arg,callback) { 
	var url='post.php?content='+arg;
	sendData(url,callback); 
}
function postDataArgs(argList,callback) { 
	var url='post.php?';
	for (var key in argList) {    
		if (argList.hasOwnProperty(key)) {           
			console.log(key, argList[key]);
			url+= key + "=" + escape(argList[key]) + "&";
debug("key #"+argList[key]+"# escaped #"+	escape(argList[key]) +"#");
		    }
	}
	debug(url);
	sendData(url,callback); 
}
function fetchData(url, callback){ sendData(url,callback,null); }

function sendData(url, callback,dataToSend){
	var pageRequest = false
	if (window.XMLHttpRequest) {
		pageRequest = new XMLHttpRequest()
	}
	else if (window.ActiveXObject){ 
		try {
			pageRequest = new ActiveXObject("Msxml2.XMLHTTP")
		} 
		catch (e) {
			try{
				pageRequest = new ActiveXObject("Microsoft.XMLHTTP")
			}
			catch (e){}
		}
	}
	else return false
	pageRequest.onreadystatechange=function() {	
	        if (pageRequest.readyState == 4 && pageRequest.status == 200) 
			callback( pageRequest.responseText);
	}
	if (dataToSend) {		
		//var sendData = 'sendData=' + dataToSend;
		pageRequest.open('POST',url,true);
		pageRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		pageRequest.send(dataToSend);
	}
	else {
		pageRequest.open('GET',url,true)
		pageRequest.send(null);	
	}
}

function testPost(){
	var pageRequest = false
	if (window.XMLHttpRequest) {
		pageRequest = new XMLHttpRequest()
	}
	else if (window.ActiveXObject){ 
		try {
			pageRequest = new ActiveXObject("Msxml2.XMLHTTP")
		} 
		catch (e) {
			try{
				pageRequest = new ActiveXObject("Microsoft.XMLHTTP")
			}
			catch (e){}
		}
	}
	else return false
		//var sendData = 'sendData=' + dataToSend;
		pageRequest.open('POST',"post.php",true);
		pageRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		pageRequest.send("testing the post");
}