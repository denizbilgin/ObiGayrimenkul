using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using ObiGayrimenkul.Firebase;
using ObiGayrimenkul.Models;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;

namespace ObiGayrimenkul.Controllers
{
    [Route("users")]
    public class UserController : Controller
    {
        private readonly FirestoreProvider _firestore;

        public UserController(FirestoreProvider firestore)
        {
            _firestore = firestore;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var users = await _firestore.GetAll<User>("users", CancellationToken.None);
            return Ok(users);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create(User user, CancellationToken ct)
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


        [HttpPost("delete/{id}")]
        public async Task<IActionResult> Delete(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<User>(id,"users", ct);
            if (advert != null)
            {
                var collection = _firestore._fireStoreDb.Collection("users");
                await collection.Document(id).DeleteAsync(null, ct);
            }
            return RedirectToAction(nameof(Index));
        }

        [HttpGet("edit/{id}")]
        public async Task<IActionResult> Update(string id, CancellationToken ct)
        {
            var user = await _firestore.Get<User> (id, "users", ct);
            if(user == null)
            {
                return NotFound();
            }
            //return View();
            return Ok(user);
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
                catch (Exception ex) {
                    if (!await UserExists(user.Id.ToString() , ct))
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

        private async Task<bool> UserExists(string id , CancellationToken ct)
        {
            var user = await _firestore.Get<User>(id, "users", ct);
            return user != null;
        }
    }
}
