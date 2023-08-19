from flask import render_template, flash, redirect, url_for, request, jsonify
from neo4j import GraphDatabase
from app import app

# Home page
@app.route('/')
@app.route('/index/')
def index():
    # Render the index template with the title
    return render_template('index.html', title='Home')

# getStarted
@app.route('/getStarted/')
def getStarted():
    # Render the index template with the title
    return render_template('getStarted.html', title='Get Started')



@app.route('/preferences', methods=['POST'])
def preferences():
    # You can access form data using request.form
    specialization = request.form['specialization']
    #prints out unit code SP-ECHEM
    mathSpecialist = request.form['mathSpecialist']
    mathMethods = request.form['mathMethods']
    chemistry = request.form['chemistry']
    physics = request.form['physics']
    print(specialization)
    # Hold responses as yes or no strings.

    # Do something with the form data (e.g., save to the database)

    return render_template('preferences.html', title='Preferences', specialization = specialization, mathSpecialist = mathSpecialist, mathMethods = mathMethods, chemistry = chemistry, physics = physics) # Render the preferences page



# Connect to remote Neo4j driver
driver=GraphDatabase.driver(uri="bolt://3.236.190.97:7687",auth=("neo4j", "ideals-extensions-necks"))
session=driver.session() 

@app.route("/display", methods=["GET"])
def display_node():
    query="""
    match (n) 
    where n.type = "CORE"
    return n.unitcode as unitcode, n.type as type, n.semester as semester, n.credit_points as credit_points
    """
    results=session.run(query)
    data=results.data()
    return(jsonify(data))

@app.route("/prereqs/<string:chosen_unit>", methods=["GET"])
def get_prereq_units(chosen_unit):
    query="""
    MATCH (u:Unit {unitcode: $chosen_unit})
    CALL apoc.path.expandConfig(u, {relationshipFilter: "REQUIRES>", minLevel: 1, maxLevel: 5})
    YIELD path
    RETURN [node IN nodes(path) | node.unitcode] AS prerequisites
    """
    x = {"chosen_unit":chosen_unit}
    results=session.run(query,x)
    data = results.data()
    return(jsonify(data))
    

@app.route("/child_units/<string:chosen_unit>", methods=["GET"])
def get_child_units(chosen_unit):
    query="""
    MATCH (u:Unit {unitcode: $chosen_unit})
    CALL apoc.path.expandConfig(u, {relationshipFilter: "<REQUIRES", minLevel: 1, maxLevel: 5, uniqueness: "NODE_GLOBAL"})
    YIELD path
    RETURN [node IN nodes(path) | node.unitcode] AS child_units
    """
    x = {"chosen_unit":chosen_unit}
    results=session.run(query,x)
    data=results.data()
    return(jsonify(data))
