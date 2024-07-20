import requests
from requests.exceptions import ChunkedEncodingError

def test_streaming_api():
    url = 'http://localhost:8000/api/chat'
    headers = {'Content-Type': 'application/json'}
    data = {
        "uid": "rBP6YPni0vf8JYM53J0Xe8GLxj62",
        "userInput": "Who is Docter strange? give me shorter response, in two lines",
        "chatId": "8768-8775-7667-8776",
    }

    response = requests.post(url, headers=headers, json=data, stream=True)

    try:
        for chunk in response.iter_content(chunk_size=1024):
            if chunk:
                chunk_str = chunk.decode('utf-8')
                if chunk_str:
                    print(chunk_str)

    except ChunkedEncodingError as ex:
        print(f"Invalid chunk encoding: {str(ex)}")

# Run the test function
test_streaming_api()