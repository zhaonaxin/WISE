require.config({
	baseUrl: '../wise/vle5/student',
	paths: {
		'angular':'../lib/angular/angular',
		'angularUIRouter':'../lib/angular/angular-ui-router',
		'studentViewController':'studentViewController',
		'jquery': '../lib/jquery/jquery-2.1.3.min',
        'configService': '../services/configService',
        'projectService': '../services/projectService'
	},
	shim: {
		'angular':{
			'exports':'angular'
		},
		'angularUIRouter':{
			'exports':'angularUIRouter',
			'deps':[
			        'angular'
			        ]
		}
	}
});

require(['app'],function(app){
	app.init();
});