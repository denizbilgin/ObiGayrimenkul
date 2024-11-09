using Google.Cloud.Firestore;
using ObiGayrimenkul.Firebase;

namespace ObiGayrimenkul.Models
{
    [FirestoreData]
    public class User : IFirebaseEntity
    {
        [FirestoreDocumentId]
        public string Id { get; set; }

        [FirestoreProperty("auth_doc_number")]
        public int AuthDocNumber { get; set; }

        [FirestoreProperty("email")]
        public string Email { get; set; }

        [FirestoreProperty("description")]
        public string Description { get; set; }

        [FirestoreProperty("facebook_link")]
        public string FacebookLink { get; set; }

        [FirestoreProperty("instagram_link")]
        public string InstagramLink { get; set; }

        [FirestoreProperty("role")]
        public string Role{ get; set; }

        [FirestoreProperty("mid_name")]
        public string MidName { get; set; }

        [FirestoreProperty("name")]
        public string Name { get; set; }

        [FirestoreProperty("password")]
        public string Password { get; set; }

        [FirestoreProperty("phone_number")]
        public string PhoneNumber { get; set; }

        [FirestoreProperty("surname")]
        public string Surname { get; set; }
    }

}
