( function( $ ){
	
if( settings['ro_glossary']['state'] == "enabled" )
	$(document).ready(display_glossary);	

const pathname = window.location.pathname;
var findlocale = pathname.split("/");
const short_locale = $(findlocale).get(-3);


function display_glossary(){
 var orig_txt, string_id, wpgpt_glossary_output;
	$(".editor-panel__right .panel-content").each(function() {
		string_id = $(this).closest('tr').attr('id');
		orig_txt = $( "#" + string_id + " .source-string__singular span.original" ).text();
		wpgpt_glossary_output="";
		wpgpt_glossary.forEach(function (item, index) { wpgpt_glossary_output += show_word_in_glossary (item, index, orig_txt)});
	
	if(wpgpt_glossary_output!=""){
		console.log("trying to load glossary");
		wpgpt_glossary_output="<table class='my-glossary glossary'><thead><tr><th colspan='2'>My Glossary</th></tr></thead>"+wpgpt_glossary_output+"</table>";
		$("#"+string_id+" .editor-panel__right .panel-content").append(wpgpt_glossary_output); 
	}
			
	});
}

function show_word_in_glossary(item, index, original_string){
	if(original_string.toLowerCase().includes(wpgpt_glossary[index]['en'].toLowerCase()))
		return "<tr><td>"+wpgpt_glossary[index]['en']+" </td><td> "+wpgpt_glossary[index][short_locale]+"</td></tr>";
    return "";
}
	
})( jQuery );




