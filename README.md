# Sketchy Phone - SoPra FS24

## Introduction
This project aims to blend two classic games: the Telephone game and the Exquisite Corpse
game. We allow players to sign up as persistent users or play as guest
users. The primary difference is that persistent users can save and view their playing history. 
For the best experience, we recommend
playing the game during a call with friends! 
Each game begins with players creating a text prompt. These prompts are then distributed to other players, who draw their interpretation of the received prompt. Next,
these drawings are redistributed, and players must describe the drawing in words, forming
a new text prompt. This completes one cycle of the game. The game progresses through
multiple cycles, each one altering the original text prompt in unique ways. At the end, all
cycles are displayed to the players, showing the evolution from start to finish. Additionally,
we narrate text prompts to add humorous effects to the presentation at the of the game.
Players can upvote text prompts and drawings. At the end of the game, the
best text prompt writer and artist are revealed based on the votes.

## Technologies
- Frontend ([Client](https://github.com/sopra-fs24-group-25/SketchyPhone-Client))
  - [Node.js](https://nodejs.org/docs/latest/api/)

  - [React.js](https://react.dev/)

- Github (Version Control)

- SonarCloud (Code Analysis)

## High-level Components
- GameRoom.tsx
    - This component takes care of offering users the choice to either join or create a new game. Upon entering or joining a gameroom, it shows the lobby with all joined users. The admin can change gamesettings, leave the room (and thus reassigning a new admin) or start the game.
- Game.tsx
    - Takes care of the main flow of the game. This includes delegating the correct tasks (drawing or writing), received drawings and prompts to a user. Additionally, it displays the presentation and leaderboard at the end of the game.
- GameJoin.tsx
    - This component takes care of the game join flow. Here, a user can set their nickname, avatar and enter the respective game pin to join a lobby. After this, they will be navigated back to the GameRoom.
- PresentationContainer.tsx
    - The presentation component takes care of showing the submitted drawings and text prompts in logical order to users and the end of the game. Here, users can upvote drawings and text prompts and download drawings they like. Depending on the chosen settings, text prompt will be narrated when revealed. An admin can click to reveal the next text prompt or drawing, show the leaderboard, start a new round, exit the game completely or redirect all users back to the lobby.
- Leaderboard.tsx
    - This component shows the top three drawings and top three text prompts depending on the respective votes they received.
- TextPromptContainer.tsx
    - This component provides users with a text field to enter a text prompt. It also takes care of submitting the text prompts to the server and ensuring it is submitted within the time limit.
- DrawContainer.tsx
    - This component provides users with a drawing canvas and different drawing tools they can use to draw their images. It also takes care of submitting the drawing to the server and ensures the task is completed within the time limit.


## Getting started

### Prerequisites and Installation
For your local development environment, you will need Node.js.\
We urge you to install the exact version **v20.11.0** which comes with the npm package manager. You can download it [here](https://nodejs.org/download/release/v20.11.0/).\
If you are confused about which download to choose, feel free to use these direct links:

- **MacOS:** [node-v20.11.0.pkg](https://nodejs.org/download/release/v20.11.0/node-v20.11.0.pkg)
- **Windows 32-bit:** [node-v20.11.0-x86.msi](https://nodejs.org/download/release/v20.11.0/node-v20.11.0-x86.msi)
- **Windows 64-bit:** [node-v20.11.0-x64.msi](https://nodejs.org/download/release/v20.11.0/node-v20.11.0-x64.msi)
- **Linux:** [node-v20.11.0.tar.xz](https://nodejs.org/dist/v20.11.0/node-v20.11.0.tar.xz) (use this [installation guide](https://medium.com/@tgmarinho/how-to-install-node-js-via-binary-archive-on-linux-ab9bbe1dd0c2) if you are new to Linux)

If you happen to have a package manager the following commands can be used:

- **Homebrew:** `brew install node@20.11.0`
- **Chocolatey:** `choco install nodejs-lts --version=20.11.0`

After the installation, update the npm package manager to **10.4.0** by running ```npm install -g npm@10.4.0```\
You can ensure the correct version of node and npm by running ```node -v``` and ```npm --version```, which should give you **v20.11.0** and **10.4.0** respectively.\
Before you start your application for the first time, run this command to install all other dependencies, including React:

```npm install```

Next, you can start the app with:

```npm run dev```

Now you can open [http://localhost:3000](http://localhost:3000) to view it in the browser.\
Notice that the page will reload if you make any edits. You will also see any lint errors in the console (use a Chrome-based browser).\
The client will send HTTP requests to the server which can be found [here](https://github.com/sopra-fs24-group-25/SketchyPhone-Server).\
In order for these requests to work, you need to install and start the server as well.

### Testing
Testing is optional, and you can run the tests with `npm run test`\
This launches the test runner in an interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

> For macOS user running into a 'fsevents' error: https://github.com/jest-community/vscode-jest/issues/423

### Build
Finally, `npm run build` builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance:\
The build is minified, and the filenames include hashes.<br>

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


### Deployment

 The app automatically deploys to Google Cloud when it detects changes to the main branch. To view the deployment progress use Github <b>[Actions](https://github.com/sopra-fs24-group-25/SketchyPhone-Client/actions)</b> tab. If the deployment was successful, you can use the app following this link: https://sopra-fs24-group-25-client.oa.r.appspot.com/.

## Main user flow

###
The homepage provides users with two options: they can either jump right into
the action as guests or register/login as persistent users.

Once a user selects to play as a guest or register as a persistent user, they are
presented with the choice to either create a new game (New Game) or join an existing one
(Join Game).

Regardless of whether the user is initiating or joining a new gameroom, they must
first set a nickname and chose an avatar.

Once the user has set up their avatar and nickname, they will be able to see all
the other players in the lobby.

 Players have the option to update their profile (by clicking on the burger menu top left), allowing them to change both
their nickname and avatar. Admins have the additional option to change the game settings. The game can then be started by the admin.

At first, user is prompted to write a text prompt within a specified time limit. After all users have completed this task, they will receive another user's text prompt which they have to draw, again within a given time limit. After all user's finish drawing, the users are tasked to describe the received drawing in words. This loop repeates for a predefined number of times.

When the loop limit is reached, users will be shown a presentation screen, with a single text-prompt. The admin can the click to reveal the associated drawing, then again to reveal the associated text prompt and so on, until all drawings and text prompts have been revealed. 
During the presentation, users have to option to upvote drawings and text prompts they like. They can also download drawings they like!

At the end of the presentation, the admin can reveal the leaderboard, where the top three drawings and text prompts are shown with their respective votes.

Finally, an admin can then decide to either immediately start a new game, return all users to the lobby or exit the game completely.


 ## How to Contribute
1. Clone the repositories to your local machine and create a new branch.

2. Make your respective changes and ensuring there are no build errors.

3. Create a Pull Request with a detailed description.

## Roadmap
- Implement microphone feature for all users in the game
- Allow users to spend their accumulated votes to manipulate other user's microphone output with humorous effects.
- Provide users with a account recovery service, in case they lost their account credentials.


## Contributing / Authors
- Noah Isaak Git: [guilloboi1917](https://github.com/guilloboi1917)
- Noé Matumona Git: [noematumona](https://github.com/noematumona)
- Xindi Liu Git: [Cindylliu](https://github.com/Cindylliu)
- Victor Git: [vichcruz](https://github.com/vichcruz)

## Acknowledgements
- [Template Client](https://github.com/HASEL-UZH/sopra-fs24-template-client)

## License
This project is licensed under the Apache License - see the [LICENSE](https://github.com/sopra-fs24-group-25/SketchyPhone-Client/blob/main/LICENSE) file for details.
