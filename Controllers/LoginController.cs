using Microsoft.AspNetCore.Mvc;
using ObiGayrimenkul.Firebase;
using ObiGayrimenkul.Models;
using ObiGayrimenkul.Services;

namespace ObiGayrimenkul.Controllers
{
    [Route("user-process")]
    public class LoginController : Controller
    {
        private readonly FirestoreProvider _firestore;
        private readonly JwtService _jwtService;
        public IActionResult Index()
        {
            return View("Views/Home/register.cshtml");
        }

        [HttpGet("login")]
        public async Task<IActionResult> Login()
        {
            return View("Views/Home/register.cshtml");
        }

        [HttpPost("/login")]
        public async Task<IActionResult> Login(LoginModel loginModel)
        {
            var user = await GetUserFromEmail(loginModel.Email);
            if (user != null && loginModel.Password == user.Password)
            {
                var token = _jwtService.GenerateJwtToken(user);
                return Ok(new { token });
            }
            return Unauthorized();
        }

        [HttpGet("get-email")]
        public async Task<User> GetUserFromEmail(string email)
        {
            var users = await _firestore.GetAll<User>("users", CancellationToken.None);
            foreach (var user in users)
            {
                if (user.Email == email)
                {
                    return user;
                }
            }
            return null;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user, CancellationToken ct)
        {
            try
            {
                if (ModelState.IsValid)
                {

                    if (string.IsNullOrEmpty(user.Id))
                    {
                        user.Id = Guid.NewGuid().ToString();
                    }
                    await _firestore.Add(user, "users", ct);
                    return RedirectToAction("Index");
                }
                var errors = ModelState.Values.SelectMany(v => v.Errors)
                                             .Select(e => e.ErrorMessage).ToList();
                return BadRequest(new { message = "Geçersiz veri gönderildi", errors });

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Veri ekleme sırasında hata oluştu: {ex.Message}");

            }
        }
    }
}
