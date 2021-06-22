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

	map_123.off();
	map_123.remove();

	map_123 = setupMap();

	if (plekjesbool) {
		displayFeatureList(alleplekjesdata, "alleplekjes");
	}
	if (stationsbool) {
		displayFeatureList(stationdata, "stations");
	}
}