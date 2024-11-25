document.addEventListener("DOMContentLoaded", async function () {
    const submitButton = document.querySelector(".btn-finish");
    submitButton.addEventListener("click", async function () {
        const email = document.getElementById("forgot-my-password-mail").value.trim();
        const authDocNumber = parseInt(document.getElementById("forgot-my-password-authdoc").value.trim());
        const newPassword = document.getElementById("forgot-my-password-password").value.trim();
        const newPasswordRepeated = document.getElementById("forgot-my-password-password-repeat").value.trim();
        if (!email || isNaN(authDocNumber) || !newPassword || !newPasswordRepeated) {
            alert("Lütfen tüm alanları doldurun.");
            return;
        }

        if (newPassword !== newPasswordRepeated) {
            alert("Şifreler uyuşmuyor. Lütfen tekrar deneyin.");
            return;
        }
        try {
            const response = await fetch("/users/forgot-my-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    authDocNumber: authDocNumber,
                    newPassword: newPassword,
                    newPasswordRepeated: newPasswordRepeated
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message || "Şifre başarıyla sıfırlandı!");
            } else {
                const error = await response.json();
                alert(error.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
            }
        } catch (error) {
            console.error("Şifre sıfırlama sırasında bir hata oluştu:", error);
            alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        }
    });
});
