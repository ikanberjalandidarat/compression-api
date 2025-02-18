Installation:

```bash
$ npm install
```



Testing locally:
```bash

// Client-side example
const formData = new FormData();
formData.append('image', imageFile);

fetch('http://localhost:3000/api/compress/image', {
  method: 'POST',
  body: formData
})
.then(response => response.blob())
.then(compressedImage => {
  // Handle compressed image
});
```


```bash
const formData = new FormData();
formData.append('video', videoFile);

fetch('http://localhost:3000/api/compress/video', {
  method: 'POST',
  body: formData
})
.then(response => response.blob())
.then(compressedVideo => {
  // Handle compressed video
});
```