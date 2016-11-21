/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Client Customization Kit (CCK).
 *
 * The Initial Developer of the Original Code is IBM Corp.
 * Portions created by the Initial Developer are Copyright (C) 2005
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const bundlename = "bundle_rebrand";
const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
var gPrefBranch = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(nsIPrefBranch);
                            
var gPromptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                               .getService(Components.interfaces.nsIPromptService);


function OpenWizard()
{
  var settingsJSON = "{}";
  try {
    settingsJSON = gPrefBranch.getCharPref("extensions.rebrand@extensions.kaply.com.settings");
  } catch (e) {}
  var settingsObject = JSON.parse(settingsJSON);
  var elements = document.getElementsByAttribute("id", "*");
  for (var i=0; i < elements.length; i++) {
    if (elements[i].nodeName == "textbox") {
      try {
		if (settingsObject[elements[i].id]) {
          elements[i].value = settingsObject[elements[i].id];
		}
      } catch (ex) {}
    }
  }
  if (document.getElementById("logoCopyright").value == '') {
  	document.getElementById("logoCopyright").value = "Firefox and the Firefox logos are trademarks of the Mozilla Foundation.";
  }
  if (document.getElementById("trademarkInfo2").value == '') {
  	document.getElementById("trademarkInfo2").value = "Some of the trademarks used under license from The Charlton Company.";
  }
}

function CloseWizard()
{
  var button;
    var bundle = document.getElementById(bundlename);

    var button = gPromptService.confirmEx(window, bundle.getString("windowTitle"), bundle.getString("cancelConfirm"),
                                          (gPromptService.BUTTON_TITLE_YES * gPromptService.BUTTON_POS_0) +
                                          (gPromptService.BUTTON_TITLE_NO * gPromptService.BUTTON_POS_1),
                                          null, null, null, null, {});
  if (button == 0) {
    var elements = document.getElementsByAttribute("id", "*");
	var settingsObject = {};
    for (var i=0; i < elements.length; i++) {
      if (elements[i].nodeName == "textbox") {
        settingsObject[elements[i].id] = elements[i].value;
      }
    }
	var settingsJSON = JSON.stringify(settingsObject);
    gPrefBranch.setCharPref("extensions.rebrand@extensions.kaply.com.settings", settingsJSON);
  }
}

var creatingXPI = false;

function CreateXPI()
{
  if (creatingXPI) {
	return false;
  }

  var bundle = document.getElementById(bundlename);
  
  creatingXPI = true;
  var currentconfigpath = document.getElementById("xpiLocation").value;
  if (!currentconfigpath) {
  gPromptService.alert(window, bundle.getString("windowTitle"),
                       "No output path specified.");
    creatingXPI = false;
    return false;
  }

  var elements = document.getElementsByAttribute("id", "*");
  var settingsObject = {};
  for (var i=0; i < elements.length; i++) {
    if (elements[i].nodeName == "textbox") {
      settingsObject[elements[i].id] = elements[i].value;
    }
  }
  var settingsJSON = JSON.stringify(settingsObject);
  gPrefBranch.setCharPref("extensions.rebrand@extensions.kaply.com.settings", settingsJSON);

  var destdir = Components.classes["@mozilla.org/file/local;1"]
                          .createInstance(Components.interfaces.nsILocalFile);
  destdir.initWithPath(currentconfigpath);
  destdir.append("rebrand");

  try {
    destdir.remove(true);
  } catch(ex) {}
  
  var file = destdir.clone();
  file.append("install.rdf");
  try {
    file.remove(false);
  } catch (ex) {}
  try {
    file.create(Components.interfaces.nsIFile.MORMAL_FILE_TYPE, 0664);
  } catch(e) {
    gPromptService.alert(window, bundle.getString("windowTitle"),
                         "Unable to access output directory.");
    creatingXPI = false;
    return false;
  }

  var contentdir = destdir.clone();
  contentdir.append("xpi");
  contentdir.append("chrome");
  contentdir.append("content");
  try {
    contentdir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
  } catch(ex) {}

  CopyFile(document.getElementById("iconURL").value, contentdir, "icon.png");
  CopyFile(document.getElementById("about").value, contentdir, "about.png");
  CopyFile(document.getElementById("aboutCredits").value, contentdir, "aboutCredits.png");
  CopyFile(document.getElementById("icon64").value, contentdir, "icon64.png");
  CopyFile(document.getElementById("icon48").value, contentdir, "icon48.png");
  CopyFile(document.getElementById("icon16").value, contentdir, "icon16.png");
  CopyFile(document.getElementById("throbber-single").value, contentdir, "throbber-single.png");
  CopyFile(document.getElementById("throbber-anim").value, contentdir, "throbber-anim.png");
  CopyFile(document.getElementById("throbber16-single").value, contentdir, "throbber16-single.png");
  CopyFile(document.getElementById("throbber16-anim").value, contentdir, "throbber16-anim.png");
  CopyFile(document.getElementById("aboutLogo").value, contentdir, "aboutLogo.png");
  CopyFile(document.getElementById("aboutWordmark").value, contentdir, "aboutWordmark.png");

  var localedir = destdir.clone();
  localedir.append("xpi");
  localedir.append("chrome");
  localedir.append("locale");
  try {
    localedir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
  } catch(ex) {}

  RebrandWriteProperties(localedir);
  RebrandWriteAppStrings(localedir);
  RebrandWriteDTD(localedir);
  RebrandWriteSyncDTD(localedir);
  
  
/* ---------- */

  var xpidir = destdir.clone();
  xpidir.append("xpi");
  try {
    xpidir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);    
  } catch(ex) {}

  CopyFile(document.getElementById("iconURL").value, xpidir, "icon.png");

  RebrandWriteChromeManifest(xpidir)
  RebrandWriteInstallRDF(xpidir);
  
  xpidir.append("chrome");
  try {
    xpidir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
  } catch(ex) {}

  xpidir.append("icons");
  xpidir.append("default");
  
  try {
    xpidir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);    
  } catch(ex) {}

  CopyFile(document.getElementById("main-window-ico").value, xpidir, "main-window.ico");
  CopyFile(document.getElementById("main-window-ico").value, xpidir, "places.ico");
  CopyFile(document.getElementById("main-window-ico").value, xpidir, "downloadManager.ico");
  CopyFile(document.getElementById("main-window-ico").value, xpidir, "viewSource.ico");
  CopyFile(document.getElementById("main-window-ico").value, xpidir, "extensionsManager.ico");
  CopyFile(document.getElementById("main-window-ico").value, xpidir, "JSConsoleWindow.ico");
  CopyFile(document.getElementById("main-window-xbm").value, xpidir, "main-window.xbm");
  CopyFile(document.getElementById("main-window16-xbm").value, xpidir, "main-window16.xbm");
         
  var filename = document.getElementById("filename").value;
  if (filename.length == 0) {
    filename = "rebrand";
  }

  var xpifile = Components.classes["@mozilla.org/file/local;1"]
                          .createInstance(Components.interfaces.nsILocalFile);
  xpifile.initWithPath(currentconfigpath);
  xpifile.append(filename + ".xpi");

  var xpidir = destdir.clone();
  xpidir.append("xpi");

  Zip(xpifile, xpidir,
         ["chrome", "chrome.manifest", "install.rdf"]);

  destdir.remove(true);

  gPromptService.alert(window, bundle.getString("windowTitle"),
                       bundle.getString("outputLocation") + xpifile.path);
  creatingXPI = false;
  return true;
}

/* This function takes a file in the chromedir and creates a real file */

function CopyChromeToFile(chromefile, location)
{
  var file = location.clone();
  file.append(chromefile);

  try {
    file.remove(false);                         
  } catch (ex) {
  }
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);

  fos.init(file, -1, -1, false);

  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components
    .classes["@mozilla.org/scriptableinputstream;1"]
    .getService(Components.interfaces.nsIScriptableInputStream);
    
  var channel=ioService.newChannel("chrome://rebrand/content/srcfiles/" + chromefile + ".in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  fos.write(str, str.length); 
  fos.close();
}

function zwRecurse(zipobj, dirobj, location) {
  var entries = dirobj.directoryEntries;

  while (entries.hasMoreElements()) {
    var file = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);;
    if (file.exists() && file.isDirectory()) {
      zwRecurse(zipobj, file, location);
    } else if (file.exists()) {
      /* Remove beginning of path */
      var path = file.path.replace(location.path, "");
      /* Remove beginning slash */
      path = path.substr(1);
	  /* Convert back slashes to forward slashes */
	  path = path.replace(/\\/g, "/");
      zipobj.addEntryFile(path, Components.interfaces.nsIZipWriter.COMPRESSION_NONE, file, false);
    }
  }
}

/* This function creates a given zipfile in a given location */
/* It takes as parameters the names of all the files/directories to be contained in the ZIP file */
/* It works by creating a CMD file to generate the ZIP */
/* or using the nsIZipWriter interface */
/* files_to_zip is an array */

function Zip(zipfile, location, files_to_zip)
{
  try {
    zipfile.remove(false);
  } catch (ex) {}

  if (Components.interfaces.nsIZipWriter) {
    var zipwriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
    var zipwriterobj = new zipwriter();
    zipwriterobj.open(zipfile, 0x04 | 0x08 | 0x20);

    for (var i=0; i < files_to_zip.length; i++) {
      var sourcepathobj = location.clone();
      sourcepathobj.append(files_to_zip[i]);
      if (sourcepathobj.exists() && sourcepathobj.isDirectory()) {
        zwRecurse(zipwriterobj, sourcepathobj, location);
      } else if (sourcepathobj.exists()) {
        /* Remove beginning of path */
        var path = sourcepathobj.path.replace(location.path, "");
        /* Remove beginning slash */
        path = path.substr(1);
        path = path.replace(/\\/g, "/");
        zipwriterobj.addEntryFile(path, Components.interfaces.nsIZipWriter.COMPRESSION_NONE, sourcepathobj, false);
      }
    }
    zipwriterobj.close();
    return;
  } else {
	alert("nsIZipWriter interface not available");
  }
}

function RebrandWriteProperties(destdir)
{
  var file = destdir.clone();
  file.append("brand.properties");
  
  try {
    file.remove(false);                         
  } catch (ex) {}
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);
  var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterOutputStream);

  fos.init(file, -1, -1, false);
  cos.init(fos, null, 0, null);
  
  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .getService(Components.interfaces.nsIScriptableInputStream);
    
  var channel=ioService.newChannel("chrome://rebrand/content/srcfiles/brand.properties.in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  str = str.replace(/%brandShortName%/g, document.getElementById("brandShortName").value);
  str = str.replace(/%brandFullName%/g, document.getElementById("brandFullName").value);
  str = str.replace(/%vendorShortName%/g, document.getElementById("vendorShortName").value);
  cos.writeString(str);

  cos.close();
  fos.close();
}

function RebrandWriteAppStrings(destdir)
{
  var file = destdir.clone();
  file.append("appstrings.properties");
  
  try {
    file.remove(false);                         
  } catch (ex) {}
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);
  var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterOutputStream);

  fos.init(file, -1, -1, false);
  cos.init(fos, null, 0, null);
  
  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .getService(Components.interfaces.nsIScriptableInputStream);
    
  var channel=ioService.newChannel("chrome://rebrand/content/srcfiles/appstrings.properties.in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  str = str.replace(/%brandShortName%/g, document.getElementById("brandShortName").value);
  cos.writeString(str);

  cos.close();
  fos.close();
}

function RebrandWriteChromeManifest(destdir)
{
  var localeline = "locale rebranding en-US chrome/locale/\n";
  var contentline = "content rebranding chrome/content/\n";
  var propertiesOverride = "override chrome://branding/locale/brand.properties chrome://rebranding/locale/brand.properties\n";
  var dtdOverride = "override chrome://branding/locale/brand.dtd chrome://rebranding/locale/brand.dtd\n";
  var dtdSyncOverride = "override chrome://browser/locale/syncBrand.dtd chrome://rebranding/locale/syncBrand.dtd\n";
  var aboutOverride = "override chrome://branding/content/about.png chrome://rebranding/content/about.png\n";
  var aboutTB2Override = "override chrome://branding/content/about-thunderbird.png chrome://rebranding/content/about.png\n";
  var aboutCreditsOverride = "override chrome://branding/content/aboutCredits.png chrome://rebranding/content/aboutCredits.png\n";
  var aboutCreditsTBOverride = "override chrome://branding/content/about-credits.png chrome://rebranding/content/aboutCredits.png\n";
  var icon64Override = "override chrome://branding/content/icon64.png chrome://rebranding/content/icon64.png\n";
  var icon48Override = "override chrome://branding/content/icon48.png chrome://rebranding/content/icon48.png\n";
  var icon16Override = "override chrome://branding/content/icon16.png chrome://rebranding/content/icon16.png\n";
  var appstringsOverride = "override chrome://global/locale/appstrings.properties chrome://rebranding/locale/appstrings.properties\n";
  var throbberSingleOverride = "override chrome://communicator/skin/brand/throbber-single.png chrome://rebranding/content/throbber-single.png\n";
  var throbberAnimOverride = "override chrome://communicator/skin/brand/throbber-anim.png chrome://rebranding/content/throbber-anim.png\n";
  var throbber16SingleOverride = "override chrome://communicator/skin/brand/throbber16-single.png chrome://rebranding/content/throbber16-single.png\n";
  var throbber16AnimOverride = "override chrome://communicator/skin/brand/throbber16-anim.png chrome://rebranding/content/throbber16-anim.png\n";
  var iconOverride = "override chrome://branding/content/icon.png chrome://rebranding/content/icon.png\n";
  //FF4
  var aboutLogoOverride = "override chrome://branding/content/about-logo.png chrome://rebranding/content/aboutLogo.png\n";
  var aboutWordmarkOverride = "override chrome://branding/content/about-wordmark.png chrome://rebranding/content/aboutWordmark.png\n";

  var file = destdir.clone();
  file.append("chrome.manifest");
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);
  fos.init(file, -1, -1, false);
  
  var content = false;

  if ((document.getElementById("brandShortName").value) ||
      (document.getElementById("brandFullName").value) ||
      (document.getElementById("vendorShortName").value)) {
    fos.write(localeline, localeline.length);
    fos.write(dtdOverride, dtdOverride.length);
    fos.write(dtdSyncOverride, dtdSyncOverride.length);
    fos.write(propertiesOverride, propertiesOverride.length);
    fos.write(appstringsOverride, appstringsOverride.length);
  }

  if (document.getElementById("about").value) {
    fos.write(aboutOverride, aboutOverride.length);
    fos.write(aboutTB2Override, aboutTB2Override.length);
	content = true;
  }
  if (document.getElementById("aboutCredits").value) {
    fos.write(aboutCreditsOverride, aboutCreditsOverride.length);
    fos.write(aboutCreditsTBOverride, aboutCreditsTBOverride.length);
	content = true;
  }
  if (document.getElementById("icon64").value) {
    fos.write(icon64Override, icon64Override.length);
	content = true;
  }
  if (document.getElementById("icon48").value) {
    fos.write(icon48Override, icon48Override.length);
	content = true;
  }
  if (document.getElementById("icon16").value) {
    fos.write(icon16Override, icon16Override.length);
	content = true;
  }
  if (document.getElementById("aboutLogo").value) {
    fos.write(aboutLogoOverride, aboutLogoOverride.length);
	content = true;
  }
  if (document.getElementById("aboutWordmark").value) {
    fos.write(aboutWordmarkOverride, aboutWordmarkOverride.length);
	content = true;
  }

  if (document.getElementById("throbber-single").value) {
    fos.write(throbberSingleOverride, throbberSingleOverride.length);
	content = true;
  }
  if (document.getElementById("throbber-anim").value) {
    fos.write(throbberAnimOverride, throbberAnimOverride.length);
	content = true;
  }
  if (document.getElementById("throbber16-single").value) {
    fos.write(throbber16SingleOverride, throbber16SingleOverride.length);
	content = true;
  }
  if (document.getElementById("throbber16-anim").value) {
    fos.write(throbber16AnimOverride, throbber16AnimOverride.length);
	content = true;
  }
  if (document.getElementById("iconURL").value) {
    fos.write(iconOverride, iconOverride.length);
	content = true;
  }

  if (content) {
    fos.write(contentline, contentline.length);
  }

  fos.close();
}

function RebrandWriteDTD(destdir)
{
  var file = destdir.clone();
  file.append("brand.dtd");
  
  try {
    file.remove(false);                         
  } catch (ex) {}
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);
  var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterOutputStream);

  fos.init(file, -1, -1, false);
  cos.init(fos, null, 0, null);
  
  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .getService(Components.interfaces.nsIScriptableInputStream);
    
  var channel=ioService.newChannel("chrome://rebrand/content/srcfiles/brand.dtd.in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  str = str.replace(/%brandShortName%/g, document.getElementById("brandShortName").value.replace("&amp;", "&").replace("&", "&amp;"));
  str = str.replace(/%brandFullName%/g, document.getElementById("brandFullName").value.replace("&amp;", "&").replace("&", "&amp;"));
  str = str.replace(/%vendorShortName%/g, document.getElementById("vendorShortName").value.replace("&amp;", "&").replace("&", "&amp;"));
  str = str.replace(/%logoCopyright%/g, document.getElementById("logoCopyright").value.replace("&amp;", "&").replace("&", "&amp;"));
  str = str.replace(/%trademarkInfo2%/g, document.getElementById("trademarkInfo2").value.replace("&amp;", "&").replace("&", "&amp;"));
  cos.writeString(str);

  cos.close();
  fos.close();
}

function RebrandWriteSyncDTD(destdir)
{
  var file = destdir.clone();
  file.append("syncBrand.dtd");
  
  try {
    file.remove(false);                         
  } catch (ex) {}
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);
  var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterOutputStream);

  fos.init(file, -1, -1, false);
  cos.init(fos, null, 0, null);
  
  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .getService(Components.interfaces.nsIScriptableInputStream);
    
  var channel=ioService.newChannel("chrome://rebrand/content/srcfiles/syncBrand.dtd.in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  str = str.replace(/%brandShortName%/g, document.getElementById("brandShortName").value.replace("&amp;", "&").replace("&", "&amp;"));
  cos.writeString(str);

  cos.close();
  fos.close();
}

function RebrandWriteInstallRDF(destdir)
{
  var header = '<RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:em="http://www.mozilla.org/2004/em-rdf#">\n' + 
               '  <Description about="urn:mozilla:install-manifest">\n';
  var footer = '    <em:unpack>true</em:unpack>\n' + 
               '    <em:targetApplication>\n' + 
               '      <Description>\n' + 
               '        <em:id>{ec8030f7-c20a-464f-9b0e-13a3a9e97384}</em:id>\n' + 
               '        <em:minVersion>3.0</em:minVersion>\n' + 
               '        <em:maxVersion>*</em:maxVersion>\n' + 
               '      </Description>\n' + 
               '    </em:targetApplication>\n' + 
               '    <em:targetApplication>\n' + 
               '      <Description> \n' + 
               '        <em:id>{3550f703-e582-4d05-9a08-453d09bdfdc6}</em:id>\n' + 
               '        <em:minVersion>1.5</em:minVersion>\n' + 
               '        <em:maxVersion>*</em:maxVersion>\n' + 
               '      </Description>\n' + 
               '    </em:targetApplication>\n' +
               '    <em:targetApplication>\n' + 
               '      <Description> \n' + 
               '        <em:id>{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}</em:id>\n' + 
               '        <em:minVersion>2.0</em:minVersion>\n' + 
               '        <em:maxVersion>*</em:maxVersion>\n' + 
               '      </Description>\n' + 
               '    </em:targetApplication>\n' +
               '  </Description>\n' + 
               '</RDF>';
  
  var idline =          "    <em:id>%id%</em:id>\n";
  var nameline =        "    <em:name>%name%</em:name>\n";
  var versionline =     "    <em:version>%version%</em:version>\n";
  var descriptionline = "    <em:description>%description%</em:description>\n";
  var creatorline =     "    <em:creator>%creator%</em:creator>\n";
  var homepageURLline = "    <em:homepageURL>%homepageURL%</em:homepageURL>\n";
  var updateURLline =   "    <em:updateURL>%updateURL%</em:updateURL>\n";  
  var updateKeyline =   "    <em:updateKey>%updateKey%</em:updateKey>\n";  
  var iconURLline =     "    <em:iconURL>chrome://branding/content/icon.png</em:iconURL>\n";

  var file = destdir.clone();

  file.append("install.rdf");
  try {
    file.remove(false);                         
  } catch (ex) {
  }
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);
  var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterOutputStream);

  fos.init(file, -1, -1, false);
  cos.init(fos, null, 0, null);

  cos.writeString(header);
  
  var id = document.getElementById("id").value;
  if (id && (id.length > 0)) {
	cos.writeString(idline.replace("%id%", id));
  }

  var name = document.getElementById("name").value;
  if (name && (name.length > 0)) {
	cos.writeString(nameline.replace("%name%", name));
  }

  var version = document.getElementById("version").value;
  if (version && (version.length > 0)) {
	cos.writeString(versionline.replace("%version%", version));
  }

  var description = document.getElementById("description").value;
  if (description && (description.length > 0)) {
	cos.writeString(descriptionline.replace("%description%", description));
  }

  var creator = document.getElementById("creator").value;
  if (creator && (creator.length > 0)) {
	cos.writeString(creatorline.replace("%creator%", creator));
  }

  var homepageURL = document.getElementById("homepageURL").value;
  if (homepageURL && (homepageURL.length > 0)) {
	cos.writeString(homepageURLline.replace("%homepageURL%", homepageURL));
  }

  var updateURL = document.getElementById("updateURL").value;
  if (updateURL && (updateURL.length > 0)) {
	cos.writeString(updateURLline.replace("%updateURL%", updateURL));
  }

  var updateKey = document.getElementById("updateKey").value;
  if (updateKey && (updateKey.length > 0)) {
	cos.writeString(updateKeyline.replace("%updateKey%", updateKey));
  }

  var iconURL = document.getElementById("iconURL").value;
  if (iconURL && (iconURL.length > 0)) {
    var sourcefile = Components.classes["@mozilla.org/file/local;1"]
                               .createInstance(Components.interfaces.nsILocalFile);
    sourcefile.initWithPath(iconURL);
	cos.writeString(iconURLline.replace("%iconURL%", sourcefile.leafName));
  }

  cos.writeString(footer);
  cos.close();
  fos.close();
}

/* This function copies a source file to a destination directory, including */
/* deleting the file at the destination if it exists */

function CopyFile(source, destination, target)
{
  if (source.length == 0)
    return false;
  
  var sourcefile = Components.classes["@mozilla.org/file/local;1"]
                       .createInstance(Components.interfaces.nsILocalFile);
  sourcefile.initWithPath(source);

  var destfile = destination.clone();
  if (target) {
    destfile.append(target);
  } else {
    destfile.append(sourcefile.leafName);
  }

  try {
    destfile.remove(false);
  } catch (ex) {}
  
  try {
    if (target) {
      sourcefile.copyTo(destination, target);
    } else {
      sourcefile.copyTo(destination, "");
    }
  } catch (ex) {
      var bundle = document.getElementById(bundlename);
      var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                     .getService(Components.interfaces.nsIConsoleService);
      consoleService.logStringMessage(bundle.getString("windowTitle") + ": " + ex + "\n\nSource: " +  source + "\n\nDestination: " + destination.path );
      throw("Stopping Javascript execution");
  }
  
  return true;
}

function Validate(field, message)
{
  var gIDTest = /^(\{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}|[a-z0-9-\._]*\@[a-z0-9-\._]+)$/i;
  
  for (var i=0; i < arguments.length; i++) {
    /* special case ID */
    if (document.getElementById(arguments[i]).id == "id") {
      if (!gIDTest.test(document.getElementById(arguments[i]).value)) {
        var bundle = document.getElementById(bundlename);
        gPromptService.alert(window, bundle.getString("windowTitle"), bundle.getString(arguments[i] + ".error"));
        return false;
      }
	} else if (document.getElementById(arguments[i]).id == "updateURL") {
	  var updateURL = document.getElementById(arguments[i]).value;
	  if (updateURL.length > 0) {
		if (updateURL.match("http:")) {
		  var updateKey = document.getElementById("updateKey").value;
		  if (updateKey.length == 0) {
            var bundle = document.getElementById(bundlename);
            gPromptService.alert(window, bundle.getString("windowTitle"), bundle.getString(arguments[i] + ".error"));
			return false;
		  }
		}
	  }
    } else {
      if (document.getElementById(arguments[i]).value == '') {
        var bundle = document.getElementById(bundlename);
        gPromptService.alert(window, bundle.getString("windowTitle"), bundle.getString(arguments[i] + ".error"));
        return false;
      }
    }
  }
  return true;
}

function ValidateNoSpace(field, message)
{
  for (var i=0; i < arguments.length; i++) {
    var str = document.getElementById(arguments[i]).value;
    if ((str == '') || (str.match(" "))) {
      var bundle = document.getElementById(bundlename);
      gPromptService.alert(window, bundle.getString("windowTitle"), bundle.getString(arguments[i] + ".error"));
      return false;
    }
  }
  return true;
}


function ValidateFile()
{
  for (var i=0; i < arguments.length; i++) {
    var filename = document.getElementById(arguments[i]).value;
    if (filename.length > 0) {
      var file = Components.classes["@mozilla.org/file/local;1"]
                           .createInstance(Components.interfaces.nsILocalFile);
      try {
        file.initWithPath(filename);
      } catch (e) {
        gPromptService.alert(window, "", "File " + filename + " not found");
        return false;
      }
      if (!file.exists() || file.isDirectory()) {
        gPromptService.alert(window, "", "File " + filename + " not found");
        return false;
      }
    }
  }
  return true;
}


function choosefile(labelname)
{
  try {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    var bundle = document.getElementById(bundlename);
    fp.init(window, bundle.getString("chooseFile"), nsIFilePicker.modeOpen);
    fp.appendFilters(nsIFilePicker.filterAll);

   if (fp.show() == nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
     var label = document.getElementById(labelname);
     label.value = fp.file.path;
   }
  }
  catch(ex) {
  }
}

function choosedir(labelname)
{
  try {
    var keepgoing = true;
    while (keepgoing) {
      var nsIFilePicker = Components.interfaces.nsIFilePicker;
      var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
      var bundle = document.getElementById(bundlename);
      fp.init(window, bundle.getString("chooseDirectory"), nsIFilePicker.modeGetFolder);
      fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterText |
                       nsIFilePicker.filterAll | nsIFilePicker.filterImages | nsIFilePicker.filterXML);

      if (fp.show() == nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
        var label = document.getElementById(labelname);
        label.value = fp.file.path;
      }
      keepgoing = false;
    }
  }
  catch(ex) {
  }
}

function chooseimage(labelname, imagename)
{
  try {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    var bundle = document.getElementById(bundlename);
    fp.init(window, bundle.getString("chooseImage"), nsIFilePicker.modeOpen);
    fp.appendFilters(nsIFilePicker.filterImages);

   if (fp.show() == nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
     var label = document.getElementById(labelname);
     label.value = fp.file.path;
     document.getElementById(imagename).src = fp.fileURL.spec;
   }
  }
  catch(ex) {
  }
}

function initimage(labelname, imagename)
{
  var sourcefile = Components.classes["@mozilla.org/file/local;1"]
                       .createInstance(Components.interfaces.nsILocalFile);
  try {
    sourcefile.initWithPath(document.getElementById(labelname).value);
    var ioServ = Components.classes["@mozilla.org/network/io-service;1"]
                           .getService(Components.interfaces.nsIIOService);
    var foo = ioServ.newFileURI(sourcefile);
    document.getElementById(imagename).src = foo.spec;
  } catch (e) {
    document.getElementById(imagename).src = '';
  }
}


function ValidateDir()
{
  for (var i=0; i < arguments.length; i++) {
    var filename = document.getElementById(arguments[i]).value;
    if (filename.length > 0) {
      var file = Components.classes["@mozilla.org/file/local;1"]
                           .createInstance(Components.interfaces.nsILocalFile);
      try {
        file.initWithPath(filename);
      } catch (e) {
        gPromptService.alert(window, "", "Directory " + filename + " not found");
        return false;
      }
      if (!file.exists()) {
        var bundle = document.getElementById(bundlename);
        var button = gPromptService.confirmEx(window, bundle.getString("windowTitle"), bundle.getString("createDir").replace(/%S/g, filename),
                                              gPromptService.BUTTON_TITLE_YES * gPromptService.BUTTON_POS_0 +
                                              gPromptService.BUTTON_TITLE_NO * gPromptService.BUTTON_POS_1,
                                              null, null, null, null, {});
        if (button == 0) {
          try {
            file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
          } catch (ex) {
            gPromptService.alert(window, bundle.getString("windowTitle"),
                                 bundle.getString("createDirError").replace(/%S/g, filename));
            return false;
          }
        }
      } else if (!file.isDirectory()) {
        gPromptService.alert(window, "", "Directory " + filename + " not found");
        return false;
      }
    }
  }
  return true;
}

function htmlEscape(s)
{
  s=s.replace(/&/g,'&amp;');
  s=s.replace(/>/g,'&gt;');
  s=s.replace(/</g,'&lt;');
  s=s.replace(/"/g, '&quot;');
  return s;
}

