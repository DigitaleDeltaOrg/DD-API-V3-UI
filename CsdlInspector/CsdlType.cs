namespace CsdlPropertyInspector;

public class CsdlType(string name)
{
  public string              Name         { get; } = name;
  public bool                IsRequired   { internal init; get; }
  public List<CsdlProperty>? Properties   { set;           get; } = [];
  public bool                IsNavigation { set;           get; }
}