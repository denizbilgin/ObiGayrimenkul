document.addEventListener("DOMContentLoaded", function () {
    const updateButton = document.querySelector("input[name='update']");

    updateButton.addEventListener("click", async function () {
        const newPassword = document.getElementById("change-password").value;
        const confirmPassword = document.getElementById("change-password-repeat").value;

        if (newPassword === confirmPassword) {
            const userId = localStorage.getItem("userId");

            if (!userId) {
                alert("Kullanýcý ID'si bulunamadý.");
                return;
            }
            try {
                const response = await fetch(`/users/change-user-password?userId=${userId}&newPassword=${newPassword}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: userId,
                        password: newPassword
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    alert("Þifre baþarýyla güncellendi.");
                } else {
                    alert("Þifre güncelleme sýrasýnda bir hata oluþtu.");
                }
            } catch (error) {
                console.error("Þifre güncellenirken hata oluþtu:", error);
                alert("Þifre güncelleme sýrasýnda bir hata oluþtu.");
            }
        } else {
            alert("Girdiðiniz þifreler eþleþmiyor!");
        }
    });
});