# M2

## 14.3 - 21.3

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

## 22.3 - 29.3

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

## 01.4 - 07.4

Xindi Liu
- Create method is service class to save a text prompt with the data from the http request #51
- Create mapping in controller to post a text prompt #52
- Sanitize text prompt #53

Victor Cruz da Silva
- Added SecureRandom functionality to create a secure six-digit game pin. #65
- Added Settings entity and debugged game entity to show the list of users correctly. #65, #68
- Added put mapping to update and get mapping to retrieve the current settings, and added the functionality in the game service. #68, #69
- Corrected code for a user to join a game room, create game session and get all game sessions of a room, save text prompt on server. #40, #42, #51, #52, #53

