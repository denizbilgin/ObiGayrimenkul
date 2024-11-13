using Google.Cloud.Firestore;
using ObiGayrimenkul.Firebase;
using System.Transactions;

namespace ObiGayrimenkul.Models
{
    [FirestoreData]
    public class ClientHouse : IFirebaseEntity
    {
        [FirestoreDocumentId]
        public String Id { get; set; }

        [FirestoreProperty("name")]
        public String Name { get; set; }

        [FirestoreProperty("phone_number")]
        public String PhoneNumber { get; set; }

        [FirestoreProperty("price")]
        public double Price { get; set; }

        [FirestoreProperty("building_age")]
        public int BuildingAge { get; set; }

        [FirestoreProperty("dues")]
        public double Dues { get; set; }

        [FirestoreProperty("heating")]
        public String Heating { get; set; }

        [FirestoreProperty("which_floor")]
        public int WhichFloor { get; set; }

        [FirestoreProperty("number_of_rooms")]
        public String NumberOfRooms { get; set; }

        [FirestoreProperty("square_meter")]
        public int SquareMeter { get; set; }

        [FirestoreProperty("is_furnished")]
        public String IsFurnished { get; set; }

        [FirestoreProperty("status")]
        public String Status { get; set; }

        [FirestoreProperty("district_id")]
        public int DistrictId { get; set; }

        [FirestoreProperty("quarter_id")]
        public int QuarterId { get; set; }

        [FirestoreProperty("other_informations")]
        public string OtherInformations { get; set; }
    }
}
