import NodeService from '../../services/nodeService2';

class TableService extends NodeService {
    constructor(StudentDataService) {
        super();
        this.StudentDataService = StudentDataService;
    }

    callFunction(node, component, functionName, functionParams, componentStates, nodeStates, componentEvents, nodeEvents) {
        var result = null;

        if (functionName === 'wordCountCompare') {
            result = this.wordCountCompare(functionParams);
        }

        return result;
    };

    getStudentWorkAsHTML(nodeState) {
        var studentWorkAsHTML = null;

        if (nodeState != null) {
            var response = nodeState.studentData;

            if (response != null) {
                studentWorkAsHTML = '<p>' + response + '</p>';
            }
        }

        return studentWorkAsHTML;
    };

    /**
     * Populate a component state with the data from another component state
     * @param componentStateFromOtherComponent the component state to obtain the data from
     * @return a new component state that contains the student data from the other
     * component state
     */
    populateComponentState(componentStateFromOtherComponent) {
        var componentState = null;

        if (componentStateFromOtherComponent != null) {

            // create an empty component state
            componentState = this.StudentDataService.createComponentState();

            // get the component type of the other component state
            var otherComponentType = componentStateFromOtherComponent.componentType;

            if (otherComponentType === 'Table') {
                // the other component is an Table component

                // get the student data from the other component state
                var studentData = componentStateFromOtherComponent.studentData;

                // create a copy of the student data
                var studentDataCopy = this.StudentDataService.makeCopyOfJSONObject(studentData);

                // set the student data into the new component state
                componentState.studentData = studentDataCopy;
            }
        }

        return componentState;
    };

    /**
     * Check if the component was completed
     * @param component the component object
     * @param componentStates the component states for the specific component
     * @param componentEvents the events for the specific component
     * @param nodeEvents the events for the parent node of the component
     * @returns whether the component was completed
     */
    isCompleted(component, componentStates, componentEvents, nodeEvents) {
        var result = false;

        if (componentStates != null) {

            // loop through all the component states
            for (var c = 0; c < componentStates.length; c++) {

                // the component state
                var componentState = componentStates[c];

                // get the student data from the component state
                var studentData = componentState.studentData;

                if (studentData != null) {
                    var tableData = studentData.tableData;

                    if (tableData != null) {
                        // there is table data so the component is completed
                        result = true;
                        break;
                    }
                }
            }
        }

        return result;
    };
}

TableService.$inject = ['StudentDataService'];

export default TableService;