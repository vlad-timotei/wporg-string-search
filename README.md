# Search strings across WordPress.org projects in your locale

## About the project

This is a Chrome extension, Firefox add-on or userscript to use with TamperMonkey or GreaseMonkey.

For consistency purposes, a translator wants to see previous translations of a certain word.
Current workflow involves filtering trough current project, wp/dev project and consistency tool for a certain word, but it's time consuming.

This script opens search results for 
- current project, current locale
- WordPress development project, current locale
- consistency tool, current locale

## Demo

[![image](https://user-images.githubusercontent.com/65488419/114697845-0f3eee80-9d27-11eb-8356-4632871e9d3b.png)](https://www.youtube.com/watch?v=9TV8CAzpitE)




## Isn't consistency tool enough? 
The [consistency tool](https://translate.wordpress.org/consistency/) is awesome, but as far as I have seen, only finds full strings, not substrings.
Example: even though the string "array" is inside some strings translated [here](https://translate.wordpress.org/projects/wp/dev/ro/default/?filters%5Bterm%5D=array), the consistency tool doesn't find any [here](https://translate.wordpress.org/consistency/?search=array&set=ro%2Fdefault&project=) so you have to search within the project for substrings. And since wildcard search is not (yet) possible ([see ticket](https://meta.trac.wordpress.org/ticket/5228)), this userscript might be a solution.

## Installation

##### Google Chrome & Edge

1. Get the lates release from [here] (https://github.com/vlad-timotei/wporg-string-search/releases) and extract to a folder.
2. Open Chrome extensions `chrome://extensions/` or `edge://extensions/` and enable Developer mode.
3. Then use Load Unpacked button and point to the `wporg-string-search\dist\latest\chrome` folder
4. That's it! Go to a translate project to see it in action.

##### UserScript

1. First, install the <a href="http://tampermonkey.net/">Tampermonkey</a> or <a href="http://www.greasespot.net/">Greasemonkey</a> browser extensions.
2. Then, [visit this page](https://raw.githubusercontent.com/vlad-timotei/wporg-string-search/main/dist/latest/userscript/wporg-string-search-standalone.js). TamperMonkey or GreaseMonkey should take over from there. If not, manually copy the url and install it. I don't know why Tampermonkey doesn't automatically prompts to install this script.

##### Firefox

Unfortunatelly, Firefox will let you use unpacked add-ons only temporary, having to follow these steps everytime you open the browser. If you know a solution, let me know
1. Get the lates release from [here] (https://github.com/vlad-timotei/wporg-string-search/releases) and extract to a folder.
2. Open Firefox Debug This Firefox page  `about:debugging#/runtime/this-firefox `
3. Use Load temporary Add-on... button and point to the `wporg-string-search\dist\latest\firefox\manifest.json` file.
4. That's it! Go to a translate project to see it in action.


## Known issues
- Script User version only: first use needs explicit permision for popups from this site
- Extension & Addon are not packed, hence the Firefox problem with unsigned add-ons.
- The repo doesn't use workflows to build the release additional zip - I couldn't make it work - if anyone has some hints, let me know.

## Contributing
This version is just a proof of concept. Contributions are welcome, bugreports, suggestions and even pull requests! No limitations, shoot for the stars!

## Changelog

##### v.1.0
- rudimentar userscript
##### v.1.1
- userscript
- jQuery included
- user prefferences
- close tabs
##### v.1.2
- Chrome extension
- Firefox add-on
