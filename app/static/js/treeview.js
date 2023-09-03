// function createSequenceofUnits(units) {
//     let seq = "";
//     for (let u in units) {
//         seq.concat(units[u], " ");
//     }
//     console.log(seq);
//     return seq
// }

//make trEEEEEEEEEEEEEEEEEE 
google.charts.load('current', {packages:['wordtree']});

function drawUnitPaths(array, display_type) { 
    let data = google.visualization.arrayToDataTable(array);

    let options = {
        width: 600,
        height: 295,
        maxFontSize: 20,
        wordtree: {
            format: 'implicit',
            type: display_type,
            word: document.getElementById("chosen_unit").value,
        }
    };

    let chart = new google.visualization.WordTree(document.getElementById('unit_tree'));
    chart.draw(data, options);
}

// helper function
function getBranches(branches, type) {
    let paths = []
    for (let p in branches) {
        if (type == "prereq") {
            console.log(branches[p].prerequisites);
            prereqUnits = branches[p].prerequisites;
            //let seq = prereqUnits;
            //if (prereqUnits.length != 1) {
            prereqUnits.reverse();
            let seq = prereqUnits.join(" ");
            //}
            
            paths.push([seq]);
        }
        if (type == "child") {
            childUnits = branches[p].child_units;
            //let seq = childUnits;
            //if (childUnits.length != 1) {
            let seq = childUnits.join(" ");
            //}
            paths.push([seq]);
        }    
    }
    return paths;
}

//retrieve the requirements of chosen unit 
function get_prereqs() {
    chosen_unit = document.getElementById("chosen_unit").value;

    //clear 
    document.getElementById("err_msg_treeview").innerHTML = "";
    
    const xhttp = new XMLHttpRequest();
    let server = '/prereqs/'.concat(chosen_unit);
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {
        //document.getElementById('prereqs_head').innerHTML = "This unit requires the following:"
        response = JSON.parse(xhttp.responseText);
        console.log(xhttp.responseText);
        unitpaths = getBranches(response, "prereq");
        if (unitpaths.length != 0) {
            drawUnitPaths(unitpaths, 'prefix');
        }
        else {
            document.getElementById('unit_tree').innerHTML = "";
            document.getElementById("err_msg_treeview").innerHTML = "This unit has no unit prerequisites :)";
        }
    }
    xhttp.send();
}

//retrieve units that require chosen unit
function get_children() {
    chosen_unit = document.getElementById("chosen_unit").value;

    //clear 
    document.getElementById("err_msg_treeview").innerHTML = "";

    const xhttp = new XMLHttpRequest();
    let server = '/child_units/'.concat(chosen_unit);
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {
        //document.getElementById('child_head').innerHTML = "This unit is a requirement for the following:"
        response = JSON.parse(xhttp.responseText);
        unitpaths = getBranches(response, "child");
        console.log(unitpaths);
        if (unitpaths.length != 0) {
            drawUnitPaths(unitpaths, 'suffix');
        }
        else {
            document.getElementById('unit_tree').innerHTML = "";
            document.getElementById("err_msg_treeview").innerHTML = "This unit has no child units :)";
        }
    }
    xhttp.send();
}

//adds units on the dropdown menu selection 
function addUnitOptions(json_response) {
    let dropdown = document.getElementById("chosen_unit");
    for (let j in json_response) {
        let option = document.createElement("option");
        option.setAttribute("value", json_response[j].unitcode);
        option.innerHTML = json_response[j].unitname.concat(" (", json_response[j].unitcode, ")");
        dropdown.appendChild(option);
    }
}