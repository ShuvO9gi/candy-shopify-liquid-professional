export default function successPopup(namePromptModal) {
  const successModal = document.querySelector('[data-success-modal]')

  namePromptModal.classList.remove('is--visible')
  successModal.classList.add('is--visible')
  
}