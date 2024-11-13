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
        public String Name { get; set; }
        public String PhoneNumber { get; set; }
        public double Price { get; set; }
        public int BuildingAge { get; set; }
        public double Dues { get; set; }
        public int HeatingType { get; set; }
        public int WhichFloor { get; set; }
        public String NumberOfRooms { get; set; }
        public int SquareMeter { get; set; }
        public int NumberOfBalcony { get; set; }
        public String IsFurnished { get; set; }
        public String Status { get; set; }
        public int DistrictId { get; set; }
        public int QuarterId { get; set; }
        public string OtherInformations { get; set; }
    }
}
