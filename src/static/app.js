document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participantsList = details.participants.length > 0 
          ? `<ul class="participants-list">${details.participants.map(email => `<li>${email}</li>`).join('')}</ul>`
          : '<p class="no-participants">Noch keine Teilnehmer angemeldet</p>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p><strong>Beschreibung:</strong> ${details.description}</p>
          <p><strong>Zeitplan:</strong> ${details.schedule}</p>
          <p><strong>Max. Teilnehmer:</strong> ${details.max_participants}</p>
          <div class="participants-section">
              <p><strong>Angemeldete Teilnehmer (${details.participants.length}/${details.max_participants}):</strong></p>
              ${participantsList}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    if (!email || !activity) {
      showMessage('Bitte alle Felder ausfüllen.', 'error');
      return;
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email })
        }
      );

      if (response.ok) {
        showMessage('Erfolgreich angemeldet!', 'success');
        signupForm.reset();
        fetchActivities(); // Reload to show updated participant list
      } else {
        const error = await response.json();
        showMessage(error.detail || 'Anmeldung fehlgeschlagen.', 'error');
      }
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.classList.remove('hidden');

  setTimeout(() => {
      messageDiv.classList.add('hidden');
  }, 5000);
}
