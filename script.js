const adminCredentials = {
  hr: "admin123",
  ceo: "admin123",
  sectionhead: "admin123",
  saleshead: "admin123",
  accountshead: "admin123"
};
let loggedInAdmin = null;
let notificationPanelOpen = false;

// Helper to format date as dd-mm-yyyy
function formatDateDMY(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return '';
  const parts = yyyy_mm_dd.split("-");
  if (parts.length !== 3) return yyyy_mm_dd;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function toggleVehicleFields(value) {
  document.getElementById("vehicleFields").classList.toggle("hidden", value !== "Yes");
}

function submitForm() {
  const formData = {
    domain: document.getElementById("domain").value,
    name: document.getElementById("name").value,
    // Store raw date, format on display
    date: document.getElementById("date").value,
    outTime: document.getElementById("outTime").value + " " + document.getElementById("outAmPm").value,
    inTime: document.getElementById("inTime").value + " " + document.getElementById("inAmPm").value,
    reason: document.getElementById("reason").value,
    vehicleUsed: document.getElementById("vehicleUsed").value,
    vehicleNo: document.getElementById("vehicleNo").value,
    readingOut: document.getElementById("readingOut").value,
    readingIn: document.getElementById("readingIn").value,
    authority: document.getElementById("authority").value,
    approved: false,
    rejected: false // Add rejected flag
  };

  if (!formData.domain || !formData.name || !formData.date || !formData.reason || !formData.authority) {
    alert("Please fill all mandatory fields.");
    return;
  }

  const existing = JSON.parse(localStorage.getItem("records") || "[]");
  existing.push(formData);
  localStorage.setItem("records", JSON.stringify(existing));
  alert("Outpass request submitted successfully!");
  clearForm();
  renderHomeTable();
  renderNotificationBellAndPanel();
}

function clearForm() {
  document.querySelectorAll("input, textarea, select").forEach(el => el.value = "");
  document.getElementById("vehicleFields").classList.add("hidden");
}

function renderTable() {
  const records = JSON.parse(localStorage.getItem("records") || "[]");
  const tbody = document.getElementById("dataTable").getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";

  records.forEach((rec, i) => {
    if (loggedInAdmin !== "hr" && loggedInAdmin !== rec.authority) return;
    if (rec.rejected) {
      // Show as rejected, no approve/reject buttons
      const row = tbody.insertRow();
      row.innerHTML =
        `<td>${rec.domain}</td>
        <td>${rec.name}</td>
        <td>${formatDateDMY(rec.date)}</td>
        <td>${rec.outTime}</td>
        <td>${rec.inTime}</td>
        <td>${rec.reason}</td>
        <td>${rec.vehicleUsed}</td>
        <td>${rec.vehicleNo}</td>
        <td>${rec.readingOut}</td>
        <td>${rec.readingIn}</td>
        <td>${rec.authority}</td>
        <td>❌ Rejected</td>`;
    } else {
      const row = tbody.insertRow();
      row.innerHTML =
        `<td>${rec.domain}</td>
        <td>${rec.name}</td>
        <td>${formatDateDMY(rec.date)}</td>
        <td>${rec.outTime}</td>
        <td>${rec.inTime}</td>
        <td>${rec.reason}</td>
        <td>${rec.vehicleUsed}</td>
        <td>${rec.vehicleNo}</td>
        <td>${rec.readingOut}</td>
        <td>${rec.readingIn}</td>
        <td>${rec.authority}</td>
        <td>${rec.approved ? '✅ Approved' : 
          `<button class="approve-button" onclick="approveRecord(${i})">Approve</button>
          <button class="reject-button" onclick="rejectRecord(${i})">Reject</button>`}
        </td>`;
    }
  });
}

function renderHomeTable() {
  const records = JSON.parse(localStorage.getItem("records") || "[]");
  const tbody = document.getElementById("homeDataTable").getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";

  records.forEach((rec) => {
    let status;
    if (rec.rejected) status = '❌ Rejected';
    else if (rec.approved) status = '✅ Approved';
    else status = '⏳ Pending';
    const row = tbody.insertRow();
    row.innerHTML =
      `<td>${rec.domain}</td>
      <td>${rec.name}</td>
      <td>${formatDateDMY(rec.date)}</td>
      <td>${rec.outTime}</td>
      <td>${rec.inTime}</td>
      <td>${rec.reason}</td>
      <td>${rec.vehicleUsed}</td>
      <td>${rec.vehicleNo}</td>
      <td>${rec.readingOut}</td>
      <td>${rec.readingIn}</td>
      <td>${rec.authority}</td>
      <td>${status}</td>`;
  });
  filterHomeTable();
}

function approveRecord(index) {
  const records = JSON.parse(localStorage.getItem("records") || "[]");
  records[index].approved = true;
  records[index].rejected = false;
  localStorage.setItem("records", JSON.stringify(records));
  renderTable();
  renderHomeTable();
  renderNotificationBellAndPanel();
}

function rejectRecord(index) {
  const records = JSON.parse(localStorage.getItem("records") || "[]");
  // Instead of removing, mark as rejected
  records[index].approved = false;
  records[index].rejected = true;
  localStorage.setItem("records", JSON.stringify(records));
  renderTable();
  renderHomeTable();
  renderNotificationBellAndPanel();
}

function handleSearchInput() {
  const input = document.getElementById("searchInput").value.trim().toLowerCase();
  document.getElementById("adminDropdown").classList.toggle("hidden", input !== "admin");
}

function openAdminModal(role) {
  if (role) {
    document.getElementById("adminSelect").value = role;
    document.getElementById("adminPassword").value = "";
    document.getElementById("adminLoginModal").style.display = "block";
  }
}

function loginAdmin() {
  const user = document.getElementById("adminSelect").value;
  const pass = document.getElementById("adminPassword").value;

  if (adminCredentials[user] === pass) {
    loggedInAdmin = user;
    document.getElementById("adminLoginModal").style.display = "none";
    document.getElementById("outpassForm").classList.add("hidden");
    document.getElementById("homeRecordTable").classList.add("hidden");
    document.getElementById("notificationPanel").style.display = "none";
    document.getElementById("notifBellWrapper").style.display = "none";
    document.getElementById("adminPanel").classList.remove("hidden");
    renderTable();
  } else {
    alert("Incorrect password!");
  }
}

function closeAdminLogin() {
  document.getElementById("adminLoginModal").style.display = "none";
}

function logout() {
  loggedInAdmin = null;
  document.getElementById("adminPanel").classList.add("hidden");
  document.getElementById("outpassForm").classList.remove("hidden");
  document.getElementById("homeRecordTable").classList.remove("hidden");
  document.getElementById("notifBellWrapper").style.display = "flex";
  renderNotificationBellAndPanel();
  renderHomeTable();
}

function downloadPDF() {
  const element = document.getElementById("pdfContent");
  const opt = {
    margin: 0.3,
    filename: 'outpass_records.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
  };
  html2pdf().set(opt).from(element).save();
}

function downloadPDFHome() {
  const element = document.getElementById("homePdfContent");
  const opt = {
    margin: 0.3,
    filename: 'outpass_requests.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
  };
  html2pdf().set(opt).from(element).save();
}

// Search/filter for Outpass Requests table (home)
function filterHomeTable() {
  const filter = (document.getElementById("homeTableSearchInput").value || "").toLowerCase();
  const table = document.getElementById("homeDataTable");
  const trs = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
  for (let i = 0; i < trs.length; i++) {
    let rowText = trs[i].innerText.toLowerCase();
    trs[i].style.display = rowText.indexOf(filter) > -1 ? "" : "none";
  }
}
document.getElementById("homeTableSearchInput").addEventListener("input", function(e) {
  filterHomeTable();
});
document.getElementById("homeTableSearchInput").addEventListener("keyup", function(e) {
  if (e.key === "Enter") filterHomeTable();
});

// Notification Bell & Panel logic
function renderNotificationBellAndPanel() {
  if (loggedInAdmin) {
    document.getElementById("notifBellWrapper").style.display = "none";
    document.getElementById("notificationPanel").style.display = "none";
    return;
  } else {
    document.getElementById("notifBellWrapper").style.display = "flex";
  }
  const records = JSON.parse(localStorage.getItem("records") || "[]");
  // Only show unapproved and unrejected requests
  const unapproved = records.map((rec, idx) => ({...rec, idx})).filter(rec => !rec.approved && !rec.rejected);
  const notifBadge = document.getElementById("notifBadge");
  notifBadge.style.display = unapproved.length > 0 ? "inline-block" : "none";
  notifBadge.textContent = unapproved.length > 0 ? unapproved.length : "";
  // Fill panel list if open
  if (notificationPanelOpen) {
    fillNotificationPanel(unapproved);
  } else {
    document.getElementById("notificationPanel").style.display = "none";
  }
}

function fillNotificationPanel(unapproved) {
  const notifPanel = document.getElementById("notificationPanel");
  const notifList = document.getElementById("notifList");
  notifList.innerHTML = "";
  if (unapproved.length === 0) {
    notifPanel.style.display = "none";
    notificationPanelOpen = false;
    return;
  }
  notifPanel.style.display = "block";
  unapproved.forEach(rec => {
    let msg = `Request from <strong>${rec.name}</strong> (${rec.domain})<br><small>${formatDateDMY(rec.date)} to <strong>${rec.authority && rec.authority.toUpperCase ? rec.authority.toUpperCase() : rec.authority}</strong></small>`;
    let li = document.createElement("li");
    li.innerHTML = msg;
    notifList.appendChild(li);
  });
}

function toggleNotificationPanel() {
  if (loggedInAdmin) return;
  notificationPanelOpen = !notificationPanelOpen;
  renderNotificationBellAndPanel();
}
function closeNotificationPanel() {
  notificationPanelOpen = false;
  document.getElementById("notificationPanel").style.display = "none";
}

// On page load, show home table and notification bell/panel
renderHomeTable();
renderNotificationBellAndPanel();
