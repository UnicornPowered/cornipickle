package ca.uqac.lif.cornipickle.transformations;

import ca.uqac.lif.cornipickle.util.JsonUtils;
import ca.uqac.lif.json.JsonElement;
import ca.uqac.lif.json.JsonMap;

public abstract class ChangePropertyTransformation extends CorniTransformation
{
  protected int m_id;
  protected String m_property;
  protected JsonElement m_value;
  
  public ChangePropertyTransformation(int id, String property, JsonElement value)
  {
    m_id = id;
    m_property = property;
    m_value = value;
  }
  
	@Override
	public JsonElement apply(JsonElement in)
	{
		if(!(in instanceof JsonMap))
		{
		  return in;
		}
		JsonMap inMap = (JsonMap)in;
		JsonMap out = inMap.clone();
		JsonMap element = JsonUtils.findElementByCornipickleId(out, m_id);
		if(element != null)
		{
		  element.put(m_property, m_value);
		}
		return out;
	}
	
	@Override
  public JsonElement toJson()
  {
    JsonMap map = new JsonMap();
    map.put("type", "changeproperty");
    map.put("id", m_id);
    map.put("property", m_property);
    map.put("value", m_value);
    return map;
  }
	
	@Override
	public String toString()
	{
	  return "Change " + m_property + " property of element with ID " + m_id + " to " + m_value.toString();
	}
}
