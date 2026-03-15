from flask import Flask, render_template, request, redirect, url_for


app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def auth():
    if request.method == 'GET':
        return render_template("auth.html")
    else:
        login = request.form.get('login')
        password = request.form.get('password')

        return redirect(url_for('user_page', username=login))


@app.route('/user_page', methods=['GET',])
def user_page():
    return render_template('user-page.html')


if __name__ == '__main__':
    import os

    app.run(debug=os.environ.get('FLASK_DEBUG', 'false').lower() == 'true')
