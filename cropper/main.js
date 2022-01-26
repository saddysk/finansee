// vars
let result = document.querySelector('.result'),
options = document.querySelector('.options'),
save = document.querySelector('.save'),
cropped = document.querySelector('.cropped'),
upload = document.querySelector('#profileimage'),

modalToggle = document.getElementById('toggleMyModal'),
myModal = new bootstrap.Modal(document.getElementById('myModal'), { keyboard: false }),

cropper = '';

// on change show image with crop options
upload.addEventListener('change', (e) => {
  if (e.target.files.length) {
		// start file reader
    const reader = new FileReader();
    reader.onload = (e)=> {
      if(e.target.result){
				// create new image
				let img = document.createElement('img');
				img.id = 'image';
				img.src = e.target.result

				// openning the modal
				myModal.show(modalToggle)

				// clean result before
				result.innerHTML = '';
				// append new image
		        result.appendChild(img);
				// show save btn and options
				save.classList.remove('hide');
				options.classList.remove('hide');
				// init cropper
				cropper = new Cropper(img);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});

// save on click
save.addEventListener('click',(e)=>{
  e.preventDefault();
  // get result to data uri
  let imgSrc = cropper.getCroppedCanvas({
		width: 150 // input value
	}).toDataURL();
	// show image cropped
	cropped.src = imgSrc;
  
  myModal.hide(modalToggle)
});
