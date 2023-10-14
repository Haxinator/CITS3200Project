/*
 * checks.js is a big file, this is because it's responsible for checking if a unit's
 * prerequisites were met.
 * 
 * unitConditionsMet is the main function. It calls all the other functions:
 *      o Checks if unit can be enrolled in a given semester.
 *      o Checks if a unit's perequisites were met.
 *      o Checks if a unit's corequisites were met.
 *      o Checks if a unit's point requirements were met (including core unit points requirements).
 *      o It also checks GENG5010 is enrolled in the last enrolled period of the last year .
 * If all of these functions return true, then the unit conditions were met and the
 * given unit can be enrolled in the semester provided. 
 * 
 * This file can be hard to understand. Best to ask Josh.
*/

import { getAllUnitInfo, getById, getByPeriod } from "./support.js";
import { infoBar } from "./classes.js";
import { highlightIfUnitHasProblems, isAlpha, inDOM, getLastCharacter, getUnitInformation, isOption, comparePeriods } from "./support.js";
import { planner } from "./main.js";

// --------------- Prerequisite Met Functions ----------------//

/**
 * Checks if all unit prerequisites met if the unit enrolls into
 * The given teaching period.
 * @param {*} unitCode unit code of a unit
 * @param {*} container teaching period from DOM.
 * @returns true if unit can be enrolled into this period false otherwise.
 */
export function unitConditionsMet(unitCode, container)
{
    //empty here for cleaner code
    //if problems still exist they will be added again
    //if problems are gone, they will be removed from array.
    let unit = getUnitInformation(unitCode);
    unit.problems = [];

    //instead of container ID can be used, which would be cleaner.
    let correctSemester = canEnrollInPeriod(unitCode, container);
    let correctPrequisites = unitPreRequisitiesMet(unitCode, container);
    let correctCorequisites = corequisitesMet(unitCode, container);
    let correctPoints = pointRequirementsMet(unitCode, container);

    // check if unit has been enrolled and it's in the DOM
    if(unit.isEnrolled() && inDOM(unitCode))
    {
        // colour magenta if problem found
        highlightIfUnitHasProblems(unit);
    }

    //hardcode check if portfolio in right spot
    if(unitCode.includes("GENG5010"))
    {
        //if in planner and planner in DOM.
        if(unit.isEnrolled() && planner != undefined)
        {
            let lastYear = getById("table").lastElementChild.id[1];
            let yearCorrect = lastYear == container.id[1];
            console.log(getByPeriod(lastYear, "NS2").lastElementChild);
            console.log(getByPeriod(lastYear, "S2").lastElementChild);

            let semesterCorrect = container.id[4] == "2" || (getByPeriod(lastYear, "NS2").lastElementChild == null && getByPeriod(lastYear, "S2").lastElementChild == null);

            if(yearCorrect && semesterCorrect)
            {
                return true;
            } else {
                unit.problems.push(`You can only enroll into ${unitCode} in your last semester of your last year!`);
                infoBar.addInfo(`You can only enroll into ${unitCode} in your last semester of your last year!`);
                highlightIfUnitHasProblems(unit);

                return false;
            }


        } else {
            for(let thatUnit of planner.unitInformation.values())
            {
                if(!thatUnit.isEnrolled() && thatUnit.unitCode != unitCode)
                {
                    return false;
                }
            }
        }

    }


    return correctSemester && correctPrequisites && correctCorequisites && correctPoints;
}

/**
 * Determines if unit belongs to the type identifier given.
 * In this case if it's a programming unit.
 * @param {*} unitCode unitCode is the unit code.
 * @param {*} identifier is the unit type identifier.
 * @returns 
 */
export function unitType(unitCode, identifier)
{
    if(identifier === "P" && unitCode.substring(0,4) === "CITS")
    {
        return true;
    }

    return false;
}

/**
 * Checks if unit has met its point requirements both the overall points and core unit points.
 * Core unit points is programming units in this case.
 * @param {*} unitCode unit code of a unit.
 * @param {*} container Teaching period from DOM.
 * @returns true if point requirements met, false otherwise.
 */
export function pointRequirementsMet(unitCode, container)
{
    let unit = getUnitInformation(unitCode);
    let pointCount = 0;
    let CoreUnitCount = 0;
    let corePointsRequired = unit.pointRequirements[0];
    let extraPointsRequired = unit.pointRequirements[1];

    //if no point requirements, then requirements met.
    if(unit.pointRequirements.length == 0)
    {
        return true;
    }

    // get the point type. (last character in corePointsRequired)
    let typeIdentifier = getLastCharacter(corePointsRequired);

    //I cri.
    //IT WORKSS
    for(let otherUnit of getAllUnitInfo().values())
    //doesn't look at option units added to planner.
    //need to change to loop over the planner instead of unit info.
    {
        let otherUnitCode = otherUnit.unitCode;

        //also need to take into account NS.
        //same bug most likely in prerequisite unit checking.
        //which will give incorrect results.
        //if in planner and before current enrollment period
        //BUG won't look at NS units.
        if(otherUnit.isEnrolled() && comparePeriods(otherUnit.enrollmentPeriod, container.id) == -1)
        {
            //pass last letter in, if it has unit point requirements
            if(unitType(otherUnitCode, typeIdentifier))
            {
                CoreUnitCount += parseInt(otherUnit.creditPoints);
            }

            pointCount += parseInt(otherUnit.creditPoints);
            // console.log(pointCount);
        }
    }

    // check if last char is alpha (different upp and lower)
    // if so then first index is core units.
    if(isAlpha(typeIdentifier))
    {
        // compare core point requirement to coreUnitCount.
        // don't include the last alpha character in the comparison (why substring is used).
        if(parseInt(corePointsRequired.substring(0, corePointsRequired.length-1)) > CoreUnitCount)
        {
            unit.problems.push(`${unitCode} requires ${corePointsRequired} core unit credit points!`);
            infoBar.addInfo(`${unitCode} requires ${corePointsRequired} core unit credit points!`);
            // updateInfoBar(`${unitCode} requires ${corePointsRequired} core unit credit points!`);

            return false;
        }

        // if there are extra point requirements, see if they're met.
        if(unit.pointRequirements.length > 1 && extraPointsRequired > pointCount)
        {
            unit.problems.push(`${unitCode} requires ${extraPointsRequired} credit points!`);
            infoBar.addInfo(`${unitCode} requires ${extraPointsRequired} credit points!`);
                
            return false;
        }
    } else {
        //otherwise first index is the point point.
        if(corePointsRequired > pointCount)
        {
            unit.problems.push(`${unitCode} requires ${corePointsRequired} credit points!`);
            infoBar.addInfo(`${unitCode} requires ${corePointsRequired} credit points!`);
                
            return false;
        }
    }

    return true;
}

/**
 * Checks if corequisites for a given unit were met.
 * Almost exactly the same as checking if prerequisites were met.
 * @param {*} unitCode unit code of the unit.
 * @param {*} container teaching period from DOM.
 * @returns true if corequisites were met, false otherwise.
 */
export function corequisitesMet(unitCode, container)
{
    let unit = getUnitInformation(unitCode);
    let corequisites = unit.corequisites;
    let corequisitesMet = true;

    for(let corequisite of corequisites)
    {
        let corequisiteUnit = getUnitInformation(corequisite);

        if(corequisiteUnit != undefined)
        {
            if(!corequisiteUnit.isEnrolled())
            {
                //if corequisite in name list then it isn't in planner
                return false;
    
            } else if(comparePeriods(corequisiteUnit.enrollmentPeriod, container.id) == 1)
                    {
                        //if corequsite is after current period.
                        infoBar.addInfo(`${corequisite} must be done concurrently or prior to commencing ${unitCode}!`);
                        
                        unit.problems.push(`${corequisite} must be done concurrently or prior to commencing ${unitCode}`);
                        
                        corequisitesMet = false;
                    }
        }
    }

    return corequisitesMet;
}

/**
 * Checks if given unit's prerequisites were met.
 * @param {*} unitCode given unit code of the unit.
 * @param {*} container teaching period from DOM.
 * @returns true if prerequisites met, false otherwise.
 */
export function unitPreRequisitiesMet(unitCode, container)
{
    let unit = getUnitInformation(unitCode);
    let andPrerequisites = unit.prerequisites[1];
    let orPrerequisites = unit.prerequisites[0];
    let prerequisitesMet = true;

    let orMet = orPrerequisites.length > 0? false : true; 

    //needs to be revised for AND OR.
    
    //AND requirements
    //BUG if unit is NS and prereq is standard sem, then it won't detect problems.
    //so if NS, check if equal to semester or greater then year.
    for(let prerequisite of andPrerequisites)
    {
        let prerequisiteUnit = getUnitInformation(prerequisite);


        if (prerequisiteUnit != undefined){

            if(!prerequisiteUnit.isEnrolled())
            {
                //if prerequisite isn't in planner (planner still generating).
                prerequisitesMet = false;

            } else if(comparePeriods(prerequisiteUnit.enrollmentPeriod, container.id) != -1)        
            {
                infoBar.addInfo(`${prerequisite} must be done before ${unitCode}!`);
                    
                unit.problems.push(`${prerequisite} must be done before ${unitCode}!`);

                //if prerequisite is in this period or greater.
                prerequisitesMet = false;
            }
        }
    }

    let noUnitCount = 0;
    let orErrorMessage = "";

    //OR requirements
    //BUG caused by bridging units or units not existing in planner.
    for(let prerequisite of orPrerequisites)
    {
        let prerequisiteUnit = getUnitInformation(prerequisite);

        if (prerequisiteUnit != undefined){

            if(prerequisiteUnit.isEnrolled() &&
                comparePeriods(prerequisiteUnit.enrollmentPeriod, container.id) == -1)
            {
                //if prerequisite is before this period
                orMet = true;
            } else {
                orErrorMessage += ` ${prerequisite} or`;
            }

            //also need to consider the case where comparing NS and standard, as above in AND.
        } else {
            //assume if prerequisite isn't in the major 
            //that the prerequisite has been met.
            noUnitCount++;

            //in case all "or" prereq units aren't in major.
            if(orPrerequisites.length == noUnitCount)
            {
                orMet = true;
            }
        }
    }

    //remove last or in messsage.
    orErrorMessage = orErrorMessage.substring(0, orErrorMessage.length-3);

    //if or not met
    if(!orMet)
    {
        infoBar.addInfo(orErrorMessage + ` must be done before ${unitCode}!`); 
        unit.problems.push(orErrorMessage + `must be done before ${unitCode}!`);
    }

    return prerequisitesMet && orMet;
}

/**
 * checks if unit can enroll in a given teaching period.
 * @param {*} unitCode is the code of the unit.
 * @param {*} container is the teaching period from the DOM.
 * @returns 
 */
export function canEnrollInPeriod(unitCode, container)
{
    let unit = getUnitInformation(unitCode);
    let semester = container.id;
    let unitAvaliability = unit.semester; //problem

    //remove the year from semester
    semester = semester.substring(2,4);

    // unit available that semester.
    let unitAvailable = unitAvaliability.includes(semester);
    // unit available for S1S2 and semester is not NS
    let unitAvailableAndNotNS = unitAvaliability == "BOTH" && !semester.includes("NS");
    //unit is core and semester is not option bar.
    let coreUnitAndNotOptionBar = !isOption(unitCode) && !container.id.includes("op");
    //option unit and option bar.
    let optionUnitAndOptionBar = isOption(unitCode) && container.id.includes("op");
    //option unit and planner.
    let optionUnitAndPlanner = isOption(unitCode) && !container.id.includes("op");


    //if semester matched when unit is offered.
    return (unitAvailable || unitAvailableAndNotNS) && 
            (coreUnitAndNotOptionBar || optionUnitAndOptionBar || optionUnitAndPlanner);
}