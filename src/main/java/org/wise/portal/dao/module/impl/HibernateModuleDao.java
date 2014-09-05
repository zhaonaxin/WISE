/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
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
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.dao.module.impl;


import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.module.ModuleDao;
import org.wise.portal.domain.module.Module;
import org.wise.portal.domain.module.impl.ModuleImpl;

/**
 * @author Hiroki Terashima
 *
 * @version $Id$
 */
@Repository
public class HibernateModuleDao extends AbstractHibernateDao<Module> implements
		ModuleDao<Module> {

	private static final String FIND_ALL_QUERY = "from ModuleImpl";

	/**
	 * @see org.wise.portal.dao.impl.AbstractHibernateDao#getFindAllQuery()
	 */
	@Override
	protected String getFindAllQuery() {
		return FIND_ALL_QUERY;
	}

	/**
	 * @see org.wise.portal.dao.impl.AbstractHibernateDao#getDataObjectClass()
	 */
	@Override
	protected Class<ModuleImpl> getDataObjectClass() {
		return ModuleImpl.class;
	}

	public Long getLatestId() {
		// TODO Auto-generated method stub
		return null;
	}
}
