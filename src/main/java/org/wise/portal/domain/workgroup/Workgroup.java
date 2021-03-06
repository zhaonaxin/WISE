/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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
package org.wise.portal.domain.workgroup;

import java.util.Set;

import org.wise.portal.domain.Persistable;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Offering;
import org.wise.portal.domain.user.User;

/**
 * Workgroup is an aggregation of users that work on the same offering. It is
 * made up of one or more users.
 * 
 * @author Hiroki Terashima
 */
public interface Workgroup extends Persistable {

    /**
     * @return the members
     */
    Set<User> getMembers();

    /**
     * @param members
     *            the members to set
     */
    void setMembers(Set<User> members);

    /**
     * @param member
     *            the member to add
     */
    void addMember(User member);
    
    /**
     * @param member
     *            the member to remove
     */
    void removeMember(User member);

    /**
     * @return the offering
     */
    Offering getOffering();

    /**
     * @param offering
     *            the offering to set
     */
    void setOffering(Offering offering);
    
    /**
     * @return the group
     */
    Group getGroup();
    
    /**
     * @param group
     *           the group to set
     */
    void setGroup(Group group);

	/**
	 * @return the id
	 */
	Long getId();

	/**
	 * Generates a name for this workgroup.
	 * 
	 * @return <code>String</code> a name for this workgroup
	 */
	String generateWorkgroupName();

}