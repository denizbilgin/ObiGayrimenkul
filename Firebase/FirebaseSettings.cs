using System.Text.Json.Serialization;

namespace ObiGayrimenkul.Firebase
{
    public class FirebaseSettings
    {
        [JsonPropertyName("project_id")]
        public static string ProjectId => "obidatabase-3e651";

        [JsonPropertyName("api_key")]
        public string ApiKey => "AIzaSyCyAaYIkN3pDw7L-5BoYclpbNtwPnhbNnU";

        [JsonPropertyName("database_url")]
        public string DatabaseURl => "https://obidatabase-3e651-default-rtdb.europe-west1.firebasedatabase.app";
    }

}
