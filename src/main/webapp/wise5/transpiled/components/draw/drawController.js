'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _drawingTool = require('lib/drawingTool/drawing-tool');

var _drawingTool2 = _interopRequireDefault(_drawingTool);

var _vendor = require('lib/drawingTool/vendor');

var _vendor2 = _interopRequireDefault(_vendor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DrawController = function () {
    function DrawController($injector, $rootScope, $scope, $timeout, DrawService, NodeService, ProjectService, StudentAssetService, StudentDataService) {
        _classCallCheck(this, DrawController);

        this.$injector = $injector;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.DrawService = DrawService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // whether the step should be disabled
        this.isDisabled = false;

        // whether the student work is dirty and needs saving
        this.isDirty = false;

        // whether this part is showing previous work
        this.isShowPreviousWork = false;

        // whether the student work is for a submit
        this.isSubmit = false;

        // will hold the drawing tool object
        this.drawingTool = null;

        // get the component content from the scope
        this.componentContent = this.$scope.component;

        // whether students can attach files to their work
        this.isStudentAttachmentEnabled = false;

        // ["normal", "showStudentWorkOnly"]
        // whether this component is to be rendered normally or as part of show student work.
        // If showStudentWorkOnly, usually this means that this component is not editable and nothing will be saved
        this.mode = "normal";

        // setup
        // set mode if it's passed in through the scope.
        if (this.$scope.mode) {
            this.mode = this.$scope.mode;
        }

        // get the current node and node id
        var currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        } else {
            this.nodeId = this.$scope.nodeId;
        }

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            // get the component type
            this.componentType = this.componentContent.type;

            if (this.mode === "student") {
                this.drawingToolId = "drawingtool_" + this.nodeId + "_" + this.componentId;
            } else if (this.mode === 'grading' || this.mode === "onlyShowWork") {
                // get the component state from the scope
                var componentState = this.$scope.componentState;
                if (componentState != null) {
                    this.drawingToolId = "drawingtool_" + componentState.id;
                }
            } else if (this.mode === 'authoring') {
                this.drawingToolId = "drawingtool_" + this.nodeId + "_" + this.componentId;
                this.updateAdvancedAuthoringView();
            }

            this.$timeout(angular.bind(this, function () {
                // running this in side a timeout ensures that the code only runs after the markup is rendered.
                // maybe there's a better way to do this, like with an event?

                // initialize the drawing tool
                this.drawingTool = new DrawingTool("#" + this.drawingToolId, {
                    stamps: this.componentContent.stamps || {},
                    parseSVG: true
                });
                var state = null;
                $("#set-background").on("click", angular.bind(this, function () {
                    this.drawingTool.setBackgroundImage($("#background-src").val());
                }));
                $("#resize-background").on("click", angular.bind(this, function () {
                    this.drawingTool.resizeBackgroundToCanvas();
                }));
                $("#resize-canvas").on("click", angular.bind(this, function () {
                    this.drawingTool.resizeCanvasToBackground();
                }));
                $("#shrink-background").on("click", angular.bind(this, function () {
                    this.drawingTool.shrinkBackgroundToCanvas();
                }));
                $("#clear").on("click", angular.bind(this, function () {
                    this.drawingTool.clear(true);
                }));
                $("#save").on("click", angular.bind(this, function () {
                    state = _drawingTool2.default.save();
                    $("#load").removeAttr("disabled");
                }));
                $("#load").on("click", angular.bind(this, function () {
                    if (state === null) return;
                    this.drawingTool.load(state);
                }));

                // get the show previous work node id if it is provided
                var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;

                var componentState = null;

                if (showPreviousWorkNodeId != null) {
                    // this component is showing previous work
                    this.isShowPreviousWork = true;

                    // get the show previous work component id if it is provided
                    var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

                    // get the node content for the other node
                    var showPreviousWorkNodeContent = this.ProjectService.getNodeContentByNodeId(showPreviousWorkNodeId);

                    // get the node content for the component we are showing previous work for
                    this.componentContent = this.NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);

                    // get the component state for the show previous work
                    componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);

                    // populate the student work into this component
                    this.setStudentWork(componentState);

                    // disable the component since we are just showing previous work
                    this.isDisabled = true;

                    // register this component with the parent node
                    this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
                } else {
                    // this is a regular component

                    // get the component state from the scope
                    componentState = this.$scope.componentState;

                    // set whether studentAttachment is enabled
                    this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

                    if (componentState == null) {
                        /*
                         * only import work if the student does not already have
                         * work for this component
                         */

                        // check if we need to import work
                        var importWorkNodeId = this.componentContent.importWorkNodeId;
                        var importWorkComponentId = this.componentContent.importWorkComponentId;

                        if (importWorkNodeId != null && importWorkComponentId != null) {
                            // import the work from the other component
                            this.importWork();
                        }
                    } else {
                        // populate the student work into this component
                        this.setStudentWork(componentState);
                    }

                    // check if we need to lock this component
                    this.calculateDisabled();

                    // register this component with the parent node
                    if (this.$scope.$parent && this.$scope.$parent.registerComponentController) {
                        this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
                    }

                    // listen for the drawing changed event
                    this.drawingTool.on('drawing:changed', angular.bind(this, this.studentDataChanged));

                    // listen for selected tool changed event
                    this.drawingTool.on('tool:changed', function (toolName) {
                        // log this event
                        var category = "Tool";
                        var event = "toolSelected";
                        var data = {};
                        data.selectedToolName = toolName;
                        this.StudentDataService.saveComponentEvent(this, category, event, data);
                    }.bind(this));

                    if (this.mode === 'grading' || this.mode === 'onlyShowWork') {
                        // we're in show student work mode, so hide the toolbar and make the drawing non-editable
                        $(".dt-tools").hide();
                    }
                }
            }));
        }

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        this.$scope.getComponentState = function () {

            var componentState = null;

            if (this.$scope.drawController.isDirty) {
                // create a component state populated with the student data
                componentState = this.$scope.drawController.createComponentState();

                // set isDirty to false since this student work is about to be saved
                this.$scope.drawController.isDirty = false;
            }

            return componentState;
        }.bind(this);

        /**
         * The parent node submit button was clicked
         */
        this.$scope.$on('nodeSubmitClicked', angular.bind(this, function (event, args) {

            // get the node id of the node
            var nodeId = args.nodeId;

            // make sure the node id matches our parent node
            if (this.nodeId === nodeId) {

                if (this.isLockAfterSubmit()) {
                    // disable the component if it was authored to lock after submit
                    this.isDisabled = true;
                }
            }
        }));

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', angular.bind(this, function (event, args) {}));
    } // end of constructor

    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */

    _createClass(DrawController, [{
        key: 'setStudentWork',
        value: function setStudentWork(componentState) {

            if (componentState != null) {

                // get the student data from the component state
                var studentData = componentState.studentData;

                if (studentData != null) {

                    // get the draw data
                    var drawData = studentData.drawData;

                    if (drawData != null) {
                        // set the draw data into the drawing tool
                        this.drawingTool.load(drawData);
                    }
                }
            }
        }
    }, {
        key: 'saveButtonClicked',

        /**
         * Called when the student clicks the save button
         */
        value: function saveButtonClicked() {

            // tell the parent node that this component wants to save
            this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'submitButtonClicked',

        /**
         * Called when the student clicks the submit button
         */
        value: function submitButtonClicked() {
            this.isSubmit = true;

            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;
            }

            // tell the parent node that this component wants to submit
            this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'studentDataChanged',

        /**
         * Called when the student changes their work
         */
        value: function studentDataChanged() {
            /*
             * set the dirty flag so we will know we need to save the
             * student work later
             */
            this.isDirty = true;

            // get this part id
            var componentId = this.getComponentId();

            // create a component state populated with the student data
            var componentState = this.createComponentState();

            /*
             * the student work in this component has changed so we will tell
             * the parent node that the student data will need to be saved.
             * this will also notify connected parts that this component's student
             * data has changed.
             */
            this.$scope.$emit('componentStudentDataChanged', { componentId: componentId, componentState: componentState });
        }
    }, {
        key: 'createComponentState',

        /**
         * Create a new component state populated with the student data
         * @return the componentState after it has been populated
         */
        value: function createComponentState() {

            // create a new component state
            var componentState = this.NodeService.createNewComponentState();

            if (componentState != null) {
                var studentData = {};

                // get the draw JSON string
                var studentDataJSONString = this.getDrawData();

                // set the draw JSON string into the draw data
                studentData.drawData = studentDataJSONString;

                if (this.isSubmit) {
                    // the student submitted this work
                    componentState.isSubmit = this.isSubmit;

                    /*
                     * reset the isSubmit value so that the next component state
                     * doesn't maintain the same value
                     */
                    this.isSubmit = false;
                }

                // set the student data into the component state
                componentState.studentData = studentData;
            }

            return componentState;
        }
    }, {
        key: 'calculateDisabled',

        /**
         * Check if we need to lock the component
         */
        value: function calculateDisabled() {

            var nodeId = this.nodeId;

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {

                // check if the parent has set this component to disabled
                if (componentContent.isDisabled) {
                    this.isDisabled = true;
                } else if (componentContent.lockAfterSubmit) {
                    // we need to lock the step after the student has submitted

                    // get the component states for this component
                    var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);

                    // check if any of the component states were submitted
                    var isSubmitted = this.NodeService.isWorkSubmitted(componentStates);

                    if (isSubmitted) {
                        // the student has submitted work for this component
                        this.isDisabled = true;
                    }
                }
            }

            if (this.mode === 'showStudentWorkOnly') {
                // distable saving if we're in showStudentWorkOnly mode
                this.isDisabled = true;
            }
        }
    }, {
        key: 'showSaveButton',

        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        value: function showSaveButton() {
            var show = false;

            if (this.componentContent != null) {

                // check the showSaveButton field in the component content
                if (this.componentContent.showSaveButton) {
                    show = true;
                }
            }

            return show;
        }
    }, {
        key: 'showSubmitButton',

        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        value: function showSubmitButton() {
            var show = false;

            if (this.componentContent != null) {

                // check the showSubmitButton field in the component content
                if (this.componentContent.showSubmitButton) {
                    show = true;
                }
            }

            return show;
        }
    }, {
        key: 'isLockAfterSubmit',

        /**
         * Check whether we need to lock the component after the student
         * submits an answer.
         */
        value: function isLockAfterSubmit() {
            var result = false;

            if (this.componentContent != null) {

                // check the lockAfterSubmit field in the component content
                if (this.componentContent.lockAfterSubmit) {
                    result = true;
                }
            }

            return result;
        }
    }, {
        key: 'attachNotebookItemToComponent',
        value: function attachNotebookItemToComponent(notebookItem) {
            if (notebookItem.studentAsset != null) {
                // we're importing a StudentAssetNotebookItem
                var studentAsset = notebookItem.studentAsset;
                this.StudentAssetService.copyAssetForReference(studentAsset).then(angular.bind(this, function (copiedAsset) {
                    if (copiedAsset != null) {
                        fabric.Image.fromURL(copiedAsset.url, angular.bind(this, function (oImg) {
                            oImg.scaleToWidth(200); // set max width and have height scale proportionally
                            // TODO: center image or put them at mouse position? Wasn't straight-forward, tried below but had issues...
                            //oImg.setLeft((this.drawingTool.canvas.width / 2) - (oImg.width / 2));  // center image vertically and horizontally
                            //oImg.setTop((this.drawingTool.canvas.height / 2) - (oImg.height / 2));
                            //oImg.center();
                            oImg.studentAssetId = copiedAsset.id; // keep track of this asset id
                            this.drawingTool.canvas.add(oImg); // add copied asset image to canvas
                        }));
                    }
                }));
            } else if (notebookItem.studentWork != null) {
                    // we're importing a StudentWorkNotebookItem
                    var studentWork = notebookItem.studentWork;

                    var componentType = studentWork.componentType;

                    if (componentType != null) {
                        var childService = this.$injector.get(componentType + 'Service');

                        if (childService != null) {
                            var studentWorkHTML = childService.getStudentWorkAsHTML(studentWork);

                            if (studentWorkHTML != null) {
                                this.studentResponse += studentWorkHTML;
                                this.studentDataChanged();
                            }
                        }
                    }
                }
        }
    }, {
        key: 'getPrompt',

        /**
         * Get the prompt to show to the student
         */
        value: function getPrompt() {
            var prompt = null;

            if (this.componentContent != null) {
                prompt = this.componentContent.prompt;
            }

            return prompt;
        }
    }, {
        key: 'getDrawData',

        /**
         * Get the draw data
         * @return the draw data from the drawing tool as a JSON string
         */
        value: function getDrawData() {
            var drawData = null;

            drawData = this.drawingTool.save();

            return drawData;
        }
    }, {
        key: 'importWork',

        /**
         * Import work from another component
         */
        value: function importWork() {

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {

                var importWorkNodeId = componentContent.importWorkNodeId;
                var importWorkComponentId = componentContent.importWorkComponentId;

                if (importWorkNodeId != null && importWorkComponentId != null) {

                    // get the latest component state for this component
                    var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

                    /*
                     * we will only import work into this component if the student
                     * has not done any work for this component
                     */
                    if (componentState == null) {
                        // the student has not done any work for this component

                        // get the latest component state from the component we are importing from
                        var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importWorkNodeId, importWorkComponentId);

                        if (importWorkComponentState != null) {
                            /*
                             * populate a new component state with the work from the
                             * imported component state
                             */
                            var populatedComponentState = this.DrawService.populateComponentState(importWorkComponentState);

                            // populate the component state into this component
                            this.setStudentWork(populatedComponentState);
                        }
                    }
                }
            }
        }
    }, {
        key: 'getComponentId',

        /**
         * Get the component id
         * @return the component id
         */
        value: function getComponentId() {
            var componentId = this.componentContent.id;

            return componentId;
        }
    }, {
        key: 'authoringViewComponentChanged',

        /**
         * The component has changed in the regular authoring view so we will save the project
         */
        value: function authoringViewComponentChanged() {

            // update the JSON string in the advanced authoring view textarea
            this.updateAdvancedAuthoringView();

            // save the project to the server
            this.ProjectService.saveProject();
        }
    }, {
        key: 'advancedAuthoringViewComponentChanged',

        /**
         * The component has changed in the advanced authoring view so we will update
         * the component and save the project.
         */
        value: function advancedAuthoringViewComponentChanged() {

            try {
                /*
                 * create a new comopnent by converting the JSON string in the advanced
                 * authoring view into a JSON object
                 */
                var editedComponentContent = angular.fromJson(this.componentContentJSONString);

                // replace the component in the project
                this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

                // set the new component into the controller
                this.componentContent = editedComponentContent;

                // save the project to the server
                this.ProjectService.saveProject();
            } catch (e) {}
        }
    }, {
        key: 'updateAdvancedAuthoringView',

        /**
         * Update the component JSON string that will be displayed in the advanced authoring view textarea
         */
        value: function updateAdvancedAuthoringView() {
            this.componentContentJSONString = angular.toJson(this.componentContent, 4);
        }
    }, {
        key: 'registerExitListener',

        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */
        value: function registerExitListener() {

            /*
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before the VLE exits.
             */
            this.exitListener = this.$scope.$on('exit', angular.bind(this, function (event, args) {

                this.$rootScope.$broadcast('doneExiting');
            }));
        }
    }]);

    return DrawController;
}();

DrawController.$inject = ['$injector', '$rootScope', '$scope', '$timeout', 'DrawService', 'NodeService', 'ProjectService', 'StudentAssetService', 'StudentDataService'];

exports.default = DrawController;