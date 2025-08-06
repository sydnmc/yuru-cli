# yuru-cli

a cli written in nodejs, made to interact with information served by [api.yuru.ca](https://api.yuru.ca)

## installation

simply run `npm install -g .` in the root of the folder to install yuru-cli systemwide~ you can then invoke yuru-cli anywhere!!

## usage

most of the information you'd need is in the help command, and is otherwise relatively self explanatory, but for reference: 

`setadd [set id]` - adds the provided set to the yuru.ca database

`diffadd [person] [diff id]` - adds the provided diff to the yuru.ca database, depending on the person given

`setedit` - lists all available sets and gives you an option to select one to edit

`diffedit [person]` - lists all available gds for the given person and lets you select one to edit