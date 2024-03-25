using System.Xml;
using Microsoft.OData.Edm;
using Microsoft.OData.Edm.Csdl;

namespace CsdlPropertyInspector;

public static class CsdlInspector
{
  private static readonly Dictionary<string, CsdlType> Types         = new();

  private static readonly List<string> RequiredTypes = [
    "DigitaleDelta.Observation", 
    "DigitaleDelta.ParameterContainer", 
    "DigitaleDelta.Foi", 
    "DigitaleDelta.Result" 
  ];

  /// <summary>
  ///   Inspect the specified type within the CSDL and extract referenced types and their properties.
  /// </summary>
  /// <param name="csdl">CSDL to parse</param>
  /// <param name="type">Type to find in the CSDL.</param>
  /// <returns>Dictionary of type names with their type specifications and properties.</returns>
  /// <exception cref="Exception">
  ///   Exceptions are thrown when: CSDL is empty, type is not present in the CSDL, CSDL is
  ///   invalid.
  /// </exception>
  public static Dictionary<string, CsdlType> Inspect(string csdl, string type)
  {
    if (string.IsNullOrWhiteSpace(csdl))
    {
      throw new Exception("The provided CSDL cannot be null, empty, or consist only of white-space characters.");
    }

    try
    {
      using var stringReader  = new StringReader(csdl);
      using var xmlTextReader = new XmlTextReader(stringReader);
      var       edmModel      = CsdlReader.Parse(xmlTextReader);
      var       edmEntityType = GetTypeByName(edmModel, type);

      if (edmEntityType == null)
      {
        throw new Exception("Cannot find type in CSDL specification.");
      }

      InspectType(edmEntityType);

      return Types;
    }
    catch (Exception ex)
    {
      throw new Exception("An error occurred during the CSDL inspection.", ex);
    }
  }

  /// <summary>
  ///   Inspect the type. It checks the flags and properties. This function is recursive.
  /// </summary>
  /// <param name="edmType">EdmType to inspect.</param>
  private static void InspectType(IEdmStructuredType? edmType)
  {
    if (edmType == null || Types.ContainsKey(edmType.FullTypeName()))
    {
      return;
    }

    var csdlType = new CsdlType(edmType.FullTypeName())
    {
      IsRequired  = RequiredTypes.Contains(edmType.FullTypeName()),
    };

    Types.Add(edmType.FullTypeName(), csdlType);

    csdlType.IsNavigation = edmType.NavigationProperties().Any();

    foreach (var property in edmType.Properties().Distinct())
    {
      InspectProperty(csdlType, property);
    }
  }

  /// <summary>
  ///   Inspect a specific property.
  /// </summary>
  /// <param name="csdlType">CsdlType to fill</param>
  /// <param name="property">Property to inspect</param>
  private static void InspectProperty(CsdlType csdlType, IEdmProperty property)
  {
    IEdmStructuredType? structuredType = null;
    var                 csdlProperty   = CreateCsdlProperty(property);

    csdlType.Properties ??= [];
    
    if (property.Type.IsCollection())
    {
      var collectionElementType = property.Type.AsCollection().ElementType();
      if (collectionElementType.IsStructured())
      {
        structuredType        = collectionElementType.AsStructured().StructuredDefinition();
      }
    }
    else
    {
      if (property.Type.IsStructured())
      {
        structuredType = property.Type.AsStructured().StructuredDefinition();
      }
    }

    csdlType.Properties.Add(csdlProperty);
    InspectType(structuredType);
  }

  /// <summary>
  ///   Create a new CSDL property and fill it with the basic values taken from the specified property.
  /// </summary>
  /// <param name="property">EdmProperty</param>
  /// <returns>Newly created Csdl property</returns>
  private static CsdlProperty CreateCsdlProperty(IEdmProperty property)
  {
    return new CsdlProperty
    {
      Name              = property.Name,
      Type              = property.Type.FullName(),
      IsKey             = property.IsKey(),
      IsNullable        = property.Type.IsNullable,
      IsString          = property.Type.IsString()
    };
  }

  /// <summary>
  ///   Retrieve an EdmType by name from the model.
  /// </summary>
  /// <param name="edmModel">EdmModel</param>
  /// <param name="name">Name of the type to retrieve</param>
  /// <returns>EdmEntityType or null if type by name could not be found.</returns>
  private static IEdmEntityType? GetTypeByName(IEdmModel edmModel, string name)
  {
    return edmModel.SchemaElements.FirstOrDefault(a => a.Name == name) as IEdmEntityType;
  }
}