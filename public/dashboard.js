document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const fileInput = document.getElementById("fileInput");
  const fileNameInput = document.getElementById("fileName");
  const folderInput = document.getElementById("folderName");
  const fileList = document.getElementById("fileList");
  const searchInput = document.getElementById("searchInput");
  const renameResult = document.getElementById("renameResult");

  // 🟢 Handle Upload
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    const name = fileNameInput.value.trim();
    const folder = folderInput.value.trim() || "root";

    if (!file || !name) {
      alert("Please provide both a file and a file name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("folder", folder);

    const res = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    alert(data.message || "Upload complete!");
    uploadForm.reset();
    fetchFiles();
  });

  // 🟢 Fetch file list
  async function fetchFiles() {
    const res = await fetch("/files");
    const files = await res.json();
    displayFiles(files);
  }

  // 🟢 Display filtered or full list
  function displayFiles(files) {
    fileList.innerHTML = "";
    const search = searchInput.value.toLowerCase();

    files
      .filter((f) => f.toLowerCase().includes(search))
      .forEach((file) => {
        const li = document.createElement("li");
        li.textContent = file;
        fileList.appendChild(li);
      });
  }

  // 🟢 Re-filter on search
  searchInput.addEventListener("input", fetchFiles);

  // 🟢 Handle Rename
  document.getElementById("renameForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // gather rename form inputs
    const type = document.getElementById("renameType").value.trim();
    const oldName = document.getElementById("oldName").value.trim();
    const newName = document.getElementById("newName").value.trim();
    const folder = document.getElementById("renameFolder").value.trim() || "root";

    const res = await fetch("/rename", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, oldName, newName, folder }),
    });

    const data = await res.json();

    if (res.ok) {
      renameResult.textContent = data.message || "Rename successful!";
      renameResult.style.color = "green";
      fetchFiles(); // <-- Refresh the file list here after renaming
    } else {
      renameResult.textContent = data.error || "Rename failed.";
      renameResult.style.color = "red";
    }
  });

  fetchFiles(); // initial load
});
