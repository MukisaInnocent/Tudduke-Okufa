/* ===============================
   CONTACT FORM SUBMIT (SAFE)
================================ */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name')?.value;
    const email = document.getElementById('email')?.value;
    const message = document.getElementById('message')?.value;
    const responseEl = document.getElementById('response');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const data = await res.json();

      if (data.success) {
        responseEl.textContent = '✅ Message sent successfully!';
        contactForm.reset();
      } else {
        responseEl.textContent = '❌ ' + (data.error || 'Submission failed');
      }

    } catch (err) {
      responseEl.textContent = '❌ Server not reachable';
      console.error(err);
    }
  });
}
