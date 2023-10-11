/*
* The main function that ties everything together.
* makes one function call:
* o FetchCourseRequirementsAndBuildPlanner.
*
* It fetches the course requirements and makes the entire planner.
*
* Contains XMLHTTP requests for the planner.
*
* As always, for anything confusing ask Josh.
*/

import {Table, sideBar} from "./classes.js";
import "./buttons.js"
import { makeExportPDFButton } from "./buttons.js";

export var planner;
export var optionsTable;
export var optionsBar;
export var statusBar;

//------------------- INSTANCE FUNCTIONS -------------------------//

fetchMaxBroadening();
// fetchCourseRequirementsAndBuildPlanner();

// --------------------------- XHTTP ---------------------------------//


//get option units
//list all option units, when user selects one, 
//look at combinations to show user next legal unit
//for that combination.
function fetchOptionUnits() {
    let major = specialization;
    const xhttp = new XMLHttpRequest();
    let url = `/option_units=${major}/year=${yearLevel}`;

    xhttp.open('GET', url, true);
    xhttp.onload = (e) => {
        let response = JSON.parse(xhttp.responseText);
        //add option units as choices for treeview
        addUnitOptions(response);
        
        optionsBar = new sideBar();
        optionsTable = new Table(0);
        statusBar = new sideBar();

        console.log(response);
        statusBar.makeStatusBar();

        // if there are option units make the options bar.
        if(response.length != 0)
        {
            //get legal option unit combinations and store them.
            fetchOptionUnitCombinations();

            //make the options bar.
            optionsBar.makeOptionsBar(optionsTable, response);
            statusBar.updateStatus("Add Option Units");
        } else {
            //set options done to true. (since there are no options)
            optionsBar.optionsDone = true;
            
            statusBar.updateStatus("Done");
            makeExportPDFButton();
        }
    }

    xhttp.send();
}

//get option unit combinations.
function fetchOptionUnitCombinations() {
    let major = specialization;
    const xhttp = new XMLHttpRequest();
    let url = `/option_combos=${major}/year=${yearLevel}`;

    xhttp.open('GET', url, true);
    xhttp.onload = (e) => {
        let response = JSON.parse(xhttp.responseText);
        console.log(response);
        optionsBar.addOptionCombinations(response);
    }

    xhttp.send();
}

function fetchMaxBroadening(){
    let major = specialization;

    const xhttp = new XMLHttpRequest();
    let server =`/get_max_broadening=${major}`;

    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {
        if (this.readyState == 4 && this.status == 200) {
            //if no error
            let response = JSON.parse(xhttp.responseText);
            // console.log(response[0]["max_broadening_pts"]);

            fetchCourseRequirementsAndBuildPlanner(response[0]["max_broadening_pts"]);
        } else {
            //If server responded with error code.
            alert(`Internal Sever Error! \nTry again later.\nSorry for the inconvience.`);
        }
    }

    xhttp.send();
}

//LOL MY FUNCTIO NOW!
//Sends request to 4j for some awesome unit info.
//mmmm unit info.
//Creates a the planner based on that info.
function fetchCourseRequirementsAndBuildPlanner(maxBroadening) {
    let major = specialization;
    let bridging = "NONE,";
    let bridgingCount = 0; 

    //check ATAR prerequisites, if not achieved include bridging unit
    if(isSpec == "no") {
        bridging = bridging.concat("MATH1722,");
        bridgingCount++;
    }
    if(isPhys == "no") {
        bridging = bridging.concat("PHYS1030,");
        bridgingCount++;
    }
    if(isChem == "no") {
        bridging = bridging.concat("CHEM1003,");
        bridgingCount++;
    }

    const xhttp = new XMLHttpRequest();
    let server = '/unitInformation/'.concat(major,"/bridging=",bridging,"/year=", yearLevel);
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {
        if (this.readyState == 4 && this.status == 200) {
            //if no error
            let response = JSON.parse(xhttp.responseText);
            planner = new Table(maxBroadening);
            planner.maxBroadening -= (6*bridgingCount);

            planner.makeTable(response);
            addUnitOptions(response);

            // to prevent async problems fetch options after.
            fetchOptionUnits();
        } else {
            //If server responded with error code.
            alert(`Internal Sever Error! \nTry again later.\nSorry for the inconvience.`);
        }
    }

    xhttp.send();
}


