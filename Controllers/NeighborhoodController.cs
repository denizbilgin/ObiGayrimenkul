using Microsoft.AspNetCore.Mvc;

namespace ObiGayrimenkul.Controllers
{
    public class NeighborhoodController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
