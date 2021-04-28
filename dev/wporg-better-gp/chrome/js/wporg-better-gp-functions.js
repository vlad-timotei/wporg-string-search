function temp_msg(elem, new_msg, default_msg, dissapear){

	jQuery(elem).fadeOut(function() { jQuery(this).text(new_msg).fadeIn(500); });
	
	if(dissapear == true)
		setTimeout(function(){ jQuery(elem).hide(1000).text(default_msg); }, 500);
	else
		setTimeout(function(){ jQuery(elem).fadeOut(function() { jQuery(this).text(default_msg).fadeIn(500); }); }, 3000);
	
}

function get_now_date(){	
var today = new Date();
return today.getDate()+'/'+(today.getMonth()+1)+' at '+today.getHours() + ":" + today.getMinutes();
}

function setLS(name, value) {
  localStorage.setItem(name, value);
}

function getLS(name) {
  return localStorage.getItem(name);
}

function delLS(name){
  localStorage.removeItem(name);
}