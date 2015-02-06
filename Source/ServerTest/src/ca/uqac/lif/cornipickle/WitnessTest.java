package ca.uqac.lif.cornipickle;

import static org.junit.Assert.fail;

import java.io.IOException;
import java.util.Set;

import org.junit.Before;
import org.junit.Test;

import ca.uqac.lif.cornipickle.CornipickleParser.ParseException;
import ca.uqac.lif.cornipickle.json.JsonElement;
import ca.uqac.lif.cornipickle.json.JsonParser;
import ca.uqac.lif.cornipickle.json.JsonParser.JsonParseException;
import ca.uqac.lif.cornipickle.json.JsonSlowParser;
import ca.uqac.lif.cornipickle.util.PackageFileReader;

public class WitnessTest
{
  
  CornipickleParser c_parser;
  JsonParser j_parser;
  
  @Before
  public void setUp() throws Exception
  {
    c_parser = new CornipickleParser();
    j_parser = new JsonSlowParser();
  }

  @Test
  public void testEquality1() throws ParseException, JsonParseException, IOException
  {
    String property = "For each $x in $(a) ($x's width is greater than 100)";
    Statement st = c_parser.parseStatement(property);
    if (st == null)
    {
      fail("Parsed statement is null");
    }
    JsonElement document = j_parser.parse(PackageFileReader.readPackageFile(this.getClass(), "data/witness-1.json"));
    if (document == null)
    {
      fail("JSON document is null");
    }
    Verdict verdict = st.evaluate(document);
    if (!verdict.is(Verdict.Value.TRUE))
    {
      fail("Wrong verdict");
    }
    Witness w_true = verdict.getWitnessTrue();
    if (w_true.childrenCount() != 0)
    {
      fail("Incorrect number of witnesses");
    }
    Witness w_false = verdict.getWitnessFalse();
    if (w_false.childrenCount() != 0)
    {
      fail("Incorrect number of witnesses");
    }
  }
  
  @Test
  public void testEquality2() throws ParseException, JsonParseException, IOException
  {
    String property = "For each $x in $(a) (There exists $y in $(b) such that ($x's width equals $y's width))";
    Statement st = c_parser.parseStatement(property);
    if (st == null)
    {
      fail("Parsed statement is null");
    }
    JsonElement document = j_parser.parse(PackageFileReader.readPackageFile(this.getClass(), "data/witness-1.json"));
    if (document == null)
    {
      fail("JSON document is null");
    }
    Verdict verdict = st.evaluate(document);
    if (!verdict.is(Verdict.Value.TRUE))
    {
      fail("Wrong verdict");
    }
    Witness w = verdict.getWitness();
    if (w.childrenCount() != 0)
    {
      fail("Incorrect number of witnesses");
    }
  }
  
  @Test
  public void testEquality3() throws ParseException, JsonParseException, IOException
  {
    String property = "For each $x in $(a) (For each $y in $(c) ($x's width is greater than $y's width))";
    Statement st = c_parser.parseStatement(property);
    if (st == null)
    {
      fail("Parsed statement is null");
    }
    
    JsonElement document = j_parser.parse(PackageFileReader.readPackageFile(this.getClass(), "data/witness-1.json"));
    if (document == null)
    {
      fail("JSON document is null");
    }
    Verdict verdict = st.evaluate(document);
    if (!verdict.is(Verdict.Value.FALSE))
    {
      fail("Wrong verdict");
    }
    Witness w = verdict.getWitness();
    if (w.childrenCount() != 1)
    {
      fail("Incorrect number of witnesses");
    }
    Set<Set<JsonElement>> tuples = w.flatten();
    if (tuples.size() != 2)
    {
      fail("Incorrect number of witnesses");
    }
  }
}
