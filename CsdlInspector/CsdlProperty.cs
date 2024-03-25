namespace CsdlPropertyInspector;

public class CsdlProperty
{
  public string Name       { internal init; get; } = null!;
  public string Type       { internal init;  get; } = null!;
  public bool   IsNullable { internal init;  get; }
  public bool   IsKey      { internal init; get; }
  public bool   IsString   { internal init;  get; }
}