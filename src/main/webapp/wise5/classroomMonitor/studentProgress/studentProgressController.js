'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StudentProgressController = function () {
    function StudentProgressController($rootScope, $scope, $state, ConfigService, ProjectService, StudentStatusService, TeacherDataService, TeacherWebSocketService) {
        var _this = this;

        _classCallCheck(this, StudentProgressController);

        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.StudentStatusService = StudentStatusService;
        this.TeacherDataService = TeacherDataService;
        this.TeacherWebSocketService = TeacherWebSocketService;

        this.teacherWorkgroupId = this.ConfigService.getWorkgroupId();

        this.studentsOnline = this.TeacherWebSocketService.getStudentsOnline();

        this.workgroups = this.sortWorkgroupsByOnline();

        this.studentStatuses = this.StudentStatusService.getStudentStatuses();

        this.maxScore = this.ProjectService.getMaxScore();

        this.canViewStudentNames = true;
        this.canGradeStudentWork = true;

        // get the role of the teacher for the run e.g. 'owner', 'write', 'read'
        var role = this.ConfigService.getTeacherRole(this.teacherWorkgroupId);

        if (role === 'owner') {
            // the teacher is the owner of the run and has full access
            this.canViewStudentNames = true;
            this.canGradeStudentWork = true;
        } else if (role === 'write') {
            // the teacher is a shared teacher that can grade the student work
            this.canViewStudentNames = true;
            this.canGradeStudentWork = true;
        } else if (role === 'read') {
            // the teacher is a shared teacher that can only view the student work
            this.canViewStudentNames = false;
            this.canGradeStudentWork = false;
        }

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

        // listen for the studentsOnlineReceived event
        this.$rootScope.$on('studentsOnlineReceived', function (event, args) {
            _this.studentsOnline = args.studentsOnline;

            // update the workgroup order
            _this.workgroups = _this.sortWorkgroupsByOnline();

            // refresh the view
            _this.$scope.$apply();
        });

        // listen for the studentStatusReceived event
        this.$rootScope.$on('studentStatusReceived', function (event, args) {
            // get the workgroup id
            var studentStatus = args.studentStatus;
            var workgroupId = studentStatus.workgroupId;

            // update the time spent for the workgroup
            _this.updateTimeSpentForWorkgroupId(workgroupId);

            // refresh the view
            _this.$scope.$apply();
        });

        // listen for the studentDisconnected event
        this.$rootScope.$on('studentDisconnected', function (event, args) {
            var data = args.data;
            var workgroupId = data.workgroupId;

            var studentsOnline = _this.studentsOnline;

            var indexOfWorkgroupId = studentsOnline.indexOf(workgroupId);

            if (indexOfWorkgroupId != -1) {
                // remove the workgroup from the students online list
                studentsOnline.splice(indexOfWorkgroupId, 1);

                // update the workgroup order
                _this.workgroups = _this.sortWorkgroupsByOnline();

                // refresh the view
                _this.$scope.$apply();
            }
        });

        // how often to update the time spent values in the view
        this.updateTimeSpentInterval = 10000;

        // mapping of workgroup id to time spent
        this.studentTimeSpent = {};

        // update the time spent values in the view
        this.updateTimeSpent();

        // update the time spent values every x seconds
        this.updateTimeSpentIntervalId = setInterval(function () {
            // update the time spent values in the view
            _this.updateTimeSpent();

            // refresh the view
            _this.$scope.$apply();
        }, this.updateTimeSpentInterval);

        // save event when student progress view is displayed
        var context = "ClassroomMonitor",
            nodeId = null,
            componentId = null,
            componentType = null,
            category = "Navigation",
            event = "studentProgressViewDisplayed",
            data = {};
        this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, event, data);
    }

    _createClass(StudentProgressController, [{
        key: 'getCurrentNodeForWorkgroupId',
        value: function getCurrentNodeForWorkgroupId(workgroupId) {
            return this.StudentStatusService.getCurrentNodePositionAndNodeTitleForWorkgroupId(workgroupId);
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

            this.$state.go('root.studentGrading', { workgroupId: workgroupId });
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
            this.$rootScope.$broadcast('periodChanged', { period: period });
        }
    }, {
        key: 'getCurrentPeriod',


        /**
         * Get the current period
         */
        value: function getCurrentPeriod() {
            return this.TeacherDataService.getCurrentPeriod();
        }
    }, {
        key: 'getStudentTotalScore',
        value: function getStudentTotalScore(workgroupId) {
            return this.TeacherDataService.getTotalScoreByWorkgroupId(workgroupId);
        }

        /**
         * Get the time spent for a workgroup
         */

    }, {
        key: 'getStudentTimeSpent',
        value: function getStudentTimeSpent(workgroupId) {
            var timeSpent = this.studentTimeSpent[workgroupId];
            return timeSpent;
        }

        /**
         * Update the time spent values in the view
         */

    }, {
        key: 'updateTimeSpent',
        value: function updateTimeSpent() {
            var studentsOnline = this.studentsOnline;

            if (studentsOnline != null) {

                // loop through all the workgroups that are online
                for (var s = 0; s < studentsOnline.length; s++) {
                    var workgroupId = studentsOnline[s];

                    if (workgroupId != null) {
                        // update the time spent for the workgroup
                        this.updateTimeSpentForWorkgroupId(workgroupId);
                    }
                }
            }
        }

        /**
         * Update the time spent for the workgroup
         * @workgroupId the workgroup id
         */

    }, {
        key: 'updateTimeSpentForWorkgroupId',
        value: function updateTimeSpentForWorkgroupId(workgroupId) {

            if (workgroupId != null) {
                // get the current client timestamp
                var currentClientTimestamp = new Date().getTime();

                // get the student status
                var studentStatus = this.StudentStatusService.getStudentStatusForWorkgroupId(workgroupId);

                if (studentStatus != null) {

                    // get the time the student status was posted to the server
                    var postTimestamp = studentStatus.postTimestamp;

                    /*
                     * convert the current client timestamp to a server timestamp
                     * this is requied in cases where the client and server clocks
                     * are not synchronized
                     */
                    var currentServerTimestamp = this.ConfigService.convertToServerTimestamp(currentClientTimestamp);

                    // get the amount of time the student has been on the step
                    var timeSpent = currentServerTimestamp - postTimestamp;

                    // get the total amount of seconds the student has been on the step
                    var totalSeconds = Math.floor(timeSpent / 1000);

                    // get the hours, minutes, and seconds
                    var hours = Math.floor(totalSeconds % 86400 / 3600);
                    var minutes = Math.floor(totalSeconds % 86400 % 3600 / 60);
                    var seconds = totalSeconds % 60;

                    if (hours < 0) {
                        hours = 0;
                    }

                    if (minutes < 0) {
                        minutes = 0;
                    }

                    if (seconds < 0) {
                        seconds = 0;
                    }

                    var timeSpentText = '';

                    if (hours > 0) {
                        timeSpentText += hours + ':';
                    }

                    if (hours > 0) {
                        // there are hours

                        if (minutes == 0) {
                            // fill with zeroes
                            timeSpentText += '00:';
                        } else if (minutes > 0 && minutes < 10) {
                            // add a leading zero
                            timeSpentText += '0' + minutes + ':';
                        } else {
                            timeSpentText += minutes + ':';
                        }
                    } else {
                        // there are no hours

                        timeSpentText += minutes + ':';
                    }

                    if (seconds == 0) {
                        // fill with zeroes
                        timeSpentText += '00';
                    } else if (seconds > 0 && seconds < 10) {
                        // add a leading zero
                        timeSpentText += '0' + seconds;
                    } else {
                        timeSpentText += seconds;
                    }

                    // update the mapping of workgroup id to time spent
                    this.studentTimeSpent[workgroupId] = timeSpentText;
                }
            }
        }

        /**
         * Sort the workgroups. Place the online workgroups sorted alphabetically at
         * the top and the offline workgroups sorted alphabetically at the bottom.
         * @returns a list of workgroup objects with the online workgroups first
         * and the offline workgroups after
         */

    }, {
        key: 'sortWorkgroupsByOnline',
        value: function sortWorkgroupsByOnline() {

            var workgroupsOnline = [];
            var workgroupsOffline = [];

            // get the workgroups sorted alphabetically
            var workgroups = this.ConfigService.getClassmateUserInfos();

            // loop through all the workgroups
            for (var x = 0; x < workgroups.length; x++) {
                var workgroup = workgroups[x];

                if (workgroup != null) {
                    if (this.isWorkgroupOnline(workgroup.workgroupId)) {
                        // the workroup is online
                        workgroupsOnline.push(workgroup);
                    } else {
                        // the workgroup is offline
                        workgroupsOffline.push(workgroup);
                    }
                }
            }

            // join the workgroup arrays together
            var workgroupsSorted = workgroupsOnline.concat(workgroupsOffline);

            return workgroupsSorted;
        }
    }]);

    return StudentProgressController;
}();

StudentProgressController.$inject = ['$rootScope', '$scope', '$state', 'ConfigService', 'ProjectService', 'StudentStatusService', 'TeacherDataService', 'TeacherWebSocketService'];

exports.default = StudentProgressController;
//# sourceMappingURL=studentProgressController.js.map