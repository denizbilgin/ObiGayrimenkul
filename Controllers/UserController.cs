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
        [Authorize(Roles ="Admin")]
        [HttpGet("edit/{id}")]
        public async Task<IActionResult> Update(string id, CancellationToken ct)
        {
            var user = await _firestore.Get<User>(id, "users", ct);
            if (user == null)
            {
                return NotFound();
            }
            return View("~/Views/Home/user-profile.cshtml");

        }


        [HttpPost("edit/{id}")]
        public async Task<IActionResult> Update(string id, User user, CancellationToken ct)
        {
            if (id != user.Id.ToString())
            {
                return NotFound();
            }
            if (ModelState.IsValid)
            {
                try
                {
                    await _firestore.Update<User>(user, "users", ct);
                }
                catch (Exception ex)
                {
                    if (!await UserExists(user.Id.ToString(), ct))
                    {
                        return NotFound(ex.Message);
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            return Ok(user);
        }

        [HttpGet("user-exists")]
        private async Task<bool> UserExists(string id, CancellationToken ct)
        {
            var user = await _firestore.Get<User>(id, "users", ct);
            return user != null;
        }
    }
}
