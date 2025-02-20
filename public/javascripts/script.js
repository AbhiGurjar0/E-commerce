document.addEventListener("DOMContentLoaded", function () {
  const priceSlider = document.getElementById("price-slider");
  const minPriceDisplay = document.getElementById("min-price");
  const maxPriceDisplay = document.getElementById("max-price");

  noUiSlider.create(priceSlider, {
    start: [4840, 1171020], // Initial values
    connect: true,
    range: {
      min: 4840,
      max: 1171020,
    },
    step: 100, // Price step increment
    tooltips: false, // Show tooltips
    format: {
      to: function (value) {
        return Math.round(value); // Round values
      },
      from: function (value) {
        return Number(value);
      },
    },
  });

  // Update displayed values
  priceSlider.noUiSlider.on("update", function (values) {
    minPriceDisplay.textContent = values[0];
    maxPriceDisplay.textContent = values[1];
  });
});
// for index page
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

loginTab.addEventListener("click", () => {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  loginTab.classList.add("border-blue-500", "text-black");
  registerTab.classList.remove("border-blue-500", "text-black");
});

registerTab.addEventListener("click", () => {
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  registerTab.classList.add("border-blue-500", "text-black");
  loginTab.classList.remove("border-blue-500", "text-black");
});

//cart
console.log("HI this is JS");
let decrease = document.getElementById("decrease");
let increase = document.getElementById("increase");
let numberOfProduct = document.getElementById("Quantity");

increase.addEventListener("click", () => {
  numberOfProduct.value = parseInt(numberOfProduct.value) + 1;
  console.log("Increased to", numberOfProduct.value);
});

decrease.addEventListener("click", () => {
  let current = parseInt(numberOfProduct.value);
  if (current > 1) {
    numberOfProduct.value = current - 1;
  }
  console.log("Decreased to", numberOfProduct.value);
});

//filter price

document.querySelectorAll('input[name="price"]').forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    document.getElementById("filterForm").submit();
  });
});
