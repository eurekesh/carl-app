# carl-app
[![Build Status](https://travis-ci.com/eurekesh/carl-app.svg?token=uVx9g6AFpDqeE9V4y2JS&branch=master)](https://travis-ci.com/eurekesh/carl-app)

### Want to play our game?
--------------------

1) Grab a friend (or many) and a laptop or something non touchscreen (stay tuned- we plan to work on touchscreen compatibility over break)
2) Go to https://carl-app-cu.herokuapp.com/instructions 
3) Click "create/join game" in the nav bar
4) Create a room by clicking "Create Room" on the left side of the screen. A code will appear in the top left.
5) Send the code to a friend (its case sensitive), have them enter it in the text box on the left side of their screen. Once they type in their code and hit "Request Room" they will be in your game room! You can now see their cursor if they move it over the canvas.
6) Once you hit "Start Game" a word will appear in the top right of the screen. Your objective is to draw this word in 30 seconds with your friends. Once the timer ends you can hit "Start Game" again and play another round.
That's our game! You can view any past drawings by clicking "Past Drawings" in the nav bar.
Thanks!

### Installation Instructions
--------------------
Step 1. Clone this repo (e.g. `git clone`)  

Step 2. Run `npm install` to get all of the dependencies. Very important!

Step 3. Use (run `nodemon app.js` (new! will automatically restart the nodejs server whenever you make changes) `node app.js` to run and then navigate to `localhost:3000` in your browser!)

### File Structure Info
--------------------
Server side: app.js is the main driver and contains db and main server logic, iggy.js contains game logic and interactions between host and clients (and pulls upon utils.js as needed) and uses nouns.js for the noun list.   
    
Client side: public/res/ contains resources that are used by the client. public/views/pages/ contains the main pages of the app, which uses some ejs components from the aptly named /pages/views/components. Finally, the Procfile is used by Heroku in order to successfully deploy. If you wanted to, this app is ready for deployment as of now to heroku by simply uploading to heroku and allocating a suitable postgresql database (otherwise it may/may not crash when you try to visit past drawings).

### Pushing to Heroku
--------------------
Once you have made the changes you want locally, run the following commands from the carl-app folder.
1. `git add .` (replace `.` with a particular file name if you only changed one file)
2. `git commit -m "Your message here"` (change the text within the quotation marks to something describing what you changed)
3. `git push` will push it to github, travis, and heroku (assuming travis passes). If there's any syntax errors or something like that, travis won't pass and it won't get pushed!
