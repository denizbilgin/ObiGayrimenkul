using Google.Cloud.Firestore;
using ObiGayrimenkul.Firebase;

namespace ObiGayrimenkul.Models
{
    [FirestoreData]

    public class Neighborhood : IFirebaseEntity
    {
        [FirestoreDocumentId]
        public string Id { get; set; }

        [FirestoreProperty("sehir_ilce_mahalle_adi")]
        public string Name { get; set; }

        [FirestoreProperty("ust_id")]
        public string ParentId { get; set; }

    }

}
