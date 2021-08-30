function select(string){
    console.log(string)
}


function makeList(listOfDataNames) {

    dropDownContainer = document.createElement('div');
    dropDownContainer.className = "dropdown";

    selectButton = document.createElement('button');
    selectButton.innerHTML = "Select";
    selectButton.setAttribute("class","btn btn-light dropdown-toggle");
    selectButton.setAttribute("type", "button");
    selectButton.setAttribute("id", "dropdownMenuButton1");
    selectButton.setAttribute("data-bs-toggle","dropdown");
    selectButton.setAttribute("aria-expanded","false");
    dropDownContainer.appendChild(selectButton);

    listElement = document.createElement('ul'); 
    listElement.setAttribute("class","dropdown-menu");
    listElement.setAttribute("aria-labelledby","dropdownMenuButton1");
    dropDownContainer.appendChild(listElement);

    document.getElementById('navbar').appendChild(dropDownContainer);

    numberOfListItems = listOfDataNames.length;
    for (i = 0; i < numberOfListItems ; ++i) {
        listItem = document.createElement('li');

        button = document.createElement('button');
        button.setAttribute("type","button");
        button.setAttribute("class","btn btn-light dropdown-item");
        button.setAttribute("onclick","select('"+listOfDataNames[i]+"')");
        button.innerHTML=listOfDataNames[i];
        
        listItem.appendChild(button)
        listElement.appendChild(listItem);
    }
}

function handleForm() {
	var stationsbool = document.getElementById("stations").checked;
	var plekjesbool = document.getElementById("plekjes").checked;
    var gr_routes_vl_bool = document.getElementById("gr_routes_vl").checked;
    var gr_routes_wa_bool = document.getElementById("gr_routes_wa").checked;
    var gr_12_bool = document.getElementById("gr_12").checked;
    var gr_12_slaapplaatsen_bool = document.getElementById("gr_12_slaapplaatsen").checked;

	map_123.off();
	map_123.remove();

	map_123 = setupMap();

    
    if (stationsbool) {
        displayFeatureList(stationdata, "stations");
    }

	if (plekjesbool) {
		displayFeatureList(alleplekjesdata, "alle plekjes");
	}
	
    if (gr_routes_vl_bool) {
		displayFeatureList(gr_routes_vl_data, "gr routes vl");
	}
    if (gr_routes_wa_bool) {
		displayFeatureList(gr_routes_wa_data, "gr routes wa");
	}

	if (gr_12_bool) {
		displayFeatureList(gr_12_data, "gr 12");
	}
    if (gr_12_slaapplaatsen_bool) {
		displayFeatureList(gr_12_slaapplaatsen_data, "gr 12 slaapplaatsen");
	}
}

function Action(){
    console.log("hllo")
}