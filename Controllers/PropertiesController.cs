using Microsoft.AspNetCore.Mvc;

namespace ObiGayrimenkul.Controllers
{
    [Route("properties")]
    public class PropertiesController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            return View("~/Views/Home/properties.cshtml");
        }

        [HttpGet("submit-property")]
        public IActionResult SubmitProperty()
        {
            return View("~/Views/Home/properties.cshtml");
        }
    }
}
