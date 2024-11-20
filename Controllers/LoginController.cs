using Microsoft.AspNetCore.Mvc;
using ObiGayrimenkul.Firebase;
using ObiGayrimenkul.Models;
using ObiGayrimenkul.Services;
using System.IdentityModel.Tokens.Jwt;

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

        [HttpGet]
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
            var users = await _firestore.GetAll<User>("users", CancellationToken.None);
            foreach (var user in users)
            {
                if (user.Email == loginModel.Email)
                {
                    var FoundedUser = user;
                    if (FoundedUser != null && loginModel.Password == FoundedUser.Password)
                    {
                        try
                        {
                            var token = _jwtService.GenerateJwtToken(FoundedUser);

                            Response.Cookies.Append("AuthToken", token, new CookieOptions
                            {
                                HttpOnly = true,
                                Secure = true,
                                SameSite = SameSiteMode.Strict
                            });

                            return Ok(new { success = true, userName = FoundedUser.Name, AuthToken = token, userId = FoundedUser.Id });
                        }
                        catch (Exception ex)
                        {
                            return StatusCode(500, "Token olusturulamadı.");
                        }
                    }
                }
            }
            return Unauthorized(new { success = false, message = "Geçersiz giriş bilgileri" });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody]User user, CancellationToken ct)
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
                    return Ok(new { success = true, message = "Kayit olma islemi basariili." });
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

        [HttpGet("current-user")]
        public IActionResult GetCurrentUser()
        {
            var authToken = Request.Cookies["AuthToken"];
            if (string.IsNullOrEmpty(authToken))
            {
                return Unauthorized(new { success = false, message = "Kullanıcı oturumu geçerli değil." });
            }

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(authToken);

            var userId = jwtToken.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
            var userName = jwtToken.Claims.FirstOrDefault(c => c.Type == "name")?.Value;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userName))
            {
                return Unauthorized(new { success = false, message = "Geçersiz token." });
            }

            return Ok(new { success = true, userName, userId });
        }


        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("AuthToken");
            return Ok(new { success = true ,  message = "Cikis yapildi " });
        }
    }
}
