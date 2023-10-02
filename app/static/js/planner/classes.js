/*
 * This file contains all the classes used for the planner.
 * It has two classes Unit and Table:
 *      o Unit stores the information for a unit.
 *      o Table creates the planner and stores information about the major. 
 * 
 * The main function of table is makeTable, which uses all of its methods to create the planner.
 * majority of the functions in the table support it in it's ability to create the planner.
 * 
 * The table class is also used to store the option unit information and make
 * the options bar.
 * 
 * Unit's functions provide a clear way of checking unit information:
 *      o isEnrolled returns true if the unit has been enrolled in the planner,
 *          which means it's been added to the table (but not necessarily the DOM).
 *      o hasProblems returns true if the number of problems is greater than 0.
 *          a problem is a unit requirement that hasn't been met.
 * 
 * Functions from support.js are used to aid in coding, and to make code cleaner and easier to read.
 * Functions from events.js adds the event listeners to the relevant DOM elements.
 * The Function from checks.js checks if all the unit requirements were met. This is important
 * when we want to enroll a unit into a particular semester.
 * 
 * If you are unsure what anything does, please message Josh.
 * 
*/


import { enrollInPeroid, addToRoot, updateInfoBar, allUnitsNotAdded, removeFromArray, getById, unitExists } from "./support.js";
import { unitConditionsMet, canEnrollInPeriod } from "./checks.js";
import { addUnitEvents, addContainerEvents, addSensorEvents, optionButtonEvent} from "./events.js";
import { optionsTable } from "./main.js";


//------------------- PROTOTYPES ----------------------------------//

export var infoBar;

export class sideBar {
    constructor(){
        this.optionCombinations = null;
        this.currentOptionCombo = [];
        this.messageToDisplay = false;
        this.innerHTML = "";
        this.optionsDone = false;
    }

    // for updating content of info bar.
    addInfo(innerHTML) {
        // add message to storage.
        // getById("infoBar").firstElementChild.innerHTML += innerHTML;
        this.innerHTML += innerHTML + "<br>";
        this.messageToDisplay = true;
    }

    // clears all info bar info.
    clearInfo() {
        this.innerHTML = "";
        getById("infoBar").firstElementChild.innerHTML = "";
    }

    display() {
        if(this.messageToDisplay)
        {
            getById("infoBar").firstElementChild.innerHTML = this.innerHTML;
            // clear message from storage
            this.messageToDisplay = false;
            this.innerHTML = ""
        }
    }

    updateStatus(innerHTML) {
        getById("statusBar").firstElementChild.innerHTML = innerHTML;
    }

    makeStatusBar() {
        let statusBar = document.createElement("div");
        let text = document.createElement("p");

        statusBar.setAttribute("id", "statusBar");
        statusBar.appendChild(text);
        
        addToRoot(statusBar);
    }

    makeInfoBar() {
        let infoBar = document.createElement("div");
        let text = document.createElement("p");

        infoBar.setAttribute("id", "infoBar");
        infoBar.appendChild(text);
        
        addToRoot(infoBar);
    }

    //option bar functions

    addOptionCombinations(optionCombos) {
        this.optionCombinations = optionCombos;
    }

    //add unit to list
    pushUnit(unitCode){
        //if not in the list
        //used to check if full, but don't know in advance how many option units
        //needed.
        if(this.currentOptionCombo.indexOf(unitCode) == -1)
        {
            //add unit to end of list.
            this.currentOptionCombo.push(unitCode);
        }
    }

    //remove unit from list
    removeUnit(unitCode){
        //in case drag ends but unit wasn't added to container.
        if(this.currentOptionCombo.indexOf(unitCode) > -1)
        {
            removeFromArray(this.currentOptionCombo, unitCode);
        }
    }

    //check combinations, show next valid legal units.
    //hide units that lead to an illegal combination.
    adjustOptionsBar() {
        //using currentCombo, see all valid next units.
        // console.log(this.optionCombinations);
        // console.log(this.currentOptionCombo);
        let matches = [];

        // console.log(this.optionCombinations);
        console.log(this.currentOptionCombo);


        for(let combination of this.optionCombinations)
        {
            let match = true;

            // Does this combination contain all option units
            // this user has currently enrolled in
            for(let element of this.currentOptionCombo)
            {
                // if not, set match to false
                if(!combination.includes(element))
                {
                    match = false;
                }
            }

            // print matching combinations
            if(match)
            {
                console.log(combination);
                matches.push(combination);
            }
        }

        // only one match if done
        if(matches.length < 2) {
            this.optionsDone = true;
        } else {
            this.optionsDone = false;
        }

        // for each option unit
        for(let unit of optionsTable.unitInformation.values())
        {

            let unitCode = unit.unitCode;

            let match = false;
            // console.log(unitCode)

            //for each combo current enrolled units match with
            for(let combo of matches)
            {
                // console.log(combo);
                // console.log(combo.includes(unitCode));

                //if option unit is a valid next option
                if(combo.includes(unitCode))
                {
                    match = true;
                }
            }

            //show if legal next option
            if(match)
            {
                // getById(unitCode).classList.remove("hide");
                getById(unitCode).classList.remove("otherHide");
                getById(unitCode).classList.add("unit");
            } else {
                //hide otherwise.
                getById(unitCode).classList.remove("unit");
                // getById(unitCode).classList.add("hide");
                // amazingly doesn't work UNLESS it's not called "hide"?!??!?!
                // took me 50 minutes to figure that out.
                getById(unitCode).classList.add("otherHide");
            }

        }
    }

    //response is the options units json
    makeOptionsBar(table, response) {
        let optionsBar = document.createElement("div");
        let button = document.createElement("button");
        let tableElement = table.makeOptionsContainer(response);
        let arrow = document.createElement("div");

        let heading = document.createElement("h3");

        heading.innerHTML = "Options";
        optionsBar.appendChild(heading);

        arrow.classList.add("leftArrow");
        button.classList.add("noMargin");
        button.appendChild(arrow);

        optionButtonEvent(button);
        optionsBar.setAttribute("id", "optionsBar");
        optionsBar.appendChild(button);
        optionsBar.appendChild(tableElement);

        addToRoot(optionsBar);
    }

}

export class Unit {
    constructor(name, code, creditPoints, type, semester, prerequisites, enrollmentReq, pointReq, corequisites) {
        this.name = name;
        this.unitCode = code;
        this.creditPoints = creditPoints;
        this.type = type;
        this.semester = semester;
        this.prerequisites = prerequisites;
        this.equivalences = []; //equivalent units to this one.
        this.enrollmentRequirements = enrollmentReq;
        //split points, because they're a string. This makes me a bit sad. I'm sorry.
        this.pointRequirements = pointReq == null ? [] : pointReq.split(";");
        this.enrollmentPeriod = null;
        //split coreqs, as coreqs are a string. This makes me a bit sad. I'm sorry.
        this.corequisites = corequisites == null ? [] : corequisites;
        this.problems = [];
    }
    
    //true if user is enrolled, false otherwise.
    isEnrolled() { 
        return this.enrollmentPeriod != null; 
    }

    // if unit has problems returns true,
    // false otherwise.
    hasProblems() {
        return this.problems.length > 0;
    }
}

//Table prototype contains all the functions necessary for making
//the unit planner.
export class Table {
    constructor() {
        this.year = 0; //may improve somehow.
        this.numberOfUnits = 0; //Number of units in the planner
        this.creditPointsRequired = 192;
        this.maxBroadening = 24; // credit points
        this.unitInformation = new Map();
        this.hasNSUnits = false;
        this.nextID = 0;
    }

    // extracts unit information from database response.
    // adds it to unitInformation field.
    extractInformation(unitInfo) {

        console.log(unitInfo);

        for (let i in unitInfo) {
            //if it has NS units
            if (unitInfo[i].semester == "NS") {
                this.hasNSUnits = true;
            }


            this.unitInformation.set(unitInfo[i].unitcode,
                new Unit(unitInfo[i].unitname,
                    unitInfo[i].unitcode,
                    unitInfo[i].credit_points,
                    unitInfo[i].type,
                    unitInfo[i].semester,
                    unitInfo[i].unit_req,
                    unitInfo[i].enrolment_req,
                    unitInfo[i].points_req,
                    unitInfo[i].corequisites));

        }
    }

    //makes a cell which represent a unit.
    makeCell(innerHTML) {
        let data = document.createElement("td");
        
        data.innerHTML = innerHTML;
        data.setAttribute("draggable", "true");
        data.classList.add("unit");

        return data;
    };

    // makes a unit cell
    makeUnit(unitCode) {
        let unit = this.makeCell(unitCode);
        let unitInformation = this.unitInformation.get(unitCode);

        unit.setAttribute("id", unitCode);
        addUnitEvents(unit);

        if(unitInformation.creditPoints == 0)
        {
            unit.classList.add("zeroPoint");
        } else if (unitInformation.creditPoints == 12) {
            unit.classList.add("TwelvePoint");
        }

        return unit;
    }

    // creates a dummy unit, for electives and broadening.
    makeDummyUnit(id, innerHTML) {
        let unit = this.makeCell(innerHTML);
        let code = id + this.nextID;

        unit.setAttribute("id", code);
        addUnitEvents(unit);

        this.unitInformation.set(code,
            new Unit(innerHTML, code, 6, innerHTML,"BOTH", [[],[]],[],null,null));

        this.nextID++;

        return unit;
    }

    //makes a year row.
    makeYearRow() {
        let row = document.createElement("tr");
        let head = document.createElement("th");
        //h3 for UWA heading.
        let heading = document.createElement("h3");

        this.year++;
        heading.innerHTML = "Year " + this.year;
        head.appendChild(heading);
        head.setAttribute("colspan", "5");
        head.classList.add("heading");
        row.appendChild(head);

        return row;
    }

    addUnitsToPlanner(container) {
        //will loop through all units considered
        //and container is full.
        let creditPointsAvailable = 24;

        for(let unit of this.unitInformation.values())
        {
            let unitCode = unit.unitCode;

            //check if unit placed in valid teaching period
            if (!unit.isEnrolled() && unitConditionsMet(unitCode, container, this)) {
                // enroll then subtract credit points from those available for the semester.
                enrollInPeroid(this.makeUnit(unitCode), container);
                creditPointsAvailable -= unit.creditPoints;
            }
            if (creditPointsAvailable < 1) {
                //if container full stop loop.
                break;
            }
        }

        //while semester has less than 4 units and not NS
        while(container.childElementCount < 4 && this.creditPointsRequired > 0 &&
                !container.id.includes("NS") && this.maxBroadening > 0) {

            // if max broadening hasn't been met
            if(this.maxBroadening > 0)
            {
                this.maxBroadening -= 6;
                enrollInPeroid(this.makeDummyUnit("B","Broadening"), container);
            } else {
                // Adding electives break things atm when options units
                // get added to the planner credit points go into negatives.
                // enrollInPeroid(this.makeDummyUnit("E", "Elective"), container);
            }
        }
    }

    enrollInPeroid(unit, container)
    {
        let unitInfo = this.unitInformation.get(unit.id);

        //subtract from creditPointsRequired
        this.creditPointsRequired -= unitInfo.creditPoints;
        unitInfo.enrollmentPeriod = container.id;
        
        container.append(unit);
    }

    //adds option units to options bar
    addUnitsToOptionsBar(container) {
        for(let unit of this.unitInformation.values())
        {
            let unitCode = unit.unitCode;

            //check if unit placed in valid teaching period
            if (canEnrollInPeriod(unitCode, container) && !unit.isEnrolled()) {
                let unitElement = this.makeUnit(unitCode);

                unitElement.classList.add("option");

                // addOptionUnitEvents(unitElement);
                container.append(unitElement);

                unit.enrollmentPeriod = container.id;
            }
        }
    }

    //makes a row
    //containerID either year or options
    makeRow(containerID, semester) {
        let row = document.createElement("tr");
        let container = document.createElement("div");
        let head = document.createElement("th");
        let heading = document.createElement("h4");

        heading.innerHTML = semester;
        head.appendChild(heading);
        head.classList.add("heading");
        container.setAttribute("id", containerID + semester);
        row.appendChild(head);
        row.appendChild(container);

        //is this a row in option bar or the planner.
        if(containerID.includes("op"))
        {
            this.addUnitsToOptionsBar(container);
        } else {
            this.addUnitsToPlanner(container);
        }

        addContainerEvents(container);

        return row;
    }

    // makes the container for an entire year.
    // creates S1,S2,N1,N2 and a year heading row.
    makeYearContainer() {
        let container = document.createElement("div");

        container.appendChild(this.makeYearRow());

        this.makePeriods("Y" + this.year, container);

        container.setAttribute("id", "Y" + this.year);

        return container;
    }

    makePeriods(containerID, container) {

        if (this.hasNSUnits) {
            container.appendChild(this.makeRow(containerID, "S1"));
            container.appendChild(this.makeRow(containerID, "NS1"));
            container.appendChild(this.makeRow(containerID, "S2"));
            container.appendChild(this.makeRow(containerID, "NS2"));
        } else {
            container.appendChild(this.makeRow(containerID, "S1"));
            container.appendChild(this.makeRow(containerID, "S2"));
        }
    }

    //makes a sensor
    //the thing you drag units over to append a new row to the planner.
    makeSensor() {
        let sensor = document.createElement("div");
        let text = document.createElement("h2");
        sensor.setAttribute("class", "sensor");

        addSensorEvents(sensor);

        text.innerHTML = "drag a unit here to add a row!";
        sensor.appendChild(text);

        return sensor;
    }

    //The core function that ties all the above methods together.
    //It creates the planner.
    makeTable(response) {
        let table = document.createElement("table");
        let iterations = 0;
        infoBar = new sideBar();

        infoBar.makeInfoBar();

        this.extractInformation(response);
        table.setAttribute("id", "table");

        // if course duration not exceeded.
        // and there are units still to be added.
        while (allUnitsNotAdded() && iterations < 10) {
            table.appendChild(this.makeYearContainer());
            iterations++;
        }

        //unit plan should not exceed 10 years.
        if (iterations > 9) {
            alert("Error Generating Table. \nInfinite loop detected.\n"
                + "Is a unit prerequisite missing?");
        }

        //make table then sensor underneath
        addToRoot(table);
        addToRoot(this.makeSensor());
        infoBar.clearInfo();
    }

    //for the option units side bar.
    makeOptionsContainer(response) {
        let table = document.createElement("table");
        let container = document.createElement("div");


        container.setAttribute("id", "options");
        this.extractInformation(response);
        this.makePeriods("op", container);
        table.appendChild(container);

        return table;
    }
}