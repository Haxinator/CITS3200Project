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


# Graph database - neo4j 
# creds:  user, password, uri
# file = open("app/creds.txt", "r")
# for f in file:
#     creds = f.split(',')

# Connect to remote Neo4j driver
driver=GraphDatabase.driver(uri="bolt://3.222.113.151:7687",auth=("neo4j", "offense-augmentation-advertisements"))
session=driver.session() 

@app.route("/display", methods=["GET","POST"])
def display_node():
    query="""
    match (n) return n.unitcode as unitcode, n.type as type, n.semester as semester, n.credit_points as credit_points
    """
    results=session.run(query)
    data=results.data()
    return(jsonify(data))

# @app.route("/create", methods=["POST"])
# def create_units(unitcode):
#     query="""
#     create (n:Unit {unitcode:$unitcode})
#     """
#     map={"unitcode":unitcode}
#     try:
#         session.run(query,map)
#         return (f"unit {unitcode} has been created")
#     except Exception as e:
#         return (str(e))
