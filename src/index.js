pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://mozilla.github.io/pdf.js/build/pdf.worker.mjs';

const $ = document.getElementById.bind(document);

const samplePdf =
  'https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf';
let fileUrl = '';
let totalPages = 1;
rerenderWithPage(1);

$('open').addEventListener('click', () => {
  $('file').click();
});

$('file').addEventListener('change', () => {
  const file = $('file');
  fileUrl = URL.createObjectURL(file.files[0]);
  pdfjsLib.getDocument(fileUrl).promise.then((pdf) => {
    totalPages = pdf.numPages;
    $('total-pages').innerText = 'of ' + totalPages;
  });
  rerenderWithPage(1);
});

function render(fileUrl, opts = { page: 1 }) {
  var canvas = $('pdf-canvas');
  var context = canvas.getContext('2d');

  // Create a PDF document from the URL
  pdfjsLib
    .getDocument(fileUrl)
    .promise.then(function (pdf) {
      window.pdf = pdf;
      // Get the first page of the PDF
      pdf.getPage(opts.page).then(function (page) {
        // Set the desired scale and viewport
        var scale = 1.5;
        var viewport = page.getViewport({ scale: scale });

        // Set the canvas dimensions based on the viewport
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render the PDF page on the canvas
        var renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        page.render(renderContext);
      });
    })
    .catch(function (error) {
      console.error('Error loading PDF:', error);
    });
}

$('minus-left').addEventListener('click', handlePositionChange('minus-left'));
$('plus-left').addEventListener('click', handlePositionChange('plus-left'));
$('minus-top').addEventListener('click', handlePositionChange('minus-top'));
$('plus-top').addEventListener('click', handlePositionChange('plus-top'));

$('minus-width').addEventListener('click', handleSizeChange('minus-width'));
$('plus-width').addEventListener('click', handleSizeChange('plus-width'));

function handlePositionChange(direction) {
  return (e) => {
    const d = e.shiftKey ? 10 : 1;
    const key = direction.endsWith('left') ? 'left' : 'top';
    const sign = direction.startsWith('plus') ? 1 : -1;
    const currentValue = ($('pdf-canvas').style[key] || '0px').replace(
      'px',
      ''
    );
    const newValue = parseInt(currentValue) + d * sign;
    localStorage.setItem(key, newValue);

    $(`${key}-value`).innerText = `${newValue}`;
    $('pdf-canvas').style[key] = `${newValue}px`;
  };
}

function handleSizeChange(direction) {
  return (e) => {
    const d = e.shiftKey ? 10 : 1;
    const sign = direction.startsWith('plus') ? 1 : -1;
    const currentValue = ($('pdf-canvas').style.width || '0px').replace(
      'px',
      ''
    );
    const newValue = parseInt(currentValue) + d * sign;
    localStorage.setItem('width', newValue);
    $('width-value').innerText = `${newValue}`;
    $('pdf-canvas').style.width = `${newValue}px`;
  };
}

const initialLeft = localStorage.getItem('left') || 10;
const initialTop = localStorage.getItem('top') || 10;
// 771 - found out by experiment
const initialWidth = localStorage.getItem('width') || 771;

$('left-value').innerText = `${initialLeft}`;
$('pdf-canvas').style.left = `${initialLeft}px`;
$('top-value').innerText = `${initialTop}`;
$('pdf-canvas').style.top = `${initialTop}px`;
$('width-value').innerText = `${initialWidth}`;
$('pdf-canvas').style.width = `${initialWidth}px`;

const initialPage = localStorage.getItem('page') || 1;
$('current-page').addEventListener('change', (e) => {
  const page = parseInt(e.target.value);
  rerenderWithPage(page);
});
$('prev-page').addEventListener('click', () => {
  rerenderWithPage(parseInt($('current-page').value) - 1);
});
$('next-page').addEventListener('click', () => {
  rerenderWithPage(parseInt($('current-page').value) + 1);
});

function rerenderWithPage(page) {
  if (0 < page && page <= totalPages) {
    localStorage.setItem('page', page);
    $('current-page').value = page;
    render(fileUrl, { page });
  }
}

$('panel-top').addEventListener('click', () => {
  $('container');
});
$('panel-bottom').addEventListener('click', () => {});
