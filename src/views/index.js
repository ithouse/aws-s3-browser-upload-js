uploadForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const file = event.target.elements.file.files[0];
  const presignedPost = await requestPresignedPost(file);
  console.log(presignedPost);
});

async function requestPresignedPost(file) {
  const { type } = file;
  const res = await window.fetch("http://localhost:3000/s3/generate-upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type,
    }),
  });
  return res.json();
}
