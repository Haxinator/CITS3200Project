/* 
 * support.js contains support functions which are used by other files to simplify code,
 * aid in modularisation and make code easier to read.
 * 
 * Any questions ask Josh.
*/

import { optionsTable, optionsBar, planner, statusBar } from "./main.js";
import { unitConditionsMet } from "./checks.js";
import { infoBar } from "./classes.js";
import { makeExportPDFButton } from "./buttons.js";

/**
 * With the enrollment period provided, this function gets all units
 * currently enrolled in this period, retrieves their credit points and
 * adds them to totalCreditPoints which is returned at the end of the function.
 * @param semester the enrollment period
 * @returns total number of credit points for units currently enrolled in this period.
 */
export function creditPointsInPeriod(semester) {
    let totalCreditPoints = 0;

    for(let unitElement of semester.children)
    {
        //get unit credit points and convert it to int. Add to total.
        totalCreditPoints += parseInt(getUnitInformation(unitElement.id).creditPoints);
    }

    return totalCreditPoints;
}

//adds given element to the root element (the main element).
export function addToRoot(element)
{
    document.getElementById("root").appendChild(element);
}

/**
 * Checks if all units have been enrolled into the planner.
 * @returns true if all units have be enrolled, false otherwise.
 */
export function allUnitsNotAdded()
{
    let allUnitsNotAdded = false;

    for(let unit of planner.unitInformation.values())
    {
        // if there is a unit that hasn't been enrolled
        if(!unit.isEnrolled())
        {
            // all units haven't been added.
            allUnitsNotAdded = true;
        }  
    }

    return allUnitsNotAdded;
}

/**
 * Short hand for document.getElementById(id).
 * @param {*} id the id of the element.
 * @returns element the id belongs to.
 */
export function getById(id)
{
    return document.getElementById(id);
}

/**
 * removes given value from given array.
 * @param {*} array the array to remove an element from
 * @param {*} value element to remove from list.
 */
export function removeFromArray(array, value)
{
    let index = array.indexOf(value);
    array.splice(index, 1);
    
    //if no elements left make array empty.
    if(array == undefined) { 
        array = [];
    }

}

/**
 * Enrolls unit into a given period in the DOM. 
 * Unit is unit as represented in the DOM.
 * @param {*} unit unit element to enroll into period
 * @param {*} container period element to enroll unit into.
 */
export function enrollInPeroid(unit, container)
{
    let unitInfo = getUnitInformation(unit.id);

    //subtract from creditPointsRequired
    planner.creditPointsRequired -= unitInfo.creditPoints;
    unitInfo.enrollmentPeriod = container.id;
    
    container.append(unit);

}

/**
 * Gets a map containing the unit information for a given unit.
 * @param {*} unitCode unit code of the unit
 * @returns the unit information map.
 */
export function getUnitInformation(unitCode) {

    // have to wait until both planner and optionsBar exist.
    // that's why making sure they're not undefined.
    // as they are done async.
    if(planner != undefined && planner.unitInformation.has(unitCode))
    {
        return planner.unitInformation.get(unitCode);
    } else if(optionsTable != undefined && optionsTable.unitInformation.has(unitCode)) {
        return optionsTable.unitInformation.get(unitCode);
    }
}

/**
 * Get container by period for cleaner code
 * @param {*} year year of teaching period.
 * @param {*} period teaching period.
 * @returns Teaching period element from DOM.
 */
export function getByPeriod(year, period)
{
    return document.getElementById("Y" + year + period);
}

/**
 * Get the teaching period a unit is offered for cleaner code.
 * @param {*} id unit code for given unit.
 * @returns teaching period the given unit is offered
 */
export function getPeriodOffered(id)
{
    return getUnitInformation(id).semester;
}

/**
 * update the text contents of the info bar to the info provided.
 * @param {*} info information you want to display on the info bar.
 */
export function updateInfoBar(info){
    if(getById("infoBar") != undefined)
    {
        getById("infoBar").firstElementChild.innerHTML = info;
    }    
}

/**
 * If given unit exists in the major. Useful if a unit is a prerequiste
 * and yet not in the major (that way we ignore it).
 * @param {*} unitCode unit code of given unit.
 * @returns true if unit is in major, false otherwise.
 */
export function unitExists(unitCode)
{
    return (getUnitInformation(unitCode) != undefined);
}

/**
 * Checks if a given character is an alphabetical character.
 * @param {*} char character provided
 * @returns true if char is an alphabetical character, false otherwise.
 */
export function isAlpha(char)
{
    //if lower case different to uppercase, it is a character.
    return char.toLowerCase() != char.toUpperCase();
}

/**
 * Highlights the given unit in red if it has problems.
 * @param {*} unit unit to highlight
 */
export function highlightIfUnitHasProblems(unit)
{
    // unit in DOM
    let unitElement = getById(unit.unitCode);

    if(unit.hasProblems())
    {
        unitElement.classList.add("magenta");
    } else{
        unitElement.classList.remove("magenta");
    }
}

/**
 * Checks if given element exists in DOM.
 * @param {*} elementId element to check for
 * @returns true if element in DOM, false otherwise.
 */
export function inDOM(elementId){
    return getById(elementId) != null
}

/**
 * Returns last character of string provided.
 * @param {*} string string provided
 * @returns last character in string provided.
 */
export function getLastCharacter(string)
{
    return string.slice(-1);
}

/**
 * Checks if given unit is an option unit.
 * @param {*} unitCode unit code of unit.
 * @returns true if unit is option and false otherwise.
 */
export function isOption(unitCode)
{
    // if option table was created.
    if(optionsTable != undefined)
    {
        return optionsTable.unitInformation.has(unitCode);
    } else {
        // can't be option if option table doesn't exist
        return false
    }

}

/**
 * Clears all highlighting in DOM (except problems)
 */
export function clearHighlighting()
{
    //clear planner highlighting
    for(let unit of planner.unitInformation.values())
    {
        //overwrite all classes with unit.
        let unitElement = getById(unit.unitCode);

        if(unit.creditPoints == 0)
        {
            // if zero point unit add back styling.
            unitElement.setAttribute("class", "unit zeroPoint");            
        } else if (unit.creditPoints == 12) {
            unitElement.setAttribute("class", "unit twelvePoint");
        } else {
            unitElement.setAttribute("class", "unit");            
        }


        if(unit.problems.length > 0)
        {
            unitElement.classList.add("magenta");
        }
    }

    //clear option bar highlighting
    if(optionsTable != undefined)
    {
        for(let unit of optionsTable.unitInformation.values())
        {
            //overwrite all classes with unit.
            let unitElement = getById(unit.unitCode);

            // if unit hidden add hidden class back
            if(unitElement.classList.contains("otherHide"))
            {
                unitElement.setAttribute("class", "otherHide option");
            } else {
                unitElement.setAttribute("class", "unit option");
            }

            // problems and not in side bar
            if(unit.problems.length > 0 && !unitElement.parentElement.id.includes("op"))
            {
                unitElement.classList.add("magenta");
            }

            if(unit.creditPoints == 0)
            {
                unitElement.classList.add("zeroPoint");
            } else if (unit.creditPoints == 12) {
                unitElement.setAttribute("class", "unit twelvePoint");
            }
        }
    }
}

/**
 * Searches planner and looks for any problems.
 * Problems being prerequisites not met, credit points not met, etc.
 */
export function checkPlannerForErrors()
{
    // Check for problems.

    let conditionMet = true;

    //check if prerequisites met for all units.
    for(let unit of planner.unitInformation.values())
    {
        let item = getById(unit.unitCode);

        if(!unitConditionsMet(item.id, item.parentElement)){
            conditionMet = false;
        }
    }

    // color option units if problems, if they're in the planner
    for(let unit of optionsTable.unitInformation.values())
    {
        let item = getById(unit.unitCode);

        // if unit conditions not met and unit is not in option bar.
        if(!item.parentElement.id.includes("op"))
        {
            // if option unit in planner.
            if(!unitConditionsMet(item.id, item.parentElement)){
                conditionMet = false;
            }
        } else {
            // clear problems if option unit placed back into options bar.
            item.classList.remove("magenta");
            unit.problems = [];
        }
        
    }

    //clear info bar if prerequisites met.
    if(conditionMet && !infoBar.messageToDisplay)
    {
        infoBar.clearInfo();
    }
    
    //for updating status bar.
    if(optionsBar.optionsDone)
    {
        if(conditionMet)
        {
            statusBar.updateStatus("Done");
            makeExportPDFButton();
            // PUT SHOW EXPORT TO PDF BUTTON HERE.
        } else {
            statusBar.updateStatus("Fix Problems");
        }
    } else {
        statusBar.updateStatus("Add Option Units");
    }

    infoBar.display();

}

/**
 * Returns unit information of all units, option and planner units.
 * @returns a map containing all unit information from the planner and option table.
 */
export function getAllUnitInfo()
{
    if(optionsTable == undefined)
    {
        //if optionTable hasn't been rendered
        return planner.unitInformation;
    } else {
        //merges planner and option table unit information maps.
        var map = new Map([...planner.unitInformation, ...optionsTable.unitInformation]);
        return map;
    }
}

/**
 * Determines which teaching period comes first.
 * -1 if 1 comes first, 1 if 2 comes first or 0 if they're in the same period.
 * @param {*} period1 first teaching period
 * @param {*} period2 Second teching period
 * @returns -1 if period 1 comes first, 1 if period 2 comes first or 0 if they're in the same period.
 */
export function comparePeriods(period1, period2)
{
    if(period1.length == period2.length)
    {
        //if both NS or both standard sem.
        if(period1 < period2)
        {
            //if period 1 less then 2 return -1.
            return -1;
        } if(period1 > period2)
        {
            // if period1 greater then 2 return 1
            return 1;
        } else {
            //if the same return 0
            return 0;
        }
    } else{

        //else one period is NS and the other isn't

        //unit we're checking is in NS period.
        //extract year and semester, and compare.
        let period1Year = period1.substring(1,2);
        let period1Period = getLastCharacter(period1);
        let period2Year = period2.substring(1,2);
        let period2Period = getLastCharacter(period2);

        //if prerequisite comes before unit in year.
        if(period1Year < period2Year)
        {
            //period 1 comes before period 2.
            return -1;
        } else if(period1Year > period2Year) {
            //period1 comes after 2.
            return 1;
        }else if (period1Period < period2Period)
        {
            //period 1 comes before 2.
            return -1;
        } else if((period1Period > period2Period)){
            //period 2 comes before 1.
            return 1;
        } else {
            //depending on which one is NS, depends on which comes first.
            if(period1.length > period2.length)
            {
                //1 is NS. So it comes after period 2.
                return 1;
            } else {
                //else 2 is NS, so 1 comes first.
                return -1;
            }
        }
    }
}
