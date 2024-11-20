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
        public async Task<IActionResult> ChangePassword(string userId, string newPassword, CancellationToken ct)
        {
            var user = await _firestore.Get<User>(userId, "users", ct);
            if (user == null)
            {
                Response.StatusCode = 404;
                return View("~/Views/Home/404.cshtml");
            }

            user.Password = newPassword;
            await _firestore.Update<User>(user, "users", ct);

            return Ok(user);
        }

        [HttpGet("isAdmin/{userId}")]
        public async Task<IActionResult> IsAdmin(string userId, CancellationToken ct)
        {
            var user = await _firestore.Get<User>(userId, "users", ct);
            Console.WriteLine("user Id : " + userId);
            Console.WriteLine("user role : " + user.Role);
            Console.WriteLine("user role yok ama fonksiyon calismakta");

            if (user.Role.Equals("Admin"))
            {
                Console.WriteLine("user role admin geldi : " + user.Role);
                Console.WriteLine("user role yok ama fonksiyon calismakta");
                return Ok(new { success = true });
                
            }
            else
            {
                Console.WriteLine("user role admin değil geldi : " + user.Role);
                Console.WriteLine("user role yok ama fonksiyon calismakta");
                return Ok(new { success = false });
                
            }
        }



        [HttpGet("user-exists")]
        private async Task<bool> UserExists(string id, CancellationToken ct)
        {
            var user = await _firestore.Get<User>(id, "users", ct);
            return user != null;
        }
    }
}
