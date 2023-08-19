var planner;

//------------------- INSTANCE FUNCTIONS -------------------------//

display_all(); //gimmie units.

//--------------------SUPPORT FUNCTIONS--------------------------//

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

array = [1, 2, 3, 4, 900];
array = removeFromArray(array, 900);
console.log(array);

//removes given value from given array and returns new array.
function removeFromArray(array, value)
{
    array = array.filter((item) => {return item !== value});

    return array
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
}

//------------------- PROTOTYPES ----------------------------------//

//unit prototype
function Unit(code, creditPoints, type, semester)
{
    this.unitCode = code;
    this.creditPoints = creditPoints;
    this.type = type;
    this.semester = semester;
    this.prerequisites = [];
    this.equivalences = []; //equivalent units to this one.

    this.addPrerequisites = () => {
        return this.prerequisites = prerequisitesList
    };
}

//Table prototype contains all the functions necessary for making
//the unit planner.
function Table()
{
    this.year = 0; //may improve somehow.
    this.numberOfUnits = 0; //Number of units in the planner
    this.unitInformationArray = [];
    this.unitNames = [];

    this.extractInformation = (unitInfo) => {
        for(let i in unitInfo)
        {
            this.unitInformationArray[i] = new Unit(unitInfo[i].unitcode,
                                            unitInfo[i].credit_points,
                                            unitInfo[i].type,
                                            unitInfo[i].semester);
    
            //only returns 1 unit before failing.
            // getUnitPrerequisites(unitInformationArray[i].unitCode);
        }
    }

    this.extractNames = () =>{
        for(let i = 0 ; i < this.unitInformationArray.length; i++)
        {
            this.unitNames[i] = this.unitInformationArray[i].unitCode;
        }
    }

    //makes a cell which represent a unit.
    this.makeCell = () =>{
        let data = document.createElement("td");
    
        data.innerHTML = this.unitNames[this.numberOfUnits];
        data.setAttribute("id", this.unitNames[this.numberOfUnits]);
        data.setAttribute("draggable", "true");
        addCellEvents(data);
    
        return data;
    }
    
    //makes a year row.
    this.makeYearRow = () => {
        let row = document.createElement("tr");
        let head = document.createElement("th");
        
        this.year++;
        head.innerHTML = "Y" + this.year;
        head.setAttribute("colspan", "5");
        row.appendChild(head);
        row.setAttribute("class","year");
        
        return row;
    }

    //makes a row
    this.makeRow = (semesterNum) =>{
        let row = document.createElement("tr");
        let container = document.createElement("div");
        let head = document.createElement("th");
        let semesterID = "S" + semesterNum;
        let yearID = "Y" + this.year;


        head.innerHTML = semesterID;
        container.setAttribute("id", yearID + semesterID);
        row.appendChild(head);
        row.appendChild(container);


        for(let i = 0; i<4; i++)
        {
            //if all units have been listed, don't list anymore
            if(this.numberOfUnits < this.unitNames.length)
            {
                container.appendChild(this.makeCell());
                this.numberOfUnits++;
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
        container.appendChild(this.makeRow(1));
        container.appendChild(this.makeRow(2));

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

        while(this.unitNames.length > this.numberOfUnits)
        {
            table.appendChild(this.makeYearContainer());
        }

        //make table then sensor underneath
        addToRoot(table);
        addToRoot(this.makeSensor());
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
        if(e.currentTarget.childElementCount < 4)
        {
            e.target.appendChild(item);
        }

        //if container in last year empty delete year and years
        //inbetween that year, until units are found.
        while(getById("Y" + planner.year + "S1").childElementCount == 0 &&
            getById("Y" + planner.year + "S2").childElementCount == 0)
        {
            //deleete year and decrement year in planner
            getById("Y" + planner.year).remove();
            planner.year--;
        }
    } else {
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
    //remove lines
    // e.target.classList.remove("dragover");
    let table = document.getElementById("table");

    //get currently dragged unit.
    let id = e.dataTransfer.getData('text/plain');
    let item = document.getElementById(id);

    table.appendChild(planner.makeYearContainer());

    //add dragged unit in S1 of the new row
    let semester1 = document.getElementById("Y" + planner.year +"S1");
    semester1.appendChild(item);
}

// --------------------------- XHTTP ---------------------------------//

//LOL MY FUNCTIO NOW!
//Sends request to 4j for some awesome unit info.
//mmmm unit info.
//Creates a the planner based on that info.
function display_all() {
    const xhttp = new XMLHttpRequest();
    let server = '/display';
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {

        response = JSON.parse(xhttp.responseText);
        console.log(response);

        document.getElementById("nodes").innerHTML = this.response;

        planner = new Table();

        planner.makeTable(response);

        // alert("I worked!! TvT");
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
const inputField = document.getElementById('chosen_unit');
const prereqsBtn = document.getElementById('prereqs_btn');
const childBtn = document.getElementById('child_btn');

inputField.addEventListener('input', function() {
    if (inputField.value.trim() === '') {
        prereqsBtn.disabled = true;
        childBtn.disabled = true;
    } 
    else {
        prereqsBtn.disabled = false;
        childBtn.disabled = false;
    }
});