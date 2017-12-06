package ca.uqac.lif.cornipickle.server;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;

import javax.xml.bind.DatatypeConverter;

import com.sun.net.httpserver.HttpExchange;

import ca.uqac.lif.cornipickle.ElementFilter;
import ca.uqac.lif.cornipickle.Interpreter;
import ca.uqac.lif.cornipickle.Statement;
import ca.uqac.lif.cornipickle.TransformationBuilder;
import ca.uqac.lif.cornipickle.Verdict;
import ca.uqac.lif.cornipickle.Interpreter.StatementMetadata;
import ca.uqac.lif.cornipickle.faultfinder.FaultIterator;
import ca.uqac.lif.cornipickle.faultfinder.PositiveFaultIterator;
import ca.uqac.lif.cornipickle.transformations.CorniTransformation;
import ca.uqac.lif.jerrydog.CallbackResponse;
import ca.uqac.lif.jerrydog.InnerFileServer;
import ca.uqac.lif.jerrydog.RequestCallback;
import ca.uqac.lif.json.JsonElement;
import ca.uqac.lif.json.JsonList;
import ca.uqac.lif.json.JsonMap;
import ca.uqac.lif.json.JsonNumber;
import ca.uqac.lif.json.JsonParser;
import ca.uqac.lif.json.JsonString;
import ca.uqac.lif.json.JsonParser.JsonParseException;

/**
 * Returns a dummy one-pixel image. This request is used as a means of
 * communication between the JavaScript probe and the interpreter. The
 * request passes as GET parameters an URL-encoded JSON object containing
 * information about the current state of the page. The response is made
 * of a one-pixel PNG image, and a cookie containing a JSON object. This
 * object is retrieved by the JS probe, which uses it to determine whether
 * any elements of the page should be highlighted.
 * It also returns a set of transformations that can potentially fix the
 * page.
 * <ul>
 * <li>Method: <b>GET</b></li>
 * <li>Name: <tt>/feedback</tt></li>
 * <li>Input:
 * <ul>
 * <li>A parameter named <tt>contents</tt>, which contains a urlencoded
 * JSON string of the following form:
 * <pre>
 * {
 *   TODO
 * }
 * </pre>
 * </li>
 * </ul>
 * </li>
 * <li>Response: 
 * <ul>
 * <li>Binary data for a one-pixel PNG image</li>
 * <li>Into a cookie named <tt>cornipickle</tt>, a JSON string of the form:
 * <pre>
 * {
 *   "num-true"           : 0,
 *   "num-false"          : 0,
 *   "num-inconclusive"   : 0,
 *   "global-verdict"     : "TRUE",
 *   "highlight-ids"      : [
 *      {
 *        "ids"     : [[0, 1, 2, ...], [3, 4], ...],
 *        "caption" : "Some text"
 *      },
 *      ...   
 *   ],
 *   "transformations"    :
 *      {
 *        "uniqueid 0 The statement blabla" :
 *        [
 *          [{ "id" : 2, "property" : "bottom", "value" : 11"}],
 *          [{ "id" : 3, "property" : "bottom", "value" : 11"}],
 *          [
 *            { "id" : 3, "property" : "bottom", "value" : 15"},
 *            { "id" : 4, "property" : "bottom", "value" : 15"}
 *          ]
 *        ],
 *        "uniqueid 1 The other statement" : ....
 *      }
 * }
 * </pre>
 * The attributes <tt>num-true</tt>, <tt>num-false</tt> and
 * <tt>num-inconclusive</tt> give the number of Cornipickle statements that
 * evaluate to true, false and inconclusive respectively. The attribute
 * <tt>global-verdict</tt> is either "TRUE", "FALSE" or "INCONCLUSIVE",
 * depending on the verdict of each statement.
 * <p>
 * The property <tt>highlight-ids</tt> is a list of structures, each correpsonding
 * to one Cornipickle statement, and having two attributes. Attribute
 * <tt>ids</tt> is a list, each element of which is a list of ids. These
 * represents the groups of elements that could be highlighted in the browser
 * to signal an error. For example, the group <tt>[0, 1, 2, ...]</tt> is
 * a first group of element IDs involved in one error instance of the property.
 * The group <tt>[3, 4]</tt> represents a second group of element IDs involved
 * in another error instance of the same property. Finally, the attribute
 * <tt>caption</tt> corresponds to the metadata <tt>@caption</tt> associated with
 * the property, if any. Note that properties that are not violated will not
 * create such a structure in the response cookie.
 * The property <tt>transformations</tt> is a map with statement metadata as the
 * keys and candidate transformations as values. Each candidate is a list of
 * transformations that are needed to make the verdict true.
 * </li>
 * </ul>
 * </li>
 * </ul>
 * @author Francis
 *
 */
public class GetFeedback extends InterpreterCallback
{
  /**
   * Dummy image made of one white pixel
   */
  static final byte[] s_dummyImage = InnerFileServer.readBytes(
      CornipickleServer.class.getResourceAsStream("resource/dummy-image.png"));
  
  /**
   * Dummy image made of one red pixel
   */
  static final byte[] s_dummyImageRed = InnerFileServer.readBytes(
      CornipickleServer.class.getResourceAsStream("resource/dummy-image-red.png"));
  
  /**
   * Dummy image made of one green pixel
   */  
  static final byte[] s_dummyImageGreen = InnerFileServer.readBytes(
      CornipickleServer.class.getResourceAsStream("resource/dummy-image-green.png"));
  
  static JsonParser s_jsonParser;
  
  public GetFeedback(Interpreter i)
  {
    super(i, RequestCallback.Method.POST, "/getfeedback/");
    s_jsonParser = new JsonParser();
  }

  @Override
  public CallbackResponse process(HttpExchange t)
  {
    Map<String,String> attributes = getParameters(t);
    
    JsonElement j = null;
    String memento = "";
    try
    {
      j = s_jsonParser.parse(URLDecoder.decode(attributes.get("contents"), "UTF-8"));
      if(attributes.get("interpreter") != null)
      {
    	  memento = URLDecoder.decode(attributes.get("interpreter"), "UTF-8");
          m_interpreter = m_interpreter.restoreFromMemento(memento);
      }
    } catch (JsonParseException e)
    {
      e.printStackTrace(); //Never supposed to happen....
    } catch (UnsupportedEncodingException e)
    {
      e.printStackTrace();
    }
    
    if (j != null)
    {
      m_interpreter.evaluateAll(j);
      //m_server.setLastProbeContact();
    }
    
    // Select the dummy image to send back
    Map<StatementMetadata,Verdict> verdicts = m_interpreter.getVerdicts();
    byte[] image_to_return = selectImage(verdicts);
    // Create response
    CallbackResponse cbr = new CallbackResponse(t);
    cbr.setHeader("Access-Control-Allow-Origin", "*");
    cbr.setContents(createResponseBody(verdicts, memento, image_to_return, j));
    cbr.setContentType(CallbackResponse.ContentType.JSON);
    m_interpreter.clear();
    // DEBUG: print state
    //com.google.gson.GsonBuilder builder = new com.google.gson.GsonBuilder();
    //com.google.gson.Gson gson = builder.create();
    //System.out.println(gson.toJson(m_interpreter));
    return cbr;
  }
  
  /**
   * Determines which of the three images (red, white, blue) to send back
   *   to the browser. The image is chosen as follows:
   *   <ul>
   *   <li>All properties evaluate to true: green</li>
   *   <li>No property to evaluate: white</li>
   *   <li>At least one property evaluates to false: red</li>
   *   </ul>
   * @param verdicts A map from the metadata for each property to
   *   its current verdict
   * @return The byte array with the contents of the selected image
   */
  protected static byte[] selectImage(Map<StatementMetadata,Verdict> verdicts)
  {
    int num_errors = 0;
    byte[] image_out = s_dummyImage;
    for (StatementMetadata key : verdicts.keySet())
    {
      Verdict v = verdicts.get(key);
      if (v.is(Verdict.Value.FALSE))
      {
        num_errors++;
      }
    }
    if (num_errors == 0)
    {
      if (verdicts.isEmpty())
      {
        // Cornipickle has no property to evaluate
      }
      else
      {
        // All's well! All properties evaluate to true 
      }
    }
    else
    {
      // Errors found
      image_out = s_dummyImageRed;
    }
    return image_out;
  }
  
  /**
   * Creates the response body out of the verdict of each property handled by the
   * interpreter. This response contains, for each property, its caption,
   * a list of element IDs to highlight (if any), as well as the total
   * number of true/false/inconclusive properties.
   * In addition, it contains the serialized state of the current interpreter
   * @param verdicts A map from the metadata for each property to
   *   its current verdict
   * @param interpreter String in base 64 representing the state of the interpreter
   * @param image The image to return as an array of bytes
   * @return A JSON string to be passed as the response to
   *   the browser
   */
  protected String createResponseBody(Map<StatementMetadata,Verdict> verdicts, String interpreter,
      byte[] image, JsonElement j)
  {
    int num_false = 0;
    int num_true = 0;
    int num_inconclusive = 0;
    Verdict outcome = new Verdict(Verdict.Value.TRUE);
    JsonList highlight_ids = new JsonList();
    for (StatementMetadata key : verdicts.keySet())
    {
      JsonMap element = new JsonMap();
      JsonList id_to_highlight = new JsonList();
      Verdict v = verdicts.get(key);
      outcome.conjoin(v);
      if (v.is(Verdict.Value.FALSE))
      {
        num_false++;
        id_to_highlight.addAll(getIdsToHighlight(v));
      }
      else if (v.is(Verdict.Value.TRUE))
      {
        num_true++;
      } 
      else
      {
        num_inconclusive++;
      }
      element.put("ids", id_to_highlight);
      element.put("caption", new JsonString(CornipickleServer.escapeQuotes(key.get("description"))));
      highlight_ids.add(element);
    }
    JsonMap result = new JsonMap();
    result.put("global-verdict", outcome.toPlainString());
    result.put("num-true", num_true);
    result.put("num-false", num_false);
    result.put("num-inconclusive", num_inconclusive);
    result.put("highlight-ids", highlight_ids);
    result.put("interpreter", interpreter);
    result.put("transformations", getTransformations(verdicts, j));
    result.put("image", "data:image/png;base64," + DatatypeConverter.printBase64Binary(image));
    // Below, we use true to get a compact JSON string without CF/LF
    // (otherwise the cookie won't be passed correctly to the browser)
    return result.toString("", true); 
  }
  
  protected static JsonList getIdsToHighlight(Verdict v)
  {
    JsonList ids = new JsonList();
    Set<Set<JsonElement>> tuples = v.getWitness().flatten();
    for (Set<JsonElement> tuple : tuples)
    {
      JsonList out = new JsonList();
      for (JsonElement e : tuple)
      {
        if (!(e instanceof JsonMap))
        {
          continue;
        }
        JsonMap m = (JsonMap) e;
        JsonElement id = m.get("cornipickleid");
        if (id == null || !(id instanceof JsonNumber))
        {
          continue;
        }
        out.add((JsonNumber) id);
      }
      ids.add(out);
    }
    return ids;
  }
  
  protected JsonMap getTransformations(Map<StatementMetadata,Verdict> verdicts, JsonElement page)
  {
    JsonMap toReturn = new JsonMap();
    TransformationBuilder builder = new TransformationBuilder(page);
    Set<StatementMetadata> falseStatements = new HashSet<StatementMetadata>();
    Map<StatementMetadata,FaultIterator<JsonElement>> faultIterators = new HashMap<StatementMetadata,FaultIterator<JsonElement>>();
    
    for(Entry<StatementMetadata,Verdict> entry : verdicts.entrySet())
    {
      if(entry.getValue().is(Verdict.Value.FALSE))
      {
        Statement s = m_interpreter.getProperty(entry.getKey());
        s.postfixAccept(builder);
        falseStatements.add(entry.getKey());
      }
    }

    Set<CorniTransformation>  transfos = builder.getTransformations();
    for(StatementMetadata s : falseStatements)
    {
      FaultIterator<JsonElement> faultIterator = new PositiveFaultIterator<JsonElement>(m_interpreter.getProperty(s), page, transfos, new ElementFilter());
      faultIterator.setTimeout(40000);
      if(faultIterator.hasNext())
      {
        faultIterators.put(s, faultIterator);
      }
    }

    for(Entry<StatementMetadata,FaultIterator<JsonElement>> entry : faultIterators.entrySet())
    {
      JsonList candidates = new JsonList();
	    JsonList transformations = new JsonList();
	    Set<? extends CorniTransformation> set = (Set<? extends CorniTransformation>) entry.getValue().next();
	    
	    for (CorniTransformation ct : set)
	    {
	      transformations.add(ct.toJson());
	    }
	    
	    candidates.add(transformations);
      toReturn.put(entry.getKey().toString().replace("\n", " "), candidates);
    }
    
    return toReturn;
  }
}