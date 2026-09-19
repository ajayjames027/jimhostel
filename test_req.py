import requests

def test():
    try:
        r = requests.post("http://localhost:5000/api/auth/login", json={
            "username": "b2_nivone",
            "password": "jim123"
        })
        print(r.status_code, r.text)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test()
