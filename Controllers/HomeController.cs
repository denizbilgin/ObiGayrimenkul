using Google.Cloud.Firestore.V1;
using Microsoft.AspNetCore.Mvc;
using ObiGayrimenkul.Firebase;

namespace ObiGayrimenkul.Controllers
{
    [Route("home")]
    public class HomeController : Controller
    {
        private readonly FirestoreProvider _firestore;

        public HomeController(FirestoreProvider firestore)
        {
            _firestore = firestore;
        }
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var adverts = await _firestore.GetAllApproved<Advert>(CancellationToken.None);
            return View("Views/Home/index.cshtml", adverts);
        }
    }
}
