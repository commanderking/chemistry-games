from flask import Flask, request, redirect, render_template
app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template("index.html")

@app.route('/reactTest')
def react_test():
    return render_template("reactTest.html")

if __name__ == '__main__':
	app.run(debug=True)
