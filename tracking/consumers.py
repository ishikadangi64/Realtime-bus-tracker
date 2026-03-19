from channels.generic.websocket import AsyncWebsocketConsumer
import json, requests

GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY"  # Replace with your key

class LocationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        origin = f"{data['lat']},{data['lng']}"
        destination = data['destination']

        url = (
            "https://maps.googleapis.com/maps/api/distancematrix/json"
            f"?origins={origin}&destinations={destination}&key={GOOGLE_API_KEY}"
        )

        response = requests.get(url).json()
        try:
            seconds = response['rows'][0]['elements'][0]['duration']['value']
            minutes = seconds // 60

            if minutes <= 10:
                await self.send(json.dumps({
                    "alert": "⚠️ You will reach your destination in 10 minutes!"
                }))
        except:
            pass
