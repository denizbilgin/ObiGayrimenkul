using Google.Cloud.Firestore;
using ObiGayrimenkul.Firebase;

[FirestoreData]
public class Advert : IFirebaseEntity
{
    [FirestoreDocumentId]
    public string Id { get; set; }

    [FirestoreProperty("title")]
    public string AdvertTitle { get; set; }

    [FirestoreProperty("approved")]
    public bool Approved { get; set; }

    [FirestoreProperty("price")]
    public double Price { get; set; }

    [FirestoreProperty("publish_date")]
    public Timestamp PublishDate { get; set; }

    [FirestoreProperty("description")]
    public string Description { get; set; }

    [FirestoreProperty("address_text")]
    public string Address { get; set; }

    [FirestoreProperty("square_meter_gross")]
    public int SquareMeterGross { get; set; }

    [FirestoreProperty("square_meter_net")]
    public int SquareMeterNet { get; set; }

    [FirestoreProperty("room_number")]
    public string RoomNumber { get; set; }

    [FirestoreProperty("building_age")]
    public int BuildingAge { get; set; }

    [FirestoreProperty("number_of_bathrooms")]
    public int NumberOfBathrooms { get; set; }

    [FirestoreProperty("number_of_floors")]
    public int NumberOfFloors { get; set; }

    [FirestoreProperty("parking")]
    public bool HasGarage { get; set; }

    [FirestoreProperty("is_furnished")]
    public bool IsFurnished { get; set; }

    [FirestoreProperty("has_lift")]
    public bool HasLift { get; set; }

    [FirestoreProperty("have_cellar")]
    public bool HaveCellar { get; set; }

    [FirestoreProperty("is_close_health_center")]
    public bool IsCloseToHealthCenter { get; set; }

    [FirestoreProperty("is_close_school")]
    public bool IsCloseToSchool { get; set; }

    [FirestoreProperty("is_in_site")]
    public bool IsInSite { get; set; }

    [FirestoreProperty("heating")]
    public int Heating { get; set; }

    [FirestoreProperty("dues")]
    public double Dues { get; set; }

    [FirestoreProperty("address_district_id")]
    public int AddressDistrictID { get; set; }

    [FirestoreProperty("address_quarter_id")]
    public int AddressQuarterID { get; set; }

    [FirestoreProperty("side")]
    public int Side { get; set; }

    [FirestoreProperty("which_floor")]
    public int WhichFloor { get; set; }

    [FirestoreProperty("videos")]
    public string[] Videos { get; set; }

    [FirestoreProperty("images")]
    public string[] AdvertImages { get; set; }

    [FirestoreProperty("balcony_count")]
    public int BalconyCount { get; set; }

    [FirestoreProperty("document_path")]
    public string DocumentPath { get; set; }

    [FirestoreProperty("status")]
    public int Status { get; set; }

    [FirestoreProperty("user_id")]
    public int UserID { get; set; }

    [FirestoreProperty("building_floor_number")]
    public int BuildingFloors {  get; set; }
}
