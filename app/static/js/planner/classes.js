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


import { enrollInPeroid, addToRoot, updateInfoBar, allUnitsNotAdded } from "./support.js";
import { unitConditionsMet, canEnrollInPeriod } from "./checks.js";
import { addUnitEvents, addContainerEvents, addSensorEvents, addOptionUnitEvents } from "./events.js";


//------------------- PROTOTYPES ----------------------------------//

export class sideBar {
    constructor(){
        this.optionCombinations = null;
        this.currentOptionCombo = [];
    }

    makeInfoBar() {
        let infoBar = document.createElement("div");
        let text = document.createElement("p");

        infoBar.setAttribute("id", "infoBar");
        infoBar.appendChild(text);
        
        addToRoot(infoBar);
    }

    addOptionCombinations(optionCombos) {
        this.optionCombinations = optionCombos;
    }

    //add unit to list
    pushUnit(unitCode){
        //add unit to end of list.
        this.currentOptionCombo.push(unitCode);
    }

    //remove unit from list
    popUnit(unitCode){
        //pop won't work user can remove any unit.
        this.currentOptionCombo = removeFromArray(this.currentOptionCombo, unitCode);
    }

    //check combinations, show next valid legal units.
    //hide units that lead to an illegal combination.
    adjustOptionsBar() {
        //using currentCombo, see all valid next units.
        
    }

    //response is the options units json
    makeOptionsBar(table, response) {
        let optionsBar = document.createElement("div");

        optionsBar.setAttribute("id", "optionsBar");
        optionsBar.appendChild(table.makeOptionsContainer(response));

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

        unit.setAttribute("id", unitCode);
        addUnitEvents(unit);

        return unit;
    }

    // creates a dummy unit, for electives and broadening.
    makeDummyUnit(id, innerHTML) {
        let unit = this.makeCell(innerHTML);
        let code = id + this.nextID;

        unit.setAttribute("id", code);
        addUnitEvents(unit);

        this.unitInformation.set(code,
            new Unit(innerHTML, code, 6, innerHTML,"BOTH", [],[],null,null));

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
        for(let unit of this.unitInformation.values())
        {
            let unitCode = unit.unitCode;

            //check if unit placed in valid teaching period
            if (unitConditionsMet(unitCode, container, this) && !unit.isEnrolled()) {
                enrollInPeroid(this.makeUnit(unitCode), container);
            }
            if (container.childElementCount > 3) {
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
            console.log(unit);
            console.log(unit.semester, container.id)
            console.log(canEnrollInPeriod(unitCode, container));


            //check if unit placed in valid teaching period
            if (canEnrollInPeriod(unitCode, container) && !unit.isEnrolled()) {
                let unitElement = this.makeUnit(unitCode);

                addOptionUnitEvents(unitElement);
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
        let infoBar = new sideBar();

        this.extractInformation(response);
        infoBar.makeInfoBar();
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
        updateInfoBar("");
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