using System.Dynamic;
using System.Reflection;

namespace Imfo.WebApi.Extensions;

public static class ObjectExtensions
{
    public static ExpandoObject ShapeData<TSource>(this TSource source, IEnumerable<string> fields)
    {
        if (source == null) throw new ArgumentNullException(nameof(source));

        var expando = new ExpandoObject();
        var dict = (IDictionary<string, object?>)expando;

        var propertyInfos = typeof(TSource).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        if (fields == null || !fields.Any())
        {
            foreach (var prop in propertyInfos)
            {
                dict[prop.Name] = prop.GetValue(source);
            }
            return expando;
        }

        var fieldsToInclude = new HashSet<string>(fields, StringComparer.OrdinalIgnoreCase);

        foreach (var prop in propertyInfos)
        {
            if (fieldsToInclude.Contains(prop.Name))
            {
                dict[prop.Name] = prop.GetValue(source);
            }
        }

        return expando;
    }
}
