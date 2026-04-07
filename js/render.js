function formatDate(value) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderEmpty(container, message) {
  container.innerHTML = `<div class="empty">${message}</div>`;
}

function noteTags(note) {
  const typeLabel = note.type === "challenge" ? "Thử thách" : "Lời nhắn";
  const typeClass = note.type === "challenge" ? "tag-type-challenge" : "tag-type-note";
  const pinTag = note.pinned ? '<span class="tag tag-pin">Đã ghim</span>' : "";

  return `
    <div class="tag-row">
      <span class="tag ${typeClass}">${typeLabel}</span>
      ${pinTag}
    </div>
  `;
}

function createNoteCard(note, actions = []) {
  const buttons = actions.map((action) => `
    <button
      class="btn ${action.variant}"
      type="button"
      data-action="${action.name}"
      data-id="${note.id}"
    >
      ${action.label}
    </button>
  `).join("");

  return `
    <article class="card">
      <div class="card-top">
        <div>
          <h3>${escapeHtml(note.title)}</h3>
          <div class="meta">Từ ${escapeHtml(note.sender)} gửi ${escapeHtml(note.recipient)} • ${formatDate(note.createdAt)}</div>
        </div>
      </div>
      ${noteTags(note)}
      <p>${escapeHtml(note.content)}</p>
      ${buttons ? `<div class="action-row" style="margin-top: 14px;">${buttons}</div>` : ""}
    </article>
  `;
}

function syncProfileUI(elements, profileName) {
  const name = profileName.trim() || "Linh";
  elements.profileName.value = name;
  elements.senderName.value = name;
  elements.profileBadge.textContent = name.charAt(0).toUpperCase();
  const shareUrl = new URL("./index.html", window.location.href);
  shareUrl.searchParams.set("to", name);
  elements.shareLink.value = shareUrl.toString();
  elements.shareLinkOpen.href = shareUrl.toString();
}

function renderFriendsTab(elements, state) {
  const sentNotes = state.notes.filter((note) => note.sender === state.profileName);

  if (sentNotes.length === 0) {
    renderEmpty(elements.sentList, "Bạn chưa gửi nội dung nào. Tạo một lời nhắn đầu tiên ở form bên trái.");
    return;
  }

  elements.sentList.innerHTML = sentNotes
    .slice(0, 6)
    .map((note) => createNoteCard(note, [
      { name: "delete", label: "Xóa", variant: "btn-ghost" }
    ]))
    .join("");
}

function renderMeTab(elements, state) {
  const inboxNotes = state.notes.filter((note) => (
    note.recipient === state.profileName && note.status !== "accepted"
  ));

  const acceptedNotes = state.notes.filter((note) => (
    note.recipient === state.profileName && note.status === "accepted"
  ));

  if (inboxNotes.length === 0) {
    renderEmpty(elements.inboxList, "Hiện chưa có lời nhắn hoặc thử thách mới gửi cho bạn.");
  } else {
    elements.inboxList.innerHTML = inboxNotes.map((note) => createNoteCard(note, [
      { name: "accept", label: "Chấp nhận", variant: "btn-primary" },
      { name: "delete", label: "Xóa", variant: "btn-ghost" }
    ])).join("");
  }

  if (acceptedNotes.length === 0) {
    renderEmpty(elements.acceptedPreview, "Bạn chưa chấp nhận thử thách nào.");
    return;
  }

  elements.acceptedPreview.innerHTML = acceptedNotes
    .slice(0, 4)
    .map((note) => createNoteCard(note))
    .join("");
}

function renderSummaryTab(elements, state) {
  const acceptedNotes = state.notes.filter((note) => (
    note.recipient === state.profileName && note.status === "accepted"
  ));
  const pinnedNotes = acceptedNotes.filter((note) => note.pinned);

  if (acceptedNotes.length === 0) {
    renderEmpty(elements.acceptedList, "Chưa có thử thách đã chấp nhận để tổng hợp.");
  } else {
    elements.acceptedList.innerHTML = acceptedNotes.map((note) => createNoteCard(note, [
      {
        name: note.pinned ? "unpin" : "pin",
        label: note.pinned ? "Bỏ ghim" : "Ghim",
        variant: "btn-secondary"
      },
      { name: "delete", label: "Xóa", variant: "btn-ghost" }
    ])).join("");
  }

  if (pinnedNotes.length === 0) {
    renderEmpty(elements.pinBoard, "Chưa có ghi chú nào được ghim.");
    return;
  }

  elements.pinBoard.innerHTML = pinnedNotes.map((note) => `
    <article class="sticky-note">
      <div class="sticky-head">
        <div>
          <strong>${escapeHtml(note.title)}</strong>
          <div class="meta">Từ ${escapeHtml(note.sender)}</div>
        </div>
        <button class="btn btn-ghost" type="button" data-action="unpin" data-id="${note.id}">
          Bỏ ghim
        </button>
      </div>
      <p>${escapeHtml(note.content)}</p>
      <div class="meta">${formatDate(note.createdAt)}</div>
    </article>
  `).join("");
}

function renderStats(elements, state) {
  const pending = state.notes.filter((note) => (
    note.recipient === state.profileName && note.status !== "accepted"
  )).length;
  const accepted = state.notes.filter((note) => (
    note.recipient === state.profileName && note.status === "accepted"
  )).length;
  const pinned = state.notes.filter((note) => (
    note.recipient === state.profileName && note.status === "accepted" && note.pinned
  )).length;

  elements.statPending.textContent = String(pending);
  elements.statAccepted.textContent = String(accepted);
  elements.statPinned.textContent = String(pinned);
}

function renderApp(elements, state) {
  syncProfileUI(elements, state.profileName);
  renderStats(elements, state);
  renderFriendsTab(elements, state);
  renderMeTab(elements, state);
  renderSummaryTab(elements, state);
}

export { renderApp };
