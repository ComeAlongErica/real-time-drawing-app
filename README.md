# real-time-drawing-app
I followed this project on PluralSight. After migrating for work to Github, I noticed the real time updates with out having to refresh the page. I thought it was cool and wanted to learn how it worked! This covers the publish/subscribe design pattern and handles disconnections.

This app uses React, Socket.io, RxJS, and RethinkBD

### To get started

cd into client folder and run <code>npm start</code>
```
cd ./client
npm start
```
cd into server folder and run <code>npm start</code>
```
cd ./server
npm start
```
In root director run command <code>rethinkdb</code>. If database is not configured, go to http://localhost:8080/ and add a database 'awesome_whiteboard' and add two tables 'drawings' and 'lines'.
```
rethinkdb
```
