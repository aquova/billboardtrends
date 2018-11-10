import requests
import time
import json
import re
import csv
import random
from requests_oauthlib import OAuth1

API_KEY = '9bf80dfdb834452add05f33d8e735316'
API_SECRET = 'b0a55ce0e0f89e575432e7a0e2b4c6be'

with open('us_billboard.psv') as f:

    psv = csv.reader(f, delimiter='|')

    psv_list = list(psv)
    while True:
        row = random.choice(psv_list)

        track = row[4]
        artist = row[5]

        artist = re.sub(' featuring.*', '', artist)

        payload = {
            'method': 'artist.getTopTags',
            # 'track': track,
            'artist': artist,
            'format': 'json',
            'api_key': API_KEY
        }

        r = requests.get('http://ws.audioscrobbler.com/2.0', params=payload)
        top_tags = json.loads(r.content)


        if ('error' in top_tags or len(top_tags['toptags']['tag']) < 5):

            artist = re.sub(' \&.*', '', artist)
            artist = re.sub(',.*', '', artist)
            artist = re.sub('\'', '', artist)
            artist = re.sub(' x .*', '', artist)

            payload = {
                'method': 'artist.getTopTags',
                # 'track': track,
                'artist': artist,
                'format': 'json',
                'api_key': API_KEY
            }

            r = requests.get('http://ws.audioscrobbler.com/2.0', params=payload)
            top_tags = json.loads(r.content)

            if 'toptags' not in top_tags or len(top_tags['toptags']['tag']) == 0:
                continue


        print(artist)
        genre = top_tags['toptags']['tag'][0]['name']
        genre = genre.lower()

        if (genre in ['indie','grunge','new wave','blues','djent','alternative'] or 'rock' in genre or 'metal' in genre):
            clean_genre = 'rock'
        elif (genre in ['rap','hip hop','cloud rap','trap']):
            clean_genre = 'hip-hop'
        elif (genre in ['female vocalists', 'male vocalists','adult contemporary','oldies'] or 'pop' in genre or any(char.isdigit() for char in genre)):
            clean_genre = 'pop'
        elif (genre in ['trance','house','drum and bass','breakcore','dubstep'] or 'dance' in genre):
            clean_genre = 'electronic'
        elif (genre in ['country', 'folk', 'singer-songwriter']):
            clean_genre = 'country / folk'
        elif (genre in ['soul','rnb','motown','new jack swing'] or 'funk' in genre):
            clean_genre = 'rnb / soul'
        elif (genre in ['swing','jazz']):
            clean_genre = 'jazz'
        elif (genre in ['disco']):
            clean_genre = 'disco'
        elif (genre in ['reggae','dub']):
            clean_genre = 'reggae'
        

        print(clean_genre)
        print()


        time.sleep(.2)
