// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // جلب معرف المحتوى من الرابط
    const contentId = new URLSearchParams(window.location.search).get('id');
    if (contentId) {
        // عرض رسالة تحميل
        displayLoading();

        // جلب تفاصيل المحتوى من قاعدة البيانات
        getContentDetails(contentId);
    } else {
        alert('معرف المحتوى غير موجود في الرابط.');
    }
});

// جلب تفاصيل المحتوى من قاعدة البيانات
function getContentDetails(contentId) {
    // فتح قاعدة البيانات
    const request = indexedDB.open('ContentDatabase', 2); // تم تغيير الإصدار إلى 2

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('content')) {
            db.createObjectStore('content', { keyPath: 'id' });
        }
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction('content', 'readonly');
        const store = transaction.objectStore('content');
        const getRequest = store.get(Number(contentId)); // البحث باستخدام المعرف

        getRequest.onsuccess = (event) => {
            const content = event.target.result;
            if (content) {
                // عرض تفاصيل المحتوى
                displayContentDetails(content);
            } else {
                // إخفاء رسالة التحميل وعرض خطأ
                hideLoading();
                document.getElementById('detailsTitle').textContent = "المحتوى غير موجود.";
            }
        };

        getRequest.onerror = (event) => {
            // إخفاء رسالة التحميل وعرض خطأ
            hideLoading();
            console.error('حدث خطأ أثناء جلب البيانات:', event.target.error);
            alert('حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.');
        };
    };

    request.onerror = (event) => {
        // إخفاء رسالة التحميل وعرض خطأ
        hideLoading();
        console.error('حدث خطأ أثناء فتح قاعدة البيانات:', event.target.error);
        alert('حدث خطأ أثناء فتح قاعدة البيانات. يرجى المحاولة مرة أخرى.');
    };
}

// عرض تفاصيل المحتوى في الصفحة
function displayContentDetails(content) {
    // البانر الأفقي
    const bannerImage = document.querySelector('.banner-image');
    bannerImage.src = content.posterLandscapeUrl;

    // البوستر العمودي
    const posterImage = document.querySelector('.poster-image');
    posterImage.src = content.posterPortraitUrl;

    // العنوان
    document.getElementById('detailsTitle').textContent = content.title;

    // الوصف
    document.getElementById('detailsDescription').textContent = content.description;

    // سنة الإنتاج
    document.getElementById('detailsYear').textContent = `سنة الإنتاج: ${content.year}`;

    // التصنيفات
    document.getElementById('detailsCategories').textContent = `التصنيفات: ${content.categories.join(', ')}`;

    // التقييم
    document.getElementById('detailsRating').innerHTML = `${'★'.repeat(content.rating)}${'☆'.repeat(5 - content.rating)}`;

    // زر المشاهدة
    document.getElementById('watchBtn').onclick = () => {
        if (content.contentUrl) {
            // إظهار مشغل الفيديو
            const videoPlayerSection = document.getElementById('videoPlayerSection');
            videoPlayerSection.style.display = 'block';

            // تعيين رابط الفيديو
            const video = document.getElementById('my-video');
            video.querySelector('source').src = content.contentUrl;
            video.load();

            // تهيئة Plyr
            const player = new Plyr(video, {
                controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'fullscreen'],
                seekTime: 10, // التقديم/التأخير 10 ثواني
            });

            // تشغيل الفيديو تلقائيًا
            player.play();

            // التحكم في التقديم/التأخير
            document.getElementById('skipForward').addEventListener('click', () => {
                player.forward(10); // تقديم 10 ثواني
            });

            document.getElementById('skipBack').addEventListener('click', () => {
                player.rewind(10); // تأخير 10 ثواني
            });

            // التحكم في التشغيل/الإيقاف
            document.getElementById('playPause').addEventListener('click', () => {
                if (player.paused) {
                    player.play();
                } else {
                    player.pause();
                }
            });
        } else {
            alert('رابط المشاهدة غير متوفر.');
        }
    };

    // زر التريلر
    document.getElementById('trailerBtn').onclick = () => {
        if (content.trailerUrl) {
            window.open(content.trailerUrl, '_blank'); // فتح رابط التريلر في نافذة جديدة
        } else {
            alert('رابط التريلر غير متوفر.');
        }
    };

    // إخفاء رسالة التحميل بعد عرض البيانات
    hideLoading();
}

// عرض رسالة تحميل
function displayLoading() {
    document.getElementById('detailsTitle').textContent = "جاري التحميل...";
    document.getElementById('detailsDescription').textContent = "";
    document.getElementById('detailsYear').textContent = "";
    document.getElementById('detailsCategories').textContent = "";
    document.getElementById('detailsRating').textContent = "";
}

// إخفاء رسالة تحميل
function hideLoading() {
    // يمكنك إضافة أي عناصر إضافية تحتاج إلى إخفائها هنا
}