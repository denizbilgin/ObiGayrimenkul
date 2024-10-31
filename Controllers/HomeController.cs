using Microsoft.AspNetCore.Mvc;

namespace ObiGayrimenkul.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View("Views/Home/index.cshtml");
        }
    }
}
