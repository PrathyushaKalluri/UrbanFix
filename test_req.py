import urllib.request
import json

try:
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/matching/recommendations',
        data=b'{"problem_text": "my washing machine is making weird sounds"}',
        headers={'Content-Type': 'application/json'}
    )
    response = urllib.request.urlopen(req)
    print(json.dumps(json.loads(response.read().decode()), indent=2))
except Exception as e:
    if hasattr(e, 'read'):
        print(e.read().decode())
    else:
        print(e)
