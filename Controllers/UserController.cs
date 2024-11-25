using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using ObiGayrimenkul.Firebase;
using ObiGayrimenkul.Models;
using ObiGayrimenkul.Services;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;

namespace ObiGayrimenkul.Controllers
{
    [Route("users")]
    public class UserController : Controller
    {
        private readonly FirestoreProvider _firestore;
        private readonly JwtService _jwtService;

        public UserController(FirestoreProvider firestore, JwtService jwtService)
        {
            _firestore = firestore;
            _jwtService = jwtService;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var users = await _firestore.GetAll<User>("users", CancellationToken.None);
            return Ok(users);
        }

        [HttpGet("get-details/{id}")]
        public async Task<IActionResult> GetDetailsByID(string id, CancellationToken ct)
        {
            var user = await _firestore.Get<User>(id, "users", ct);
            if (user == null)
            {
                Response.StatusCode = 404;
                return View("~/Views/Home/404.cshtml"); ;
            }
            return Ok(user);
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetProfile(string userId , CancellationToken ct)
        {
            var user = await _firestore.Get<User>(userId, "users", ct);
            if (user == null) {
                return StatusCode(404);
            }
            return View("~/Views/Home/user-profile.cshtml");
        }

        [HttpPost("delete/{id}")]
        public async Task<IActionResult> Delete(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<User>(id, "users", ct);
            if (advert != null)
            {
                var collection = _firestore._fireStoreDb.Collection("users");
                await collection.Document(id).DeleteAsync(null, ct);
            }
            return RedirectToAction(nameof(Index));
        }
        //[Authorize(Roles ="Admin")]
        [HttpGet("edit/{id}")]
        public async Task<IActionResult> Update(string id, CancellationToken ct)
        {
            var user = await _firestore.Get<User>(id, "users", ct);
            if (user == null)
            {
                Response.StatusCode = 404;
                return View("~/Views/Home/404.cshtml");
            }
            return View("~/Views/Home/user-profile.cshtml");

        }

        [Authorize]
        [HttpPost("edit/{id}")]
        public async Task<IActionResult> Update(string id,[FromBody] User user, CancellationToken ct)
        {
            Console.WriteLine($"User Details: {System.Text.Json.JsonSerializer.Serialize(user)}");
            if (id != user.Id.ToString())
            {
                return Content("User bulunamadi");
            }
            if (ModelState.IsValid)
            {
                if (!await UserExists(user.Id.ToString(), ct))
                {
                    return Content("User mevcut degil");
                }

                await _firestore.Update<User>(user, "users", ct);
            }
            return Ok(user);
        }

        //[Authorize]
        [HttpGet("change-user-password")]
        public IActionResult ChangePassword()
        {
            return View("~/Views/Home/change-password.cshtml");
        }

        // [Authorize]
        [HttpPost("change-user-password")]
        public async Task<IActionResult> ChangePassword(string userId , string oldPassword , string newPassword, CancellationToken ct)
        {
            var user = await _firestore.Get<User>(userId, "users", ct);
            if (user == null)
            {
                Response.StatusCode = 404;
                return View("~/Views/Home/404.cshtml");
            }

            if(user.Password == oldPassword)
            {
                user.Password = newPassword;
                await _firestore.Update<User>(user, "users", ct);
                return Ok(user);
            }
            else
            {
                return Content("Mevcut şifreniz yanlış . Şifrenizi unuttuysanız");
            } 
        }

        [HttpGet("forgot-my-password")]
        public IActionResult ForgotPassword()
        {
            return View("~/Views/Home/forgot-password.cshtml");
        }

        [HttpPost("forgot-my-password")]
        public async Task<IActionResult> ForgotMyPassword([FromBody] ForgotPasswordRequest request, CancellationToken ct)
        {
            Console.WriteLine("Forgot Password Request: " + System.Text.Json.JsonSerializer.Serialize(request));
            if (string.IsNullOrWhiteSpace(request.Email) || request.AuthDocNumber <= 0)
            {
                return BadRequest(new { message = "Geçerli bir e-posta ve kimlik numarası giriniz." });
            }
            var users = await _firestore.GetAll<User>("users", ct);
            var user = users.FirstOrDefault(u => u.Email == request.Email && u.AuthDocNumber == request.AuthDocNumber);

            if (user == null)
            {
                return NotFound(new { message = "Bu bilgilere sahip bir kullanıcı bulunamadı." });
            }

            if (request.NewPassword != request.NewPasswordRepeated)
            {
                return BadRequest(new { message = "Şifreler uyuşmuyor." });
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { message = "Geçerli bir şifre giriniz." });
            }

            if (user.Password == request.NewPassword)
            {
                return BadRequest(new { message = "Eski şifrenizle aynı bir şifre giremezsiniz." });
            }

            user.Password = request.NewPassword;
            await _firestore.Update<User>(user, "users", ct);

            return Ok(new { message = "Şifreniz başarıyla sıfırlandı." });
        }


        [HttpGet("isAdmin/{userId}")]
        public async Task<IActionResult> IsAdmin(string userId, CancellationToken ct)
        {
            var user = await _firestore.Get<User>(userId, "users", ct);

            if (user.Role.Equals("Admin"))
            {
                return Ok(new { success = true });
                
            }
            else
            {
                return Unauthorized(new { success = false });
                
            }
        }

        [HttpGet("user-adverts/{userId}")]
        public async Task<IActionResult> UserAdverts(string userId, CancellationToken ct)
        {
            return View("~/Views/Home/user-properties.cshtml");
        }


        [HttpGet("user-exists")]
        private async Task<bool> UserExists(string id, CancellationToken ct)
        {
            var user = await _firestore.Get<User>(id, "users", ct);
            return user != null;
        }
    }
}
