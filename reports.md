# M2

## 14.03 - 21.03

**Group Member 1**

- The first thing you did.
- The second thing you did.
- The third thing you did. [Link to task](https://www.example.com)
- ...

**Group Member 2**

- The first thing you did.
- The second thing you did.
- The third thing you did. [Link to task](https://www.example.com)
- ...

## 22.03 - 29.03

Victor Cruz da Silva
- Created GameRoom Entity and the according service, controller and repository files. Added endpoint for room creation according to our REST specs. #64

Noah Isaak
- Created GameRoom UI and respective .scss and basic functionalities to fetch from server. #26
- Created UserPreview component, UserOverviewContainer component and various smaller helper components to show users and admin of current game room. #27
- Show who is admin in the UserOverviewContainer #28

Noé Matumona
- Created Homepage UI with Guide and sign in buttons. Not connected correctly yet. Temporary link /start, should be homepage in future.
- Started with creating join game UI and functionality client-side #5

Xindi Liu
- The server will respond to a user with the game room token after receiving a join request with a valid game room pin. #40
- After a game session is over, the server will change the respective game room's availability to "available" #41
- If the game room is full and a join request is received, a response is returned explaining the reason a user can't join #42

## 01.04 - 07.04

Xindi Liu
- Create method is service class to save a text prompt with the data from the http request #51
- Create mapping in controller to post a text prompt #52
- Sanitize text prompt #53

Victor Cruz da Silva
- Added SecureRandom functionality to create a secure six-digit game pin. #65
- Added Settings entity and debugged game entity to show the list of users correctly. #65, #68
- Added put mapping to update and get mapping to retrieve the current settings, and added the functionality in the game service. #68, #69
- Corrected code for a user to join a game room, create game session and get all game sessions of a room, save text prompt on server. #40, #42, #51, #52, #53
- Added functionality to edit user profile (mappings to create and get avatars, encode avatars correctly, added authentication of user with token in the according http requests). #78, #79, #80

Noé Matumona
- Implemented UI for Join Game with game PIN, nickname, and avatar #5, #7
- Made pictures and text unavailable for dragging and selecting respectively
- Changed main.yml file to avoid triggering actions when editing reports.md

## 08.04 - 14.04

Noé Matumona
- Implemented pin invalid msg for Join Game #6
- Further cleanup for #5, #7
- Implemented waiting room #8
- Implemented room not available view when the room has status CLOSED
- Implemented slide menu when clicking burger menu (not everywhere yet)
- Started implementing automatically joining the active game room when available #10
- Started implementing storing game tokens in session storage #11

Victor Cruz da Silva
- Added functionality and endpoint to delete a temporary user when they leave a game room, added functionality to reassign admin role when admin leaves in a lobby with multiple players. #67
- Added Drawing entity, added post mapping and functionality to create drawing, added get mapping and functionality to assign drawing to user, changed game session entity to work with the game functionality, fixed bug in admin reassignment when admin leaves game room, added authentication for starting a game. #89, #90, #91
  
Noah Isaak
- Various minor styling changes
- Created Admin Settings page (including storing settings data on server) #33
- Reworked .scss and functionalities for GameRoom creation views #26 #27
- Created Canvas React Component for basic drawing features #43

Xindi Liu 
- Refined the design for Figma so the frontend can follow the flow more smoothly
- Implemented Endpoint to display the current text prompt on the screen. #92

## 15.04 - 21.04

Victor Cruz da Silva
- Changed createDrawing and createTextPrompt methods to save the current drawing/text prompt as the previous text prompt/drawing’s next, updated text prompt mapping and controller method, to save previous drawing, updated drawing and text prompt creation to save current, to prevent assignment of already used text prompts or drawings in later rounds. #51, #52, #34
- Added get mappings for text prompts and drawings for the presentation at the end of the game, added mapping to get the first text prompt of a sequence making sure we don’t repeat a sequence. #35, #36, #37, #38, #39

Xindi Liu
- currently configurating Websockets, created dependencies and implemented websocketsconfiguration class
- Working on user story #66, #70, #71

Noé Matumona
- Added various tasks from user story #4 (#19, #20, #22, #23, #24, #25)
- #24, #25 need more work to be fully functional
- implemented various visual changes
- further integrated slide menu in more views

Noah Isaak
- Create drawing surface as react component #43 #42
- Allow simple basic drawing tools #44
- Refactored to allow for drawing history and undo #45
- Imported and used timer, incorporated timer functionality #46 #47
- Allow for submitting of drawn image #48
- minor fixes across the board
- attached server functionality across the board

## 22.04 - 28.04 

Xindi Liu
- Incorporated WebSocket functionality into the server side, including configuration and the WebSocket controller.
- Implemented logic to handle user reconnection upon disconnection.
- Enhanced the GameService to dynamically remove game rooms when they become inactive and have fewer than three users.
- Updated the build.gradle file to include dependencies required for WebSocket functionality.

Victor Cruz da Silva
- Adapted some features and wrote tests. #64, #40, #3, #91, #68, #1, #51, #52, #92, #4, #35, #38
- Adapted code to work with Frontend.  #35, #36, #37, #79, #4, #5, #6 
