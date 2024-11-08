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

        public LoginController(FirestoreProvider firestore, JwtService jwtService)
        {
            _firestore = firestore;
            _jwtService = jwtService;
        }

        public IActionResult Index()
        {
            Console.WriteLine("register sayfası açıldı");
            return View("~/Views/Home/register.cshtml");
        }

       /* [HttpGet("login")]
        public async Task<IActionResult> Login()
        {
            Console.WriteLine("deneme");
            return View("~/Views/Home/register.cshtml");
        }*/

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromForm] LoginModel loginModel)
        {
            Console.WriteLine("Gelen Email: " + loginModel.Email);
            Console.WriteLine("Gelen Şifre: " + loginModel.Password);
            var user = await GetUserFromEmail(loginModel.Email);
            if (user != null && loginModel.Password == user.Password)
            {
                try
                {
                    var token = _jwtService.GenerateJwtToken(user);


                    Response.Cookies.Append("AuthToken", token, new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.Strict
                    });

                    return Ok(new { success = true, token });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, "Token olusturulamadı.");
                }
            }
            return Unauthorized(new { success = false, message = "Geçersiz giriş bilgileri" });
        }




        [HttpGet("get-from-email")]
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
