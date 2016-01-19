'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentProgressController = function () {
    function StudentProgressController($rootScope, $state, ConfigService, StudentStatusService, TeacherDataService, TeacherWebSocketService) {
        _classCallCheck(this, StudentProgressController);

        this.$rootScope = $rootScope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;

        this.title = 'Grade By Student';

        this.workgroups = this.ConfigService.getClassmateUserInfos();

        this.studentStatuses = this.StudentStatusService.getStudentStatuses();

        this.periods = [];

        // create an option for all periods
        var allPeriodOption = {
            periodId: -1,
            periodName: 'All'
        };

        this.periods.push(allPeriodOption);

        this.periods = this.periods.concat(this.ConfigService.getPeriods());

        // set the current period if it hasn't been set yet
        if (this.getCurrentPeriod() == null) {
            if (this.periods != null && this.periods.length > 0) {
                // set it to the all periods option
                this.setCurrentPeriod(this.periods[0]);
            }
        }

        this.studentsOnline = this.TeacherWebSocketService.getStudentsOnline();

        /**
         * Listen for the studentsOnlineReceived event
         */
        $rootScope.$on('studentsOnlineReceived', angular.bind(this, function (event, args) {
            this.studentsOnline = args.studentsOnline;
        }));
    }

    _createClass(StudentProgressController, [{
        key: 'getNewNodeVisits',
        value: function getNewNodeVisits() {
            return this.StudentStatusService.getNewNodeVisits();
        }
    }, {
        key: 'getCurrentNodeForWorkgroupId',
        value: function getCurrentNodeForWorkgroupId(workgroupId) {
            return this.StudentStatusService.getCurrentNodeTitleForWorkgroupId(workgroupId);
        }
    }, {
        key: 'getStudentProjectCompletion',
        value: function getStudentProjectCompletion(workgroupId) {
            return this.StudentStatusService.getStudentProjectCompletion(workgroupId);
        }
    }, {
        key: 'studentRowClicked',
        value: function studentRowClicked(workgroup) {
            var workgroupId = workgroup.workgroupId;

            $state.go('root.studentGrading', { workgroupId: workgroupId });
        }
    }, {
        key: 'isWorkgroupOnline',
        value: function isWorkgroupOnline(workgroupId) {
            return this.studentsOnline.indexOf(workgroupId) != -1;
        }
    }, {
        key: 'setCurrentPeriod',

        /**
         * Set the current period
         * @param period the period object
         */
        value: function setCurrentPeriod(period) {
            this.TeacherDataService.setCurrentPeriod(period);
        }
    }, {
        key: 'getCurrentPeriod',

        /**
         * Get the current period
         */
        value: function getCurrentPeriod() {
            return this.TeacherDataService.getCurrentPeriod();
        }
    }]);

    return StudentProgressController;
}();

StudentProgressController.$inject = ['$rootScope', '$state', 'ConfigService', 'StudentStatusService', 'TeacherDataService', 'TeacherWebSocketService'];

exports.default = StudentProgressController;