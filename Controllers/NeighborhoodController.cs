using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Mvc;
using ObiGayrimenkul.Firebase;

namespace ObiGayrimenkul.Controllers
{
    [ApiController]
    [Route("api/search")]
    public class NeighborhoodController : Controller
    {
        private readonly FirestoreProvider _firestore;

        public NeighborhoodController(FirestoreProvider fireStore)
        {
            _firestore = fireStore;
        }

        public IActionResult Index()
        {
            return View();
        }

        public async Task<IReadOnlyCollection<T>> FilterBy<T>(
            double? minPrice = null,
            double? maxPrice = null,
            double? minSquareMeters = null,
            double? maxSquareMeters = null,
            bool? hasElevator = null,
            bool? nearSchool = null,
            bool? inSite = null,
            bool? hasPantry = null,
            bool? nearHealthCenter = null,
            bool? hasParking = null,
            bool? hasNaturalGas = null,
            bool? isFurnished = null,
            CancellationToken ct = default) where T : IFirebaseEntity
        {
            var approvedAdverts = await _firestore.GetAllApproved<Advert>(CancellationToken.None);
            Query query = _firestore._fireStoreDb.Collection("adverts");

            if (minPrice.HasValue)
                query = query.WhereGreaterThanOrEqualTo("price", minPrice.Value);

            if (maxPrice.HasValue)
                query = query.WhereLessThanOrEqualTo("price", maxPrice.Value);

            if (minSquareMeters.HasValue)
                query = query.WhereGreaterThanOrEqualTo("squareMeters", minSquareMeters.Value);

            if (maxSquareMeters.HasValue)
                query = query.WhereLessThanOrEqualTo("squareMeters", maxSquareMeters.Value);

            if (hasElevator.HasValue)
                query = query.WhereEqualTo("elevator", hasElevator.Value);

            if (nearSchool.HasValue)
                query = query.WhereEqualTo("nearSchool", nearSchool.Value);

            if (inSite.HasValue)
                query = query.WhereEqualTo("inSite", inSite.Value);

            if (hasPantry.HasValue)
                query = query.WhereEqualTo("pantry", hasPantry.Value);

            if (nearHealthCenter.HasValue)
                query = query.WhereEqualTo("nearHealthCenter", nearHealthCenter.Value);

            if (hasParking.HasValue)
                query = query.WhereEqualTo("parking", hasParking.Value);

            if (hasNaturalGas.HasValue)
                query = query.WhereEqualTo("naturalGas", hasNaturalGas.Value);

            if (isFurnished.HasValue)
                query = query.WhereEqualTo("furnished", isFurnished.Value);

            return await _firestore.GetList<T>(query, ct);
        }

        
    }
}
