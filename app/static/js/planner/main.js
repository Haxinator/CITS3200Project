/*
* The main makes one function call:
* FetchMaxBroadening()
*
* It fetches the broadening units for the selected major
* then makes other XMLHttp requests to get the 
* course requirements and make the entire planner.
*
* this file contains all the XMLHTTP requests for the planner.
*
* As always, for anything confusing ask Josh.
*/

import {Table, sideBar} from "./classes.js";
import "./buttons.js" //adds button event listeners
import { makeExportPDFButton } from "./buttons.js";

//exports to be used for other files
export var planner;
export var optionsTable;
export var optionsBar;
export var statusBar;

//------------------- INSTANCE FUNCTIONS -------------------------//

fetchMaxBroadening();

// --------------------------- XHTTP ---------------------------------//


/*
 * Get option units then create option bar, option table and status bar.
 * if no option units, don't create option bar or table.
 * */
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

/*
 * Get all of the legal option unit combinations.
*/
function fetchOptionUnitCombinations() {
    let major = specialization;
    const xhttp = new XMLHttpRequest();
    let url = `/option_combos=${major}/year=${yearLevel}`;

    xhttp.open('GET', url, true);
    xhttp.onload = (e) => {
        let response = JSON.parse(xhttp.responseText);
        optionsBar.addOptionCombinations(response);
    }

    xhttp.send();
}

/*
* Fetches the max number of broadening units for the given specialization,
* which is passed to the planner. Generates the planner if http response was ok.
 */
function fetchMaxBroadening(){
    let major = specialization;

    const xhttp = new XMLHttpRequest();
    let server =`/get_max_broadening=${major}`;

    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {
        if (this.readyState == 4 && this.status == 200) {
            //if no error
            let response = JSON.parse(xhttp.responseText);

            fetchCourseRequirementsAndBuildPlanner(response[0]["max_broadening_pts"]);
        } else {
            //If server responded with error code.
            alert(`Internal Sever Error! \nTry again later.\nSorry for the inconvience.`);
        }
    }

    xhttp.send();
}

/*
 * Sends a request to neo4j to get the units offered for a major.
 * Creates the planner based on the response.
 * @param maxBroadening the max broadening units for the chosen specialization.
 */
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

            //remove broadening units depending on number of bridging units taken.
            planner.maxBroadening -= (6*bridgingCount);

            console.log(response);

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


