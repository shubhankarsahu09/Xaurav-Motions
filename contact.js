const contactForm = document.querySelector("[data-contact-form]");
const contactStatus = document.querySelector("[data-contact-status]");
const WEB3FORMS_KEY = "c0e4459a-b170-4d1b-80e1-a30806a87b1b";

if (contactForm && contactStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const brand = String(formData.get("brand") || "").trim();
    const projectTypes = formData.getAll("project_type").map((v) => String(v).trim()).filter(Boolean);
    const budget = String(formData.get("budget") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !budget || !message) {
      contactStatus.textContent = "Please complete all required fields before sending.";
      contactStatus.classList.add("is-visible");
      return;
    }

    const submitButton = contactForm.querySelector("[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    contactStatus.textContent = "Sending your project brief...";
    contactStatus.classList.add("is-visible");

    const payload = {
      access_key: WEB3FORMS_KEY,
      subject: `New project inquiry from ${name}`,
      from_name: name,
      email: email,
      brand: brand || "Not specified",
      project_type: projectTypes.length ? projectTypes.join(", ") : "Not specified",
      budget: budget,
      message: message,
    };

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          contactStatus.textContent = "✓ Project brief sent successfully! I'll respond within 24 hours.";
          contactForm.reset();
        } else {
          contactStatus.textContent = "Something went wrong. Please try again.";
        }
      })
      .catch(() => {
        contactStatus.textContent = "Network error. Please check your connection and try again.";
      })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Send Project Brief";
        }
      });
  });
}
