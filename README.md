# carl-app
### Installation Instructions
--------------------
Step 1. Clone this repo (e.g. `git clone`)  

Step 2. Run `npm install` to get all of the dependencies.  

Step 3. Profit

### Running locally
--------------------
Navigate into the folder and run `node app.js` - navigate to http://localhost:3000 to view your changes. If you want to get some new changes that other people have pushed, run `git pull` within your local carl-app folder.
### Pushing to Heroku
--------------------
Once you have made the changes you want locally, run the following commands from the carl-app folder.
1. `git add .` (replace `.` with a particular file name if you only changed one file)
2. `git commit -m "Your message here"` (change the text within the quotation marks to something describing what you changed)
3. `git push` will push it to github, travis, and heroku (assuming travis passes). If there's any syntax errors or something like that, travis won't pass and it won't get pushed!
