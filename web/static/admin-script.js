document.addEventListener('DOMContentLoaded', () => {
    let form = document.querySelector("form");
    let inputs = document.querySelectorAll("input");
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.borderColor = "rgb(224, 180, 98)";
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = "rgb(191, 168, 125)";
        });
    });
});