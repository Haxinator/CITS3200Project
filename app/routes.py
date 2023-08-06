from flask import render_template, flash, redirect, url_for, request, jsonify
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