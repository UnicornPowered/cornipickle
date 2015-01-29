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

import java.util.Iterator;
import java.util.Map;

import ca.uqac.lif.cornipickle.json.JsonElement;

public class Eventually extends Globally
{
	@Override
	public Verdict evaluate(JsonElement j, Map<String, JsonElement> d)
	{
		if (m_verdict != Verdict.INCONCLUSIVE)
		{
			return m_verdict;
		}
		// Instantiate new inner statement
		Statement new_s = m_innerStatement.getClone();
		m_inMonitors.add(new_s);
		// Evaluate each
		Iterator<Statement> it = m_inMonitors.iterator();
		while (it.hasNext())
		{
			Statement st = it.next();
			Verdict st_v = st.evaluate(j, d);
			if (st_v == Verdict.FALSE)
			{
				it.remove();
			}
			if (st_v == Verdict.TRUE)
			{
				m_verdict = Verdict.TRUE;
				return m_verdict;
			}
		}
		return Verdict.INCONCLUSIVE;
	}
	
	@Override
	public String toString(String indent)
	{
		StringBuilder out = new StringBuilder();
		out.append(indent).append("Always (\n");
		out.append(m_innerStatement.toString(indent + "  "));
		out.append("\n").append(indent).append(")");
		return out.toString();
	}
	
	@Override
	public Statement getClone()
	{
		Eventually out = new Eventually();
		out.setInnerStatement(m_innerStatement.getClone());
		return out;
	}

}