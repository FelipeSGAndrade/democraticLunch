# Democratic Lunch  
Make your lunch place choice easier  

## Starting application  
To start the server, ensure that you have node and npm installed, then run the following command for installing node packages  
**npm install**  

And this one to install pm2, the tool that will manage the server, globally  
**npm install pm2 -g**  

The next step ir startin the server  
**npm start**  

## Testing  
For testing, you need to have everything installed as above and run the command  
**npm test**  

After running the full test, a report about coverage can be found at **/reports/coverage/index.html**  

## Usage
There is an automatically generated swagger running on endpoint **/docs**. Also, there is a postman collection in the root directory that can be imported and contains examples.  

The **/startMock** endpoint will insert some data on the lists used as database (as the instructions said it could be mocked). This adds a closed poll using tomorrow's date.  

I didn't want to make a user registration page, so, if the user e-mail is not found, a new user is created.

There is an endpoint for closing polls, cause this solution can be more flexible.

## Notes  

I try to make things in the easiest way of delivering value, fast and easy to understand. That is why I chose Hapi framework, as it has lots of straightforward implementations like swagger automation and Joi for contract validation.  

I tend to follow patterns about coding style that I find on projects and, when suitable, propose improvements. Because of my latest experiences with node, the architecture of this application is the one I've got to work better till now. There is no service layer cause this would introduce too many layers unecessarily, although I see no problem about calling the controllers as "service" instead, as the routes define pretty much what a controller would do.

I made this code in a rush, so there is a lot to improve. The first thing I would change would be the tests, they can get a lot simpler by creating default stubs for expected responses. Of course the application needs a database as soon as possible, and the repository files could be replaced for that purpose.  

Unfortunately, I didn't have time to make a front-end, so that is needed also.

There is a lot of room for improvements, one I would like to make is the possibility of writing commentaries on polls, so that workers can convince people to vote on a particular restaurant. It would be nice for the worker being able to undo the vote and vote in another option while the poll is still open.

Anyway, **hope you like it!**

*Felipe Andrade*
