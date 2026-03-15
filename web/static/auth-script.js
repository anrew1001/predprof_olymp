function change_active_btn(clicked_btn, other_btn){
    clicked_btn.classList.toggle("active-action");
    other_btn.classList.toggle("active-action");

    let submit_btn = document.querySelector(".submit-btn");
    if (clicked_btn.textContent == "Вход"){
        submit_btn.textContent = "Войти";
    }
    else{
        submit_btn.textContent = "Зарегистрироваться";
    }
}


document.addEventListener('DOMContentLoaded', () => {
    let login_btn = document.querySelector("#login-btn");
    let signup_btn = document.querySelector("#signup-btn");

    login_btn.addEventListener('click', () => change_active_btn(login_btn, signup_btn));
    signup_btn.addEventListener('click', () => change_active_btn(signup_btn, login_btn));
});