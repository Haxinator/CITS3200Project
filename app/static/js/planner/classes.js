import { enrollInPeroid, addToRoot, updateInfoBar, allUnitsNotAdded } from "./support.js";
import { unitConditionsMet } from "./checks.js";
import { addUnitEvents, addContainerEvents, addSensorEvents } from "./events.js";


//------------------- PROTOTYPES ----------------------------------//

//unit prototype
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
        this.corequisites = corequisites == null ? [] : corequisites.split(";");
        this.problems = [];
    }

    addPrerequisites() {
            return this.prerequisites = prerequisitesList;
        }
    
    //true if user is enrolled, false otherwise.
    isEnrolled() { return this.enrollmentPeriod != null; }

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
        this.maxBroadening = 24;
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
        // removeFromArray(this.unitNames, unitCode);
        addUnitEvents(unit);

        return unit;
    }

    // makes a broadening unit cell
    makeBroadening() {
        let broadening = this.makeCell("Broadening");
        let code = "B" + this.nextID;

        broadening.setAttribute("id", code);
        addUnitEvents(broadening);

        this.unitInformation.set(code,
            new Unit("broadening", code, 6, "broadening","BOTH", [],[],null,null));

        this.nextID++;

        return broadening;
    }

    // makes an elective unit cell
    makeElective() {
        let elective = this.makeCell("Elective");
        let code = "E"+this.nextID

        elective.setAttribute("id", code);
        addUnitEvents(elective);

        this.unitInformation.set(code,
            new Unit("elective", code, 6, "elective","BOTH", [],[],null,null));
            
        this.nextID++;

        return elective;
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

    //makes a row
    makeRow(semester) {
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

        //will loop through all units considered
        //and container is full.
        for(let unit of this.unitInformation.values())
        {
            let unitCode = unit.unitCode;

            //check if unit placed in valid teaching period
            if (unitConditionsMet(unitCode, container) && !unit.isEnrolled()) {
                enrollInPeroid(this.makeUnit(unitCode), container);
            }
            if (container.childElementCount > 3) {
                //if container full stop loop.
                break;
            }
        }

        //while semester has less than 4 units and not NS
        while(container.childElementCount < 4 && this.creditPointsRequired > 0 &&
                !container.id.includes("NS")) {

            // if max broadening hasn't been met
            if(this.maxBroadening > 0)
            {
                this.maxBroadening -= 6;
                enrollInPeroid(this.makeBroadening(), container);
            } else {
                enrollInPeroid(this.makeElective(), container);
            }
        }

        addContainerEvents(container);

        return row;
    }

    // makes the container for an entire year.
    // creates S1,S2,N1,N2 and a year heading row.
    makeYearContainer() {
        let container = document.createElement("div");

        container.appendChild(this.makeYearRow());

        if (this.hasNSUnits) {
            container.appendChild(this.makeRow("S1"));
            container.appendChild(this.makeRow("NS1"));
            container.appendChild(this.makeRow("S2"));
            container.appendChild(this.makeRow("NS2"));
        } else {
            container.appendChild(this.makeRow("S1"));
            container.appendChild(this.makeRow("S2"));
        }


        container.setAttribute("id", "Y" + this.year);

        return container;
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
        this.extractInformation(response);
        let iterations = 0;

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
}