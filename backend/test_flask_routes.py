from flask import Flask

app = Flask(__name__)

@app.route('/hello', methods=['GET'])
def get_hello(): return "GET block"

@app.route('/hello', methods=['POST'])
def post_hello(): return "POST block"

with app.app_context():
    app.url_map

if __name__ == '__main__':
    with app.test_client() as c:
        print("GET /hello :", c.get('/hello').status_code)
        print("POST /hello :", c.post('/hello').status_code)
