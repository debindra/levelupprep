var stripeElements = function(publicKey, setupIntent) {
  var stripe = Stripe(publicKey);
  var elements = stripe.elements();
  window.stripe = stripe;
  // Element styles
  var style = {
    base: {
      fontSize: "16px",
      color: "#32325d",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
      fontSmoothing: "antialiased",
      "::placeholder": {
        color: "rgba(0,0,0,0.4)"
      }
    }
  };

  var card = elements.create("card", { style: style });

  card.mount("#card-element");

  // Element focus ring
  card.on("focus", function() {
    var el = document.getElementById("card-element");
    el.classList.add("focused");
  });

  card.on("blur", function() {
    var el = document.getElementById("card-element");
    el.classList.remove("focused");
  });

  window.stripeCard = card

  // Handle payment submission when user clicks the pay button.
  // var button = document.getElementById("submit");
  // button.addEventListener("click", function(event) {
  //   event.preventDefault();
  //   changeLoadingState(true);


  //   var email = document.getElementById("email").value;

  //   stripe
  //     .confirmCardSetup(setupIntent.client_secret, {
  //       payment_method: {
  //         card: card,
  //         billing_details: { email: email }
  //       }
  //     })
  //     .then(function(result) {
  //       if (result.error) {
  //         changeLoadingState(false);
  //         var displayError = document.getElementById("card-errors");
  //         displayError.textContent = result.error.message;
  //       } else {
  //         // The PaymentMethod was successfully set up

  //         orderComplete(stripe, setupIntent.client_secret);
  //       }
  //     });



  // });
};



var getSetupIntent = function(publicKey) {
  return fetch("/api/v1/student/create-setup-intent", {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(setupIntent) {
      window.initialSetupIntent = setupIntent
      stripeElements(publicKey, setupIntent);
    });
};

var getPublicKey = function() {
  return fetch("/api/public-key", {
    method: "get",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
      window.publicKey = response.publicKey;
      getSetupIntent(response.publicKey);
    });
};


getPublicKey();
