using Microsoft.AspNetCore.Mvc;

namespace ObiGayrimenkul.Controllers
{
    [Route("documents")]
    public class DocumentsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
