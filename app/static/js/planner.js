var planner;

//------------------- INSTANCE FUNCTIONS -------------------------//

fetchCourseRequirementsAndBuildPlanner();
makeInfoBar();

// -------------------- FILTERS ----------------------------- //
getById("root").addEventListener("click", (e) =>{
    console.log(e.target.type);

    //if a unit wasn't clicked
    if(!e.target.classList.contains("unit") && !e.target.classList.contains("button"))
    {
        //removing highlighting and info bar text.
        updateInfoBar("");

        for(let unit of planner.unitInformation.values())
        {
            //overwrite all classes with unit.
            unitElement = getById(unit.unitCode);
            unitElement.setAttribute("class", "unit");
        }
    }
    
})

getById("SemesterFilter").addEventListener("click", () => {
    for(let unit of planner.unitInformation.values())
    {
        item = getById(unit.unitCode);

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

getById("ProblemFilter").addEventListener("click", () => {
    for(let unit of planner.unitInformation.values())
    {
        item = getById(unit.unitCode);

        if(unit.problems.length > 0)
        {
            //NS is red.
            item.classList.toggle("NS");
        } else {
            item.classList.remove("NS");
        }

        //BUG if problem added when problem filter on, problem filter
        //alternates between problem units.
    }
        updateInfoBar("Legend: red - prerequisite not met");
});

// ------------------- INFO BAR FUNCTIONS -----------------------//

function updateInfoBar(info){
    getById("infoBar").firstElementChild.innerHTML = info;
}

function makeInfoBar() {
    infoBar = document.createElement("div");
    infoBar.setAttribute("id", "infoBar");

    text = document.createElement("p");

    infoBar.appendChild(text);

    addToRoot(infoBar);
}

//--------------------SUPPORT FUNCTIONS--------------------------//

function unitExists(unitCode)
{
    return (planner.unitInformation.get(unitCode) != undefined);
}
//Dummy functions for testing
//creates fake units for testing.
// function makeUnitArray(size)
// {
//     const units = [];

//     for(let i = 0; i< size; i++)
//     {
//         units[i] = "unit00" + i;
//     }

//     return units;
// }

let array = [1, 2, 3, 4, 900];
removeFromArray(array, 1);
console.log(array);

//removes given value from given array and returns new array.
function removeFromArray(array, value)
{
    index = array.indexOf(value);
    array.splice(index, 1);
}

//adds given element to main
function addToRoot(element)
{
    document.getElementById("root").appendChild(element);
}

function getById(id)
{
    return document.getElementById(id);
}

//gets the enrollment period of given unit.
function getEnrollmentPeriod(unit)
{
    return unit.parentElement.id
}

//to add events to unit cells.
function addCellEvents(item)
{
    item.addEventListener("dragstart", dragstart);
    item.addEventListener("dragend", dragend);
    item.addEventListener("click", printInfo);
}

//formats unit information
function printUnitInfo(unitCode)
{
    let unit = planner.unitInformation.get(unitCode);
    let str = "";

    str += `Unit: ${unit.unitCode}<br>`;
    str += `Type: ${unit.type}<br>`;
    str += `Semester: ${unit.semester}<br>`;
    str += `Credit Points: ${unit.creditPoints}<br>`;
    str += `Semester: ${unit.semester}<br>`;
    str += `Prerequisites: ${unit.prerequisites}<br>`;
    str += `Point Requirements: ${unit.pointRequirements}<br>`;
    str += `enrollment Requirements: ${unit.enrollmentRequirements}`;

    return str;
}

// --------------- Prerequisite Met Functions ----------------//

//checks if all unit prerequisites met.
function unitConditionsMet(unitCode, container)
{
    correctSemester = canEnrollInPeriod(unitCode, container);
    correctPrequisites = unitPreRequisitiesMet(unitCode, container);

    return correctSemester && correctPrequisites;
}

//checks if unit prerequisites met
function unitPreRequisitiesMet(unitCode, container)
{
    let unit = planner.unitInformation.get(unitCode);
    let prerequisites = unit.prerequisites;
    let prerequisitesMet = true;

    //empty here for cleaner code
    //if problems still exist they will be added again
    //if problems are gone, they will be removed from array.
    unit.problems = [];

    for(let prerequisite of prerequisites)
    {
        let prerequisiteUnit = planner.unitInformation.get(prerequisite)

        if(planner.unitNames.indexOf(prerequisite) != -1)
        {
            //if prerequisite in name list then it isn't in planner
            return false;

        } else if (prerequisiteUnit != null){

            //provided the unit exists (ATAR units may not exist in plan)

            //used to be prerequ.period == container.id
            //extension allows function to be used after planner
            //initalisation.
            console.log(prerequisiteUnit)
            console.log("unit period " + prerequisiteUnit.enrollmentPeriod);
            console.log("contianer period", container.id);
            console.log(prerequisiteUnit.enrollmentPeriod >= container.id);

            if(prerequisiteUnit.enrollmentPeriod >= container.id && 
                prerequisiteUnit.enrollmentPeriod.length == container.id.length) {

                updateInfoBar(`${prerequisite} must be done before ${unitCode}!`);
                
                unit.problems.push(`${prerequisite} must be done before ${unitCode}!`);

                //if prerequisite is in this period or greater.
                prerequisitesMet = false;
            }
        }
    }

    return prerequisitesMet;
}

// -------------------- MISC SUPPORT FUNCTIONS --------------//

//enrolls unit into period
//unit is unit as represented in the DOM.
function enrollInPeroid(unit, container)
{
    planner.unitInformation.get(unit.id).enrollmentPeriod = container.id;
    container.append(unit);

}

//checks if unit can enroll in a given teaching period
//@param container is the teaching period
//@param unitCode is the code of the unit
function canEnrollInPeriod(unitCode, container)
{
    let unit = planner.unitInformation.get(unitCode);
    let semester = container.id;
    let unitAvaliability = unit.semester;

    //remove the year from semester
    semester = semester.substring(2,4);

    //if semester matched when unit is offered.
    return (unitAvaliability.includes(semester) ||
      (unitAvaliability == "BOTH" && !semester.includes("NS")));
}

//get container by period for cleaner code
function getByPeriod(year, period)
{
    return document.getElementById("Y" + year + period);
}

//get the teaching period a unit is offered for cleaner code.
function getPeriodOffered(id)
{
    return planner.unitInformation.get(id).semester;
}

//------------------- PROTOTYPES ----------------------------------//

//unit prototype
function Unit(code, creditPoints, type, semester, prerequisites, enrollmentReq, pointReq)
{
    this.unitCode = code;
    this.creditPoints = creditPoints;
    this.type = type;
    this.semester = semester;
    this.prerequisites = prerequisites;
    this.equivalences = []; //equivalent units to this one.
    this.enrollmentRequirements = enrollmentReq;
    this.pointRequirements = pointReq;
    this.enrollmentPeriod = "None";
    this.problems = [];

    this.addPrerequisites = () => {
        return this.prerequisites = prerequisitesList
    };
    this.isEnrolled = () => {return this.enrollmentPeriod != "None"};
}

//Table prototype contains all the functions necessary for making
//the unit planner.
function Table()
{
    this.year = 0; //may improve somehow.
    this.numberOfUnits = 0; //Number of units in the planner
    this.unitInformation = new Map();
    this.unitNames = [];
    this.hasNSUnits = false;

    this.extractInformation = (unitInfo) => {
        for(let i in unitInfo)
        {
            //if it has NS units
            if(unitInfo[i].semester == "NS")
            {
                this.hasNSUnits = true;
            }

            this.unitInformation.set(unitInfo[i].unitcode,
                                        new Unit(unitInfo[i].unitcode,
                                            unitInfo[i].credit_points,
                                            unitInfo[i].type,
                                            unitInfo[i].semester,
                                            unitInfo[i].unit_req,
                                            unitInfo[i].enrolment_req,
                                            unitInfo[i].points_req));
    
        }
    }

    //extractNames (unitcodes) from unit info and place into unitNames
    this.extractNames = () =>{
        let i = 0;

        for(let unit of this.unitInformation.values())
        {
            this.unitNames[i] = unit.unitCode;
            i++;
        }
    }

    //makes a cell which represent a unit.
    this.makeCell = (unitCode) =>{
        let data = document.createElement("td");
    
        data.innerHTML = unitCode;
        data.setAttribute("id", unitCode);
        data.setAttribute("draggable", "true");
        data.classList.add("unit");
        addCellEvents(data);

        removeFromArray(this.unitNames, unitCode);
    
        return data;
    }
    
    //makes a year row.
    this.makeYearRow = () => {
        let row = document.createElement("tr");
        let head = document.createElement("th");
        //h3 for UWA heading.
        let heading = document.createElement("h3");
        
        this.year++;
        heading.innerHTML = "Y" + this.year;
        head.appendChild(heading);
        head.setAttribute("colspan", "5");
        head.classList.add("heading");
        row.appendChild(head);
        
        return row;
    }

    //makes a row
    this.makeRow = (semester) =>{
        let row = document.createElement("tr");
        let container = document.createElement("div");
        let head = document.createElement("th");
        let heading = document.createElement("h4");
        let yearID = "Y" + this.year;

        heading.innerHTML = semester;
        head.appendChild(heading);
        head.classList.add("heading");
        container.setAttribute("id", yearID + semester);
        row.appendChild(head);
        row.appendChild(container);

        console.log(container.id);

        //will loop through all units until unit names empty or
        //container is full.
        for(let i = 0; i < this.unitNames.length; i++)
        {
                let unitCode = this.unitNames[i];

                //check if unit placed in valid teaching period
                if(unitConditionsMet(unitCode, container))
                {
                    enrollInPeroid(this.makeCell(unitCode), container)
                    //-1 as element was removed to get actual index.
                    i -= 1;

                    if(container.childElementCount > 3)
                    {
                        //if container full stop loop.
                        break;
                    }
                }


        }

        container.addEventListener("dragover", dragover);
        container.addEventListener("dragenter", dragenter);
        container.addEventListener("dragleave", dragleave);
        container.addEventListener("drop", drop);

        return row;
    }

    this.makeYearContainer = () =>{
        let container = document.createElement("div");

        container.appendChild(this.makeYearRow());
        if(this.hasNSUnits)
        {
            container.appendChild(this.makeRow("S1"));
            container.appendChild(this.makeRow("NS1"));
            container.appendChild(this.makeRow("S2"));
            container.appendChild(this.makeRow("NS2"));
        } else {
            container.appendChild(this.makeRow("S1"));
            container.appendChild(this.makeRow("S2"));
        }


        container.setAttribute("id", "Y" + this.year);

        return container
    }

    //makes a sensor
    this.makeSensor = () =>{    
        sensor = document.createElement("div");
        text = document.createElement("h2");
        sensor.setAttribute("class", "sensor");

        sensor.addEventListener("dragover", sensordragover);
        sensor.addEventListener("drop", appendRow);

        text.innerHTML = "drag a unit here to add a row!";
        sensor.appendChild(text);

        return sensor;
    }

    //makes the actual table.
    this.makeTable = (response) => {
        let table = document.createElement("table");

        table.setAttribute("id", "table");

        this.extractInformation(response);
        this.extractNames();

        let iterations = 0;

        while(this.unitNames.length > 0 && iterations < 50)
        {
            table.appendChild(this.makeYearContainer());
            iterations++;
        }

        if(iterations > 49)
        {
            alert("Error Generating Table. \nInfinite loop detected.\n"
                    + "Is a unit prerequisite missing?")
        }

        //make table then sensor underneath
        addToRoot(table);
        addToRoot(this.makeSensor());
        updateInfoBar("");
    }
}

//--------------------- EVENT LISTENER FUNCTIONS -------------------------//

//if your cursor (whilst dragging unit) is over the row add red lines.
function sensordragover(e)
{
    //prevent default to have drop cursor appear
    e.preventDefault();
    // e.target.classList.add("dragover");
}

//if your cursor (whilst dragging unit) is over the row add red lines.
function dragover(e)
{
    //prevent default to have drop cursor appear
    e.preventDefault();
    e.target.classList.add("dragover");
}

//if your cursor (whilst dragging unit) enters the row add red lines.
function dragenter(e)
{
    e.preventDefault();
    e.target.classList.add("dragover");
}

//if your cursor (whilst dragging unit) leaves the row, remove red lines.
function dragleave(e)
{
    e.target.classList.remove("dragover");
}

//When the item is dropped either place the unit in the row or swap it
//if the row is full with the unit user is hovering over.
function drop(e)
{
    //currentTarget used instead of target to prevent cells being dropped into cells.
    e.target.classList.remove("dragover");

    //element id that was stored in datatransfer when drag started
    let id = e.dataTransfer.getData('text/plain');
    //use to get the item
    let item = document.getElementById(id);

    //if hovering over container
    if(e.currentTarget == e.target)
    {
        //only add to sem if less than 4 units.
        //and semester is valid
        if(e.currentTarget.childElementCount < 4 && 
            canEnrollInPeriod(id, e.currentTarget))
        {
            // e.target.appendChild(item);
            enrollInPeroid(item, e.target);

        } else {
            if(e.currentTarget.childElementCount > 3)
            {
                updateInfoBar(`${e.currentTarget.id} is full`);
            }

            if(!canEnrollInPeriod(id, e.currentTarget))
            {
                updateInfoBar(`${id} only available in ${getPeriodOffered(id)}!`);
            }
        }

        //if container in last year empty delete year and years
        //inbetween that year, until units are found.
        while(getByPeriod(planner.year, "S1").childElementCount == 0 &&
            getByPeriod(planner.year, "S2").childElementCount == 0 &&
            getByPeriod(planner.year, "NS1").childElementCount == 0 &&
            getByPeriod(planner.year, "NS2").childElementCount == 0)
        {
            //deleete year and decrement year in planner
            getById("Y" + planner.year).remove();
            planner.year--;
        }

        //before swap see if currently dragged unit can be dropped
        //into that semester AND if the other unit user is swapping with
        //can go into the other semester
    } else if(canEnrollInPeriod(id, e.currentTarget) &&
                canEnrollInPeriod(e.target.id, item.parentElement)){

            // swap units
            //create clone elements.
            let targetClone = e.target.cloneNode(true);
            let itemClone = item.cloneNode(true); 

            //swap
            item.replaceWith(targetClone);
            e.target.replaceWith(itemClone);

            //show item
            itemClone.classList.remove("hide");

            //add the event listeners to swapped units.
            addCellEvents(targetClone);
            addCellEvents(itemClone);

            let targetUnit = planner.unitInformation.get(targetClone.id);
            let itemUnit = planner.unitInformation.get(itemClone.id);
            
            //make sure to update unit period
            targetUnit.enrollmentPeriod = targetClone.parentElement.id
            itemUnit.enrollmentPeriod = itemClone.parentElement.id
            
    } else {
        updateInfoBar(`${id} only available in ${getPeriodOffered(id)} <br>
                        ${e.target.id} only available in ${getPeriodOffered(e.target.id)}`);
    }

    //check if prerequisites met for all units.
    for(let unit of planner.unitInformation.values())
    {
        item = getById(unit.unitCode);

        unitConditionsMet(item.id, item.parentElement);
    }

    //show item
    item.classList.remove("hide");
}

//hide when dragging, the timeout ends hide when item released (or else hidden forever).
function dragstart(e)
{
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => e.target.classList.add("hide"), 0);
}

//When drag ends, reveal the item.
function dragend(e)
{
    //put item back if not drop occured at end of drag.
    e.target.classList.remove("hide");
}

//adds a new row underneath the last row in the table when item dropped beneath row.
function appendRow(e)
{
    if(planner.year < 10)
    {
        //remove lines
        // e.target.classList.remove("dragover");
        let table = document.getElementById("table");

        //get currently dragged unit.
        let unitCode = e.dataTransfer.getData('text/plain');
        let unit = getById(unitCode);

        table.appendChild(planner.makeYearContainer());

        let semester1 = document.getElementById("Y" + planner.year +"S1");
        let semester2 = document.getElementById("Y" + planner.year +"S2");
        let NS = document.getElementById("Y" + planner.year +"NS1");

        //see what period to enroll unit into
        if(canEnrollInPeriod(unitCode, semester1)){
            enrollInPeroid(unit, semester1);
        } else if (canEnrollInPeriod(unitCode, semester2)) {
            enrollInPeroid(unit, semester2);
        } else {
            enrollInPeroid(unit, NS);
        }

    } else {
        updateInfoBar("Course duration is a maximum of 10 years!");
    }
}

function printInfo(e)
{
    let unitCode = e.currentTarget.id;
    let unit = planner.unitInformation.get(unitCode);

    if(unit.problems.length > 0)
    {
        updateInfoBar(unit.problems);
    } else {
        updateInfoBar(printUnitInfo(unitCode));
    }

    for(let prerequisite of unit.prerequisites)
    {
        if(unitExists(prerequisite))
        {
            unitElement = getById(prerequisite);
            
            unitElement.classList.toggle("S2");
            //it would be nice to add an arrow going from prerequiste to unit.
        }
    }
}

// --------------------------- XHTTP ---------------------------------//

//LOL MY FUNCTIO NOW!
//Sends request to 4j for some awesome unit info.
//mmmm unit info.
//Creates a the planner based on that info.
function fetchCourseRequirementsAndBuildPlanner() {
    let major = specialization;
    let bridging = "NONE,"

    //check ATAR prerequisites, if not achieved include bridging unit
    if(isSpec == "no") {
        bridging = bridging.concat("MATH1722,")
    }
    if(isMeth == "no") {
        bridging = bridging.concat("MATH1721,")
    }
    if(isPhys == "no") {
        bridging = bridging.concat("PHYS1030,")
    }
    if(isChem == "no") {
        bridging = bridging.concat("CHEM1003,")
    }

    const xhttp = new XMLHttpRequest();
    let server = '/unitInformation/'.concat(major,"/bridging=",bridging);
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {
        response = JSON.parse(xhttp.responseText);
        planner = new Table();

        planner.makeTable(response);
    }
    xhttp.send();
}

function display_all() {
    const xhttp = new XMLHttpRequest();
    let server = '/display';
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {

        document.getElementById("nodes").innerHTML = this.response;

        alert("I worked!! TvT");
    }
    xhttp.send();
}


function display_unit() {
    chosen_unit = document.getElementById("chosen_unit").value;
    document.getElementById("unitchosen").innerHTML = chosen_unit;
}

//retrieve the requirements of given unit
function getUnitPrerequisites(unit) {
    const xhttp = new XMLHttpRequest();
    let server = '/prereqs/'.concat(unit);
    xhttp.open("GET", server, true);

    xhttp.onload = function (e) {
        prerequisites = JSON.parse(xhttp.responseText);
        console.log(prerequisites);
    }
    xhttp.send();
}

//retrieve the requirements of chosen unit 
function get_prereqs() {
    chosen_unit = document.getElementById("chosen_unit").value;
    
    const xhttp = new XMLHttpRequest();
    let server = '/prereqs/'.concat(chosen_unit);
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {
        document.getElementById('prereqs_head').innerHTML = "This unit requires the following:"
        document.getElementById('prereqs').innerHTML = xhttp.responseText;
    }
    xhttp.send();
}

//retrieve units that require chosen unit
function get_children() {
    chosen_unit = document.getElementById("chosen_unit").value;

    const xhttp = new XMLHttpRequest();
    let server = '/child_units/'.concat(chosen_unit);
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {
        document.getElementById('child_head').innerHTML = "This unit is a requirement for the following:"
        document.getElementById('child_units').innerHTML = xhttp.responseText;
    }
    xhttp.send();
}

//disable buttons if chosen unit field is empty
// const inputField = document.getElementById('chosen_unit');
// const prereqsBtn = document.getElementById('prereqs_btn');
// const childBtn = document.getElementById('child_btn');

// inputField.addEventListener('input', function() {
//     if (inputField.value.trim() === '') {
//         prereqsBtn.disabled = true;
//         childBtn.disabled = true;
//     } 
//     else {
//         prereqsBtn.disabled = false;
//         childBtn.disabled = false;
//     }
// });
