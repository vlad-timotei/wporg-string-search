/** Based on https://github.com/Mte90/GlotDict/blob/master/js/glotdict-settings.js */
var settings = { 
	/** Main Features settings with default values */
	'checks' : {
		'desc' : 'A. <b>General Checks</b>',
		'state' : 'enabled',
		'group' : 'Main Features',
		'feature_parent' : 'self'
		},
	'ro_checks' : {
		'desc' : 'B. <b>Romanian checks</b>',
		'state' : 'enabled',
		'group' : 'Main Features',
		'feature_parent' : 'self'
		},
	'search' : {
		'desc' : 'C. <b>Search in other projects</b>',
		'state' : 'enabled',
		'group' : 'Main Features',
		'feature_parent' : 'self'
		},
	'snippets' : {
		'desc' : 'D. <b>Snippets & notes</b>',
		'state' : 'disabled',
		'group' : 'Main Features',
		'feature_parent' : 'self'
		},
	'ro_glossary' : {
		'desc' : 'E. <b>Romanian glossary</b>',
		'state' : 'disabled',
		'group' : 'Main Features',
		'feature_parent' : 'self'
		},
	
	/** Child Features settings with default values*/
	'start_space' : {
		'desc' : 'Additional or missing start space',
		'state' : 'warning',
		'group' : 'A. General checks options',
		'feature_parent' : 'checks'
		},
	'end_space' : {
		'desc' : 'Additional or missing end space',
		'state' : 'warning',
		'group' : 'A. General checks options',
		'feature_parent' : 'checks'
		},
	'end_period' : {
		'desc' : 'Additional or missing end period (.)',
		'state' : 'warning',
		'group' : 'A. General checks options',
		'feature_parent' : 'checks'
		},
	'end_colon' : {
		'desc' : 'Additional or missing end colon (:)',
		'state' : 'warning',
		'group' : 'A. General checks options',
		'feature_parent' : 'checks'
		},
	'end_different' : {
		'desc' : 'Different ending',
		'state' : 'notice',
		'group' : 'A. General checks options',
		'feature_parent' : 'checks'
		},
	'double_spaces' : {
		'desc' : 'Multiple spaces',
		'state' : 'warning',
		'group' : 'A. General checks options',
		'feature_parent' : 'checks'
		},
	'ro_diacritics' : {
		'desc' : 'Wrong ro_RO diacritics (ÃãŞşŢţ)',
		'state' : 'warning',
		'group' : 'B. Romanian checks options',
		'feature_parent' : 'ro_checks'
		},
	'ro_quotes' : {
		'desc' : 'Wrong ro_RO quotes ("" instead of „”)',
		'state' : 'warning',
		'group' : 'B. Romanian checks options',
		'feature_parent' : 'ro_checks'
		},
	'ro_ampersand' : {
		'desc' : '& instead of „și”',
		'state' : 'nothing',
		'group' : 'B. Romanian checks options',
		'feature_parent' : 'ro_checks'
		},
	'ro_slash' : {
		'desc' : 'No spaces around slash (/) ',
		'state' : 'warning',
		'group' : 'B. Romanian checks options',
		'feature_parent' : 'ro_checks'
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
    settings[property]['state'] = user_settings[property];
}
		
var settings_group = "";
var settings_state = 0;

function  wpgpt_settings() {
	if(settings_state){
		location.reload();
		return; // just in case at some point a refresh won't be needed anymore, but now, too much stuff to reset
		$(".wpgpt_settings a").text("Tools Settings");
		settings_state = 0;
	}
	else {
		$(".wpgpt_settings a").text("Close Settings & Refresh");
		settings_state = 1;
	}
	
	if ($('.wpgpt_settings_window').length !== 0) {
		$('.wpgpt_settings_window').toggle();
		return;
	}
	
	var container = '<div class="wpgpt_settings_window"></div>';
	$('.gp-content').prepend(container);

	
	var settings_html_output = "";
	
	var settings_count = Object.keys(settings).length;
	var i = 1;

	$.each(settings, function(key) {
		
		if( settings[key]['group'] != settings_group ){
			
			if( settings_group == "A. General checks options")
				settings_html_output += "<tr><td>Missing or broken placeholders</td><td colspan = '3'>Can't be disabled. To bypass, click <i>Save / approve with warnings</i> when prompted.</td></tr>";

			if( settings_group != "" )
				settings_html_output += "</table></div>";
			
			settings_group = settings[key]['group'];
			settings_html_output +="<div class='wpgpt-settings-" + settings[key]['feature_parent'] +"'><h3>" + settings_group + "</h3><table class='wpgpt-settings-table'>";
		}
		if( settings[key]['feature_parent'] == "checks" || settings[key]['feature_parent'] == "ro_checks" ){
			settings_html_output += '<tr><td>' + settings[key]['desc'] + '</td>' +
			'<td><label><input type="radio" class="wpgpt-update" name="' + key + '" value="warning" ' + ( ( settings[key]['state'] == 'warning' ) ? 'checked' : '' ) + '> Warn & prevent save</label></td>'+
			'<td><label><input type="radio" class="wpgpt-update" name="' + key + '" value="notice" ' + ( ( settings[key]['state'] == 'notice' ) ? 'checked' : '' )  + '> Just notification</label></td>'+
			'<td><label><input type="radio" class="wpgpt-update" name="' + key + '" value="nothing" ' + ( ( settings[key]['state'] == 'nothing' ) ? 'checked' : '' ) + '> Don\'t check</label></td></tr>';
		
		
		} 
		else if( settings[key]['feature_parent'] == "self" ){
			settings_html_output += '<tr><td>' + settings[key]['desc'] + '</td>' +
			'<td><label><input type="radio" class="wpgpt-update is-parent" name="' + key + '" value="enabled" ' + ( ( settings[key]['state'] == 'enabled' ) ? 'checked' : '' ) + '> Enabled</label></td>'+
			'<td><label><input type="radio" class="wpgpt-update is-parent" name="' + key + '" value="disabled" ' + ( ( settings[key]['state'] == 'disabled' ) ? 'checked' : '' ) + '> Disabled</label></td></tr>';
		}
		
		if(i == settings_count){
			settings_html_output += "</table></div>";
			$('.wpgpt_settings_window').append(settings_html_output);
			$.each(settings, function(key) {
				if(settings[key]['feature_parent'] == "self" && settings[key]['state'] == "disabled")
					$(".wpgpt-settings-" + key ).hide();
			});
		}
		i++;
	});

	$(".wpgpt-update").click(function(){
		var option_name = $(this).attr('name'); 
		var option_value = $(this).val();
		update_settings( option_name, option_value, true );	
		
		if( $(this).hasClass('is-parent') )
			if( option_value == "disabled" )
				update_feature(option_name, "nothing");
			else 
				update_feature(option_name, "warning");				
	}); 
 }
 
function update_feature(feature_name, feature_status){
	 
	if(feature_status == "nothing")
		$(".wpgpt-settings-" + feature_name ).hide(200);
	else
		$(".wpgpt-settings-" + feature_name ).show(200);
	 
	/** Only if I want to reset saved Features options
	
	$.each(settings, function(key) {
		if(settings[key]['feature_parent'] == feature_name)
			settings[key]['state'] = feature_status;
		});
				
	$(".wpgpt-settings-" + feature_name + " .wpgpt-update").each(function() {
		if($(this).val() == feature_status)
			$(this).prop("checked", true);
	});
				
	update_settings( '', '', false );
	*/
}
 
function update_settings(name, val, once){
	if( once )
		settings[name]['state'] = val;
	for ( const property in settings )
    user_settings[property]= settings[property]['state'];
    setLS('wpgpt-user-settings', JSON.stringify( user_settings ) );
}

/**
 ** Override show function to display the editor in the middle of the screen
 ** Based on: https://meta.trac.wordpress.org/browser/sites/trunk/wordpress.org/public_html/wp-content/plugins/wporg-gp-customizations/templates/js/editor.js#L143
 */

 $gp.editor.show = ( function( original ) {
	 return function(element) {
		 original.apply( $gp.editor, arguments );	 			
		 document.getElementById('editor-' + element.closest( 'tr' ).attr( 'row' )).scrollIntoView({
			 behavior: 'auto',
			 block: 'center',
			 inline: 'center'
			 });
		}
	})( $gp.editor.show );
	
})( jQuery );