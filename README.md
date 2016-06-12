# Haros Express
Haros Express is a thought experiment for me to mess around with building my own API gateway. Think something like [StrongLoop's old API Connect](https://docs.strongloop.com/display/LGW/StrongLoop+API+Gateway). This is an Express application built on top of the [Haros](https://github.com/camuthig/haros) package. The gateway should be able to:

1. Route traffic to any number of servers/APIs (using Haros)
1. Handle management (including live reload) of forward servers (using Haros)
1. Handle creation and management of users. I'm just tired of rebuilding this kind of thing for all of my toy projects.
2. Present an easily recreatable situation for future projects. 

What it is not:

1. Production ready. This is just for me to screw around with for now. I want to make it usable, but don't have time for real production capabilities.

## How to use this

1. Fork/copy the project
2. Create your own default.json configuration file
3. Run ```npm start```
4. Add services through the API
5. Login through the index page ```http://localhost:3000/```
6. Profit

## Future Improvements and To Do's

1. Standardize JSON API probably around the official [spec](jsonapi.org) - DONEish
1. Get some unit tests in there
1. Add in some simple, extendable frontend components. Bower component?
2. Figure out a better way to make this recreateable: yeoman generator? package? what? 
