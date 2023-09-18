from flask import render_template, flash, redirect, url_for, request, jsonify
from neo4j import GraphDatabase
# from neo4j import __version__ as neo4j_version
from app import app
import itertools

# ------------------------------------- HTML RENDERING ------------------------------------------------
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
    chemistry = request.form['chemistry']
    physics = request.form['physics']
    print(specialization)
    # Hold responses as yes or no strings.

    # Do something with the form data (e.g., save to the database)

    return render_template('preferences.html', title='Preferences', specialization = specialization, mathSpecialist = mathSpecialist, chemistry = chemistry, physics = physics) # Render the preferences page


# ------------------------------------- NEO4J QUERIES ------------------------------------------------
driver = GraphDatabase.driver(
    "bolt://e5218dc4.databases.neo4j.io:7687", 
    auth=("neo4j", "svH9RLz19fQFpDDgjnQCZMO9MF6WEVPRmtpXEaNVQ2o"), 
    encrypted=True, 
    trust="TRUST_ALL_CERTIFICATES"
)

@app.route("/unitInformation/<string:major>/bridging=<string:bridging>", methods=["GET"])
def send_unit_information(major, bridging):
    with driver.session() as session:
        units = bridging.split(",") 
        unit_conditions = " OR ".join([f"u.unitcode = '{unit}'" for unit in units])

    # REVISED VERSION: ----------------------------------------------------------------------
        # fix js first before implementing this query
        # 'unit_req' property now implements AND-OR
        # instead of returning e.g., ["MATH1012", "GENG2000", "CITS1401", "ENSC2004", "CITS2401"],  
        # it returns e.g., [" MATH1012_AND", " GENG2000_AND", " CITS1401_OR", " ENSC2004_AND", " CITS2401_OR"]
        # AND = must-have unit 
        # OR = not necessarily a must-have but can fill the requirements if one of them are taken

        """
        MATCH (u:Unit) -[rel:CORE_OF]-> (m:Major)
        WHERE m.major = "{major}" OR {unit_conditions}
        OPTIONAL MATCH (u)-[rr:REQUIRES]->(r)
        OPTIONAL MATCH (u)-[:COREQUIRES]->(c)
        WITH u, rr, COLLECT(DISTINCT r.unitcode) as unit_req, COLLECT(DISTINCT c.unitcode) as corequisites
        WITH u, rr, corequisites,  REDUCE( s = '', node IN unit_req | 
        CASE WHEN rr.type IS NOT NULL 
            THEN s + ' ' + node + '_' + rr.type
            ELSE s + ' ' + node
        END) as test
        RETURN u.unitcode as unitcode, u.unitname as unitname, u.type as type, u.semester as semester, u.major as major, u.level as level, u.credit_points as credit_points, u.points_req as points_req, u.enrolment_req as enrolment_req, COLLECT(test) as unit_req, u.incompatible_units as incompatibilities, corequisites
        ORDER BY level
        """

    # --------------------------------------------------------------------------------------
        query = f"""
        MATCH (u:Unit) -[rel:CORE_OF]-> (m:Major)
        WHERE m.major = "{major}" OR {unit_conditions}
        OPTIONAL MATCH (u)-[:REQUIRES]->(r)
        OPTIONAL MATCH (u)-[:COREQUIRES]->(c)
        WITH u, COLLECT(DISTINCT r.unitcode) as unit_req, COLLECT(DISTINCT c.unitcode) as corequisites
        RETURN u.unitcode as unitcode, u.unitname as unitname, u.type as type, u.semester as semester, u.major as major, u.level as level, u.credit_points as credit_points, u.points_req as points_req, u.enrolment_req as enrolment_req, unit_req, u.incompatible_units as incompatibilities, corequisites
        ORDER BY level
        """ 
        results = session.run(query)
        data = results.data()
        return jsonify(data)

@app.route("/option_units=<string:major>", methods=["GET"])
def get_option_units(major):
    with driver.session() as session:
        query = f"""
        MATCH (u:Unit) -[rel:GROUP_A_OF|GROUP_B_OF]-> (m:Major)
        WHERE m.major = "{major}"
        OPTIONAL MATCH (u)-[:REQUIRES]->(r)
        OPTIONAL MATCH (u)-[:COREQUIRES]->(c)
        WITH u, COLLECT(DISTINCT r.unitcode) as unit_req, COLLECT(DISTINCT c.unitcode) as corequisites
        RETURN u.unitcode as unitcode, u.unitname as unitname, u.type as type, u.semester as semester, u.major as major, u.level as level, u.credit_points as credit_points, u.points_req as points_req, u.enrolment_req as enrolment_req, unit_req, u.incompatible_units as incompatibilities, corequisites
        ORDER BY level
        """
        results = session.run(query)
        data = results.data()
        return jsonify(data)

@app.route("/option_combos=<string:major>", methods=["GET"])  
def get_option_combos(major): 
     with driver.session() as session:
        query = f"""MATCH (u:Unit) -[rel:GROUP_A_OF|GROUP_B_OF]-> (m:Major)
        WHERE m.major = "{major}"
        RETURN COLLECT(DISTINCT u.unitcode) as options"""

        results = session.run(query)
        options = results.single()['options']

        # one 12-point unit + one 6-point 
        combos_1 = []
        if ("GENG4411" in options) and ("GENG4412" in options):
            combos_1 = [["GENG4411", "GENG4412", unit] for unit in options if (unit != "GENG4411") and (unit != "GENG4412")]

        # three 6-point units
        exclude = ["GENG4411", "GENG4412"]
        filtered_options = [x for x in options if x not in exclude]
        combos_2 = list(itertools.combinations(filtered_options, 3))
        combos_2 = [list(combination) for combination in combos_2]

        # combine two types of combinations
        combinations = combos_1 + combos_2
        return jsonify(combinations)
     

# ------------------------------------- TREE VIEW QUERIES ------------------------------------

@app.route("/prereqs/<string:major>/<string:chosen_unit>", methods=["GET"])
def get_prereq_units(chosen_unit, major):
    with driver.session() as session:
        query = """
        MATCH (u:Unit {unitcode: $chosen_unit})
        CALL apoc.path.expandConfig(u, {relationshipFilter: "REQUIRES>", minLevel: 1, maxLevel: 5})
        YIELD path
        RETURN [node IN nodes(path) WHERE (node.major CONTAINS $major) OR (node.major IS NULL) | node.unitcode] AS prerequisites
        """
        x = {"chosen_unit": chosen_unit, "major": major}
        results = session.run(query, x)
        data = results.data()
        return jsonify(data)

@app.route("/child_units/<string:major>/<string:chosen_unit>", methods=["GET"])
def get_child_units(chosen_unit, major):
    with driver.session() as session:
        query = """
        MATCH (u:Unit {unitcode: $chosen_unit})
        CALL apoc.path.expandConfig(u, {relationshipFilter: "<REQUIRES", minLevel: 1, maxLevel: 5})
        YIELD path
        RETURN [node IN nodes(path) WHERE (node.major CONTAINS $major) OR (node.major IS NULL) | node.unitcode] AS child_units
        """
        x = {"chosen_unit": chosen_unit, "major": major}
        results = session.run(query, x)
        data = results.data()
        return jsonify(data)