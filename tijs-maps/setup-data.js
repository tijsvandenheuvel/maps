// LOAD GEOJSON FILES

function loadJSON(file_name,callback) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', file_name, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }



function loadData(listOfFileNames,listOfDataNames){

    let listOfData =[]

    for (i=0;i<listOfFileNames.length;i++){

        file_name = listOfDataNames[i];
        
        loadJSON(listOfFileNames[i], (e) => {
            listOfData.push(JSON.parse(e));
        });
    }

    return listOfData

}

var stationdata;
var alleplekjesdata;

loadJSON("../data/stations.geojson", (e) => {
    stationdata = JSON.parse(e);
    //displayFeatureList(stationdata, "stations");
});

loadJSON("../data/alle_plekjes.geojson", (e) => {
    alleplekjesdata = JSON.parse(e);
    //displayFeatureList(stationdata, "stations");
});

// upload file
var fr = new FileReader();
fr.readAsText(document.getElementById('file').files[0]);
fr.onload = function(){displayFeatureList(JSON.parse(fr.result), 'gr')};


