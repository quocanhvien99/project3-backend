const closeBtn = document.getElementById('close');
const popup = document.getElementsByClassName('popup-form')[0];

closeBtn.addEventListener('click', () => {
	popup.classList.toggle('open');
});
