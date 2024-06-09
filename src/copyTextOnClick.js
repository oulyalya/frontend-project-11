const copyTextOnClick = () => {
  const copyables = document.querySelectorAll('.copy-on-click');

  copyables.forEach((copyable) => {
    copyable.addEventListener('click', () => {
      document.execCommand('copy');
    });

    copyable.addEventListener('copy', (event) => {
      event.preventDefault();
      if (event.clipboardData) {
        event.clipboardData.setData('text/plain', copyable.textContent);
      }
    });
  });
};

export default copyTextOnClick;
