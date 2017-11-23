package ca.uqac.lif.cornipickle.transformations;

import ca.uqac.lif.cornipickle.faultfinder.Transformation;
import ca.uqac.lif.json.JsonElement;
import ca.uqac.lif.json.JsonNumber;

public class ChangeHeightTransformation extends ChangePropertyTransformation
{
  public ChangeHeightTransformation(int id, JsonNumber value)
  {
    super(id, "height", value);
  }
  
  @Override
  public boolean conflictsWith(Transformation<JsonElement> t)
  {
    if(t instanceof MoveTopTransformation || t instanceof MoveBottomTransformation)
    {
      return true;
    }
    return false;
  }
  
  @Override
  public int hashCode()
  {
    return 5;
  }
  
  @Override
  public boolean equals(Object t)
  {
    if(!(t instanceof ChangeHeightTransformation))
    {
      return false;
    }
    ChangeHeightTransformation trans = (ChangeHeightTransformation)t;
    if(trans.m_id == m_id && trans.m_value.equals(m_value))
    {
      return true;
    }
    return false;
  }
}