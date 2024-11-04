using Microsoft.AspNetCore.Mvc;

namespace ObiGayrimenkul.Controllers
{
    [Route("documents")]
    public class DocumentsController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            return View("Views/Home/documents.cshtml");
        }
    }
}
