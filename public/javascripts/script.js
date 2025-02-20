
document.addEventListener("DOMContentLoaded", function () {
  const priceSlider = document.getElementById("price-slider");
  const minPriceDisplay = document.getElementById("min-price");
  const maxPriceDisplay = document.getElementById("max-price");

  noUiSlider.create(priceSlider, {
    start: [4840, 1171020], // Initial values
    connect: true,
    range: {
      min: 4840,
      max: 1171020
    },
    step: 100, // Price step increment
    tooltips: false, // Show tooltips
    format: {
      to: function (value) {
        return Math.round(value); // Round values
      },
      from: function (value) {
        return Number(value);
      }
    }
  });

  // Update displayed values
  priceSlider.noUiSlider.on("update", function (values) {
    minPriceDisplay.textContent = values[0];
    maxPriceDisplay.textContent = values[1];
  });
});

