from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
import os

app = Flask(__name__)

MONGOD_PORT = 19250
MONGOD_HOST = 'ds119250.mlab.com'
MONGO_DB_NAME = 'heroku_l67bkg1s'
MONGODB_URI = 'mongodb://<dbuser>:<dbpassword>@ds119250.mlab.com:19250/heroku_l67bkg1s'
dbuser = "root"
dbpassword = "kZc-TT4-YcG-ZZR"
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DBS_NAME = os.getenv('MONGO_DB_NAME', 'donorsUSA')
COLLECTION_NAME = 'projects'
FIELDS = {'funding_status': True,
          'school_state': True,
          'school_county': True,
          'school_latitude': True,
          'school_longitude': True,
          'resource_type': True,
          'poverty_level': True,
          'date_posted': True,
          'total_donations': True,
          '_id': False}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/donorsUS/projects")
def donor_projects():
    """
    A Flask view to serve the project data from
    MongoDB in JSON format.
    """

    # A constant that defines the record fields that we wish to retrieve.
    FIELDS = {'funding_status': True,
              'school_state': True,
              'school_county': True,
              'school_latitude': True,
              'school_longitude': True,
              'resource_type': True,
              'poverty_level': True,
              'date_posted': True,
              'total_donations': True,
              '_id': False}

    # Open a connection to MongoDB using a with statement such that the
    # connection will be closed as soon as we exit the with statement
    # The MONGO_URI connection is required when hosted using a remote mongo db.
    with MongoClient(MONGO_URI) as conn:
        # Define which collection we wish to access
        collection = conn[DBS_NAME][COLLECTION_NAME]
        # Retrieve a result set only with the fields defined in FIELDS
        # and limit the the results to a lower limit of 20000
        projects = collection.find(projection=FIELDS, limit=20000)
        # Convert projects to a list in a JSON object and return the JSON data
        return json.dumps(list(projects))


if __name__ == "__main__":
    app.run(debug=True)