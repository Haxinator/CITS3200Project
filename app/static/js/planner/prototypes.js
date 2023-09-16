import { removeFromArray, enrollInPeroid, addToRoot, updateInfoBar } from "./support.js";
import { unitConditionsMet } from "./preprequisites.js";
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
        this.enrollmentPeriod = "None";
        //split coreqs, as coreqs are a string. This makes me a bit sad. I'm sorry.
        this.corequisites = corequisites == null ? [] : corequisites.split(";");
        this.problems = [];

        this.addPrerequisites = () => {
            return this.prerequisites = prerequisitesList;
        };
        this.isEnrolled = () => { return this.enrollmentPeriod != "None"; };
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
        this.unitNames = [];
        this.hasNSUnits = false;
        this.nextID = 0;

        this.extractInformation = (unitInfo) => {
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
        };

        //extractNames (unitcodes) from unit info and place into unitNames
        this.extractNames = () => {
            let i = 0;

            for (let unit of this.unitInformation.values()) {
                this.unitNames[i] = unit.unitCode;
                i++;
            }
        };

        //makes a cell which represent a unit.
        this.makeCell = (innerHTML) => {
            let data = document.createElement("td");
            
            data.innerHTML = innerHTML;
            data.setAttribute("draggable", "true");
            data.classList.add("unit");

            return data;
        };

        this.makeUnit = (unitCode) => {
            let unit = this.makeCell(unitCode);

            unit.setAttribute("id", unitCode);
            removeFromArray(this.unitNames, unitCode);
            addUnitEvents(unit);

            return unit;
        }

        this.makeBroadening = () => {
            let broadening = this.makeCell("Broadening");
            let code = "B" + this.nextID;

            broadening.setAttribute("id", code);
            addUnitEvents(broadening);

            this.unitInformation.set(code,
                new Unit("broadening", code, 6, "broadening","BOTH", [],[],"",""));

            this.nextID++;

            return broadening;
        }

        this.makeElective = () => {
            let elective = this.makeCell("Elective");
            let code = "E"+this.nextID

            elective.setAttribute("id", code);
            addUnitEvents(elective);

            this.unitInformation.set(code,
                new Unit("elective", code, 6, "elective","BOTH", [],[],"",""));
                
            this.nextID++;

            return elective;
        }

        //makes a year row.
        this.makeYearRow = () => {
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
        };

        //makes a row
        this.makeRow = (semester) => {
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

            // console.log(container.id);

            //will loop through all units until unit names empty or
            //container is full.
            for (let i = 0; i < this.unitNames.length; i++) {
                let unitCode = this.unitNames[i];

                //check if unit placed in valid teaching period
                if (unitConditionsMet(unitCode, container)) {
                    enrollInPeroid(this.makeUnit(unitCode), container);
                    //-1 as element was removed to get actual index.
                    i -= 1;

                    if (container.childElementCount > 3) {
                        //if container full stop loop.
                        break;
                    }
                }
            }

            //while semester has less than 4 units
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
        };

        this.makeYearContainer = () => {
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
        };

        //makes a sensor
        this.makeSensor = () => {
            let sensor = document.createElement("div");
            let text = document.createElement("h2");
            sensor.setAttribute("class", "sensor");

            addSensorEvents(sensor);

            text.innerHTML = "drag a unit here to add a row!";
            sensor.appendChild(text);

            return sensor;
        };

        //makes the actual table.
        this.makeTable = (response) => {
            let table = document.createElement("table");

            table.setAttribute("id", "table");

            this.extractInformation(response);
            this.extractNames();

            let iterations = 0;

            while (this.unitNames.length > 0 && iterations < 10) {
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
        };
    }
}