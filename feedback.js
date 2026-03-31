const feedbackForm = document.querySelector("[data-feedback-form]");
const feedbackStatus = document.querySelector("[data-feedback-status]");
const WEB3FORMS_KEY = "c0e4459a-b170-4d1b-80e1-a30806a87b1b";

if (feedbackForm && feedbackStatus) {
  feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(feedbackForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const rating = String(formData.get("rating") || "").trim();
    const highlights = formData.getAll("highlight").map((value) => String(value).trim()).filter(Boolean);
    const message = String(formData.get("message") || "").trim();
    const testimonial = formData.get("testimonial") ? "Yes" : "No";

    if (!name || !email || !rating || !message) {
      feedbackStatus.textContent = "Please complete all required fields before sending feedback.";
      feedbackStatus.classList.add("is-visible");
      return;
    }

    const submitButton = feedbackForm.querySelector("[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    feedbackStatus.textContent = "Sending feedback...";
    feedbackStatus.classList.add("is-visible");

    const payload = {
      access_key: WEB3FORMS_KEY,
      subject: `Portfolio feedback from ${name}`,
      from_name: name,
      email: email,
      rating: `${rating}/5`,
      highlights: highlights.length ? highlights.join(", ") : "None selected",
      testimonial_approved: testimonial,
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
          feedbackStatus.textContent = "✓ Feedback sent successfully! Thank you.";
          feedbackForm.reset();
        } else {
          feedbackStatus.textContent = "Something went wrong. Please try again.";
        }
      })
      .catch(() => {
        feedbackStatus.textContent = "Network error. Please check your connection and try again.";
      })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Send Feedback";
        }
      });
  });
}
