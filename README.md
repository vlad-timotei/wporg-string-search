# Search strings across WordPress.org projects in your locale

## About the project

This is a userscript, used with TamperMonkey or GreaseMonkey, for beginner polyglots that would like to find out how a specific string was translated before. It will search in 
- current project, current locale
- WordPress development project, current locale
- consistency tool, current locale

## Demo

[![image](https://user-images.githubusercontent.com/65488419/114697845-0f3eee80-9d27-11eb-8356-4632871e9d3b.png)](https://www.youtube.com/watch?v=9TV8CAzpitE)




## Isn't consistency tool enough? 
The [consistency tool](https://translate.wordpress.org/consistency/) is awesome, but as far as I have seen, only finds full strings, not substrings.
Example: even though the string "array" is inside some strings translated [here](https://translate.wordpress.org/projects/wp/dev/ro/default/?filters%5Bterm%5D=array), the consistency tool doesn't find any [here](https://translate.wordpress.org/consistency/?search=array&set=ro%2Fdefault&project=) so you have to search within the project for substrings. 

## Installation

1. First, install the <a href="http://tampermonkey.net/">Tampermonkey</a> or <a href="http://www.greasespot.net/">Greasemonkey</a> browser extensions.
2. Then, [visit this page](https://raw.githubusercontent.com/vlad-timotei/wporg-string-search/main/src/wporg-search-strings-across-projects.js). TamperMonkey or GreaseMonkey should take over from there. If not, manually copy the url and install it.

## Known issues
- First use needs explicit permision for popups from this site

## Contributing
This version is just a proof of concept. Contributions are welcome, bugreports, suggestions and even pull requests! No limitations, shoot for the stars!
