var coreScripts = [
	'vle/node/flash/FlashNode.js',
	'vle/node/flash/flashEvents.js'
];

var studentVLEScripts = [
	scriptloader.jquerySrc,
	scriptloader.jqueryUISrc,
	'vle/node/flash/flash.js',
	'vle/node/flash/flashState.js',
	'vle/util/swfobject/swfobject.js',
	'vle/util/underscore-min.js'
];

var authorScripts = [
	'vle/node/flash/authorview_flash.js'
];

var gradingScripts = [
	'vle/node/flash/flashState.js'
];

var dependencies = [
	{child:"vle/node/flash/FlashNode.js", parent:["vle/node/Node.js"]}
];

var nodeClasses = [
	{nodeClass:'simulation', nodeClassText:'Flash', icon:'node/flash/icons/simulation28.png'}
];

var nodeIconPath = 'node/flash/icons/';
componentloader.addNodeIconPath('FlashNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('flash', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addDependencies(dependencies);

var css = [
	"vle/node/flash/flash.css"
];

scriptloader.addCssToComponent('flash', css);

componentloader.addNodeClasses('FlashNode', nodeClasses);

var nodeTemplateParams = [
   	{
   		nodeTemplateFilePath:'node/flash/flashTemplate.fl',
   		nodeExtension:'fl'
   	}
];

componentloader.addNodeTemplateParams('FlashNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/flash/setup.js');
};