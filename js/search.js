// تأكد من أنك تقوم بتحديد الـ input والـ button بشكل صحيح
const searchInput = document.getElementById("searchQuery");
const searchButton = document.getElementById("searchButton");
const searchResults = document.getElementById("searchResults");

searchButton.addEventListener("click", async function (event) {
    event.preventDefault(); // منع إعادة تحميل الصفحة

    const query = searchInput.value.trim();
    if (query === "") return;

    // تجهيز البيانات للإرسال كـ FormData
    const formData = new FormData();
    formData.append("keyword", query);

    try {
        // إرسال الطلب إلى الـ API
        const response = await fetch("https://abdulrahmanantar.com/outbye/items/search.php", {
            method: "POST",
            body: formData,
        });

        // قراءة الاستجابة كنص
        const textResponse = await response.text();
        console.log("API Response:", textResponse); // لفحص الاستجابة

        // إزالة أي محتوى غير صالح بعد الـ JSON
        const jsonResponseText = textResponse.replace(/[^}\]]+\s*$/, ''); // إزالة أي نص بعد الـ JSON

        // محاولة تحليل JSON
        let jsonResponse = null;
        try {
            jsonResponse = JSON.parse(jsonResponseText);
        } catch (jsonError) {
            console.error("خطأ في تحليل JSON:", jsonError);
            searchResults.innerHTML = "<p>حدث خطأ أثناء تحليل البيانات.</p>";
            return;
        }

        // التحقق من نجاح الطلب
        if (jsonResponse.status === "success" && jsonResponse.data.length > 0) {
            displayResults(jsonResponse.data);
        } else {
            searchResults.innerHTML = "<p>لا توجد نتائج مطابقة.</p>";
        }
    } catch (error) {
        console.error("حدث خطأ:", error);
        searchResults.innerHTML = "<p>حدث خطأ أثناء البحث.</p>";
    }
});
