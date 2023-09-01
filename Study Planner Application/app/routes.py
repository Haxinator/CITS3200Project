from flask import render_template, flash, redirect, url_for, request, jsonify
from neo4j import GraphDatabase
# from neo4j import __version__ as neo4j_version
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


uri= "bolt+s://e5218dc4.databases.neo4j.io"  #"bolt://3.236.190.97:7687" :skull:
user="neo4j"
pswd= "svH9RLz19fQFpDDgjnQCZMO9MF6WEVPRmtpXEaNVQ2o"  #"ideals-extensions-necks" 

# Connect to remote Neo4j driver
# print("Neo4j Driver Version:", neo4j_version)
driver=GraphDatabase.driver(uri,auth=(user, pswd))
driver.verify_connectivity()
session=driver.session() 

@app.route("/unitInformation/<string:major>/bridging=<string:bridging>", methods=["GET"])
def send_unit_information(major, bridging):
    units = bridging.split(",") 
    unit_conditions = " OR ".join([f"u.unitcode = '{unit}'" for unit in units])

    # if major does not have option units (soft)
    if(major == "SP-ESOFT"):
        query=f""" MATCH (u)
        WHERE u.major CONTAINS $major OR {unit_conditions}
        OPTIONAL MATCH (u)-[:REQUIRES]->(m)
        WITH u, COLLECT(m.unitcode) as unit_req
        RETURN u.unitcode as unitcode, u.unitname as unitname, u.type as type, u.semester as semester, u.major as major, u.level as level, u.credit_points as credit_points, u.points_req as points_req, u.enrolment_req as enrolment_req, unit_req, u.incompatible_units as incompatibilities, u.corequisites as corequisites
        ORDER BY level
        """
        x = {"major":major} 
        results=session.run(query,x)
        data=results.data()
        return(jsonify(data))
    # if major does have option units (mech)
    else:
        query=f""" MATCH (u)
        WHERE u.major CONTAINS $major AND u.type = "CORE" OR {unit_conditions}
        OPTIONAL MATCH (u)-[:REQUIRES]->(m)
        WITH u, COLLECT(m.unitcode) as unit_req
        RETURN u.unitcode as unitcode, u.unitname as unitname, u.type as type, u.semester as semester, u.major as major, u.level as level, u.credit_points as credit_points, u.points_req as points_req, u.enrolment_req as enrolment_req, unit_req, u.incompatible_units as incompatibilities, u.corequisites as corequisites
        ORDER BY level
        """
        x = {"major":major}
        results=session.run(query,x)
        data=results.data()
        return(jsonify(data))

@app.route("/option_units=<string:major>", methods=["GET"])
def get_option_units(major):
    query=f""" MATCH (u)
    WHERE u.major CONTAINS $major AND u.type CONTAINS "GROUP"
    OPTIONAL MATCH (u)-[:REQUIRES]->(m)
    WITH u, COLLECT(m.unitcode) as unit_req
    RETURN u.unitcode as unitcode, u.unitname as unitname, u.type as type, u.semester as semester, u.major as major, u.level as level, u.credit_points as credit_points, u.points_req as points_req, u.enrolment_req as enrolment_req, unit_req, u.incompatible_units as incompatibilities
    ORDER BY level
    """
    x = {"major":major}
    results=session.run(query,x)
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