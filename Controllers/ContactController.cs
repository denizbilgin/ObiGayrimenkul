using Microsoft.AspNetCore.Mvc;

namespace ObiGayrimenkul.Controllers
{
    [Route("contact")]
    public class ContactController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            return View("~/Views/Home/contact.cshtml");
        }
    }
}
