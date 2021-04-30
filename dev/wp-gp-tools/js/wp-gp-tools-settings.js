/** Based on https://github.com/Mte90/GlotDict/blob/master/js/glotdict-settings.js */
var settings = { 
	'start_space' : {
		'desc' : 'Additional or missing start space',
		'action' : 'warning',
		'group':'General'
		},
	'end_space' : {
		'desc' : 'Additional or missing end space',
		'action' : 'warning',
		'group':'General'
		},
	'end_period' : {
		'desc' : 'Additional or missing end period (.)',
		'action' : 'warning',
		'group':'General'
		},
	'end_colon' : {
		'desc' : 'Additional or missing end colon (:)',
		'action' : 'warning',
		'group':'General'
		},
	'end_different' : {
		'desc' : 'Different ending',
		'action' : 'notice',
		'group':'General'
		},
	'double_spaces' : {
		'desc' : 'Multiple spaces',
		'action' : 'warning',
		'group':'General'
		},
	'ro_diacritics' : {
		'desc' : 'Wrong ro_RO diacritics (ÃãŞşŢţ)',
		'action' : 'warning',
		'group':'ro_RO'
		},
	'ro_quotes' : {
		'desc' : 'Wrong ro_RO quotes ("" instead of „”)',
		'action' : 'warning',
		'group':'ro_RO'
		},
	'ro_ampersand' : {
		'desc' : '& instead of „și”',
		'action' : 'nothing',
		'group':'ro_RO'
		},
	'ro_slash' : {
		'desc' : 'No spaces around slash (/) ',
		'action' : 'warning',
		'group':'ro_RO'
		}
};

( function( $ ){
	
$('#menu-headline-nav').append('<li class="current-menu-item wpgpt_settings" style="cursor:pointer;"><a style="font-weight:bold;">Tools Settings</a></li>');
$('.wpgpt_settings').click(function() {
  wpgpt_settings();
});

var user_settings = {}; 

if(getLS('wpgpt-user-settings') !== null){
	user_settings = JSON.parse( getLS('wpgpt-user-settings') ); 
	for ( const property in settings )
    settings[property]['action'] = user_settings[property];
}
		
var settings_group = "";
var settings_state = 0;

function  wpgpt_settings() {
	
	if(settings_state){
		$(".wpgpt_settings a").text("Tools Settings");
		settings_state = 0;
	}
	else {
		$(".wpgpt_settings a").text("Close Settings");
		settings_state = 1;
	}
	
	
	if ($('.wpgpt_settings_window').length !== 0) {
		$('.wpgpt_settings_window').toggle();
		            return;
	}
	
	var container = '<div class="wpgpt_settings_window"></div>';
	$('.gp-content').prepend(container);

	
	var settings_html_output = "";

	$.each(settings, function(key) {
		
		if( settings[key]['group'] != settings_group ){
			if( settings_group != "" )
				settings_html_output += "</table>";
			
			settings_group = settings[key]['group'];
			settings_html_output +="<h3>" + settings_group + " Settings</h3><table class='wpgpt-options'>";
		}
		settings_html_output += '<tr><td>' + settings[key]['desc'] + '</td>' +
		'<td><label><input type="radio" class="wpgpt-setting-radio" name="' + key + '" value="warning" ' + ( ( settings[key]['action'] == 'warning' ) ? 'checked' : '' ) + '> Warn & prevent save</label></td>'+
		'<td><label><input type="radio" class="wpgpt-setting-radio" name="' + key + '" value="notice" ' + ( ( settings[key]['action'] == 'notice' ) ? 'checked' : '' )  + '> Just notification</label></td>'+
		'<td><label><input type="radio" class="wpgpt-setting-radio" name="' + key + '" value="nothing" ' + ( ( settings[key]['action'] == 'nothing' ) ? 'checked' : '' ) + '> Don\'t check</label></td></tr>';

	});
	
	settings_html_output += "</table>";
	settings_html_output += "<p class='note'><b>Missing or broken placeholders warnings can't be disabled</b><br>You can however click <i>save with warnings</i> checkbox in the warnings panel</p>";
	
	$('.wpgpt_settings_window').append(settings_html_output);
	
	$(".wpgpt-setting-radio").click(function(){
		update_setting($(this).attr('name'), $(this).val() );		
	}); 
 }
 
 function update_setting(name, val){
	settings[name]['action'] = val;
	for ( const property in settings )
    user_settings[property]= settings[property]['action'];
    setLS('wpgpt-user-settings', JSON.stringify( user_settings ) );
 }

/** toDo - this doesn't work - maybe relocate
let params = new URLSearchParams(document.location.search.substring(1));
let is_result_page = params.get("resultpage");
	if (is_result_page !== null) {
   
    $(document).ready(function() {
		jQuery("#toggle-translations-unique").click();
	 
	 if($(".breadcrumb").lenght)
      $([document.documentElement, document.body]).animate({
        scrollTop: $(".breadcrumb").offset().top
      }, 5);
	  
    });
  }
*/
})( jQuery );