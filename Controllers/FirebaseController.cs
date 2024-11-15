using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Threading.Tasks;

namespace ObiGayrimenkul.Controllers
{
    [Route("fbase")]
    public class FirebaseController : Controller
    {
        [HttpGet("obidatabase-3e651-firebase-adminsdk-ta9fl-2ef236de49")]
        public async Task<IActionResult> Index()
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Firebase", "obidatabase-jsconfiguration.json");
            if (!System.IO.File.Exists(filePath))
            {
                Response.StatusCode = 404;
                return View("~/Views/Home/404.cshtml");
            }
            try
            {
                var jsonData = await System.IO.File.ReadAllTextAsync(filePath);
                return Content(jsonData, "application/json");
            }
            catch (JsonException jsonEx)
            {
                return BadRequest($"JSON formatında hata: {jsonEx.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Dosya okuma sırasında hata: {ex.Message}");
            }
        }
    }
}
