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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel loginModel)
        {
            Console.WriteLine("Gelen Email: " + loginModel.Email);
            Console.WriteLine("Gelen Şifre: " + loginModel.Password);
            var user = await GetUserFromEmail(loginModel.Email);
            if (user != null && loginModel.Password == user.Password)
            {
                var token = _jwtService.GenerateJwtToken(user);

                Response.Cookies.Append("AuthToken", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict
                });

                return Ok(new { success = true });
            }
            return Unauthorized(new { success = false, message = "Geçersiz giriş bilgileri" });
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
