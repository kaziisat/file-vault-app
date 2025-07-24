document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const fileInput = document.getElementById("fileInput");
  const fileNameInput = document.getElementById("fileName");
  const folderInput = document.getElementById("folderName");
  const fileList = document.getElementById("fileList");
  const searchInput = document.getElementById("searchInput");

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

  async function fetchFiles() {
    const res = await fetch("/files");
    const files = await res.json();
    displayFiles(files);
  }

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

  searchInput.addEventListener("input", fetchFiles);

  fetchFiles(); // initial load
});
