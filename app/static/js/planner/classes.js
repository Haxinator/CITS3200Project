/*
 * This file contains all the classes used for the planner.
 * It has three classes Unit, Table and Sidebar:
 *      o Unit stores the information for a unit.
 *      o Table creates the planner and stores information about the major. 
 *      o Sidebar creates the status, info, and option bars.
 * 
 * The main function of table is makeTable, which uses all of its methods to create the planner.
 * majority of the functions in Table support it in it's ability to create the planner.
 * 
 * The Table class is also used to store the option unit information and make
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


import { enrollInPeroid, addToRoot, allUnitsNotAdded, removeFromArray, getById, } from "./support.js";
import { unitConditionsMet, canEnrollInPeriod } from "./checks.js";
import { addUnitEvents, addContainerEvents, addSensorEvents, optionButtonEvent} from "./events.js";
import { optionsTable } from "./main.js";
import { makeExportPDFButton } from "./buttons.js";


//------------------- PROTOTYPES ----------------------------------//

export var infoBar;

/**
 * Used for creating the status, info and option bars.
 * Should really have been used as a super class for three other
 * class specifically for status, info and options.
 * 
 * Right now the class is a mess containing functions that
 * a status bar needs, but not an options bar, as an example.
 */
export class sideBar {
    constructor(){
        this.optionCombinations = null;
        this.currentOptionCombo = [];
        this.messageToDisplay = false;
        this.innerHTML = "";
        this.optionsDone = false;
        this.lastStatus = "";
    }

    // for updating content of info bar.
    addInfo(innerHTML) {
        // add message to storage.
        this.innerHTML += innerHTML + "<br>";
        this.messageToDisplay = true;
    }

    // clears all info bar info.
    clearInfo() {
        this.innerHTML = "";
        getById("infoBar").firstElementChild.innerHTML = "";
    }

    //displays info bar message.
    display() {
        if(this.messageToDisplay)
        {
            getById("infoBar").firstElementChild.innerHTML = this.innerHTML;
            // clear message from storage
            this.messageToDisplay = false;
            this.innerHTML = ""
        }
    }

    //update status bar status.
    //@param innerHTML is the text to display.
    updateStatus(innerHTML) {
        this.clearStatus();

        let text = document.createElement("p");
        text.innerHTML = innerHTML;
        getById("statusBar").append(text);
        this.lastStatus = innerHTML;
    }

    //displays last status bar update.
    //clears previous.
    displayStatus()
    {
        this.clearStatus();

        let text = document.createElement("p");
        text.innerHTML = this.lastStatus;
        getById("statusBar").append(text);

        if(this.lastStatus.includes("Done"))
        {
            makeExportPDFButton();
        }
    }

    //clears all text/legend from status bar.
    clearStatus()
    {
        //remove previous text/legend from status bar.
        while(getById("statusBar").lastChild)
        {
            getById("statusBar").lastChild.remove();
        }
    }

    //displays legend in status bar.
    //@param dictionary is a map containing the legend.
    displayLegend(dictionary) {

        this.clearStatus();

        for(let key of dictionary.keys())
        {
            let pair = document.createElement("span");
            let box = document.createElement("div");
            let text = document.createElement("p");

            box.classList.add("colourBox");
            // box.setAttribute("style", "backgroundcolor:" + dictionary.get(key));
            box.classList.add(dictionary.get(key));
            text.classList.add("key");
            text.innerHTML = key;

            pair.classList.add("pair");
            pair.appendChild(text);
            pair.appendChild(box);

            getById("statusBar").appendChild(pair);
        }
    }

    //creates the status bar.
    makeStatusBar() {
        let statusBar = document.createElement("div");
        let text = document.createElement("p");

        statusBar.setAttribute("id", "statusBar");
        statusBar.appendChild(text);
        
        addToRoot(statusBar);
    }

    //creates the info bar.
    makeInfoBar() {
        let infoBar = document.createElement("div");
        let text = document.createElement("p");

        infoBar.setAttribute("id", "infoBar");
        infoBar.appendChild(text);
        
        addToRoot(infoBar);
    }

    //--------------option bar functions----------------------//

    //stores the option combinations fetched from neo4j.
    //@param optionCombos the option combinations to store.
    addOptionCombinations(optionCombos) {
        this.optionCombinations = optionCombos;
    }

    //add unit to current option combination list
    //@unitCode is the unit code of the unit to add.
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

    //remove unit from the current option combination.
    //@param unitCode is the unit code to remove.
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
        let matches = [];

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
                matches.push(combination);
            }
        }

        //assume options are done
        let done = true;

        // for each option unit
        for(let unit of optionsTable.unitInformation.values())
        {

            let unitCode = unit.unitCode;

            let match = false;

            //for each combo current enrolled units match with
            for(let combo of matches)
            {
                //if option unit is a valid next option
                if(combo.includes(unitCode))
                {
                    match = true;
                }
            }

            //show if legal next option
            if(match)
            {
                getById(unitCode).classList.remove("otherHide");
                getById(unitCode).classList.add("unit");
            } else {
                //hide otherwise.
                getById(unitCode).classList.remove("unit");
                getById(unitCode).classList.add("otherHide");
            }

            let unitElement = getById(unitCode);

            // if option unit in option bar
            if(unitElement.parentElement.id.includes("op"))
            {
                // if there is a unit that is not hidden
                if(!unitElement.classList.contains("otherHide"))
                {
                    //this means the option combo isn't complete
                    done = false;
                }
            }

        }

        // update optionsDone
        this.optionsDone = done;

    }

    /**
     * Creates the options bar.
     * @param {*} table the options table used for the options bar.
     * @param {*} response the XMLhttp response from neo4j.
     */
    makeOptionsBar(table, response) {
        let optionsBar = document.createElement("div");
        let button = document.createElement("button");
        let tableElement = table.makeOptionsContainer(response);
        let arrow = document.createElement("div");

        let headingContainer = document.createElement("div");
        let heading = document.createElement("h3");

        heading.innerHTML = "Options";
        headingContainer.appendChild(heading);

        optionsBar.appendChild(headingContainer);

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

/**
 * This class is used to convert the objects retrieved from Neo4j to a
 * class that can be extended in JS if needed. To ensure data is formated as intended.
 */
export class Unit {
    constructor(name, code, creditPoints, type, semester, prerequisites, enrollmentReq, pointReq, corequisites, note) {
        this.name = name;
        this.unitCode = code;
        this.creditPoints = creditPoints;
        this.type = type;
        this.semester = semester;
        this.prerequisites = prerequisites;
        this.equivalences = []; //equivalent units to this one.
        this.enrollmentRequirements = enrollmentReq;
        this.pointRequirements = pointReq == null ? [] : pointReq.split(";");
        this.enrollmentPeriod = null;
        this.corequisites = corequisites == null ? [] : corequisites;
        this.problems = [];
        this.notes = note == null ? "" : note;
    }
    
    //true if unit is in the study plan. Useful for option units.
    //also other applications.
    isEnrolled() { 
        return this.enrollmentPeriod != null; 
    }

    // if unit has problems returns true,
    // false otherwise.
    // Problems being unmet requirements.
    hasProblems() {
        return this.problems.length > 0;
    }
}

/**
 * Table prototype contains all the functions necessary for making
 * the unit planner and the options bar.
 */
export class Table {
    constructor(maxBroadening) {
        this.year = 0; //next available year.
        this.numberOfUnits = 0; //Number of units in the planner
        this.creditPointsRequired = 192;
        this.maxBroadening = maxBroadening; // credit points
        this.unitInformation = new Map();
        this.hasNSUnits = false;
        this.nextID = 0;
    }

    /**
     * extracts unit information from database response adds it to unitInformation field.
     * @param {*} unitInfo response from neo4j containing unit information.
     */
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
                    unitInfo[i].corequisites,
                    unitInfo[i].notes));

        }
    }

    /**
     * makes a cell in the table which represent a unit.
     * @param {*} innerHTML text to show in the unit (unit code)
     * @returns a table cell.
     */
    makeCell(innerHTML) {
        let data = document.createElement("td");
        let text = document.createElement("p");


        text.classList.add("unitText");
        
        text.innerHTML = innerHTML;
        data.appendChild(text);
        data.setAttribute("draggable", "true");
        data.classList.add("unit");

        return data;
    };

    /**
     * Creates an option unit in the DOM.
     * @param {*} unitCode unit code.
     * @param {*} optionCode option unit A or B or etc.
     * @returns option unit element.
     */
    makeOptionUnit(unitCode, optionCode)
    {
        let unit = this.makeCell(unitCode);
        let unitInformation = this.unitInformation.get(unitCode);
        let watermark = document.createElement("span");

        watermark.classList.add("watermark");
        watermark.innerHTML = optionCode;

        unit.setAttribute("id", unitCode);
        unit.appendChild(watermark);

        addUnitEvents(unit);

        if(unitInformation.creditPoints == 0)
        {
            unit.classList.add("zeroPoint");
        } else if (unitInformation.creditPoints == 12) {
            unit.classList.add("TwelvePoint");
        }

        return unit;
    }

    /**
     * Makes a core unit
     * @param {*} unitCode unit code.
     * @returns unit element.
     */
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

    /**
     * Used for elective units and broadening units.
     * Could be extended for some other dummy unit.
     * @param {*} id used to identify the broadening unit.
     * @param {*} innerHTML "Broadening" or "Elective".
     * @returns A broadening or elective unit.
     */
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

    //makes a year heading row.
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

    /**
     * adds any unenrolled units into the teaching period if it's
     * requirements are met.
     * @param {*} container teaching period.
     */
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
                enrollInPeroid(this.makeDummyUnit("Broad","Broadening"), container);
            } else {
                // Adding electives break things atm when options units
                // get added to the planner credit points go into negatives.
                // enrollInPeroid(this.makeDummyUnit("E", "Elective"), container);
            }
        }
    }

    /**
     * enrolls a unit into a teaching period.
     * @param {*} unit unit element.
     * @param {*} container teaching period element.
     */
    enrollInPeroid(unit, container)
    {
        let unitInfo = this.unitInformation.get(unit.id);

        //subtract from creditPointsRequired
        this.creditPointsRequired -= unitInfo.creditPoints;
        unitInfo.enrollmentPeriod = container.id;
        
        container.append(unit);
    }

    /**
     * Adds option units to options bar
     * @param {*} container Option bar.
     */
    addUnitsToOptionsBar(container) {
        for(let unit of this.unitInformation.values())
        {
            let unitCode = unit.unitCode;

            //check if unit placed in valid teaching period
            if (canEnrollInPeriod(unitCode, container) && !unit.isEnrolled()) {
                let types = this.unitInformation.get(unitCode).type;
                // get group code.
                let targetSpec = `_${specialization}`;
                let position = types.search(targetSpec)-1;
                let optionCode = types[position];

                // console.log(position);

                let unitElement = this.makeOptionUnit(unitCode, optionCode);

                unitElement.classList.add("option");

                // addOptionUnitEvents(unitElement);
                container.append(unitElement);

                unit.enrollmentPeriod = container.id;
            }
        }
    }

    /**
     * Makes a row for either year or option units.
     * @param {*} containerID id of the teaching period DOM container.
     * @param {*} semester teaching period (NS1, NS2, S1, S2)
     * @returns 
     */
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

    /**
     * makes the container for an entire year.
     * creates S1,S2,NS1,NS2 DOM teaching periods and a year heading row.
     * @returns element containing S1, S2, NS1, NS2, and the year header.
     */
    makeYearContainer() {
        let container = document.createElement("div");

        container.appendChild(this.makeYearRow());

        this.makePeriods("Y" + this.year, container);

        container.setAttribute("id", "Y" + this.year);

        return container;
    }

    /**
     * Creates the teaching period elements. For options bar and planner.
     * @param {*} containerID distinguish between option and non-option container.
     * @param {*} container teaching period element.
     */
    makePeriods(containerID, container) {

        if (this.hasNSUnits) {

            if(container.id.includes("op"))
            {
                container.appendChild(this.makeRow(containerID, "S1"));
                container.appendChild(this.makeRow(containerID, "S2"));
                container.appendChild(this.makeRow(containerID, "NS"));
            } else {
                container.appendChild(this.makeRow(containerID, "S1"));
                container.appendChild(this.makeRow(containerID, "NS1"));
                container.appendChild(this.makeRow(containerID, "S2"));
                container.appendChild(this.makeRow(containerID, "NS2"));
            }
        } else {
            container.appendChild(this.makeRow(containerID, "S1"));
            container.appendChild(this.makeRow(containerID, "S2"));
        }
    }

    /**
     * Makes a sensor. The thing you drag units over to append a new row to the planner.
     * @returns the sensor element.
     */
    makeSensor() {
        let sensor = document.createElement("div");
        let text = document.createElement("h2");
        sensor.setAttribute("class", "sensor");

        addSensorEvents(sensor);

        text.innerHTML = "drag a unit here to add a row!";
        sensor.appendChild(text);

        return sensor;
    }

    /**
     * The core function that ties all the above methods together. It creates the planner.
     * @param {*} response XMLHttp response containing unit information.
     */
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

    /**
     * To create the options bar and add option units to it.
     * @param {*} response XMLHttp containing option unit information.
     * @returns option bar element.
     */
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