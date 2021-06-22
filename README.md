# Handy Commands

Handy Commands is a Visual Studio Code extension for organizing commands that we frequently run on the command line. Sometimes we forget that command we want to run, and we will leave our development environment to search for it. That is not productive. With Handy Commands, you organize them into groups of related commands and run them with the click of the mouse. If some part of the command changes from run to run, you can paste and edit it in the terminal. If you no longer frequently use a command, you can delete it. And by organizing them into groups, they will not clutter your workspace.
From v0.0.2, Handy Commands automatically imports the scripts defined in package.json and puts them in their group (Npm Scripts). It watches changes to package.json and updates this group as the script changes.


![screenshot](./assets/screenshot.gif)

## Features

- Add a group to your collection. (Extension is pre-populated with scripts from package.json)
- Add command items to the group. A command item consists of a command and a label.
- Add more groups and commands.
- Select a group to load its commands in the view.
- Run the command by clicking its node.
- Paste a command by clicking the paste icon.
- Delete commands and groups as needed.
- Be more productive.

## Requirements

#### VSCode >= 1.55.0

## Extension Settings

#### None

## Known Issues

#### Currently None

## Release Notes

### Version 0.0.3 - 05/06/2021

## Change Logs

- v0.0.2 Added importing npm scripts from package.json. Npm Scripts is now reserved as the name of this group and cannot be used when creating a new group. Also you can neither delete the group nor commands from it.

- v0.0.3 Groups are moved to the Treeview. On clicking the group node, the Treeview is refreshed with populated with the commands in the group. A back button is provided to go back to the group view.

- v0.0.4 Fixed bug of NPM Scripts not running correctly.

## Author Details

👤 **Obetta Francis**

[![](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/chasscepts) [![](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/chasscepts) [![](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/chasscepts/)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check the [issues page](https://github.com/chasscepts/handy-commands/issues).

## Show your support

⭐ Star this project on [GitHub](https://github.com/chasscepts/handy-commands/) — it helps!

## Acknowledgments

- Microverse Community.

## 📝 License

This project is [MIT](./LICENSE) licensed.
