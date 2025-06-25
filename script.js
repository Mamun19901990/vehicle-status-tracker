// قم بتغيير هذه القيم إلى مفاتيح Supabase الخاصة بك
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // مثال: https://xyzcompany.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // مثال: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('plateNumberInput');
    const searchButton = document.getElementById('searchButton');
    const resultsSection = document.getElementById('resultsSection');

    searchButton.addEventListener('click', searchVehicle);

    // تمكين البحث بالضغط على Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchVehicle();
        }
    });

    async function searchVehicle() {
        const plateNumber = searchInput.value.trim();

        if (!plateNumber) {
            resultsSection.innerHTML = '<p class="placeholder-text">الرجاء إدخال رقم اللوحة للبحث.</p>';
            return;
        }

        resultsSection.innerHTML = '<p class="placeholder-text">جاري البحث...</p>';

        const { data, error } = await _supabase
            .from('vehicles')
            .select('plate_number, gas_status, notes, is_verified')
            .eq('plate_number', plateNumber.toUpperCase()) // تحويل للإحرف الكبيرة للمطابقة
            .single(); // نتوقع نتيجة واحدة فقط لرقم لوحة فريد

        if (error && error.code !== 'PGRST116') { // PGRST116 يعني عدم العثور على نتائج
            console.error('Error fetching data:', error);
            resultsSection.innerHTML = `<p class="status-negative">حدث خطأ أثناء البحث. الرجاء المحاولة مرة أخرى لاحقاً.</p>`;
            return;
        }

        if (data) {
            const gasStatusText = data.gas_status ?
                `<span class="status-positive">يعمل بالغاز</span>` :
                `<span class="status-negative">لا يعمل بالغاز</span>`;
            const notesText = data.notes ? `<p class="notes">الملاحظات: ${data.notes}</p>` : '';
            const verifiedText = data.is_verified ?
                `<p class="verified">تم التحقق من البيانات 🟢</p>` :
                `<p class="not-verified">البيانات غير متحققة 🟡</p>`;

            resultsSection.innerHTML = `
                <p>رقم اللوحة: <strong>${data.plate_number}</strong></p>
                <p>حالة الغاز: ${gasStatusText}</p>
                ${notesText}
                ${verifiedText}
            `;
        } else {
            resultsSection.innerHTML = `<p class="placeholder-text">لا توجد بيانات لهذه اللوحة.</p>`;
        }
    }
});
