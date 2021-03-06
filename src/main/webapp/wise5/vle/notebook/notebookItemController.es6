'use strict';

class NotebookItemController {

    constructor($injector,
                $rootScope,
                $scope,
                $translate,
                ConfigService,
                NotebookService,
                ProjectService,
                StudentAssetService,
                StudentDataService,
                UtilService) {
        this.$injector = $injector;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
        this.mode = this.ConfigService.getMode();

        this.item = this.NotebookService.getLatestNotebookItemByLocalNotebookItemId(this.itemId);
        this.item.id = null; // set to null so we're creating a new notebook item. An edit to a notebook item results in a new entry in the db.

        // set the type in the controller
        this.type = this.item ? this.item.type : null;

        this.notebookConfig = this.NotebookService.getNotebookConfig();
        this.label = this.notebookConfig.itemTypes[this.type].label;

        this.$rootScope.$on('notebookUpdated', (event, args) => {
            let notebook = args.notebook;
            if (notebook.items[this.itemId]) {
                this.item = notebook.items[this.itemId].last();
            }
        });
    }

    getItemNodeId() {
        if (this.item == null) {
            return null;
        } else {
            return this.item.nodeId;
        }
    }

    /**
     * Returns this NotebookItem's position link
     */
    getItemNodeLink() {
        if (this.item == null) {
            return "";
        } else {
            return this.ProjectService.getNodePositionAndTitleByNodeId(this.item.nodeId);
        }
    }

    /**
     * Returns this NotebookItem's position
     */
    getItemNodePosition() {
        if (this.item == null) {
            return "";
        } else {
            return this.ProjectService.getNodePositionById(this.item.nodeId);
        }
    }

    getTemplateUrl() {
        return this.ProjectService.getThemePath() + '/notebook/notebookItem.html';
    }

    doSelect(ev) {
        if (this.onSelect) {
            this.onSelect({$ev: ev, $itemId: this.item.localNotebookItemId});
        }
    }

    doDelete(ev) {
        if (this.onDelete) {
            ev.stopPropagation();  // don't follow-through on the doSelect callback after this
            this.onDelete({$ev: ev, $itemId: this.item.localNotebookItemId});
        }
    }
}

NotebookItemController.$inject = [
    "$injector",
    "$rootScope",
    "$scope",
    "$translate",
    "ConfigService",
    "NotebookService",
    "ProjectService",
    "StudentAssetService",
    "StudentDataService",
    "UtilService"
];

export default NotebookItemController;
