import {
  deleteNote,
  loadState,
  seedDemoData,
  updateNote,
  updateProfileName,
  upsertNote
} from "./firebase.js";
import { renderApp } from "./render.js";

async function getProfileName(elements) {
  const rawName = elements.profileName.value.trim();
  if (rawName) {
    return rawName;
  }

  const state = await loadState();
  return state.profileName;
}

function activateTab(elements, targetId) {
  elements.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tabTarget === targetId);
  });

  elements.tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });
}

async function refreshApp(elements) {
  const state = await loadState();
  renderApp(elements, state);
}

async function handleFormSubmit(elements, event) {
  event.preventDefault();

  const sender = elements.senderName.value.trim() || await getProfileName(elements);
  const recipient = elements.recipientName.value.trim();
  const title = elements.messageTitle.value.trim();
  const content = elements.messageContent.value.trim();

  if (!recipient || !title || !content) {
    window.alert("Vui lòng nhập người nhận, tiêu đề và nội dung.");
    return;
  }

  await upsertNote({
    sender,
    recipient,
    title,
    content,
    type: elements.messageType.value
  });

  elements.noteForm.reset();
  elements.senderName.value = await getProfileName(elements);
  await refreshApp(elements);
  activateTab(elements, "friends-tab");
}

async function handleActionClick(elements, event) {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) {
    return;
  }

  const noteId = trigger.dataset.id;
  const action = trigger.dataset.action;
  if (!noteId || !action) {
    return;
  }

  if (action === "accept") {
    await updateNote(noteId, { status: "accepted", pinned: true });
  }

  if (action === "delete") {
    await deleteNote(noteId);
  }

  if (action === "pin") {
    await updateNote(noteId, { pinned: true });
  }

  if (action === "unpin") {
    await updateNote(noteId, { pinned: false });
  }

  await refreshApp(elements);
}

async function handleSaveProfile(elements) {
  const nextName = elements.profileName.value.trim();

  if (!nextName) {
    window.alert("Tên hồ sơ không được để trống.");
    return;
  }

  updateProfileName(nextName);
  await refreshApp(elements);
}

async function handleSeedDemo(elements) {
  await seedDemoData(await getProfileName(elements));
  await refreshApp(elements);
  activateTab(elements, "me-tab");
}

function bindEvents(elements) {
  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", () => activateTab(elements, button.dataset.tabTarget));
  });

  elements.noteForm.addEventListener("submit", async (event) => {
    try {
      await handleFormSubmit(elements, event);
    } catch (error) {
      console.error("Failed to create note", error);
      window.alert("Không thể gửi dữ liệu lên Firebase. Hãy kiểm tra cấu hình Firestore.");
    }
  });

  elements.saveProfile.addEventListener("click", async () => {
    try {
      await handleSaveProfile(elements);
    } catch (error) {
      console.error("Failed to save profile", error);
      window.alert("Không thể tải dữ liệu hồ sơ lúc này.");
    }
  });

  elements.seedDemo.addEventListener("click", async () => {
    try {
      await handleSeedDemo(elements);
    } catch (error) {
      console.error("Failed to seed demo data", error);
      window.alert("Không thể nạp dữ liệu mẫu lên Firebase.");
    }
  });

  elements.refreshInbox.addEventListener("click", async () => {
    try {
      await refreshApp(elements);
    } catch (error) {
      console.error("Failed to refresh app", error);
      window.alert("Không thể tải danh sách từ Firebase.");
    }
  });

  document.body.addEventListener("click", async (event) => {
    try {
      await handleActionClick(elements, event);
    } catch (error) {
      console.error("Failed to handle action", error);
      window.alert("Không thể cập nhật ghi chú trên Firebase.");
    }
  });
}

async function initializeApp(elements) {
  bindEvents(elements);
  await refreshApp(elements);
}

export { initializeApp };
