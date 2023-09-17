/*
* The main function that ties everything together.
* makes only two function calls:
* o FetchCourseRequirementsAndBuildPlanner.
* o makeInfoBar
*
* The first fetches the course requirements and makes the entire planner.
* The seconds makes the info bar, could really be added to the first function.
*
* This file also contains all the event listeners for the buttons.
*
* As always, for anything confusing ask Josh.
*/

import {addToRoot, getById, updateInfoBar, clearHighlighting} from "./support.js";
import {Table} from "./classes.js";

export var planner;

//------------------- INSTANCE FUNCTIONS -------------------------//

fetchCourseRequirementsAndBuildPlanner();
fetchOptionUnits();
fetchOptionUnitCombinations();
makeInfoBar();

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
            item.classList.toggle("S1");
        } else if(unit.semester == "S2"){
            item.classList.toggle("S2");
        } else if(unit.semester == "NS"){
            item.classList.toggle("NS")
        }else {
            item.classList.toggle("S1S2");
        }
    }
        updateInfoBar("Legend: <br>Blue - S1, Green - S2, Yellow - S1/S2, red - NS");
});

getById("corequisiteFilter").addEventListener("click", () =>
{
    clearHighlighting();

    for(let unit of planner.unitInformation.values())
    {
        let item = getById(unit.unitCode);

        if(unit.corequisites.length > 0)
        {
            //NS is red.
            item.classList.toggle("S1");
        } else {
            item.classList.remove("S1");
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
            //NS is red.
            item.classList.toggle("S1S2");
        } else {
            item.classList.remove("S1S2");
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
            item.classList.toggle("S1S2");
        } else {
            item.classList.remove("S1S2");
        }
    }

    updateInfoBar("Legend: Yellow - Unit has point requirements");
});

// ------------------- INFO BAR FUNCTIONS -----------------------//


function makeInfoBar() {
    let infoBar = document.createElement("div");
    infoBar.setAttribute("id", "infoBar");

    let text = document.createElement("p");

    infoBar.appendChild(text);

    addToRoot(infoBar);
}

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
        console.log(response);
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
    let bridgingCount = 1; //always at least one broadening unit

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
    let server = '/unitInformation/'.concat(major,"/bridging=",bridging);
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {
        let response = JSON.parse(xhttp.responseText);
        planner = new Table();
        planner.maxBroadening -= (6*bridgingCount);

        planner.makeTable(response);
        addUnitOptions(response);
    }
    xhttp.send();
}