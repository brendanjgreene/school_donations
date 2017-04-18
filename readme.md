# This is the Final Project for Stream Two

## Overview

The goal of this project is to expand on the skillsets and tools for creating a meaningful interactive data visualization learned throughout Streams 1 & 2 . I will use a dataset from DonorsChoose.org to build a data visualization that represents school donations broken down by different attributes over a timeline. I will be use a wide range of technologies: MongoDB for storing and querying the data, Python for building a web server that interacts with MongoDB and serves html pages, and JavaScript libraries: d3.js, dc.js queue.js and crossfilter.js for building interactive charts.

# WHAT I WILL DO: A REMINDER

1.  I will organise the presentation layer layout to display the data in a visually effective manner.
2.  I will add at least one additional data dimension and associated visualization to the data already presented on the dashboard.
3.  I will include additional functionality that provides a Dashboard tutorial, which targets each Dashboard element with an explanation of its purpose (see guidelines below this list).
4.  I will embed the dashboard into a site – either one you have already created or a new simple site instance.
5.  I will make a great and wonderful thing of beauty.

# WHAT I HAVE DONE: SO FAR

1.  I organised the presentation layer and to make it visually appealing through html and css and bootstrap classes.
2.  I added one additional data dimension, specifically the 'school_county' field and a corresponding menu selection to filter this field. I also created and additional range chart for the associated time chart and changed it to a line chart to make it more visually interesting!  I also added a data table so that details of individual donations including pagination to make the table manageble.
3.  I included additional functionality that provides a Dashboard tutorial, which targets each Dashboard element with an explanation of its purpose (see guidelines below this list).
4.  I deployed the dashboard to a website using Heroku at """https://safe-mesa-50210.herokuapp.com/"""!
5.  Yes indeed it is beautiful!

## Tech Used

1.  D3.js: A JavaScript based visualization engine, which will render interactive charts and graphs based on the data.
2.  Dc.js: A JavaScript based wrapper library for D3.js, which makes plotting the charts a lot easier.
3.  Crossfilter.js: A JavaScript based data manipulation library that enables two way data binding.
4.  Queue.js: An asynchronous helper library for JavaScript.
5.  Mongo DB: NoSQL Database used to convert and present our data in JSON format.
6.  Flask: A Python based  micro – framework  used to serve our data from the server to our web based interface.
7.  Intro.js: A javascript that helps us create a interactive tutorial for our dashboard.
8.  data-table.js: A javascript that help employ additional functionality to my data table.
9.  Heroku: for web deployment.
10. Gunicorn and PRrocfiles: to support other OS.
11. Heroku mLab Add on: to deploy our Mongo database on the web.