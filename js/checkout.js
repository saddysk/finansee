var options = {
  key: "rzp_test_4uniVJbkTLvIls", // Enter the Key ID generated from the Dashboard
  amount: "29900", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
  currency: "INR",
  name: "Finansee Agency",
  description: "Use UPI Id: test@ybl to complete the test payment",
  image: "../images/logos/finansee.png",
  order_id: "order_IoUoGr4rVApAhh", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
  handler: function (response) {
  	alert("Payment Successful.\nYour session will be scheduled at the earliest.");
    // alert(response.razorpay_payment_id);
    // alert(response.razorpay_order_id);
    // alert(response.razorpay_signature);
  },
  prefill: {
    name: "Sk Saddy",
    email: "saddam@sksaddam.com",
    contact: "8974593683",
  },
  notes: {
    address: "Razorpay Corporate Office",
  },
  theme: {
    color: "#69b26f",
  },
};
var rzp1 = new Razorpay(options);
rzp1.on("payment.failed", function (response) {
  alert(response.error.code);
  alert(response.error.description);
  alert(response.error.source);
  alert(response.error.step);
  alert(response.error.reason);
  alert(response.error.metadata.order_id);
  alert(response.error.metadata.payment_id);
});
document.getElementById("rzp-button1").onclick = function (e) {
  rzp1.open();
  e.preventDefault();
};
