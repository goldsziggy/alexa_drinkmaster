# alexa_circleofdeath
An Amazon Alexa task for DrinkMaster - Circle of death

### Folder Overview

#### events

This folder contains mocked up events.  In terms of development, this folder serves no purpose.  The purpose of this folder is to be used with testing. This way you can simulate Alexa/App Events without being on Lambda

#### lib

This folder contains all the assets used by the application.  These JSON files are used by my application as datasources.

#### spec

This folder contains all of my test cases.  The test cases are meant to test both the logic of the underlying base functions, as well as the flow of the Alexa application.

#### speechAssets

This folder contains all of the files used to define the Alexa application within Amazon.  

#### src

This folder contains the main custom logic of the application.  It is important to note, that the entry point of the application is index.js, but the bulk of the program logic is stored here in src.  The file AlexaSkill.js is a file that is provided from Amazon for interegration with Alexa.

### Setup Development Enviroment

TBD



#### AWS

_development for this tool requires AWS Lambda account.  I currently do not have a way to safely 'share' a lambda account so each developer would need thier own._

- Use the following guide's intro for setting up your own lambda account
    - http://tobuildsomething.com/2015/08/14/Amazon-Echo-Alexa-Tutorial-The-Definitive-Guide-to-Coding-an-Alexa-Skill/

- Set up your .env file (copy .env.example to .env and set the variables).

