(function () {
  var extensionID = "rebrand@extensions.kaply.com";
  var extensionName = "rebrand";

  var prefBranch;

  function migratePreferences() {
    var oldPrefBranch = Components.classes["@mozilla.org/preferences-service;1"]
	                              .getService(Components.interfaces.nsIPrefService)
                                  .getBranch("rebrand.");
    var children = oldPrefBranch.getChildList("", {});
	if (children.length > 0) {
	  var rebrandSettingsObject = {};
	  var prefName;
	  var prefValue;
	  for (var i=0; i < children.length; i++) {
		prefName = children[i].replace("rebrand.", "");
		prefValue = oldPrefBranch.getCharPref(prefName);
		rebrandSettingsObject[prefName] = prefValue;
	  }
  
	  var rebrandSettingsJSON = JSON.stringify(rebrandSettingsObject);
	  prefBranch.setCharPref("settings", rebrandSettingsJSON);
	  oldPrefBranch.deleteBranch("");
	}
  }
  function startup()
  {
    var firstrun = prefBranch.getBoolPref("firstrun");

    var curVersion = "0.0.0";

	if (firstrun) {
	  migratePreferences();
      window.setTimeout(function(){
        gBrowser.selectedTab = gBrowser.addTab("http://mike.kaply.com/addons/" + extensionName + "/install/");
      }, 1000);
	  prefBranch.setBoolPref("firstrun", false);
	  prefBranch.setCharPref("installedVersion", curVersion);
	} else {
	  var installedVersion;
	  if (prefBranch.prefHasUserValue("installedVersion")) {
		installedVersion = prefBranch.getCharPref("installedVersion");
		if (curVersion > installedVersion) {
		  /* Upgrade */
          window.setTimeout(function(){
            gBrowser.selectedTab = gBrowser.addTab("http://mike.kaply.com/addons/" + extensionName + "/upgrade/");
          }, 1000);
		  prefBranch.setCharPref("installedVersion", curVersion);
		}
	  }
	}
    window.removeEventListener("load", startup, false);
  }

  function shutdown()
  {
	window.removeEventListener("unload", shutdown, false);
  }
  prefBranch = Components.classes["@mozilla.org/preferences-service;1"]
                         .getService(Components.interfaces.nsIPrefService)
                         .getBranch("extensions." + extensionID + ".");

  window.addEventListener("load", startup, false);
//  window.addEventListener("unload", shutdown, false);
})();
