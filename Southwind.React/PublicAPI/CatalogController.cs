using Signum.React.RestLog;
using Southwind.Entities;

namespace Southwind.React.Controllers;

[IncludeInDocumentation, RestLogFilter(allowReplay: true)]
public class CatalogController : Controller
{
    [HttpGet("api/categories")]
    public List<CategoryDTO> GetCategories()
    {
        return Database.Query<CategoryEntity>().Select(a => new CategoryDTO
        {
            Id = (int)a.Id,
            Name = a.CategoryName,
            Description = a.Description
        }).ToList();
    }
}

#pragma warning disable CS8618 // Non-nullable field is uninitialized.
public class CategoryDTO
{
    public int Id { get; internal set; }
    public string Name { get; internal set; }
    public string Description { get; internal set; }
}
#pragma warning restore CS8618 // Non-nullable field is uninitialized.
