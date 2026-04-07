import { upsertNote } from "./firebase.js";

const elements = {
  noteGrid: document.getElementById("friend-note-grid"),
  noteTemplate: document.getElementById("friend-note-template"),
  addNoteButton: document.getElementById("friend-add-note"),
  popupBackdrop: document.getElementById("friend-popup-backdrop"),
  popupTitle: document.getElementById("friend-popup-title"),
  popupText: document.getElementById("friend-popup-text"),
  popupClose: document.getElementById("friend-popup-close"),
  popupAction: document.getElementById("friend-popup-action"),
  adminImage: document.getElementById("friend-admin-image")
};
let popupTimer = null;

function showPopup(title, message) {
  elements.popupTitle.textContent = title;
  elements.popupText.textContent = message;
  elements.popupBackdrop.hidden = false;
  window.clearTimeout(popupTimer);
  popupTimer = window.setTimeout(() => {
    hideThankYou();
  }, 3000);
}

function getPresetRecipient() {
  const params = new URLSearchParams(window.location.search);
  return params.get("to")?.trim() || "";
}

function getAdminImageFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("img")?.trim() || "";
}

function showThankYou(sender, recipient, type) {
  const messageLabel = type === "challenge" ? "thử thách" : "lời nhắn";
  showPopup("Cảm ơn bạn", `${messageLabel} của ${sender} đã được gửi tới ${recipient}.`);
}

function hideThankYou() {
  elements.popupBackdrop.hidden = true;
  window.clearTimeout(popupTimer);
}

function applyPresetToSheet(sheet) {
  const recipientInput = sheet.querySelector(".friend-input-recipient");
  const presetRecipient = getPresetRecipient();
  if (recipientInput && presetRecipient) {
    recipientInput.value = presetRecipient;
  }
}

function initializePresetValues() {
  const adminImage = getAdminImageFromQuery();
  if (adminImage) {
    elements.adminImage.src = adminImage;
  }

  elements.noteGrid.querySelectorAll(".friend-note-sheet").forEach(applyPresetToSheet);
}

function getSheetType(sheet) {
  const selectedType = sheet.querySelector(".friend-input-type")?.value;
  if (selectedType) {
    return selectedType;
  }

  return sheet.dataset.sheetType === "challenge" ? "challenge" : "note";
}

function updateDynamicSheetStyle(sheet) {
  const selectedType = getSheetType(sheet);
  if (!sheet.classList.contains("friend-note-sheet-extra")) {
    return;
  }

  sheet.classList.toggle("friend-note-sheet-message", selectedType === "note");
  sheet.classList.toggle("friend-note-sheet-challenge", selectedType === "challenge");
}

async function handleSheetSubmit(sheet, event) {
  event.preventDefault();

  const sender = sheet.querySelector(".friend-input-sender")?.value.trim() || "Ẩn danh";
  const recipient = sheet.querySelector(".friend-input-recipient")?.value.trim() || "";
  const title = sheet.querySelector(".friend-input-title")?.value.trim() || "";
  const content = sheet.querySelector(".friend-input-content")?.value.trim() || "";
  const type = getSheetType(sheet);

  if (!recipient || !title || !content) {
    window.alert("Vui lòng nhập người nhận, tiêu đề và nội dung.");
    return;
  }

  await upsertNote({
    sender,
    recipient,
    title,
    content,
    type
  });

  showThankYou(sender, recipient, type);
  sheet.reset();
  applyPresetToSheet(sheet);
  updateDynamicSheetStyle(sheet);
  sheet.querySelector(".friend-input-sender")?.focus();
}

function bindSheetEvents(sheet) {
  const typeInput = sheet.querySelector(".friend-input-type");
  if (typeInput) {
    typeInput.addEventListener("change", () => updateDynamicSheetStyle(sheet));
  }

  sheet.addEventListener("submit", async (event) => {
    try {
      await handleSheetSubmit(sheet, event);
    } catch (error) {
      console.error("Failed to submit note", error);
      window.alert("Không thể gửi lúc này. Hãy kiểm tra kết nối Firebase rồi thử lại.");
    }
  });
}

function createExtraSheet() {
  const fragment = elements.noteTemplate.content.cloneNode(true);
  const sheet = fragment.querySelector(".friend-note-sheet");
  applyPresetToSheet(sheet);
  updateDynamicSheetStyle(sheet);
  bindSheetEvents(sheet);
  elements.noteGrid.appendChild(fragment);
  showPopup("Đã thêm ghi chú mới", "Một tờ note mới đã được tạo. Bạn có thể viết tiếp trên đó.");
  sheet.querySelector(".friend-input-sender")?.focus();
}

function bindPopupEvents() {
  elements.popupClose.addEventListener("click", hideThankYou);
  elements.popupAction.addEventListener("click", hideThankYou);
  elements.popupBackdrop.addEventListener("click", (event) => {
    if (event.target === elements.popupBackdrop) {
      hideThankYou();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.popupBackdrop.hidden) {
      hideThankYou();
    }
  });
}

function initializeFriendForm() {
  initializePresetValues();
  bindPopupEvents();

  elements.noteGrid.querySelectorAll(".friend-note-sheet").forEach((sheet) => {
    bindSheetEvents(sheet);
  });

  elements.addNoteButton.addEventListener("click", createExtraSheet);

  elements.noteGrid.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".friend-remove-note");
    if (!removeButton) {
      return;
    }

    const sheet = removeButton.closest(".friend-note-sheet");
    sheet?.remove();
  });
}

initializeFriendForm();
