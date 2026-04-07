const elements = {
  tabButtons: document.querySelectorAll("[data-tab-target]"),
  tabPanels: document.querySelectorAll(".tab-panel"),
  profileName: document.getElementById("profile-name"),
  profileBadge: document.getElementById("profile-badge"),
  shareLink: document.getElementById("share-link"),
  shareLinkOpen: document.getElementById("share-link-open"),
  saveProfile: document.getElementById("save-profile"),
  seedDemo: document.getElementById("seed-demo"),
  noteForm: document.getElementById("note-form"),
  senderName: document.getElementById("sender-name"),
  recipientName: document.getElementById("recipient-name"),
  messageType: document.getElementById("message-type"),
  messageTitle: document.getElementById("message-title"),
  messageContent: document.getElementById("message-content"),
  sentList: document.getElementById("sent-list"),
  inboxList: document.getElementById("inbox-list"),
  acceptedPreview: document.getElementById("accepted-preview"),
  acceptedList: document.getElementById("accepted-list"),
  pinBoard: document.getElementById("pin-board"),
  refreshInbox: document.getElementById("refresh-inbox"),
  statPending: document.getElementById("stat-pending"),
  statAccepted: document.getElementById("stat-accepted"),
  statPinned: document.getElementById("stat-pinned")
};

export { elements };
