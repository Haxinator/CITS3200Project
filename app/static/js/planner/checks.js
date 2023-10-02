/*
 * checks.js is a big file, this is because it's responsible for checking if a unit's
 * prerequisites were met.
 * 
 * unitConditionsMet is the main file. It calls all the other functions:
 *      o Checks if unit can be enrolled in a given semester.
 *      o Checks if a unit's perequisites were met.
 *      o Checks if a unit's corequisites were met.
 *      o Checks if a unit's point requirements were met (including core unit points requirements).
 * If all of these functions return true, then the unit conditions were met and the
 * given unit can be enrolled in the semester provided. 
 * 
 * This file can be hard to understand. Best to ask Josh.
*/

import { planner } from "./main.js";
import { infoBar } from "./classes.js";
import { updateInfoBar, highlightIfUnitHasProblems, isAlpha, inDOM, getLastCharacter, getUnitInformation, isOption } from "./support.js";

// --------------- Prerequisite Met Functions ----------------//

//checks if all unit prerequisites met.
// container is the teaching period.
// unitCode is the unit code.
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

    return correctSemester && correctPrequisites && correctCorequisites && correctPoints;
}

//determines if unit belongs to the type identifier given
//@param unit code is the unit code.
//@param identifier is the unit type identifier.
export function unitType(unitCode, identifier)
{
    if(identifier === "P" && unitCode.substring(0,4) === "CITS")
    {
        return true;
    }

    return false;
}

//it works I think?
//checks if unit has met its point requirements.
//both the overall points and core unit points.
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
    for(let otherUnit of planner.unitInformation.values())
    {
        let otherUnitCode = otherUnit.unitCode;

        //if in planner and before current enrollment period
        if(otherUnit.isEnrolled() &&
            otherUnit.enrollmentPeriod < container.id)
        {

            //pass last letter in, if it has unit point requirements
            if(unitType(otherUnitCode, typeIdentifier))
            {
                CoreUnitCount += parseInt(otherUnit.creditPoints);
            }

            pointCount += parseInt(otherUnit.creditPoints);

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

//checks if corequisites for a given unit were met.
//almost exactly the same as checking if prerequisites were met.
//Haven't done indepth testing.
//I hope this works. _/\_
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
    
            } else if(corequisiteUnit.enrollmentPeriod > container.id && 
                    corequisiteUnit.enrollmentPeriod.length == container.id.length)
                    {
                        infoBar.addInfo(`${corequisite} must be done concurrently or prior to commencing ${unitCode}!`);
                        
                        unit.problems.push(`${corequisite} must be done concurrently or prior to commencing ${unitCode}`);
                        
                        corequisitesMet = false;
                    }
        }
    }

    return corequisitesMet;
}

//checks if unit prerequisites met
export function unitPreRequisitiesMet(unitCode, container)
{
    let unit = getUnitInformation(unitCode);
    let andPrerequisites = unit.prerequisites[1];
    let orPrerequisites = unit.prerequisites[0];
    let prerequisitesMet = true;

    let orMet = orPrerequisites.length > 0? false : true; 

    console.log(unit);
    console.log(orPrerequisites);
    console.log(andPrerequisites);


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

            } else if(prerequisiteUnit.enrollmentPeriod >= container.id && 
                    prerequisiteUnit.enrollmentPeriod.length == container.id.length) {

                    infoBar.addInfo(`${prerequisite} must be done before ${unitCode}!`);
                    
                    unit.problems.push(`${prerequisite} must be done before ${unitCode}!`);

                    //if prerequisite is in this period or greater.
                    prerequisitesMet = false;
            } else if(container.id.includes("NS"))
            {
                //unit we're checking is in NS period.
                //extract year and semester, and compare.
                let prerequisiteYear = prerequisiteUnit.enrollmentPeriod.substring(1,2);
                let prerequisitePeriod = getLastCharacter(prerequisiteUnit.enrollmentPeriod);
                let unitYear = container.id.substring(1,2);
                let unitPeriod = getLastCharacter(container.id);

                //if prerequisite comes before unit in year.
                if(prerequisiteYear < unitYear)
                {
                    prerequisitesMet = true;
                } else if (prerequisiteYear == unitYear && prerequisitePeriod <= unitPeriod)
                {
                    // if same year, if prerequisite is before or equal to period 
                    //(NS2 comes after S2 so only works for NS unit prereq checking.
                    prerequisitesMet = true;
                } else {

                    //else prerequisite wasn't done.
                    infoBar.addInfo(`${prerequisite} must be done before ${unitCode}!`);
                    
                    unit.problems.push(`${prerequisite} must be done before ${unitCode}!`);
                    prerequisitesMet = false;
                }
            }
        }
    }

    console.log("prereqs for: " + unitCode);
    let noUnitCount = 0;
    let orErrorMessage = "Either";

    //OR requirements
    //BUG caused by bridging units or units not existing in planner.
    for(let prerequisite of orPrerequisites)
    {
        let prerequisiteUnit = getUnitInformation(prerequisite);

        if (prerequisiteUnit != undefined){
            console.log(prerequisite);
            console.log(prerequisiteUnit.enrollmentPeriod);
            console.log(container.id);
            console.log(prerequisiteUnit.enrollmentPeriod < container.id);

            if(prerequisiteUnit.enrollmentPeriod < container.id && 
                    prerequisiteUnit.enrollmentPeriod.length == container.id.length) {

                    //if prerequisite is before this period
                    // prerequisitesMet = true;
                    orMet = true;
            } else if(container.id.includes("NS") && prerequisiteUnit.enrollmentPeriod != null)
            {
                //unit we're checking is in NS period.
                //extract year and semester, and compare.
                let prerequisiteYear = prerequisiteUnit.enrollmentPeriod.substring(1,2);
                let prerequisitePeriod = getLastCharacter(prerequisiteUnit.enrollmentPeriod);
                let unitYear = container.id.substring(1,2);
                let unitPeriod = getLastCharacter(container.id);

                //if prerequisite comes before unit in year.
                if(prerequisiteYear < unitYear)
                {
                    orMet = true;
                } else if (prerequisiteYear == unitYear && prerequisitePeriod <= unitPeriod)
                {
                    // if same year, if prerequisite is before or equal to period 
                    //(NS2 comes after S2 so only works for NS unit prereq checking.
                    orMet = true;
                } else {
                    //else prerequisite wasn't done.
                    orErrorMessage += ` ${prerequisite} or`;
                }
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

    console.log(prerequisitesMet)
    console.log(orMet)

    return prerequisitesMet && orMet;
}

//checks if unit can enroll in a given teaching period
//@param container is the teaching period
//@param unitCode is the code of the unit
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