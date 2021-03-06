const Mask = {
  apply(input, func) {
    if (input.name === 'price')
      setTimeout(() => {
        input.value = Mask[func](input.value);
        Mask.setCaretPosition(input, input.value.length - 2);
      }, 1);
    else
      setTimeout(() => {
        input.value = Mask[func](input.value);
      }, 1);
  },
  formatEUR(value) {
    value = value.replace(/\D/g, '');

    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value / 100);
  },
  setCaretPosition(input, caretPos) {
    input.value = input.value;
    // ^ this is used to not only get "focus", but
    // to make sure it doesn't have everything -selected-
    // (it causes an issue in chrome, and having it doesn't hurt any other browser)
    if (input !== null) {
      if (input.createTextRange) {
        let range = input.createTextRange();
        range.move('character', caretPos);
        range.select();
        return true;
      } else {
        // (input.selectionStart === 0 added for Firefox bug)
        if (input.selectionStart || input.selectionStart === 0) {
          input.focus();
          input.setSelectionRange(caretPos, caretPos);
          return true;
        } else {
          input.focus();
          return false;
        }
      }
    }
  },
  cpfCnpj(value) {
    value = value.replace(/\D/g, '');

    if (value.length > 14) value = value.slice(0, -1);

    if (value.length > 11) {
      value = value.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d)/,
        '$1.$2.$3/$4-$5'
      );
    } else {
      value = value.replace(
        /(\d{3})(\d{3})(\d{3})(\d)/,
        '$1.$2.$3-$4');
    }

    return value;
  },
  cep(value) {
    value = value.replace(/\D/g, '');

    if (value.length > 8) value = value.slice(0, -1);

    value = value.replace(/(\d{5})(\d)/, '$1-$2');

    return value;
  },
};

const PhotosUpload = {
  input: '',
  preview: document.querySelector('#photos-preview'),
  uploadLimit: 6,
  files: [],
  handleFileInput(event) {
    const { files: fileList } = event.target;
    PhotosUpload.input = event.target;

    if (PhotosUpload.hasLimit(event)) return;

    Array.from(fileList).forEach(file => {
      PhotosUpload.files.push(file);

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        const image = new Image(); /* same as <img /> */
        image.src = String(reader.result);

        const div = PhotosUpload.getContainer(image);
        PhotosUpload.preview.appendChild(div);
      };
    });

    PhotosUpload.input.files = PhotosUpload.getAllFiles();
  },
  hasLimit(event) {
    const { uploadLimit, input, preview } = PhotosUpload;
    const { files: fileList } = input;

    if (fileList.length > uploadLimit) {
      alert(`Upload a maximum of ${uploadLimit} photos!`);
      event.preventDefault();
      return true;
    }

    const photosDiv = [];
    preview.childNodes.forEach(item => {
      if (item.classList && item.classList.value == 'photo') {
        photosDiv.push(item);
      }
    });

    const totalPhotos = fileList.length + photosDiv.length;
    if (totalPhotos > uploadLimit) {
      alert(
        `You have reached the maximum upload limit! (${uploadLimit} photos)`
      );
      event.preventDefault();
      return true;
    }

    return false;
  },
  getAllFiles() {
    const dataTransfer =
      new ClipboardEvent('').clipboardData || new DataTransfer();

    PhotosUpload.files.forEach(file => dataTransfer.items.add(file));

    return dataTransfer.files;
  },
  getContainer(image) {
    const div = document.createElement('div'); /* there isn't new Div() */
    div.classList.add('photo');

    div.onclick = PhotosUpload.removePhoto;

    div.appendChild(image);

    div.appendChild(PhotosUpload.getRemoveButton());

    return div;
  },
  getRemoveButton() {
    const button = document.createElement('i');
    button.classList.add('material-icons');
    button.innerHTML = 'delete_forever';
    return button;
  },
  removePhoto(event) {
    const photoDiv = event.target.parentNode; /* <div class="photo"> */

    const photosArray = Array.from(PhotosUpload.preview.children);
    const index = photosArray.indexOf(photoDiv);

    PhotosUpload.files.splice(index, 1);
    PhotosUpload.input.files = PhotosUpload.getAllFiles();

    photoDiv.remove();
  },
  removeOldPhoto(event) {
    const photoDiv = event.target.parentNode;

    if (photoDiv.id) {
      const removedFiles = document.querySelector(
        'input[name="removed_files"]'
      );
      if (removedFiles) removedFiles.value += `${photoDiv.id},`;
    }

    photoDiv.remove();
  },
};

const ImageGallery = {
  highlight: document.querySelector('.gallery .highlight > img'),
  previews: document.querySelectorAll('.gallery-preview img'),
  lightboxHighlight: document.querySelector(
    '.gallery .highlight .lightbox-target > img'
  ),
  setImage(e) {
    const { target } = e;

    ImageGallery.previews.forEach(preview =>
      preview.classList.remove('active')
    );
    target.classList.add('active');

    ImageGallery.highlight.src = target.src;
    ImageGallery.lightboxHighlight.src = target.src;
  },
};

const Lightbox = {
  target: document.querySelector('.lightbox-target'),
  image: document.querySelector('.lightbox-target img'),
  closeButton: document.querySelector('.lightbox-target a.lightbox-close'),
  open() {
    Lightbox.target.style.opacity = 1;
    Lightbox.target.style.top = 0;
    Lightbox.target.style.bottom = 0;
    Lightbox.closeButton.style.top = 0;
  },
  close() {
    Lightbox.target.style.opacity = 0;
    Lightbox.target.style.top = '-100%';
    Lightbox.target.style.bottom = 'initial';
    Lightbox.closeButton.style.top = '-80px';
  },
};

const Validate = {
  apply(input, func) {
    Validate.clearErrors(input);

    let results = Validate[func](input.value);
    input.value = results.value;

    if (results.error) Validate.displayError(input, results.error);
  },
  displayError(input, error) {
    const div = document.createElement('div');
    div.classList.add('error');
    div.innerHTML = error;
    input.parentNode.appendChild(div);
    input.focus();
  },
  clearErrors(input) {
    const errorDiv = input.parentNode.querySelector('.error');

    if (errorDiv) errorDiv.remove();
  },
  isEmail(value) {
    let error = null;

    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (!value.match(mailFormat)) error = 'Adresse électronique invalide';

    return { error, value };
  },
  isCpfCnpj(value) {
    let error = null;

    const cleanValues = value.replace(/\D/g, '');

    if (cleanValues.length > 11 && cleanValues.length !== 14) {
      error = 'CNPJ invalide';
    } else if (cleanValues.length < 12 && cleanValues.length !== 11) {
      error = 'CPF invalide';
    }

    return { error, value };
  },
  isCep(value) {
    let error = null;

    const cleanValues = value.replace(/\D/g, '');

    if (cleanValues.length !== 8) error = 'CEP invalide';

    return { error, value };
  },
  allFields(e) {
    const items = document.querySelectorAll(
      '.item input, .item select, .item textarea'
    );

    for (let item of items) {
      if (item.value == '') {
        const message = document.createElement('div');
        message.classList.add('messages');
        message.classList.add('error');
        message.style.position = 'fixed';
        message.innerHTML = 'Tous les champs sont obligatoires';
        document.querySelector('body').append(message);

        e.preventDefault();
        break;
      }
    }
  },
};
