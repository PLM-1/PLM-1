const adminEmail = "plm159357258456a@gmail.com";
let isAdmin = false;

// EmailJS Initialization
emailjs.init("YOUR_USER_ID"); // ضع User ID من حسابك EmailJS
const serviceID = "YOUR_SERVICE_ID"; // ضع Service ID
const templateID = "YOUR_TEMPLATE_ID"; // ضع Template ID

let orders = JSON.parse(localStorage.getItem("orders")) || [];
let sections = JSON.parse(localStorage.getItem("sections")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [];

const translations = {
  ar: {...}, // استخدم نفس الترجمة من الكود السابق
  en: {...},
  fr: {...}
};

function changeLanguage() { /* نفس الكود السابق لتغيير اللغة */ }

function login() { /* نفس الكود السابق لتسجيل الدخول */ }

// إدارة الأقسام والمنتجات كما في النسخة السابقة
function addSection() { /* نفس الكود */ }
function renderSections() { /* نفس الكود */ }
function deleteSection(idx) { /* نفس الكود */ }
function updateSectionOptions() { /* نفس الكود */ }

function addProduct() { /* نفس الكود */ }
function renderProducts() { /* نفس الكود */ }
function deleteProduct(idx) { /* نفس الكود */ }
function displayProductsToCustomer() { /* نفس الكود */ }

// إدارة الطلبات
document.getElementById("order-form").addEventListener("submit", function(e){
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("user-email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const captcha = document.getElementById("captcha").checked;
  if(!captcha){ alert("تأكد أنك لست روبوت!"); return; }

  const order = {name,email,phone,address,date:new Date().toLocaleString()};
  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));
  renderOrders();

  // إرسال الطلب مباشرة للبريد عبر EmailJS
  emailjs.send(serviceID, templateID, order)
    .then(()=>{ document.getElementById("status").textContent="تم إرسال الطلب بنجاح!"; document.getElementById("order-form").reset(); },
          err=>{ document.getElementById("status").textContent="حدث خطأ في إرسال الطلب."; console.error(err); });
});

function renderOrders() { /* نفس الكود السابق */ }
function deleteOrder(idx) { /* نفس الكود */ }

// Initialize
changeLanguage();
renderProducts();
renderSections();
renderOrders();