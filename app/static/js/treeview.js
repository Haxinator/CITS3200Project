
/**
 * Loads Google charts packages 
 */
google.charts.load('current', {packages:['wordtree']});


/**
 * Draws the tree on the web app
 * @param {*} array list of strings generated from getBranches()
 * @param {*} display_type whether to put the branches before the chosen_unit (prefix) or right after (suffix)
 */
function drawUnitPaths(array, display_type) { 
    let data = google.visualization.arrayToDataTable(array);

    let options = {
        width: 600,
        height: 295,
        maxFontSize: 10,
        wordtree: {
            format: 'implicit',
            type: display_type,
            word: document.getElementById("chosen_unit").value,
        }
    };

    let chart = new google.visualization.WordTree(document.getElementById('unit_tree'));
    chart.draw(data, options);
}

/**
 * Helper function that gets the path lists generated from the database 
 * and make them into one big string for parsing
 * @param {*} branches lists of paths generated from database
 * @param {*} type direction of the paths (forward traversal or backwards traversal)
 * @returns array of 'path' strings 
 */
function getBranches(branches, type) {
    let paths = [['unit_sequences']]
    for (let p in branches) {
        if (type == "prereq") {
            prereqUnits = branches[p].prerequisites;
            prereqUnits.reverse();
            let seq = prereqUnits.join(" ");
            paths.push([seq]);
        }
        if (type == "child") {
            console.log(branches[p].child_units);
            childUnits = branches[p].child_units;
            let seq = childUnits.join(" ");
            paths.push([seq]);
        }    
    }
    return paths;
}

/**
 * Generates tree view based on paths obtained from forward traversal
 */
function get_prereqs() {
    chosen_unit = document.getElementById("chosen_unit").value;
    let major = specialization;

    //clear 
    document.getElementById("err_msg_treeview").innerHTML = "";
    
    const xhttp = new XMLHttpRequest();
    let server = '/prereqs/'.concat(major, "/", chosen_unit);
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {
        response = JSON.parse(xhttp.responseText);
        console.log(xhttp.responseText);
        unitpaths = getBranches(response, "prereq");
        if (unitpaths.length != 1) {
            drawUnitPaths(unitpaths, 'prefix');
        }
        else {
            document.getElementById('unit_tree').innerHTML = "";
            document.getElementById("err_msg_treeview").innerHTML = "This unit has no unit prerequisites :)";
        }
    }
    xhttp.send();
}

/**
 * Generates tree view based on paths obtained from backward traversal
 */
function get_children() {
    chosen_unit = document.getElementById("chosen_unit").value;
    let major = specialization;

    //clear 
    document.getElementById("err_msg_treeview").innerHTML = "";

    const xhttp = new XMLHttpRequest();
    let server = '/child_units/'.concat(major, "/", chosen_unit);
    xhttp.open("GET", server, true);
    xhttp.onload = function (e) {
        response = JSON.parse(xhttp.responseText);
        unitpaths = getBranches(response, "child");
        console.log(unitpaths);
        if (unitpaths.length != 1) {
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