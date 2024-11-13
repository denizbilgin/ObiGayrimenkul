using Google.Cloud.Firestore;
using Google.Rpc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ObiGayrimenkul.Firebase;
using ObiGayrimenkul.Models;

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

            return View("~/Views/Home/index.cshtml");
        }

        [HttpGet("all-adverts")]
        public async Task<IActionResult> GetAllAdverts(CancellationToken ct)
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
            return View("~/Views/Home/property-detail.cshtml");
        }

        [HttpGet("get-details/{id}")]
        public async Task<IActionResult> GetDetailsByID(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id, "adverts", ct);
            if (advert == null)
            {
                return NotFound();
            }
            return Ok(advert);
        }

        // İlan ekle - GET (Form gösterimi)
        //[Authorize]
        [HttpGet("create")]
        public IActionResult Create()
        {
            return View("~/Views/Home/submit-property.cshtml");

        }

        // İlan ekle - POST (Formdan gelen verileri işleme)
        //[Authorize]
        [HttpPost("create")]

        public async Task<IActionResult> Create([FromBody] Advert advert, CancellationToken ct)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    if (string.IsNullOrEmpty(advert.Id))
                    {
                        advert.Id = Guid.NewGuid().ToString();
                    }

                    var date = Timestamp.FromDateTime(DateTime.UtcNow);
                    advert.PublishDate = date.ToDateTime().ToString();
                    advert.Approved = false;
                    Console.WriteLine(advert.PublishDate);
                    await _firestore.Add(advert, "advert-requests", ct);

                    return Ok(advert);
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

        /* [HttpGet("edit/{id}")]
         public async Task<IActionResult> Edit(string id, CancellationToken ct)
         {
             var advert = await _firestore.Get<Advert>(id,"adverts", ct);

             if (advert == null)
             {
                 return NotFound();
             }
             // return View(advert);
             return Ok(advert);
         }*/
        
        [HttpPost("edit/{id}")]
        public async Task<IActionResult> Edit(string id,[FromBody] Advert advert, CancellationToken ct)
        {
            if (id != advert.Id.ToString())
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {   
                    await _firestore.Update(advert,"adverts", ct);
                
                    if (!await AdvertExists(advert.Id.ToString(), ct))
                    {
                        return NotFound();
                    }
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
        //[Authorize(Roles = "Admin")]
        [HttpPost("delete/{id}")]
        public async Task<IActionResult> DeleteConfirmed(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id, "adverts", ct);
            if (advert != null)
            {
                var collection = _firestore._fireStoreDb.Collection("adverts");
                await collection.Document(id).DeleteAsync(null, ct);
            }
            return RedirectToAction(nameof(Index));
        }


        //[Authorize(Roles = "Admin")]
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> Approve(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id,"advert-requests" ,ct);
            //Console.WriteLine(advert.Id);
            if (advert == null)
            {
                Console.WriteLine("advert null");
                return NotFound();
            }

            advert.Approved = true; // İlanı onayla
            await _firestore.Add(advert,"adverts", ct);
            await DeleteRequest(advert.Id, CancellationToken.None);
            return Ok(advert);
        }

        [HttpPost("delete-request/{id}")]
        public async Task<IActionResult> DeleteRequest(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id, "advert-requests", ct);
            if (advert != null)
            {
                var collection = _firestore._fireStoreDb.Collection("advert-requests");
                await collection.Document(id).DeleteAsync(null, ct);
            }
            return RedirectToAction(nameof(Index));
        }
        [HttpGet("sell-house")]
        private async Task<IActionResult> ClientHouseSell(CancellationToken ct)
        {
            return View("~/Views/Home/sell-house.cshtml");
        }

        [HttpPost("sell-house")]
        private async Task<IActionResult> ClientHouseSell([FromBody] ClientHouse clientHouse, CancellationToken ct)
        {
            if (ModelState.IsValid)
            {
                if (string.IsNullOrEmpty(clientHouse.Id))
                {
                    clientHouse.Id = Guid.NewGuid().ToString();
                }
                await _firestore.Add(clientHouse, "client-houses", ct);
            }
            return Ok("Ilan koyma basarili");
        }

        [HttpGet("advert-exists")]
            
        private async Task<bool> AdvertExists(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id,"adverts", ct);
            return advert != null;
        }
    }
}