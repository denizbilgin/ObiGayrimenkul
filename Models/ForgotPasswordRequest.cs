namespace ObiGayrimenkul.Models
{
    public class ForgotPasswordRequest
    {
        public string Email { get; set; }
        public int AuthDocNumber { get; set; }
        public string NewPassword { get; set; }
        public string NewPasswordRepeated { get; set; }
    }

}
