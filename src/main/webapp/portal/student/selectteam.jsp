<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="student.selectteam.selectTeam" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />

</head>
<body>
<div id="teamSelect" class="teamMargin1">

	<div id="teamSelectHeader"><spring:message code="student.selectteam.aloneOrTeam"/></div>
	<div id="teamSelectChoices">
		<ul>
			<li><a href="startproject.html?runId=${runId}&bymyself=true" onclick="setTimeout('self.close()', 15000);" id="byMyself"><spring:message code="student.selectteam.alone"/></a></li>
      		<li><a href="teamsignin.html?runId=${runId}" id="withTeam"><spring:message code="student.selectteam.team" arguments="${maxWorkgroupSize}" /></a></li>
    	</ul>
	</div>
</div>
</body>
</html>