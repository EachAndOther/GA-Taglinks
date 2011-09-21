	/*
	***********************************************************************

	GA tag links
		Tag file downloads and external links in Google Analytics

	@Homepage:		http://www.iqcontent.com
	@Author:			Fabrizio Menghini Calderón <fabrizio.menghini@iqcontent.com>
	@License:		Creative Commons Attribution-Noncommercial-Share Alike 
						3.0 Unported License
	@Copyright:		2009 (c) iQ Content Limited. 
						Some rights reserved.
	@Example: 		$('a').gataglinks({ options });
						$('area').gataglinks({ options });
						$('form').gataglinks({ options });

	***********************************************************************
	*/





	/*
	==============================================
		GA tag plugin
	==============================================
	*/

	(function($) 
	{
		// Start plugin definition

		$.fn.gataglinks = function(settings) 
		{
			// Link event type
			var link_event_type = "click";
			// Form event type
			var form_event_type = "submit";

			// Default options
			var config = 
			{
				// Links tracking strings
				mail_tracker_string: '/virtual/mailto', // Prefix for mailto links
				javascript_tracker_string: '/virtual/javascript', // Prefix for javascript links
				external_tracker_string: '/virtual/external', // Prefix for external links
				internal_download_tracker_string: '/virtual/internal/download', // Prefix for internal file downloads
				external_download_tracker_string: '/virtual/external/download', // Prefix for external file downloads

				// Forms tracking strings
				mail_form_tracker_string: '/action/mailto', // Prefix for mailto actions
				external_form_tracker_string: '/action/external', // Prefix for external actions

				// Subdomain tracking strings
				subdomain_download_tracker_string: '/virtual/subdomain/download', // Prefix for subdomain downloads
				subdomain_tracker_string: '/virtual/subdomain', // Prefix for subdomain links
				subdomain_form_tracker_string: '/action/subdomain', // Prefix for subdomain actions

				separator: '|', // Separator for the virtual tags
				source_destination: true, // Add source and destination string to the virtual path

				extensions: 'doc|pdf|xls|ppt|zip|txt|vsd|vxd|rar|wma|mov|avi|wmv|mp3|xml', // List of extension that will be tracked

				debug: false // Debug mode will display the tracker string into the console
			};
			if(settings) $.extend(config, settings);

			this.each(function()
			{
				switch(this.tagName)
				{
					// Check the tag type
					case "A":
					case "AREA":
					{
						// Check for mail links
						if(this.protocol == "mailto:") 
						{
							_attach_link_tracker(this,"mail");
						}
						// Check for javascript links
						else if(this.protocol == "javascript:") 
						{
							_attach_link_tracker(this,"javascript");
						}
						// Check for internal links
						else if(_detect_internal(this)) 
						{
							_attach_link_tracker(this,"internal");
						}
						// Check for external links
						else 
						{
							_attach_link_tracker(this,"external");
						}
						break;
					}
					case "FORM":
					{	
						var action_uri = this.action.toString().parse_uri();
						var location_uri = window.location.toString().parse_uri();

						// Check for mail actions
						if(action_uri["protocol"] == "mailto") 
						{
							_attach_form_tracker(this,"mail");
						}
						// Check for external actions
						else if(action_uri["authority"] != location_uri["authority"]) 
						{
							_attach_form_tracker(this,"external");
						}
						break;
					}
					default:
					{
						// The plugin works only for anchors, areas and forms
					}
				}
			});
			// return this;



			/*
			==============================================
				Private functions
			==============================================
			*/

			// Debugging information
			function _debug(info)
			{
				if(config.debug)
				{
					if(window.console && window.console.log)
						window.console.log("gataglinks: " + info);
				}
			};

			// Detect internal links
			function _detect_internal($link)
			{
				if((location.host == $link.hostname) || (location.host == $link.host))
					return true;
				else
					return false;
			}

			// Attach the onclick function
			function _attach_link_tracker($object,tracker_type)
			{
				switch(tracker_type)
				{
					case "mail":
					{
						if($object.addEventListener)
							$object.addEventListener(link_event_type, function () { _track_mail($object); }, true);
						else
							$object.attachEvent("on" + link_event_type, function () { _track_mail($object); });
						break;
					}
					case "javascript":
					{
						if($object.addEventListener)
							$object.addEventListener(link_event_type, function () { _track_javascript($object); }, true);
						else
							$object.attachEvent("on" + link_event_type, function () { _track_javascript($object); });
						break;
					}
					case "internal":
					{
						// If the href is not defined do nothing (ex. AREA with nohref attribute)
						if(($object.href == "") || ($object.href == null))
						{
							// Do nothing
						}
						else
						{
							if($object.addEventListener)
								$object.addEventListener(link_event_type, function () { _track_internal($object); }, true);
							else
								$object.attachEvent("on" + link_event_type, function () { _track_internal($object); });
						}
						break;
					}
					case "external":
					{
						// If the href is not defined do nothing (ex. AREA with nohref attribute)
						if(($object.href == "") || ($object.href == null))
						{
							// Do nothing
						}
						else
						{
							if($object.addEventListener)
								$object.addEventListener(link_event_type, function () { _track_external($object); }, true);
							else
								$object.attachEvent("on" + link_event_type, function () { _track_external($object); });
							break;
						}
					}
				}
			}

			// Attach the onsubmit function
			function _attach_form_tracker($object,tracker_type)
			{
				switch(tracker_type)
				{
					case "mail":
					{
						if($object.addEventListener)
							$object.addEventListener(form_event_type, function () { _track_form_mail($object); }, true);
						else
							$object.attachEvent("on" + form_event_type, function () { _track_form_mail($object); });
						break;
					}
					case "external":
					{
						if($object.addEventListener)
							$object.addEventListener(form_event_type, function () { _track_form_external($object); }, true);
						else
							$object.attachEvent("on" + form_event_type, function () { _track_form_external($object); });
						break;
					}
				}
			}



			/*
			==============================================
				Link tracking
			==============================================
			*/

			// Mail tracking
			function _track_mail($object)
			{
				var email_address = $object.href.substring(7);
				var tracker = config.mail_tracker_string + config.separator + window.location.toString().trim_slashes() + config.separator + email_address;
				_debug(tracker);

				// Track the click
				if(typeof(pageTracker) != "undefined")
					pageTracker._trackPageview(tracker);
			}

			// Javascript tracking
			function _track_javascript($object)
			{
				var tracker = config.javascript_tracker_string + config.separator + window.location.toString().trim_slashes();
				_debug(tracker);

				// Track the click
				if(typeof(pageTracker) != "undefined")
					pageTracker._trackPageview(tracker);
			}

			// Internal link tracking
			function _track_internal($object)
			{
				var re = new RegExp("\.(" + config.extensions + "){1}$","i");
				if(re.test($object.pathname.toString().trim_slashes()))
				{
					if(config.source_destination)
						var tracker = config.internal_download_tracker_string + config.separator + "source--" + window.location.toString().trim_slashes() + config.separator + "destination--" + $object.href;
					else
						var tracker = config.internal_download_tracker_string + config.separator + window.location.toString().trim_slashes() + config.separator + $object.href;
					_debug(tracker);

					// Track the click
					if(typeof(pageTracker) != "undefined")
						pageTracker._trackPageview(tracker);
				}
			}

			// External link tracking
			function _track_external($object)
			{
				// We have an external download
				var re = new RegExp("\.(" + config.extensions + "){1}$","i");
				if(re.test($object.pathname.toString().trim_slashes()))
				{
					var tracker_string = config.external_download_tracker_string;
					if(config.domains)
					{
						var uri = $object.href.toString().parse_uri();
						var re = new RegExp("\.(" + config.domains + "){1}$","i");
						if(re.test(uri["domain"]))
						{
							// Found a sub-domain
							tracker_string = config.subdomain_download_tracker_string;
						}
					}

					if(config.source_destination)
						var tracker = tracker_string + config.separator + "source--" + window.location.toString().trim_slashes() + config.separator + "destination--" + $object.href;
					else
						var tracker = tracker_string + config.separator + window.location.toString().trim_slashes() + config.separator + $object.href;
				}
				// We have a normal external link
				else
				{
					var tracker_string = config.external_tracker_string;
					if(config.domains)
					{
						var uri = $object.href.toString().parse_uri();
						var re = new RegExp("\.(" + config.domains + "){1}$","i");
						if(re.test(uri["domain"]))
						{
							// Found a sub-domain
							tracker_string = config.subdomain_tracker_string;
						}
					}

					if(config.source_destination)
						var tracker = tracker_string + config.separator + "source--" + window.location.toString().trim_slashes() + config.separator + "destination--" + $object.href;
					else
						var tracker = tracker_string + config.separator + window.location.toString().trim_slashes() + config.separator + $object.href;
				}
				_debug(tracker);

				// Track the click
				if(typeof(pageTracker) != "undefined")
					pageTracker._trackPageview(tracker);
			}



			/*
			==============================================
				Form tracking
			==============================================
			*/

			// Form mail action tracking
			function _track_form_mail($object)
			{
				var action_uri = $object.action.toString().parse_uri();
				var tracker = config.mail_form_tracker_string + config.separator + window.location.toString().trim_slashes() + config.separator + action_uri["authority"];
				_debug(tracker);

				// Track the click
				if(typeof(pageTracker) != "undefined")
					pageTracker._trackPageview(tracker);
			}

			// Form external action tracking
			function _track_form_external($object)
			{
				var tracker_string = config.external_form_tracker_string;
				if(config.domains)
				{
					var uri = $object.action.toString().parse_uri();
					var re = new RegExp("\.(" + config.domains + "){1}$","i");
					if(re.test(uri["domain"]))
					{
						// Found a sub-domain
						tracker_string = config.subdomain_form_tracker_string;
					}
				}

				if(config.source_destination)
					var tracker = tracker_string + config.separator + "source--" + window.location.toString().trim_slashes() + config.separator + "destination--" + $object.action;
				else
					var tracker = tracker_string + config.separator + window.location.toString().trim_slashes() + config.separator + $object.action;
				_debug(tracker);

				// Track the click
				if(typeof(pageTracker) != "undefined")
					pageTracker._trackPageview(tracker);
			}

		}

		// Prototype function to remove the first and last slash from a url
		String.prototype.trim_slashes = function() 
		{
			var url = this;
			var url_length = url.length;

			if(url.charAt((url_length - 1)) == '/')
				url = url.substring(0,(url_length - 1));

			if(url.charAt(0) == '/')
				url = url.substring(1,url_length);

			return url;
		}

		// Prototype function that extract URI info
		String.prototype.parse_uri = function()
		{
			var uri_elements = ["source","protocol","authority","domain","port","path","directory_path","file_name","query","anchor"];
			var uri_tokens = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?","i").exec(this);
			var uri = {};

			// Create the URI structure
			for(var index = 0; index < 10; index++)
			{
				uri[uri_elements[index]] = (uri_tokens[index] ? uri_tokens[index] : "");
			}

			// Add a trailing slash at the en of the path
			if(uri.directory_path.length > 0)
			{
				uri.directory_path = uri.directory_path.replace(/\/?$/, "/");
			}

			return uri;
		}


		// End plugin definition
	})(jQuery);