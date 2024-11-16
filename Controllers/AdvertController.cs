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

        [HttpGet("advert-requests")]
        public async Task<IActionResult> GetAdvertRequests(CancellationToken ct)
        {
            return View("~/Views/Home/advert-approve.cshtml");
        }

        [HttpGet("all-advert-requests")]
        public async Task<IActionResult> GetAllAdvertRequests(CancellationToken ct)
        {
            var adverts = await _firestore.GetAll<Advert>("advert-requests",CancellationToken.None);
            return Ok(adverts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByID(string id , CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id, "adverts", ct);
            if (advert == null)
            {
                Response.StatusCode = 404;
                return View("~/Views/Home/404.cshtml");
            }
            return View("~/Views/Home/property-detail.cshtml");
        }

        [HttpGet("get-details/{id}")]
        public async Task<IActionResult> GetDetailsByID(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id, "adverts", ct);
            if (advert == null)
            {
                Response.StatusCode = 404;
                return View("~/Views/Home/404.cshtml");
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

        [HttpGet("edit/{id}")]
         public async Task<IActionResult> Edit(string id, CancellationToken ct)
         {
             var advert = await _firestore.Get<Advert>(id,"adverts", ct);

             if (advert == null)
             {
                Response.StatusCode = 404;
                return View("~/Views/Home/404.cshtml");
            }
             return View("~/Views/Home/edit-property.cshtml");
         }
        
        [HttpPost("edit/{id}")]
        public async Task<IActionResult> Edit(string id,[FromBody]Advert advert , CancellationToken ct)
        {
            if (!await AdvertExists(id.ToString(), ct))
            {
                Console.WriteLine("! advertexists");
                Response.StatusCode = 404;
                return View("~/Views/Home/404.cshtml");
            }
            if (ModelState.IsValid)
            {
                
                await _firestore.Update(advert, "adverts", ct);
                advert.Approved = false;
                await _firestore.MoveDocument<Advert>(id, "adverts", "advert-requests", ct);
                //await _firestore.Add(advert, "advert-requests", ct);
                //await _firestore.Delete(advert.Id, "adverts", ct);

                
            }
            return Ok(advert);
        }

        [HttpGet("delete/{id}")]
        public async Task<IActionResult> Delete(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id,"adverts", ct);
            if (advert == null)
            {
                Response.StatusCode = 404;
                return View("~/Views/Home/404.cshtml");
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
                Response.StatusCode = 404;
                return View("~/Views/Home/404.cshtml");
            }

            advert.Approved = true;
            await _firestore.Update(advert, "advert-requests", ct);
            await _firestore.MoveDocument<Advert>(id, "advert-requests", "adverts", ct);
            return Ok(advert);
        }

        [HttpPost("delete-request/{id}")]
        public async Task<IActionResult> DeleteRequest(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id, "advert-requests", ct);
            if (advert == null)
            {
                Response.StatusCode = 404;
                return View("~/Views/Home/404.cshtml");
            }
            await _firestore.Delete(advert.Id, "advert-requests", CancellationToken.None);
            return Ok(advert);
        }

        [HttpGet("sell-house")]
        public ViewResult ClientHouseSell()
        {
            return View("~/Views/Home/sell-house.cshtml");
        }

        [HttpPost("sell-house")]
        public async Task<IActionResult> ClientHouseSell([FromBody] ClientHouse clientHouse, CancellationToken ct)
        {
            if (ModelState.IsValid)
            {
                if (string.IsNullOrEmpty(clientHouse.Id))
                {
                    clientHouse.Id = Guid.NewGuid().ToString();
                }
                await _firestore.Add<ClientHouse>(clientHouse, "client-requests", ct);
            }
            return Ok(new { success = true, message = "işlem başarılı." });
        }

        [HttpGet("advert-exists")]
            
        private async Task<bool> AdvertExists(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id,"adverts", ct);
            return advert != null;
        }
    }
}