using Signum.Engine.Translation;
using Southwind.Entities;
using Southwind.Logic;

namespace Southwind.React.ApiControllers;

public class CatalogController : ControllerBase
{
    static PropertyRoute prCategoryName = PropertyRoute.Construct((CategoryEntity a) => a.CategoryName);
    static PropertyRoute prDescription = PropertyRoute.Construct((CategoryEntity a) => a.Description);

    [HttpGet("api/catalog"), SignumAllowAnonymous]
    public List<CategoryWithProducts> Catalog()
    {
        return ProductLogic.ActiveProducts.Value.Select(a => new CategoryWithProducts
        {
            Category = a.Key.ToLite(),
            Picture = a.Key.Picture?.BinaryFile,
            LocCategoryName = TranslatedInstanceLogic.TranslatedField(a.Key.ToLite(), prCategoryName, null, a.Key.CategoryName),
            LocDescription = TranslatedInstanceLogic.TranslatedField(a.Key.ToLite(), prDescription, null, a.Key.Description),
            Products = a.Value
        }).ToList();
    }

#pragma warning disable CS8618 // Non-nullable field is uninitialized.
    public class CategoryWithProducts
    {
        public Lite<CategoryEntity> Category;
        public byte[]? Picture;
        public string LocCategoryName;
        public string LocDescription;
        public List<ProductEntity> Products;
    }
#pragma warning restore CS8618 // Non-nullable field is uninitialized.
}
