import { initializeApp } from "./app.js";
import { elements } from "./elements.js";

initializeApp(elements).catch((error) => {
  console.error("Failed to initialize app", error);
  window.alert("Không thể kết nối Firebase. Hãy kiểm tra cấu hình và quyền truy cập Firestore.");
});
