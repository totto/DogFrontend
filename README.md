DogFrontend
===========

DogFrontend is a tool to search for dogs registered with NKK. 

![Screenshot](https://raw.github.com/NKK-IT-Utvikling/DogFrontend/master/media/screenshot.png)

### Dependencies

* DogService - SOLR search index

### Installation

Serve the files with your favorite server software, and set up the references to the backend services.

#### Setup

Change the solrurl-variable in config.js to point to the correct server address for the DogService.

Currently, the different services are expected to live at:

* http://your.url/ <-- index.html
* http://your.url/dogservice/dogs/select <-- DogService dogsearch endpoint
* http://dogid.nkk.no/ <- DogPopulationFrontend for Pedigree view
