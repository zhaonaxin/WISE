/**
 * Copyright (c) 2007-2015 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * 
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 * 
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers.forgotaccount.student;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.wise.portal.domain.impl.PasswordReminderParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.validators.SearchForStudentUserNameValidator;
import org.wise.portal.service.user.UserService;

/**
 * Looks up the project code in student lost password
 */
@Controller
@RequestMapping("/forgotaccount/student/searchforstudentusername.html")
public class SearchForStudentUserNameController {

	@Autowired
	protected UserService userService;
	
	@Autowired
	protected SearchForStudentUserNameValidator searchForStudentUserNameValidator;
	
	//the path to this form view
	protected String formView = "/forgotaccount/student/searchforstudentusername";
	
	//the path to the success view
	protected String successView = "/forgotaccount/student/searchforstudentusernameresult";
	
    /**
     * Called before the page is loaded to initialize values
     * @param model the model object that contains values for the page to use when rendering the view
     * @return the path of the view to display
     */
    @RequestMapping(method = RequestMethod.GET)
    public String initializeForm(ModelMap model) {
    	//create the parameters object for the page
    	PasswordReminderParameters params = new PasswordReminderParameters();
    	model.addAttribute("passwordReminderParameters", params);
    	
    	return formView;
    }
    
    /**
     * Called when the user submits the form
     * @param params the object that contains values from the form
     * @param bindingResult the object used for validation in which errors will be stored
     * @param model the model object that contains values for the page to use when rendering the view
     * @return the path of the view to display
     */
    @RequestMapping(method = RequestMethod.POST)
    protected String onSubmit(@ModelAttribute("passwordReminderParameters") PasswordReminderParameters params,
							  BindingResult bindingResult, Model model)
            throws Exception {

        String[] fields = null;
		String[] values = null;
		String classVar = "";
		
		//validate the values the user entered
		searchForStudentUserNameValidator.validate(params, bindingResult);
		
		//check if there were any errors
		if(bindingResult.hasErrors()) {
			//there were errors so we will reload this page and display errors
			return formView;
		}
		
		//get the values from the form
        String firstName = params.getFirstName();
		String lastName = params.getLastName();
		String birthMonth = params.getBirthMonth();
		String birthDay = params.getBirthDay();
		
		//populate the array that will be used to search for the User accounts
		fields = new String[4];
		fields[0] = "firstname";
		fields[1] = "lastname";
		fields[2] = "birthmonth";
		fields[3] = "birthday";
		
		//populate the array that will be used to search for the User accounts
		values = new String[4];
		values[0] = firstName;
		values[1] = lastName;
		values[2] = birthMonth;
		values[3] = birthDay;
		
		//the type of object to search
		classVar = "studentUserDetails";
		
		//find all the accounts with matching values
		List<User> accountsThatMatch = userService.retrieveByFields(fields, values, classVar);
        
		model.addAttribute("users", accountsThatMatch);
		model.addAttribute("firstName", firstName);
		model.addAttribute("lastName", lastName);
		model.addAttribute("birthMonth", birthMonth);
		model.addAttribute("birthDay", birthDay);
        
		return successView;
    }
}

