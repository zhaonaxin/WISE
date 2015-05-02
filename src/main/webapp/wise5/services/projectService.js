define(['configService'], function(configService) {

    var service = ['$http', '$rootScope', 'ConfigService', function($http, $rootScope, ConfigService) {
        var serviceObject = {};
        
        serviceObject.project = null;
        serviceObject.transitions = [];
        serviceObject.applicationNodes = [];
        serviceObject.groupNodes = [];
        serviceObject.idToNode = {};
        serviceObject.idToElement = {};
        
        serviceObject.getProject = function() {
            return this.project;
        };
        
        serviceObject.setProject = function(project) {
            this.project = project;
            this.parseProject();
        };
        
        serviceObject.getProjectStyle = function() {
            var style = '';
            var project = this.project;
            if (project != null) {
                style = project.style;
            }
            return style;
        };
        
        serviceObject.getNodes = function() {
            var nodes = null;
            var project = this.project;
            
            if (project != null) {
                nodes = project.nodes;
            }
            
            return nodes;
        };
        
        serviceObject.getApplicationNodes = function() {
            return this.applicationNodes;
        };
        
        serviceObject.getGroupNodes = function() {
            return this.groupNodes;
        };
        
        serviceObject.getIdToNode = function() {
            return this.idToNode;
        };
        
        serviceObject.isNode = function(id) {
            var result = false;
            var nodes = this.getNodes();
            
            if (nodes != null) {
                for (var n = 0; n < nodes.length; n++) {
                    var node = nodes[n];
                    
                    if (node != null) {
                        var nodeId = node.id;
                        
                        if (nodeId === id) {
                            result = true;
                            break;
                        }
                    }
                }
            }
            
            return result;
        };
        
        // adds or update transition if exists
        serviceObject.addTransition = function(transition) {
        
            var existingTransitions = this.getTransitions();
            var replaced = false;
            for (var t = 0; t < existingTransitions.length; t++) {
                var existingTransition = existingTransitions[t];
                if (existingTransition.id === transition.id) {
                    existingTransitions.splice(t, 1, transition);
                    replaced = true;
                }
            }
            if (!replaced) {
                existingTransitions.push(transition);
            }
        };
        
        serviceObject.addNode = function(node) {
            var existingNodes = this.project.nodes;
            
            var replaced = false;
            if (node != null && existingNodes != null) {
                for (var n = 0; n < existingNodes.length; n++) {
                    var existingNode = existingNodes[n];
                    var existingNodeId = existingNode.id;
                    if (existingNodeId === node.id) {
                        existingNodes.splice(n, 1, node);
                        replaced = true;
                    }
                }
            }
            if (!replaced) {
                existingNodes.push(node);
            }
        };
        
        serviceObject.addApplicationNode = function(node) {
            
            var applicationNodes = this.applicationNodes;
            
            if (node != null && applicationNodes != null) {
                applicationNodes.push(node);
            }
        };
        
        serviceObject.addGroupNode = function(node) {
            
            var groupNodes = this.groupNodes;
            
            if (node != null && groupNodes != null) {
                groupNodes.push(node);
            }
            
            $rootScope.$broadcast('groupsChanged');
        };
        
        serviceObject.addNodeToGroupNode = function(groupId, nodeId) {
            if (groupId != null && nodeId != null) {
                var group = this.getNodeById(groupId);
                if (group != null) {
                    var groupChildNodeIds = group.ids;
                    if (groupChildNodeIds != null) {
                        if (groupChildNodeIds.indexOf(nodeId) === -1) {
                            groupChildNodeIds.push(nodeId);
                        }
                    }
                }
            }
        };
        
        serviceObject.isGroupNode = function(id) {
            var result = false;
            
            var groupNode = this.getNodeById(id);
            
            if (groupNode != null) {
                var type = groupNode.type;
                
                if (type === 'group') {
                    result = true;
                }
            }
            
            return result;
        };
        
        serviceObject.isApplicationNode = function(id) {
            var result = false;
            
            var applicationNode = this.getNodeById(id);
            
            if (applicationNode != null) {
                var type = applicationNode.type;
                
                if (type !== 'group') {
                    result = true;
                }
            }
            
            return result;
        };
        
        serviceObject.getGroups = function() {
            return this.groupNodes;
        };
        
        serviceObject.loadNodes = function(nodes) {
            if (nodes != null) {
                for (var n = 0 ; n < nodes.length; n++) {
                    var node = nodes[n];
                    
                    if (node != null) {
                        var nodeId = node.id;
                        var nodeType = node.type;
                        
                        this.setIdToNode(nodeId, node);
                        this.setIdToElement(nodeId, node);
                        
                        this.addNode(node);

                        if (nodeType === 'group') {
                            this.addGroupNode(node);
                        } else {
                            this.addApplicationNode(node);
                        }
                        
                        var groupId = node.groupId;
                        
                        if (groupId != null) {
                            this.addNodeToGroupNode(groupId, nodeId);
                        }
                    }
                }
            }
        };
        
        serviceObject.loadTransitions = function(transitions) {
            if (transitions != null) {
                for (var t = 0; t < transitions.length; t++) {
                    var transition = transitions[t];
                    
                    if (transition != null) {
                        var transitionId = transition.id;
                        
                        this.setIdToElement(transitionId, transition);
                        
                        this.addTransition(transition);
                    }
                }
            }
        };
        
        serviceObject.parseProject = function() {
            var project = this.project;
            if (project != null) {
                var nodes = project.nodes;
                this.loadNodes(nodes);
                
                var transitions = project.transitions;
                this.loadTransitions(transitions);
                
                var constraints = project.constraints;
                
                if (constraints != null) {
                    for (var c = 0; c < constraints.length; c++) {
                        var constraint = constraints[c];
                        
                        if (constraint != null) {
                            var constraintId = constraint.id;
                            
                            this.setIdToElement(constraintId, constraint);
                        }
                    }
                }
            }
        };
        
        serviceObject.setIdToNode = function(id, element) {
            if (id != null) {
                this.idToNode[id] = element;
            }
        };
        
        serviceObject.setIdToElement = function(id, element) {
            if (id != null) {
                this.idToElement[id] = element;
            }
        };
        
        serviceObject.getElementById = function(id) {
            var element = null;
            
            if (id != null) {
                element = this.idToElement[id];
            }
            
            return element;
        }
        
        serviceObject.getNodeById = function(id) {
            var element = null;
            
            if (id != null) {
                element = this.idToNode[id];
            }
            
            return element;
        };
        
        serviceObject.getTransitionById = function(id) {
            var element = null;
            
            if (id != null) {
                element = this.idToElement[id];
            }
            
            return element;
        };
        
        serviceObject.getConstraintById = function(id) {
            var element = null;
            
            if (id != null) {
                element = this.idToElement[id];
            }
            
            return element;
        };
        
        serviceObject.getParentGroup = function(nodeId) {
            var result = null;
            
            if (nodeId != null) {
                var node = this.getNodeById(nodeId);
                
                if (node != null) {
                    var groupNodes = this.getGroupNodes();
                    
                    for (var g = 0; g < groupNodes.length; g++) {
                        var groupNode = groupNodes[g];
                        
                        if (this.isNodeDirectChildOfGroup(node, groupNode)) {
                            result = groupNode;
                            break;
                        }
                    }
                }
            }
            
            return result;
        };
        
        serviceObject.getRootNode = function(nodeId) {
            var result = null;
            
            var parentGroup = this.getParentGroup(nodeId);
            
            if (parentGroup == null) {
                result = this.getNodeById(nodeId);
            } else {
                result = this.getRootNode(parentGroup.id);
            }
            
            return result;
        };
        
        serviceObject.isNodeDirectChildOfGroup = function(node, group) {
            var result = false;
            
            if (node != null && group != null) {
                var nodeId = node.id;
                var groupIds = group.ids;
                
                if (groupIds != null && groupIds.indexOf(nodeId) != -1) {
                    result = true;
                }
            }
            
            return result;
        };
        
        serviceObject.isNodeDescendentOfGroup = function(node, group) {
            var result = false;
            
            if (node != null && group != null) {
                var descendents = this.getDescendentsOfGroup(group);
                var nodeId = node.id;
                
                if (descendents.indexOf(nodeId) != -1) {
                    result = true;
                }
            }
            
            return result;
        };
        
        serviceObject.getDescendentsOfGroup = function(group) {
            var descendents = [];
            
            if (group != null) {
                var childIds = group.ids;
                
                if (childIds != null) {
                    descendents = childIds;
                    
                    for (var c = 0; c < childIds.length; c++) {
                        var childId = childIds[c];
                        
                        var node = this.getNodeById(childId);
                        
                        if (node != null) {
                            var childDescendents = this.getDescendentsOfGroup(node);
                            
                            descendents = descendents.concat(childDescendents);
                        }
                    }
                }
            }
            
            return descendents;
        };
        
        serviceObject.isStartNode = function(node) {
            var result = false;
            
            if (node != null) {
                var nodeId = node.id;
                
                var projectStartId = this.getStartNodeId();
                
                if (nodeId === projectStartId) {
                    result = true;
                }
                
                var groups = this.getGroups();
                
                for (var g = 0; g < groups.length; g++) {
                    var group = groups[g];
                    
                    if (group != null) {
                        var groupStartId = group.startId;
                        
                        if (nodeId === groupStartId) {
                            result = true;
                            break;
                        }
                    }
                }
            }
            
            return result;
        };
        
        serviceObject.getStartNodeId = function() {
            var startNodeId = null;
            var project = this.getProject();
            if (project != null) {
                startNodeId = project.startNodeId;
            }
            return startNodeId;
        };
        
        serviceObject.getConstraints = function() {
            var constraints = null;
            var project = this.getProject();
            
            if (project != null) {
                constraints = project.constraints;
            }
            
            return constraints;
        };
        
        serviceObject.getConstraintsForNode = function(node) {
            var constraints = [];
            
            var allConstraints = this.getConstraints();
            
            for (var c = 0; c < allConstraints.length; c++) {
                var constraint = allConstraints[c];
                
                if (this.isNodeAffectedByConstraint(node, constraint)) {
                    constraints.push(constraint);
                }
            }
            
            return constraints;
        };
        
        serviceObject.isNodeAffectedByConstraint = function(node, constraint) {
            var result = false;
            
            if (node != null && constraint != null) {
                var nodeId = node.id;
                var targetId = constraint.targetId;
                
                var targetNode = this.getNodeById(targetId);
                
                if (targetNode != null) {
                    var nodeType = targetNode.type;
                    
                    if (nodeType === 'application') {
                        // the target is an application
                        
                        if (nodeId === targetId) {
                            result = true;
                        }
                    } else if (nodeType === 'group') {
                        // the target is a group
                        
                        if (this.isNodeDescendentOfGroup(node, targetNode)) {
                            result = true;
                        }
                    }
                }
                
                var targetTransition = this.getTransitionById(targetId);
                
                if (targetTransition != null) {
                    var from = targetTransition.from;
                    var to = targetTransition.to;
                    
                    if (nodeId === to) {
                        result = true;
                    }
                }
            }
            
            return result;
        };
        
        serviceObject.getNavigationMode = function() {
            var navigationMode = null;
            var project = this.getProject();
            if (project != null) {
                navigationMode = project.navigationMode; 
            }
            return navigationMode;
        };
        
        serviceObject.getNavigationApplications = function() {
            var navigationApplications = null;
            var project = this.getProject();
            if (project != null) {
                navigationApplications = project.navigationApplications;
            }
            return navigationApplications;
        };
        
        serviceObject.getTransitions = function() {
            var transitions = null;
            var project = this.getProject();
            if (project != null) {
                transitions = project.transitions;
            }
            return transitions;
        };
        
        serviceObject.getTransitionsByGroupId = function(groupId) {
            var transitionsInGroup = [];
            
            if (groupId != null) {
                var group = this.getNodeById(groupId);
                
                if (group != null) {
                    var childIds = group.ids;
                    
                    if (childIds != null) {
                        var allTransitions = this.getTransitions();
                        
                        // loop through all the transitions
                        
                        for (var t = 0; t < allTransitions.length; t++) {
                            var tempTransition = allTransitions[t];
                            
                            if (tempTransition != null) {
                                var from = tempTransition.from;
                                var to = tempTransition.to;
                                
                                if (childIds.indexOf(from) != -1 || childIds.indexOf(to) != -1) {
                                    transitionsInGroup.push(tempTransition);
                                }
                            }
                        }
                    }
                }
            }
            var project = this.getProject();
            if (project != null) {
                
                
                transitions = project.transitions;
            }
            return transitionsInGroup;
        };
        
        serviceObject.getTransitionsByFromNodeId = function(fromNodeId) {
            var transitionsResults = [];
            if (fromNodeId != null) {
                var transitions = this.getTransitions();
                
                if (transitions != null) {
                    for (var i = 0; i < transitions.length; i++) {
                        var transition = transitions[i];
                        if (transition.from === fromNodeId && !transition.disabled) {
                            transitionsResults.push(transition);
                        }
                    }
                }                
            }
            
            return transitionsResults;
        };
        
        serviceObject.getTransitionsByToNodeId = function(toNodeId) {
            var transitionsResults = [];
            if (toNodeId != null) {
                var transitions = this.getTransitions();
                
                if (transitions != null) {
                    for (var i = 0; i < transitions.length; i++) {
                        var transition = transitions[i];
                        if (transition.to === toNodeId) {
                            transitionsResults.push(transition);
                        }
                    }
                }                
            }
            
            return transitionsResults;
        };
        
        serviceObject.getTransitionsByFromAndToNodeId = function(fromNodeId, toNodeId) {
            var transitionsResults = [];
            if (toNodeId != null) {
                var transitions = this.getTransitions();
                
                if (transitions != null) {
                    for (var i = 0; i < transitions.length; i++) {
                        var transition = transitions[i];
                        if (transition.from === fromNodeId && transition.to === toNodeId) {
                            transitionsResults.push(transition);
                        }
                    }
                }                
            }
            
            return transitionsResults;
        };

        serviceObject.getLayoutLogic = function() {
            var layoutLogic = null;
            var project = this.getProject();
            if (project != null) {
                layoutLogic = project.layoutLogic;
            }
            return layoutLogic;
        };
        
        serviceObject.retrieveProject = function() {
            var projectFileUrl = ConfigService.getConfigParam('projectURL');
            
            return $http.get(projectFileUrl).then(angular.bind(this, function(result) {
                var projectJSON = result.data;
                this.setProject(projectJSON);
                return projectJSON;
            }));
        };
        
        serviceObject.getNodeTypeByNode = function(node) {
            var nodeType = null;
            
            if (node != null) {
                nodeType = node.type;
            }
            
            return nodeType;
        };
        
        serviceObject.getApplicationTypeByNode = function(node) {
            var applicationType = null;
            
            if (node != null) {
                applicationType = node.applicationType;
            }
            
            return applicationType;
        };
        
        serviceObject.getNodeSrcByNodeId = function(nodeId) {
            var nodeSrc = null;
            
            var node = this.getNodeById(nodeId);
            
            if (node != null) {
                nodeSrc = node.src;
            }
            
            if(nodeSrc != null) {
                var projectBaseURL = ConfigService.getConfigParam('projectBaseURL');
                nodeSrc = projectBaseURL + nodeSrc;
            }
            
            return nodeSrc;
        };
        
        serviceObject.getNodeTitleByNodeId = function(nodeId) {
            var title = null;
            
            var node = this.getNodeById(nodeId);
            
            if (node != null) {
                title = node.title;
            }
            
            return title;
        };
        
        serviceObject.getStudentIsOnGroupNodeClass = function() {
            var studentIsOnGroupNodeClass = null;
            var project = this.getProject();
            
            if (project != null) {
                var layout = project.layout
                
                if (layout != null) {
                    studentIsOnGroupNodeClass = layout.studentIsOnGroupNode;
                }
            }
            
            return studentIsOnGroupNodeClass;
        };
        
        serviceObject.getStudentIsOnApplicationNodeClass = function() {
            var studentIsOnApplicationNodeClass = null;
            var project = this.getProject();
            
            if (project != null) {
                var layout = project.layout
                
                if (layout != null) {
                    studentIsOnApplicationNodeClass = layout.studentIsOnApplicationNode;
                }
            }
            
            return studentIsOnApplicationNodeClass;
        };
        
        serviceObject.getStartGroupId = function() {
            var startGroupId = null;
            var project = this.getProject();
            if (project != null) {
                startGroupId = project.startGroupId;
            }
            return startGroupId;
        };
        
        /**
         * Flatten the project to obtain a list of node ids
         */
        serviceObject.getFlattenedProjectAsNodeIds = function() {
            var nodeIds = [];
            
            // get the start node id
            var startNodeId = this.getStartNodeId();
            
            /*
             * an array to keep track of the node ids in the path that
             * we are currently on as we traverse the nodes in the project
             * depth first
             */
            var pathsSoFar = [];
            
            // get all the possible paths through the project
            var allPaths = this.getAllPaths(pathsSoFar, startNodeId);
            
            // consolidate all the paths to create a single list of node ids
            //nodeIds = this.consolidatePaths(allPaths);
            nodeIds = this.consolidatePaths(allPaths.reverse());
            
            return nodeIds;
        };
        
        /**
         * Get all the possible paths through the project. This function 
         * recursively calls itself to traverse the project depth first.
         * @param pathSoFar the node ids in the path so far. the node ids
         * in this array are referenced to make sure we don't loop back
         * on the path.
         * @param nodeId the node id we are want to get the paths from
         * @return an array of paths. each path is an array of node ids.
         */
        serviceObject.getAllPaths = function(pathSoFar, nodeId) {
            var allPaths = [];
            
            if (nodeId != null) {
                if (this.isApplicationNode(nodeId)) {
                    // the node is an application node
                    
                    // get all the transitions from this node
                    var transitions = this.getTransitionsByFromNodeId(nodeId);
                    
                    if (transitions != null) {
                        
                        // add the node id to the path so far
                        pathSoFar.push(nodeId);
                        
                        if (transitions.length === 0) {
                            /*
                             * there are no transitions from the node id so this path
                             * only contains this node id
                             */
                            
                            var path = [];
                            
                            // add the node id to the path
                            path.push(nodeId);
                            
                            // add the path to the all paths array
                            allPaths.push(path);
                        } else {
                            // loop through all the transitions from this node id
                            for (var t = 0; t < transitions.length; t++) {
                                var transitionResult = [];
                                
                                // get a transition
                                var transition = transitions[t];
                                
                                if (transition != null) {
                                    // get the to node id
                                    var toNodeId = transition.to;
                                    
                                    if (pathSoFar.indexOf(toNodeId) == -1) {
                                        /*
                                         * recursively get the paths by getting all 
                                         * the paths for the to node
                                         */
                                        var allPathsFromToNode = this.getAllPaths(pathSoFar, toNodeId);
                                        
                                        if (allPathsFromToNode != null) {
                                            // loop through all the paths for the to node
                                            for (var a = 0; a<allPathsFromToNode.length; a++) {
                                                
                                                // get a path
                                                var tempPath = allPathsFromToNode[a];
                                                
                                                // prepend the current node id to the path
                                                tempPath.unshift(nodeId);
                                                
                                                // add the path to our collection of paths
                                                allPaths.push(tempPath);
                                            }
                                        }
                                    } else {
                                        /*
                                         * the node is already in the path so far which means
                                         * the transition is looping back to a previous node.
                                         * we do not want to take this transition because
                                         * it will lead to an infinite loop. we will just
                                         * add the current node id to the path and not take
                                         * the transition which essentially ends the path.
                                         */
                                        var path = [];
                                        
                                        // add the node id to the path
                                        path.push(nodeId);
                                        
                                        // add the path to the all paths array
                                        allPaths.push(path);
                                    }
                                }
                            }
                        }
                        
                        /*
                         * remove the latest node id since we are moving back 
                         * up the path as we traverse the nodes depth first
                         */
                        pathSoFar.pop();
                    }
                } else if (this.isGroupNode(nodeId)) {
                    // the node is a group node
                }
            }
            
            return allPaths;
        };
        
        /**
         * Consolidate all the paths into a linear list of node ids
         * @param paths an array of paths. each path is an array of node ids.
         * @return an array of node ids that have been properly ordered
         */
        serviceObject.consolidatePaths = function(paths) {
            var consolidatedPath = [];
            
            if (paths != null) {
                
                /*
                 * continue until all the paths are empty. as we consolidate
                 * node ids, we will remove them from the paths. once all the
                 * paths are empty we will be done consolidating the paths.
                 */
                while(!this.arePathsEmpty(paths)) {
                    
                    // start with the first path
                    var currentPath = this.getNonEmptyPathIndex(paths);
                    
                    // get the first node id in the current path
                    var nodeId = this.getFirstNodeIdInPathAtIndex(paths, currentPath);
                    
                    if (this.areFirstNodeIdsInPathsTheSame(paths)) {
                        // the first node ids in all the paths are the same
                        
                        // remove the node id from all the paths
                        this.removeNodeIdFromPaths(nodeId, paths);
                        
                        // add the node id to our consolidated path
                        consolidatedPath.push(nodeId);
                    } else {
                        // not all the top node ids are the same which means we have branched
                        
                        // get all the paths that contain the node id
                        var pathsThatContainNodeId = this.getPathsThatContainNodeId(nodeId, paths);
                        
                        if (pathsThatContainNodeId != null) {
                            if(pathsThatContainNodeId.length === 1) {
                                // only the current path we are on has the node id
                                
                                // remove the node id from the path
                                this.removeNodeIdFromPath(nodeId, paths, currentPath);
                                
                                // add the node id to our consolidated path
                                consolidatedPath.push(nodeId);
                            } else {
                                // there are multiple paths that have this node id
                                
                                // consume all the node ids up to the given node id
                                var consumedPath = this.consumePathsUntilNodeId(paths, nodeId);
                                
                                // remove the node id from the paths
                                this.removeNodeIdFromPaths(nodeId, paths);
                                
                                // add the node id to the end of the consumed path
                                consumedPath.push(nodeId);
                                
                                // add the consumed path to our consolidated path
                                consolidatedPath = consolidatedPath.concat(consumedPath);
                            }
                        }
                    }
                    
                }
            }
            
            return consolidatedPath;
        };
        
        /**
         * Consume the node ids in the paths until we get to the given node id
         * @param paths the paths to consume
         * @param nodeId the node id to stop consuming at
         * @return an array of node ids that we have consumed
         */
        serviceObject.consumePathsUntilNodeId = function(paths, nodeId) {
            var consumedNodeIds = [];
            
            if (paths != null && nodeId != null) {
                
                // loop through all the paths
                for (var p = 0; p < paths.length; p++) {
                    
                    // get a path
                    var path = paths[p];
                    
                    // check if the path contains the node id to stop consuming at
                    if (path != null && path.indexOf(nodeId) != -1) {
                        /*
                         * the path does contain the node id to stop consuming at
                         * so we will consume the node ids in this path until
                         * we get to the given node id to stop consuming at
                         */
                        
                        // loop through the node ids in the path
                        for (var x = 0; x < path.length; x++) {
                            
                            // get a node id
                            var tempNodeId = path[x];
                            
                            if (nodeId === tempNodeId) {
                                /*
                                 * the node id is the same as the one we need to 
                                 * stop consuming at so we will stop looking
                                 * at this path
                                 */
                                break;
                            } else {
                                /*
                                 * the node id is not the one that we need to stop consuming at
                                 * so we will consume it
                                 */
                                
                                // get all the paths that contain the node id
                                var pathsThatContainNodeId = this.getPathsThatContainNodeId(tempNodeId, paths);
                                
                                if (pathsThatContainNodeId.length === 1) {
                                    // there is only one path with this node id
                                    
                                    // remove the node id from the path
                                    this.removeNodeIdFromPath(tempNodeId, paths, p);
                                    
                                    // move the counter back one since we have just removed a node id
                                    x--;
                                    
                                    // add the node id to the consumed node ids array
                                    consumedNodeIds.push(tempNodeId);
                                } else {
                                    // there are multiple paths with this node id
                                    
                                    // tempNodeId must come before nodeId
                                    
                                    var pathsToConsume = [];
                                    
                                    // loop through all the paths that contain the node id
                                    for (var g = 0; g < pathsThatContainNodeId.length; g++) {
                                        
                                        // get a path that contains the node id
                                        var pathThatContainsNodeId = pathsThatContainNodeId[g];
                                        
                                        // get the index of the node id we want to remove
                                        var tempNodeIdIndex = pathThatContainsNodeId.indexOf(tempNodeId);
                                        
                                        // get the index of the node id we want to stop consuming at
                                        var nodeIdIndex = pathThatContainsNodeId.indexOf(nodeId);
                                        
                                        /*
                                         * check if the node id we want to remove comes before
                                         * the node id we want to stop consuming at. we need to
                                         * do this to prevent an infinite loop. an example of 
                                         * when this can happen is if there are two paths
                                         * 
                                         * path1 = 1, 2, 3, 4, 5
                                         * path2 = 1, 2, 4, 3, 5
                                         * 
                                         * as we consume path1 we will need to consume 3. in order to
                                         * consume 3, we must consume consume up to 3 in path2.
                                         * in order to consume up to 3 in path2 we must consume 4.
                                         * in order to consume 4, we must consume everything before
                                         * 4 in path1. everything before 4 in path1 is 1, 2, 3.
                                         * this means we need to consume 3 which brings us back up
                                         * to the top of this paragraph creating an infinite loop.
                                         * 
                                         * this check below will prevent infinite loops by only
                                         * adding paths that have the tempNodeId come before the
                                         * nodeId to stop consuming at.
                                         */
                                        if (tempNodeIdIndex < nodeIdIndex) {
                                            pathsToConsume.push(pathThatContainsNodeId);
                                        }
                                    }
                                    
                                    /*
                                     * take the paths that contain the given node id and consume
                                     * the paths until the given node id
                                     */
                                    var tempConsumedNodeIds = this.consumePathsUntilNodeId(pathsToConsume, tempNodeId);
                                    
                                    // remove the node id from the paths that contain it
                                    this.removeNodeIdFromPaths(tempNodeId, pathsThatContainNodeId);
                                    
                                    // add the temp consumed node ids to our consumed node ids array
                                    consumedNodeIds = consumedNodeIds.concat(tempConsumedNodeIds);
                                    
                                    // move the counter back one since we have just removed a node id
                                    x--;
                                    
                                    // add the node id to the consumed node ids array
                                    consumedNodeIds.push(tempNodeId);
                                }
                            }
                        }
                    }
                }
                
            }

            return consumedNodeIds;
        };
        
        /**
         * Get the path at the given index and get the first node id in
         * the path
         * @param paths an array of paths. each path is an array of node ids
         * @param index the index of the path we want
         * @return the first node in the given path
         */
        serviceObject.getFirstNodeIdInPathAtIndex = function(paths, index) {
            var nodeId = null;
            
            if (paths != null && index != null) {
                // get the path at the given index
                var path = paths[index];
                
                if (path != null && path.length > 0) {
                    // get the first node id in the path
                    nodeId = path[0];
                }
            }
            
            return nodeId;
        };
        
        /**
         * Remove the node ifrom the paths
         * @param nodeId the node id to remove
         * @param paths an array of paths. each path is an array of node ids
         */
        serviceObject.removeNodeIdFromPaths = function(nodeId, paths) {
            
            if (nodeId != null && paths != null) {
                // loop through all the paths
                for (var p = 0; p < paths.length; p++) {
                    
                    // get a path
                    var path = paths[p];
                    
                    // loop through all the node ids in the path
                    for (var x = 0; x < path.length; x++) {
                        // get a node id
                        var tempNodeId = path[x];
                        
                        /*
                         * check if the node id matches the one we are looking
                         * for
                         */
                        if (nodeId === tempNodeId) {
                            /*
                             * we have found the node id we are looking for so
                             * we will remove it from the path
                             */
                            path.splice(x, 1);
                            
                            /*
                             * move the counter back since we just removed a
                             * node id. we will continue searching this path
                             * for the node id in case the path contains it
                             * multiple times.
                             */
                            x--;
                        }
                    }
                }
            }
        };
        
        /**
         * Remove the node id from the path
         * @param nodeId the node id to remove
         * @param paths an array of paths. each path is an array of node ids
         * @param pathIndex the path to remove from
         */
        serviceObject.removeNodeIdFromPath = function(nodeId, paths, pathIndex) {
            
            if (nodeId != null && paths != null && pathIndex != null) {
                
                // get the path at the given index
                var path = paths[pathIndex];
                
                if (path != null) {
                    
                    // loop through all the node ids in the path
                    for (var x = 0; x < path.length; x++) {
                        // get a ndoe id
                        var tempNodeId = path[x];
                        
                        /*
                         * check if the node id matches the one we are looking
                         * for
                         */
                        if (nodeId === tempNodeId) {
                            /*
                             * we have found the node id we are looking for so
                             * we will remove it from the path
                             */
                            path.splice(x, 1);
                            
                            /*
                             * move the counter back since we just removed a
                             * node id. we will continue searching this path
                             * for the node id in case the path contains it
                             * multiple times.
                             */
                            x--;
                        }
                    }
                }
            }
        };
        
        /**
         * Check if the first node ids in the paths are the same
         * @param paths an array of paths. each path is an array of node ids
         * @return whether all the paths have the same first node id
         */
        serviceObject.areFirstNodeIdsInPathsTheSame = function(paths) {
            var result = true;
            
            var nodeId = null;
            
            if (paths != null) {
                
                // loop through all the paths
                for (var p = 0; p < paths.length; p++) {
                    
                    // get a path
                    var path = paths[p];
                    
                    // get the first node id in the path
                    tempNodeId = path[0];
                    
                    if (nodeId == null) {
                        /*
                         * this is the first path we have looked at so we will
                         * remember the node id
                         */
                        nodeId = tempNodeId;
                    } else if (nodeId != tempNodeId) {
                        /*
                         * the node id does not match the first node id from a 
                         * previous path so the paths do not all have the same
                         * first node id
                         */ 
                        result = false;
                        break;
                    }
                }
            }
            
            return result;
        };
        
        /**
         * Check if all the paths are empty
         * @param paths an array of paths. each path is an array of node ids
         * @return whether all the paths are empty
         */
        serviceObject.arePathsEmpty = function(paths) {
            var result = true;
            
            if (paths != null) {
                
                // loop through all the paths
                for (var p = 0; p < paths.length; p++) {
                    
                    // get a path
                    var path = paths[p];
                    
                    if (path != null) {
                        
                        // get the length of the path
                        if (path.length !== 0) {
                            // the path is not empty
                            result = false;
                            break;
                        }
                    }
                }
            }
            
            return result;
        };
        
        /**
         * Get the paths that contain the node id
         * @param nodeId the node id we are looking for
         * @param paths an array of paths. each path is an array of node ids
         * @return an array of paths that contain the given node id
         */
        serviceObject.getPathsThatContainNodeId = function(nodeId, paths) {
            var pathsThatContainNodeId = [];
            
            if (nodeId != null && paths != null) {
                // loop through all the paths
                for (var p = 0; p < paths.length; p++) {
                    
                    // get a path
                    var path = paths[p];
                    
                    // check if the path contains the node id
                    if (path.indexOf(nodeId) != -1) {
                        /*
                         * add the path to the array of paths that contain 
                         * the node id
                         */
                        pathsThatContainNodeId.push(path);
                    }
                }
            }
            
            return pathsThatContainNodeId;
        };
        
        /**
         * Get a non empty path index. It will loop through the paths and
         * return the index of the first non empty path.
         * @param paths an array of paths. each path is an array of node ids
         * @return the index of the path that is not empty
         */
        serviceObject.getNonEmptyPathIndex = function(paths) {
            var index = null;
            
            if (paths != null) {
                // loop through all the paths
                for (var p = 0; p < paths.length; p++) {
                    // get a path
                    var path = paths[p];
                    
                    // check the length of the path
                    if (path.length !== 0) {
                        // the path is not empty so we will return this index
                        index = p;
                        break;
                    }
                }
            }
            
            return index;
        };
        
        /**
         * Get the branches in the project
         */
        serviceObject.getBranches = function() {
            
            // get the start node id
            var startNodeId = this.getStartNodeId();
            
            /*
             * an array to keep track of the node ids in the path that
             * we are currently on as we traverse the nodes in the project
             * depth first
             */
            var pathsSoFar = [];
            
            // get all the paths in the project
            var allPaths = this.getAllPaths(pathsSoFar, startNodeId);
            
            // find the branches in the project from the paths
            var branches = this.findBranches(allPaths);
            
            return branches;
        };
        
        /**
         * Find the branches in the project
         * @param paths all the possible paths through the project
         * @return an array of branch objects. each branch object contains
         * the branch start point, the branch paths, and the branch
         * end point
         */
        serviceObject.findBranches = function(paths) {
            var branches = [];
            
            var previousNodeId = null;
            
            /*
             * continue until all the paths are empty. we will remove
             * node ids from the paths as we traverse the paths to find
             * the branches
             */
            while(!this.arePathsEmpty(paths)) {
                
                // get the first node id in the first path
                var nodeId = this.getFirstNodeIdInPathAtIndex(paths, 0);
                
                if (this.areFirstNodeIdsInPathsTheSame(paths)) {
                    // the first node ids in all the paths are the same
                    
                    // remove the node id from all the paths
                    this.removeNodeIdFromPaths(nodeId, paths);
                    
                    // remember this node id for the next iteration of the loop
                    previousNodeId = nodeId;
                } else {
                    // not all the top node ids are the same which means we have branched
                    
                    // create a branch object
                    var branchMetaObject = this.createBranchMetaObject(previousNodeId);
                    branchMetaObject.branchStartPoint = previousNodeId;
                    
                    // find the branch end point
                    var nextCommonNodeId = this.findNextCommonNodeId(paths);
                    branchMetaObject.branchEndPoint = nextCommonNodeId;
                    
                    // get the branch paths
                    var branchPaths = this.extractPathsUpToNodeId(paths, nextCommonNodeId);
                    branchPaths = this.removeDuplicatePaths(branchPaths);
                    branchMetaObject.branchPaths = branchPaths;
                    
                    // add the branch object to our array
                    branches.push(branchMetaObject);
                    
                    // trim the paths so that they start at the branch end point
                    this.trimPathsUpToNodeId(paths, nextCommonNodeId);
                    
                    // remember this node id for the next iteration of the loop
                    previousNodeId = nextCommonNodeId;
                }
            }
            
            return branches;
        };
        
        /**
         * Create a branch meta object that will contain the branch start
         * point, branch paths, and branch end point
         * @return an object that contains a branch start point, branch paths,
         * and a branch end point
         */
        serviceObject.createBranchMetaObject = function() {
            var branchMetaObject = {};
            
            branchMetaObject.branchStartPoint = null;
            branchMetaObject.branchPaths = [];
            branchMetaObject.branchEndPoint = null;
            
            return branchMetaObject;
        };
        
        /**
         * Find the next common node id in all the paths
         * @param paths the paths to find the common node id in
         * @return a node id that is in all the paths or null
         * if there is no node id that is in all the paths
         */
        serviceObject.findNextCommonNodeId = function(paths) {
            var nextCommonNodeId = null;
            var subPaths = [];
            
            if (paths != null) {
                if (paths.length > 0) {
                    // get the first path
                    var path = paths[0];
                    
                    // loop through all the node ids in the first path
                    for (var x = 0; x < path.length; x++) {
                        // get a node id
                        var tempNodeId = path[x];
                        
                        // check if the node id is in all the paths
                        if (this.allPathsContainNodeId(paths, tempNodeId)) {
                            /*
                             * the node id is in all the paths so we have found
                             * what we were looking for
                             */
                            nextCommonNodeId = tempNodeId;
                            break;
                        }
                    }
                }
            }
            
            return nextCommonNodeId;
        };
        
        /**
         * Check if all the paths contain the node id
         * @param paths an array of paths. each path contains an array of node ids
         * @param nodeId the node id that we will check is in all the paths
         * @return whether the node id is in all the paths
         */
        serviceObject.allPathsContainNodeId = function(paths, nodeId) {
            var result = false;
            
            if (paths != null) {
                
                // loop through all the paths
                for (var p = 0; p < paths.length; p++) {
                    // get a path
                    var path = paths[p];
                    
                    // get the index of the node id in the path
                    var index = path.indexOf(nodeId);
                    
                    if (index == -1) {
                        // the node id is not in the path
                        result = false;
                        break;
                    } else {
                        // the node id is in the path
                        result = true;
                    }
                }
            }
            
            return result;
        };
        
        /**
         * Trim the paths up to the given node id so that the paths will contain
         * the given node id and all the node ids after it. This function will
         * modify the paths.
         * @param paths the paths to trim
         * @param nodeId the node id to trim up to
         */
        serviceObject.trimPathsUpToNodeId = function(paths, nodeId) {
            if (paths != null) {
                // loop through all the paths
                for (var p = 0; p < paths.length; p++) {
                    // get a path
                    var path = paths[p];
                    
                    if (path != null) {
                        // get the index of the node id in the path
                        var index = path.indexOf(nodeId);
                        
                        if (index == -1) {
                            /*
                             * the node id is not in the path so we will
                             * trim the path to the end which will make
                             * the path empty
                             */
                            index = path.length;
                        }
                        
                        /*
                         * trim the path up to the node id index. this will
                         * modify the path array.
                         */
                        path.splice(0, index);
                    }
                }
            }
        };
        
        
        /**
         * Extract the paths up to a given node id. This will be used to
         * obtain branch paths.
         * @param paths the paths to extract from
         * @param nodeId the node id to extract up to
         * @return paths that go up to but do not include the node id
         */
        serviceObject.extractPathsUpToNodeId = function(paths, nodeId) {
            var extractedPaths = [];
            
            if (paths != null) {
                // loop through the paths
                for (var p = 0; p < paths.length; p++) {
                    
                    // get a path
                    var path = paths[p];
                    
                    if (path != null) {
                        
                        // get the index of the node id in the path
                        var index = path.indexOf(nodeId);
                        
                        if (index == -1) {
                            /*
                             * the node id is not in the path so we will
                             * extract up to the end of the path
                             */
                            index = path.length;
                        }
                        
                        /*
                         * get the path up to the node id index. this does
                         * not modify the path array.
                         */
                        var extractedPath = path.slice(0, index);
                        
                        // add the 
                        extractedPaths.push(extractedPath);
                    }
                }
            }
            
            return extractedPaths;
        };
        
        /**
         * Removes duplicate paths
         * @param paths an array of paths. each path contains an array of node ids
         * @return an array of unique paths
         */
        serviceObject.removeDuplicatePaths = function(paths) {
            var uniquePaths = [];
            
            if (paths != null) {
                // loop through all the paths
                for (var p = 0; p < paths.length; p++) {
                    // get a path
                    var path = paths[p];
                    
                    var isPathInUniquePaths = false;
                    
                    // loop through all the unique paths so far
                    for (var u = 0; u < uniquePaths.length; u++) {
                        // get a unique path
                        var uniquePath = uniquePaths[u];
                        
                        // check if the paths are equal
                        if (this.pathsEqual(path, uniquePath)) {
                            // the paths are equal
                            isPathInUniquePaths = true;
                        }
                    }
                    
                    if (!isPathInUniquePaths) {
                        /*
                         * the path is not equal to any paths in the unique 
                         * paths array so we will add it to the unique paths
                         * array
                         */ 
                        uniquePaths.push(path);
                    }
                }
            }
            
            return uniquePaths;
        };
        
        /**
         * Check if two paths are equal
         * @param path1 an array of node ids
         * @param path2 an array of node ids
         * @return whether the two paths contain the same node ids
         * in the same order
         */
        serviceObject.pathsEqual = function(path1, path2) {
            var result = false;
            
            if (path1 != null && path2 != null) {
                
                // check if the paths are the same length
                if (path1.length === path2.length) {
                    result = true;
                    
                    // loop through each element of the first path
                    for (var x = 0; x < path1.length; x++) {
                        // get the node id from the first path
                        var path1NodeId = path1[x];
                        
                        // get the node id from the second path
                        var path2NodeId = path2[x];
                        
                        // check if the node ids are the same
                        if (path1NodeId !== path2NodeId) {
                            /*
                             * the node ids are not the same to the paths
                             * are not equal
                             */ 
                            result = false;
                            break;
                        }
                    }
                }
            }
            
            return result;
        };
        
        return serviceObject;
    }];
    
    return service;
});