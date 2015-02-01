/*
    Cornipickle, validation of layout bugs in web applications
    Copyright (C) 2015 Sylvain Hallé

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package ca.uqac.lif.cornipickle;

import java.util.HashSet;
import java.util.Set;

public class AttributeExtractor implements LanguageElementVisitor
{
  protected Set<String> m_attributes;
  
  public AttributeExtractor()
  {
    super();
    m_attributes = new HashSet<String>();
  }
  
  public static Set<String> getAttributes(LanguageElement le)
  {
    AttributeExtractor ae = new AttributeExtractor();
    le.prefixAccept(ae);
    return ae.m_attributes;
  }

  @Override
  public void visit(LanguageElement element)
  {
    if (element instanceof ElementProperty)
    {
      ElementProperty prop = (ElementProperty) element;
      m_attributes.add(prop.getPropertyName());
    }
    else if (element instanceof PredicateCall)
    {
      PredicateCall pc = (PredicateCall) element;
      m_attributes.addAll(AttributeExtractor.getAttributes(pc.getPredicateDefinition()));
    }
  }

  @Override
  public void pop()
  {
    // Do nothing
  }

}
