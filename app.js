const uploadButton =
document.getElementById("uploadButton");

const imageInput =
document.getElementById("imageInput");

const previewImage =
document.getElementById("previewImage");

const statusText =
document.getElementById("statusText");

uploadButton.onclick=()=>{

    imageInput.click();

}

imageInput.onchange=(event)=>{

    const file=
    event.target.files[0];

    if(!file)
        return;

    const reader=
    new FileReader();

    reader.onload=(e)=>{

        previewImage.src=
        e.target.result;

        previewImage.style.display=
        "block";

        statusText.innerHTML=
        "Screenshot Loaded ✓";

    };

    reader.readAsDataURL(file);

}

// Drag and Drop

document.body.addEventListener("dragover",e=>{

    e.preventDefault();

});

document.body.addEventListener("drop",e=>{

    e.preventDefault();

    const file=
    e.dataTransfer.files[0];

    if(!file)
        return;

    const reader=
    new FileReader();

    reader.onload=(event)=>{

        previewImage.src=
        event.target.result;

        previewImage.style.display=
        "block";

        statusText.innerHTML=
        "Screenshot Loaded ✓";

    }

    reader.readAsDataURL(file);

});