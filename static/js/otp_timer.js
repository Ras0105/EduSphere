// convert seconds to milliseconds

let timer = setInterval(function(){

    let currentTime = new Date().getTime();

    let remainingTime = expiryTime - currentTime;


    if(remainingTime <= 0){

        clearInterval(timer);

        document.getElementById("timer").innerHTML = "OTP Expired";

        alert("OTP Expired. Please request a new OTP.");

        // window.location.href = "/forgot-password";

        return;
    }


    let minutes = Math.floor(
        remainingTime / (1000 * 60)
    );

    let seconds = Math.floor(
        (remainingTime % (1000 * 60)) / 1000
    );


    document.getElementById("timer").innerHTML =
        String(minutes).padStart(2,'0')
        + ":"
        +
        String(seconds).padStart(2,'0');


},1000);