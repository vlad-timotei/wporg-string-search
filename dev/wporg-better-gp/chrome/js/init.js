/**
 ** Based on https://github.com/Mte90/GlotDict/blob/master/js/init.js 
 ** Scripts are loaded at the end of the head to override some editor keyboard shortcuts*
 */

var jsScripts = ['checks', 'snippets', 'search', 'functions' ];
script(jsScripts);

parse_img();
function parse_img(){
	var warning_icon = chrome.extension.getURL('img/warning.png');
	var img_script = document.createElement('script');
	img_script.type = 'text/javascript';
	img_script.innerHTML = ' var warning_icon = "' + warning_icon + '";';    
	document.getElementsByTagName('head')[0].appendChild(img_script);
}

function script(url) {
  if (Array.isArray(url)) {
    var self = this,
      prom = [];
    url.forEach(function(item) {
      prom.push(self.script(item));
    });
    return Promise.all(prom);
  } 
  return new Promise(function(resolve, reject) {
    var r = false,
	t = document.getElementsByTagName('head')[0],
    s = document.createElement('script'); 
    s.type = 'text/javascript';
    s.src = chrome.extension.getURL('js/wporg-better-gp-' + url + '.js');
    s.async = false;
    s.onload = s.onreadystatechange = function() {
      if (!r && (!this.readyState || this.readyState === 'complete')) {
        r = true;
        resolve(this);
      }
    };
    s.onerror = s.onabort = reject;
    t.appendChild(s);
  });
}

