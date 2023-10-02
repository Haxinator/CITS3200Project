/*
* The main function that ties everything together.
* makes one function call:
* o FetchCourseRequirementsAndBuildPlanner.
*
* It fetches the course requirements and makes the entire planner.
*
* This file also contains all the event listeners for the buttons.
*
* As always, for anything confusing ask Josh.
*/

import {getById, updateInfoBar, clearHighlighting} from "./support.js";
import {Table, sideBar} from "./classes.js";

export var planner;
export var optionsTable;
export var optionsBar;
export var statusBar;

//------------------- INSTANCE FUNCTIONS -------------------------//

fetchCourseRequirementsAndBuildPlanner();

// fetchOptionUnitCombinations();
// makeInfoBar();

// -------------------- FILTERS ----------------------------- //

//change highlighting with zebra strips if unit has problems.
//get entire page if clicked on remove highlight and info bar.
getById("root").parentElement.parentElement.addEventListener("click", (e) =>{

    //if a unit wasn't clicked
    if(!e.target.classList.contains("unit") && !e.target.classList.contains("button"))
    {
        //removing highlighting and info bar text.
        updateInfoBar("");

        clearHighlighting();
    }
    
})

getById("SemesterFilter").addEventListener("click", () => {

    //clear last previous filters()
    clearHighlighting();

    for(let unit of planner.unitInformation.values())
    {
        let item = getById(unit.unitCode);

        if(unit.semester == "S1")
        {
            item.classList.toggle("blue");
        } else if(unit.semester == "S2"){
            item.classList.toggle("purple");
        } else if(unit.semester == "NS"){
            item.classList.toggle("magenta")
        }else {
            item.classList.toggle("yellow");
        }
    }

    //filter option units.
    for(let unit of optionsTable.unitInformation.values())
    {
        let item = getById(unit.unitCode);

        if(unit.semester == "S1")
        {
            item.classList.toggle("blue");
        } else if(unit.semester == "S2"){
            item.classList.toggle("purple");
        } else if(unit.semester == "NS"){
            item.classList.toggle("magenta")
        }else {
            item.classList.toggle("yellow");
        }
    }
        updateInfoBar("Legend: <br>Blue - S1, Purple - S2, Yellow - S1/S2, magenta - NS");
});

getById("corequisiteFilter").addEventListener("click", () =>
{
    clearHighlighting();

    for(let unit of planner.unitInformation.values())
    {
        let item = getById(unit.unitCode);

        if(unit.corequisites.length > 0)
        {
            item.classList.toggle("blue");
        } else {
            item.classList.remove("blue");
        }
    }

    //option units
    for(let unit of optionsTable.unitInformation.values())
    {
        let item = getById(unit.unitCode);

        if(unit.corequisites.length > 0)
        {
            item.classList.toggle("blue");
        } else {
            item.classList.remove("blue");
        }
    }

    updateInfoBar("Legend: Blue - Unit has Corequisites");
});

getById("prequisiteFilter").addEventListener("click", () =>
{
    clearHighlighting();

    for(let unit of planner.unitInformation.values())
    {
        let item = getById(unit.unitCode);

        if(unit.prerequisites.length > 0)
        {
            item.classList.toggle("yellow");
        } else {
            item.classList.remove("yellow");
        }
    }

    //options
    for(let unit of optionsTable.unitInformation.values())
    {
        let item = getById(unit.unitCode);

        if(unit.prerequisites.length > 0)
        {
            item.classList.toggle("yellow");
        } else {
            item.classList.remove("yellow");
        }
    }

    updateInfoBar("Legend: Yellow - Unit has Prequisites");
});

getById("pointRequirementsFilter").addEventListener("click", () =>
{
    clearHighlighting();

    for(let unit of planner.unitInformation.values())
    {
        let item = getById(unit.unitCode);

        if(unit.pointRequirements.length > 0)
        {
            item.classList.toggle("yellow");
        } else {
            item.classList.remove("yellow");
        }
    }

    for(let unit of optionsTable.unitInformation.values())
    {
        let item = getById(unit.unitCode);

        if(unit.pointRequirements.length > 0)
        {
            item.classList.toggle("yellow");
        } else {
            item.classList.remove("yellow");
        }
    }
    updateInfoBar("Legend: Yellow - Unit has point requirements");
});

// --------------------------- XHTTP ---------------------------------//


//get option units
//PLAN
//list all option units, when user selects one, look at combinations to view possible next unit
//combinations.
function fetchOptionUnits() {
    let major = specialization;
    const xhttp = new XMLHttpRequest();
    let url = `/option_units=${major}`;

    xhttp.open('GET', url, true);
    xhttp.onload = (e) => {
        let response = JSON.parse(xhttp.responseText);
        optionsBar = new sideBar();
        optionsTable = new Table();
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
            statusBar.updateStatus("Add Options");
        } else {
            //set options done to true. (since there are no options)
            optionsBar.optionsDone = true;
            
            statusBar.updateStatus("Done");
        }
    }
    xhttp.send();

}

//get option unit combinations.
//MY PLAN
function fetchOptionUnitCombinations() {
    let major = specialization;
    const xhttp = new XMLHttpRequest();
    let url = `/option_combos=${major}`;

    xhttp.open('GET', url, true);
    xhttp.onload = (e) => {
        let response = JSON.parse(xhttp.responseText);
        console.log(response);
        optionsBar.addOptionCombinations(response);
    }
    xhttp.send();
}

//LOL MY FUNCTIO NOW!
//Sends request to 4j for some awesome unit info.
//mmmm unit info.
//Creates a the planner based on that info.
function fetchCourseRequirementsAndBuildPlanner() {
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
            planner = new Table();
            planner.maxBroadening -= (6*bridgingCount);

            planner.makeTable(response);
            addUnitOptions(response);

            // to prevent async problems fetch options after.
            fetchOptionUnits();
        } else {
            alert(`Internal Sever Error! \nTry again later.\nSorry for the inconvience.`);
        }
    }
    xhttp.send();
}