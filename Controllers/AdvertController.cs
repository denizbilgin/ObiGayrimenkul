using Google.Cloud.Firestore;
using Google.Rpc;
using Microsoft.AspNetCore.Mvc;
using ObiGayrimenkul.Firebase;

namespace ObiGayrimenkul.Controllers
{
    [Route("adverts")]
    public class AdvertController : Controller
    {
        private readonly FirestoreProvider _firestore;

        public AdvertController(FirestoreProvider firestore)
        {
            _firestore = firestore;
        }

        // İlanları listeleme
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var adverts = await _firestore.GetAllApproved<Advert>(CancellationToken.None);
            return Ok(adverts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByID(string id , CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id, "adverts", ct);
            if (advert == null)
            {
                return NotFound();
            }
            // return View(advert);
            return Ok(advert);
        }

        // İlan ekle - GET (Form gösterimi)
        [HttpGet("create")]
        public IActionResult Create()
        {
            return View("../Views/Home/submit-property.cshtml");

        }

        // İlan ekle - POST (Formdan gelen verileri işleme)
        [HttpPost("create")]

        public async Task<IActionResult> Create(Advert advert, CancellationToken ct)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    if (string.IsNullOrEmpty(advert.Id))
                    {
                        advert.Id = Guid.NewGuid().ToString();
                    }

                    advert.PublishDate = Timestamp.FromDateTime(DateTime.UtcNow);
                    advert.Approved = false;

                    await _firestore.Add(advert, "adverts", ct);

                    return RedirectToAction(nameof(Index));
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

        [HttpGet("edit/{id}")]
        public async Task<IActionResult> Edit(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id,"adverts", ct);
            if (advert == null)
            {
                return NotFound();
            }
            // return View(advert);
            return Ok(advert);
        }

        [HttpPost("edit/{id}")]
        public async Task<IActionResult> Edit(string id, Advert advert, CancellationToken ct)
        {
            if (id != advert.Id.ToString())
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    await _firestore.Update(advert,"adverts", ct);
                }
                catch
                {
                    if (!await AdvertExists(advert.Id.ToString(), ct))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            return Ok(advert);
        }

        [HttpGet("delete/{id}")]
        public async Task<IActionResult> Delete(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id,"adverts", ct);
            if (advert == null)
            {
                return NotFound();
            }
            return View(advert);
        }

        [HttpPost("delete/{id}")]
        public async Task<IActionResult> DeleteConfirmed(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id,"adverts" ,ct);
            if (advert != null)
            {
                var collection = _firestore._fireStoreDb.Collection("adverts");
                await collection.Document(id).DeleteAsync(null, ct);
            }
            return RedirectToAction(nameof(Index));
        }

        // İlan onaylama
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> Approve(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id,"adverts" ,ct);
            if (advert == null)
            {
                return NotFound();
            }

            advert.Approved = true; // İlanı onayla
            await _firestore.AddOrUpdate(advert,"adverts", ct);
            return RedirectToAction(nameof(Index));
        }

        private async Task<bool> AdvertExists(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id,"adverts", ct);
            return advert != null;
        }
    }
}