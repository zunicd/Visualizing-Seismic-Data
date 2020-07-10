import os
# import the Flask class from the flask module
from flask import Flask, render_template

# create the application object
app = Flask(__name__)

# Add all our keys to list of dictionaries
API_KEY = os.getenv('API_KEY')
keys = [{"name": "API_KEY", "value": API_KEY}]

# use decorators to link the function to a url
@app.route('/')
def home():
    return render_template('index.html',api_keys=keys)  # render a template

# start the server with the 'run()' method
if __name__ == '__main__':
    app.run(debug=True)