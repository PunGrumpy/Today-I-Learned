const btn = document.querySelector('.btn-open')
const form = document.querySelector('.fact-form')
const factsList = document.querySelector('.facts-list')

factsList.innerHTML = ''

btn.addEventListener('click', function () {
  if (form.classList.contains('hidden')) {
    form.classList.remove('hidden')
    btn.textContent = 'Close'
  } else {
    form.classList.add('hidden')
    btn.textContent = 'Share a fact'
  }
})
