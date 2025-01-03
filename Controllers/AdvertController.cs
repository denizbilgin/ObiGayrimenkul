﻿using Google.Cloud.Firestore;
using Google.Rpc;
using Grpc.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ObiGayrimenkul.Firebase;
using ObiGayrimenkul.Models;
using System.Reflection.Metadata;

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
        [Authorize(Roles ="Admin")]
        [HttpGet("advert-requests")]
        public async Task<IActionResult> GetAdvertRequests(CancellationToken ct)
        {
            return View("~/Views/Home/pending-properties.cshtml");
        }
        [Authorize]
        [HttpGet("client-requests")]
        public async Task<IActionResult> GetClientRequests(CancellationToken ct)
        {
            return View("~/Views/Home/client-requests.cshtml");
        }
        [Authorize]
        [HttpGet("all-advert-requests")]
        public async Task<IActionResult> GetAllAdvertRequests(CancellationToken ct)
        {
            var adverts = await _firestore.GetAll<Advert>("advert-requests",CancellationToken.None);
            return Ok(adverts);
        }
        [Authorize(Roles ="Admin")]
        [HttpGet("pending-adverts")]
        public async Task<IActionResult> GetPendingAdverts(CancellationToken ct)
        {
            return View("~/Views/Home/pending-properties.cshtml");
        }

        [HttpGet("get-request-details/{id}")]
        public async Task<IActionResult> GetRequestDetails(string id ,CancellationToken ct)
        {
            var adverts = await _firestore.Get<Advert>(id ,"advert-requests", CancellationToken.None);
            return Ok(adverts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByID(string id , CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id, "adverts", ct);
            if (advert != null)
            {
                return View("~/Views/Home/property-detail.cshtml");
            }
            else
            {
                try
                {
                    advert = await _firestore.Get<Advert>(id, "advert-requests", ct);
                    return View("~/Views/Home/property-detail.cshtml");
                }
                catch
                {
                    Response.StatusCode = 404;
                    return View("~/Views/Home/404.cshtml");
                }
            }
            
        }

        [HttpGet("requests/{id}")]
        public async Task<IActionResult> GetRequestByID(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id, "advert-requests", ct);
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
            if (advert != null)
            {
                return Ok(advert);
            }
            else
            {
                try
                {
                    advert = await _firestore.Get<Advert>(id, "advert-requests", ct);
                    return Ok(advert);
                }
                catch
                {
                    Response.StatusCode = 404;
                    return View("~/Views/Home/404.cshtml");
                }
            }
            
        }

        [Authorize]
        [HttpGet("create")]
        public IActionResult Create()

        {
            return View("~/Views/Home/submit-property.cshtml");

        }
        [Authorize]
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

                    var utcDateTime = DateTime.UtcNow;
                    var turkeyTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time");
                    var dateTimeInTurkey = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, turkeyTimeZone);
                    advert.PublishDate = dateTimeInTurkey.ToString("dd.MM.yyyy HH:mm:ss");
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
        [Authorize]
        [HttpGet("edit/{id}")]
         public async Task<IActionResult> Edit(string id, CancellationToken ct)
         {
             var advert = await _firestore.Get<Advert>(id,"adverts", ct);

             if (advert != null)
             {
                return View("~/Views/Home/edit-property.cshtml");
             }
            else
            {
                try
                {
                    advert = await _firestore.Get<Advert>(id, "advert-requests", ct);
                    return View("~/Views/Home/edit-property.cshtml");
                }
                catch
                {
                    Response.StatusCode = 404;
                    return View("~/Views/Home/404.cshtml");
                }
            }
             
         }
        [Authorize]
        [HttpPost("edit/{id}")]
        public async Task<IActionResult> Edit(string id,[FromBody]Advert advert , CancellationToken ct)
        {       
            if (ModelState.IsValid)
            {
                var CurrentAdvert = await _firestore.Get<Advert>(id, "adverts", ct);
                if(CurrentAdvert != null)
                {
                    await _firestore.Update(advert, "adverts", ct);
                    advert.Approved = false;
                    await _firestore.MoveDocument<Advert>(id, "adverts", "advert-requests", ct);
                }
                else
                {
                    try
                    {
                        CurrentAdvert = await _firestore.Get<Advert>(id, "advert-requests", ct);
                        await _firestore.Update(advert, "advert-requests", ct);
                    }
                    catch
                    {
                        Response.StatusCode = 404;
                        return View("~/Views/Home/404.cshtml");
                    }
                }   
            }
            return Ok(advert);
        }
        [Authorize]
        [HttpPost("edit-user/{advertId}")]
        public async Task<IActionResult> ChangeAdvertsUser([FromBody] Advert currentAdvert , string advertId , CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(advertId, "adverts", ct);
            if (advert != null)
            {
                advert.UserID = currentAdvert.UserID;
                await _firestore.Update<Advert>(advert, "adverts", ct);
            }
            else
            {
                try
                {
                    advert = await _firestore.Get<Advert>(advertId, "advert-requests", ct);
                    advert.UserID = currentAdvert.UserID;
                    await _firestore.Update<Advert>(advert, "advert-requests", ct);
                }catch(Exception ex)
                {
                    Response.StatusCode = 404;
                    return View("~/Views/Home/404.cshtml");
                }

            }
            
            return Ok(advert);
        }
        [Authorize(Roles ="Admin")]
        [HttpGet("delete/{id}")]
        public async Task<IActionResult> Delete(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id,"adverts", ct);
            if (advert != null)
            {
                return View(advert);
            }
            else
            {
                try
                {
                    advert = await _firestore.Get<Advert>(id, "advert-requests", ct);
                    return View(advert);
                }
                catch
                {
                    Response.StatusCode = 404;
                    return View("~/Views/Home/404.cshtml");
                }
            }         
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("delete/{id}")]
        public async Task<IActionResult> DeleteConfirmed(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id, "adverts", ct);
            if (advert != null)
            {
                await _firestore.Delete(advert.Id, "adverts", CancellationToken.None);
                return RedirectToAction(nameof(Index));
            }
            else
            {
                try
                {
                    advert = await _firestore.Get<Advert>(id, "advert-requests", ct);
                    await _firestore.Delete(advert.Id, "advert-requests", CancellationToken.None);
                    return RedirectToAction(nameof(Index));

                }
                catch
                {
                    Response.StatusCode = 404;
                    return View("~/Views/Home/404.cshtml");
                }
            }
        }


        [Authorize(Roles = "Admin")]
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
        [Authorize]
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
        [Authorize]
        [HttpGet("advert-exists")]
            
        private async Task<bool> AdvertExists(string id, CancellationToken ct)
        {
            var advert = await _firestore.Get<Advert>(id,"adverts", ct);
            return advert != null;
        }
        [Authorize]
        [HttpGet("get-user-adverts/{userId}")]
        public async Task<IActionResult> GetAdvertsByUserID(string userId, CancellationToken ct)
        {
            var adverts = await _firestore.GetAll<Advert>("adverts", CancellationToken.None);
            var advertRequests = await _firestore.GetAll<Advert>("advert-requests", CancellationToken.None);
            var allAdverts = adverts.Concat(advertRequests).ToList();
            var userAdverts = allAdverts.Where(advert => advert.UserID == userId).ToList();

            if (userAdverts == null)
            {
                Response.StatusCode = 404;
                return View("~/Views/Home/404.cshtml");
            }
            return Ok(userAdverts);
        }

        [HttpGet("index-search")]
        public async Task<IActionResult> SearchAdvertsIndex([FromQuery] int? selectedDistrictId,
            [FromQuery] int? selectedQuartertId,
            [FromQuery] bool? selectedStatus,
            [FromQuery] double? minPrice,
            [FromQuery] double? maxPrice,
            [FromQuery] double? minSquaremeter,
            [FromQuery] double? maxSquaremeter,
            [FromQuery] bool? isHasLiftChecked,
            [FromQuery] bool? isHasParkChecked,
            [FromQuery] bool? isIsFurnishedChecked,
            [FromQuery] bool? isIsCloseSchoolChecked,
            [FromQuery] bool? isIsCloseHealthCenterChecked,
            [FromQuery] bool? isIsInSiteChecked,
            [FromQuery] bool? isHasCellarChecked,
    CancellationToken ct)
        {
            try
            {
                var allAdverts = await _firestore.GetAllApproved<Advert>(ct);

                var filteredAdverts = allAdverts.Where(advert =>
                    (!selectedDistrictId.HasValue || advert.AddressDistrictID == selectedDistrictId.Value) &&
                    (!selectedQuartertId.HasValue || advert.AddressQuarterID == selectedQuartertId.Value) &&
                    (!selectedStatus.HasValue || advert.Status == selectedStatus.Value) &&
                    (!minPrice.HasValue || advert.Price >= minPrice.Value) &&
                    (!maxPrice.HasValue || advert.Price <= maxPrice.Value) &&
                    (!minSquaremeter.HasValue || advert.SquareMeterGross >= minSquaremeter.Value) &&
                    (!maxSquaremeter.HasValue || advert.SquareMeterGross <= maxSquaremeter.Value) &&
                    (!isHasLiftChecked.HasValue || advert.HasLift == isHasLiftChecked.Value) &&
                    (!isHasParkChecked.HasValue || advert.HasGarage == isHasParkChecked.Value) &&
                    (!isIsFurnishedChecked.HasValue || advert.IsFurnished == isIsFurnishedChecked.Value) &&
                    (!isIsCloseSchoolChecked.HasValue || advert.IsCloseToSchool == isIsCloseSchoolChecked.Value) &&
                    (!isIsCloseHealthCenterChecked.HasValue || advert.IsCloseToHealthCenter == isIsCloseHealthCenterChecked.Value) &&
                    (!isIsInSiteChecked.HasValue || advert.IsInSite == isIsInSiteChecked.Value) &&
                    (!isHasCellarChecked.HasValue || advert.HaveCellar == isHasCellarChecked.Value)
                ).ToList();

                return Ok(filteredAdverts);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Arama sırasında hata oluştu: {ex.Message}");
                return StatusCode(500, new { message = "Arama sırasında bir hata oluştu.", error = ex.Message });
            }
        }

        [HttpGet("search-adverts")]
        public async Task<IActionResult> SearchAdverts(
            [FromQuery] int? ilce,
            [FromQuery] int? mahalle,
            [FromQuery] bool? status,
            [FromQuery] double? minPrice,
            [FromQuery] double? maxPrice,
            [FromQuery] double? minSquareMeters,
            [FromQuery] double? maxSquareMeters,
            [FromQuery] bool? hasElevator,
            [FromQuery] bool? hasGarage,
            [FromQuery] bool? isFurnished,
            [FromQuery] bool? nearSchool,
            [FromQuery] bool? nearHealthCenter,
            [FromQuery] bool? inSite,
            [FromQuery] bool? hasPantry,
            [FromQuery] bool? hasNaturalgas,
    CancellationToken ct)
        {
            try
            {

                Console.WriteLine($"ilce:{ilce}");
                Console.WriteLine($"mahalle:{mahalle}");
                Console.WriteLine($"status:{status}");
                Console.WriteLine($"minPrice:{minPrice}");
                Console.WriteLine($"maxPrice:{maxPrice}");
                Console.WriteLine($"minSquareMeters:{minSquareMeters}");
                Console.WriteLine($"maxSquareMeters:{maxSquareMeters}");
                Console.WriteLine($"hasElevator:{hasElevator}");
                Console.WriteLine($"hasGarage:{hasGarage}");
                Console.WriteLine($"isFurnished:{isFurnished}");
                Console.WriteLine($"nearSchool:{nearSchool}");
                Console.WriteLine($"nearHealthCenter:{nearHealthCenter}");
                Console.WriteLine($"inSite:{inSite}");
                Console.WriteLine($"hasPantry:{hasPantry}");
                Console.WriteLine($"hasNaturalgas:{hasNaturalgas}");
                Console.WriteLine("====================================");

                var allAdverts = await _firestore.GetAllApproved<Advert>(ct);

                var filteredAdverts = allAdverts.Where(advert =>
                    (!ilce.HasValue || advert.AddressDistrictID == ilce.Value) &&
                    (!mahalle.HasValue || advert.AddressQuarterID == mahalle.Value) &&
                    (!status.HasValue || advert.Status == status.Value) &&
                    (!minPrice.HasValue || advert.Price >= minPrice.Value) &&
                    (!maxPrice.HasValue || advert.Price <= maxPrice.Value) &&
                    (!minSquareMeters.HasValue || advert.SquareMeterGross >= minSquareMeters.Value) &&
                    (!maxSquareMeters.HasValue || advert.SquareMeterGross <= maxSquareMeters.Value) &&
                    (!hasElevator.HasValue || advert.HasLift == hasElevator.Value) &&
                    (!hasGarage.HasValue || advert.HasGarage == hasGarage.Value) &&
                    (!isFurnished.HasValue || advert.IsFurnished == isFurnished.Value) &&
                    (!nearSchool.HasValue || advert.IsCloseToSchool == nearSchool.Value) &&
                    (!nearHealthCenter.HasValue || advert.IsCloseToHealthCenter == nearHealthCenter.Value) &&
                    (!inSite.HasValue || advert.IsInSite == inSite.Value) &&
                    (!hasPantry.HasValue || advert.HaveCellar == hasPantry.Value) &&
                    (!hasNaturalgas.HasValue || (hasNaturalgas.Value && (advert.Heating == 1 || advert.Heating == 2)))
                ).ToList();

                return Ok(filteredAdverts);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Arama sırasında hata oluştu: {ex.Message}");
                return StatusCode(500, new { message = "Arama sırasında bir hata oluştu.", error = ex.Message });
            }
        }

    }
}