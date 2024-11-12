document.addEventListener("DOMContentLoaded", function () {
    const updateButton = document.querySelector("input[name='update']");

    updateButton.addEventListener("click", async function () {
        const newPassword = document.getElementById("change-password").value;
        const confirmPassword = document.getElementById("change-password-repeat").value;

        if (newPassword === confirmPassword) {
            const userId = localStorage.getItem("userId");

            if (!userId) {
                alert("Kullan�c� ID'si bulunamad�.");
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
                    alert("�ifre ba�ar�yla g�ncellendi.");
                } else {
                    alert("�ifre g�ncelleme s�ras�nda bir hata olu�tu.");
                }
            } catch (error) {
                console.error("�ifre g�ncellenirken hata olu�tu:", error);
                alert("�ifre g�ncelleme s�ras�nda bir hata olu�tu.");
            }
        } else {
            alert("Girdi�iniz �ifreler e�le�miyor!");
        }
    });
});