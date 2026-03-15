from flask import Flask, render_template, request, redirect, url_for


app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def auth():
    if request.method == 'GET':
        return render_template("auth.html")
    else:
        login = request.form.get('login')
        password = request.form.get('password')

        return redirect(url_for('admin-page'))
    

if __name__ == '__main__':
    # app.run(debug=<включить режим отладки?>)
    app.run(debug=True)