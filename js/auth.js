import { auth } from "./firebase-config.js";

import {
  signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  const error =
    document.getElementById("errorMessage");

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    window.location.href =
      "dashboard.html";

  }
  catch (err) {

    error.innerText =
      err.message;

  }

});